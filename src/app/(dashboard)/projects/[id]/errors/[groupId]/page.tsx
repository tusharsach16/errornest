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
import { ErrorGroupHeader } from "./ErrorGroupHeader";
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

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-12">
      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" className="mb-6 animate-hero">
        <Link
          href={`/projects/${params.id}/errors`}
          className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/30 rounded"
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

      {/* ── Title Heading ── */}
      <div className="space-y-1 animate-hero">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Error Group
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl break-words">
          {group.title}
        </h1>
      </div>

      <div className="animate-hero" style={{ animationDelay: "60ms" }}>
        <ErrorGroupHeader
          projectId={params.id}
          groupId={params.groupId}
          severity={group.severity as "INFO" | "WARNING" | "ERROR" | "CRITICAL"}
          initialStatus={group.status as "OPEN" | "RESOLVED" | "IGNORED"}
        />
      </div>

      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4 text-sm animate-hero" style={{ animationDelay: "120ms" }}>
        <div>
          <dt className="font-semibold text-zinc-500 dark:text-zinc-400">Occurrences</dt>
          <dd className="mt-1 tabular-nums text-zinc-900 dark:text-zinc-100">
            {group.occurrenceCount.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-zinc-500 dark:text-zinc-400">First seen</dt>
          <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
            <time dateTime={group.firstSeenAt.toISOString()}>
              {group.firstSeenAt.toLocaleString()}
            </time>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-zinc-500 dark:text-zinc-400">Last seen</dt>
          <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
            <time dateTime={group.lastSeenAt.toISOString()}>
              {group.lastSeenAt.toLocaleString()}
            </time>
          </dd>
        </div>
      </dl>

      <hr className="mt-8 border-gray-200 dark:border-zinc-800 animate-hero" style={{ animationDelay: "180ms" }} />

      <div className="animate-hero" style={{ animationDelay: "240ms" }}>
        <ErrorDetailClient
          projectId={params.id}
          groupId={params.groupId}
          initialItems={initialItems}
          initialNextCursor={nextCursor}
        />
      </div>
    </main>
  );
}