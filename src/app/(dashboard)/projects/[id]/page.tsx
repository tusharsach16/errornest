import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerUserId } from "@/lib/session";
import {
  PrismaProjectRepository,
  PrismaProjectMemberRepository,
} from "@/server/repositories/prisma-project.repository";
import { PrismaErrorRepository } from "@/server/repositories/prisma-error.repository";
import { IntegrationOnboarding } from "@/components/dashboard/IntegrationOnboarding";
import dynamic from "next/dynamic";

const OverviewChart = dynamic(
  () => import("./OverviewChart").then((m) => m.OverviewChart),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[220px] animate-pulse rounded-card bg-zinc-900/10 dark:bg-zinc-800/30"
        aria-busy="true"
        aria-label="Loading chart"
      />
    ),
  },
);

interface Props {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const projectRepo = new PrismaProjectRepository();
  const project = await projectRepo.findById(params.id);
  const name = project?.name ?? "Project";
  return {
    title: `${name} — Overview · ErrorNest`,
    description: `Error volume trends and top error groups for the ${name} project.`,
  };
}

export default async function ProjectOverviewPage({ params, searchParams }: Props) {
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

  const errorRepo = new PrismaErrorRepository();
  const [dailyCounts, { items: topGroups }] = await Promise.all([
    errorRepo.getDailyEventCounts(params.id, 14),
    errorRepo.listGroups(params.id, { limit: 5 }),
  ]);

  const hasAnyData = topGroups.length > 0;

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-12">
      {/* ── Tabs ── */}
      <nav aria-label="Project navigation" className="mb-6 flex gap-1 border-b border-gray-200 dark:border-zinc-800">
        <span
          className="border-b-2 border-indigo-650 dark:border-indigo-500 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400"
          aria-current="page"
        >
          Overview
        </span>
        <Link
          href={`/projects/${params.id}/errors`}
          className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-zinc-550 dark:text-zinc-400 transition-colors duration-[150ms] hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Errors
        </Link>
        {(role === "OWNER" || role === "ADMIN") && (
          <Link
            href={`/projects/${params.id}/team`}
            className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-zinc-550 dark:text-zinc-400 transition-colors duration-[150ms] hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Team
          </Link>
        )}
      </nav>

      {searchParams.message === "access-denied" && (
        <div role="alert" className="mb-6 rounded-input border border-amber-250 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          You need to be an Admin or Owner to access the Team page.
        </div>
      )}

      {/* ── Title Heading ── */}
      <div className="space-y-1 animate-hero">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Project Overview
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          {project.name}
        </h1>
      </div>

      {hasAnyData ? (
        <div className="mt-8 space-y-8">
          {/* ── Chart ── */}
          <section aria-labelledby="chart-heading" className="animate-hero" style={{ animationDelay: "60ms" }}>
            <h2
              id="chart-heading"
              className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Error volume — last 14 days
            </h2>
            <div className="relative overflow-hidden rounded-card border border-zinc-800 bg-zinc-950 p-6 pt-8 shadow-xl before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-indigo-500">
              <OverviewChart data={dailyCounts} />
            </div>
          </section>

          {/* ── Top Groups ── */}
          <section aria-labelledby="top-groups-heading" className="animate-hero" style={{ animationDelay: "120ms" }}>
            <h2
              id="top-groups-heading"
              className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Top 5 error groups
            </h2>
            <ol className="rounded-card border border-gray-200 dark:border-zinc-800 bg-[#FDFDFD] dark:bg-zinc-900/20 divide-y divide-gray-150 dark:divide-zinc-800/80 shadow-sm overflow-hidden">
              {topGroups.map((group, idx) => (
                <li key={group.id}>
                  <Link
                    href={`/projects/${params.id}/errors/${group.id}`}
                    className="flex items-center gap-4 px-6 py-4 transition-colors duration-[150ms] hover:bg-zinc-50 dark:hover:bg-zinc-800/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-600/40"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] bg-zinc-100 dark:bg-zinc-800 font-mono text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      {idx + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {group.title}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
                      {group.occurrenceCount.toLocaleString()} events
                    </span>
                    <SeverityBadge severity={group.severity} />
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        </div>
      ) : (
        <EmptyState projectName={project.name} />
      )}
    </main>
  );
}

function EmptyState({ projectName }: { projectName: string }) {
  return <IntegrationOnboarding projectName={projectName} />;
}

const SEVERITY_CLASSES: Record<string, string> = {
  INFO: "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900/50",
  WARNING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900/50",
  ERROR: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-900/50",
  CRITICAL: "bg-red-100 text-red-800 ring-1 ring-red-300 font-semibold dark:bg-red-900/40 dark:text-red-200 dark:ring-red-800",
};

function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-pill px-2 py-0.5 text-xs ${SEVERITY_CLASSES[severity] ?? ""}`}
    >
      {severity}
    </span>
  );
}
