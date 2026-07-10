import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerUserId } from "@/lib/session";
import {
  PrismaProjectRepository,
  PrismaProjectMemberRepository,
} from "@/server/repositories/prisma-project.repository";
import { PrismaErrorRepository } from "@/server/repositories/prisma-error.repository";
import { errorGroupFilterSchema } from "@/lib/validators/error.validators";
import { ErrorsClient, type FilterStatus, type FilterSeverity } from "./ErrorsClient";
import type { SerializableErrorGroup } from "./actions";

interface Props {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const projectRepo = new PrismaProjectRepository();
  const project = await projectRepo.findById(params.id);
  const name = project?.name ?? "Project";
  return {
    title: `${name} — Errors · ErrorNest`,
    description: `Browse, search, and triage all error groups for the ${name} project in ErrorNest.`,
  };
}

export default async function ErrorsPage({ params, searchParams }: Props) {
  const userId = await getServerUserId();
  if (!userId) redirect("/login");

  const [projectRepo, memberRepo] = [
    new PrismaProjectRepository(),
    new PrismaProjectMemberRepository(),
  ];

  const [project, role] = await Promise.all([
    projectRepo.findById(params.id),
    memberRepo.getRole(params.id, userId),
  ]);

  if (!project || !role) notFound();

  // Parse searchParams once on the server so the client gets a clean first page.
  const rawFilters = {
    status: firstString(searchParams.status),
    severity: firstString(searchParams.severity),
    search: firstString(searchParams.q),
    cursor: firstString(searchParams.cursor),
  };
  const parsed = errorGroupFilterSchema.safeParse(rawFilters);
  const filters = parsed.success ? parsed.data : {};

  const errorRepo = new PrismaErrorRepository();
  const { items, nextCursor } = await errorRepo.listGroups(params.id, filters);

  const initialItems: SerializableErrorGroup[] = items.map((g) => ({
    ...g,
    firstSeenAt: g.firstSeenAt.toISOString(),
    lastSeenAt: g.lastSeenAt.toISOString(),
  }));

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-12">
      <nav aria-label="Project navigation" className="mb-6 flex gap-1 border-b border-gray-200">
        <Link
          href={`/projects/${params.id}`}
          className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 transition-colors duration-[150ms] hover:text-gray-900"
        >
          Overview
        </Link>
        <span
          className="border-b-2 border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600"
          aria-current="page"
        >
          Errors
        </span>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
        {project.name} — Errors
      </h1>

      <ErrorsClient
        projectId={params.id}
        projectName={project.name}
        initialItems={initialItems}
        initialNextCursor={nextCursor}
        initialFilters={{
          q: firstString(searchParams.q) ?? "",
          status: toFilterStatus(firstString(searchParams.status)),
          severity: toFilterSeverity(firstString(searchParams.severity)),
        }}
      />
    </main>
  );
}

function firstString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

const VALID_STATUSES: FilterStatus[] = ["OPEN", "RESOLVED", "IGNORED"];
const VALID_SEVERITIES: FilterSeverity[] = ["INFO", "WARNING", "ERROR", "CRITICAL"];

function toFilterStatus(v: string | undefined): FilterStatus {
  return VALID_STATUSES.includes(v as FilterStatus) ? (v as FilterStatus) : "";
}

function toFilterSeverity(v: string | undefined): FilterSeverity {
  return VALID_SEVERITIES.includes(v as FilterSeverity) ? (v as FilterSeverity) : "";
}
