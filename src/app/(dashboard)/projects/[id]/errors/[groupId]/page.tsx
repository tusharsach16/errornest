import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerUserId } from "@/lib/session";
import {
  PrismaProjectRepository,
  PrismaProjectMemberRepository,
} from "@/server/repositories/prisma-project.repository";
import { PrismaErrorRepository } from "@/server/repositories/prisma-error.repository";
import { db } from "@/lib/db";
import { ErrorDetailClient } from "./ErrorDetailClient";
import type { SerializableErrorEvent } from "./actions";

interface Props {
  params: { id: string; groupId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const group = await db.errorGroup.findFirst({
    where: { id: params.groupId, projectId: params.id },
    select: { title: true },
  });
  const title = group?.title ?? "Error Detail";
  return {
    title: `${title} · ErrorNest`,
    description: `Inspect all occurrences and the stack trace for the error group: ${title}.`,
  };
}

export default async function ErrorDetailPage({ params }: Props) {
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

  const group = await db.errorGroup.findFirst({
    where: { id: params.groupId, projectId: params.id },
  });

  if (!group) notFound();

  const errorRepo = new PrismaErrorRepository();
  const { items, nextCursor } = await errorRepo.listEvents(params.groupId);

  const initialItems: SerializableErrorEvent[] = items.map((e) => ({
    id: e.id,
    errorGroupId: e.errorGroupId,
    message: e.message,
    stackTrace: e.stackTrace ?? null,
    browser: e.browser ?? null,
    url: e.url ?? null,
    createdAt: e.createdAt.toISOString(),
  }));

  const severityClasses: Record<string, string> = {
    INFO: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    WARNING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    ERROR: "bg-red-50 text-red-700 ring-1 ring-red-200",
    CRITICAL: "bg-red-100 text-red-800 ring-1 ring-red-300 font-semibold",
  };

  const statusClasses: Record<string, string> = {
    OPEN: "bg-red-50 text-red-700 ring-1 ring-red-200",
    RESOLVED: "bg-green-50 text-green-700 ring-1 ring-green-200",
    IGNORED: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
  };

  const statusLabel =
    group.status.charAt(0) + group.status.slice(1).toLowerCase();

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-12">
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          href={`/projects/${params.id}/errors`}
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30 rounded"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z"
              clipRule="evenodd"
            />
          </svg>
          {project.name} — Errors
        </Link>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 break-words">
        {group.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span
          className={`inline-block rounded-pill px-2.5 py-0.5 text-xs ${severityClasses[group.severity]}`}
        >
          {group.severity}
        </span>
        <span
          className={`inline-block rounded-pill px-2.5 py-0.5 text-xs ${statusClasses[group.status]}`}
        >
          {statusLabel}
        </span>
      </div>

      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4 text-sm">
        <div>
          <dt className="font-medium text-gray-500">Occurrences</dt>
          <dd className="mt-1 tabular-nums text-gray-900">
            {group.occurrenceCount.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">First seen</dt>
          <dd className="mt-1 text-gray-900">
            <time dateTime={group.firstSeenAt.toISOString()}>
              {group.firstSeenAt.toLocaleString()}
            </time>
          </dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Last seen</dt>
          <dd className="mt-1 text-gray-900">
            <time dateTime={group.lastSeenAt.toISOString()}>
              {group.lastSeenAt.toLocaleString()}
            </time>
          </dd>
        </div>
      </dl>

      <hr className="mt-8 border-gray-200" />

      <ErrorDetailClient
        projectId={params.id}
        groupId={params.groupId}
        initialItems={initialItems}
        initialNextCursor={nextCursor}
      />
    </main>
  );
}