import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerUserId } from "@/lib/session";
import { PrismaProjectRepository } from "@/server/repositories/prisma-project.repository";
import { PrismaErrorRepository } from "@/server/repositories/prisma-error.repository";
import type { Project } from "@/server/domain/entities";
import StatCard from "@/components/dashboard/StatCard";
import ProjectCard from "@/components/dashboard/ProjectCard";
import { ProjectsPoller } from "./ProjectsPoller";

export const metadata: Metadata = {
  title: "Your Projects — ErrorNest",
  description:
    "View and manage all your ErrorNest projects. Create a new project to start monitoring production errors in real time.",
};

export default async function ProjectsPage() {
  const userId = await getServerUserId();
  if (!userId) redirect("/login");

  const projectRepo = new PrismaProjectRepository();
  const errorRepo = new PrismaErrorRepository();

  const projects: Project[] = await projectRepo.listForUser(userId!);

  // Fetch aggregate stats in parallel
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const projectIds = projects.map((p) => p.id);

  const [totalErrors24h, criticalAlerts, resolvedToday, projectSummaries] = await Promise.all([
    errorRepo.countEventsForUser(userId!, since24h),
    errorRepo.countGroupsBySeverityForUser(userId!, "CRITICAL", "OPEN"),
    errorRepo.countResolvedForUser(userId!, since24h),
    errorRepo.getProjectSummaries(projectIds),
  ]);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <ProjectsPoller initialProjectIds={projectIds} />
      {/* ── Header ── */}
      <div className="flex items-center justify-between animate-hero">
        <div className="space-y-1">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Dashboard
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Projects
          </h1>
        </div>
        <Link
          href="/projects/new"
          className="
            inline-flex items-center justify-center gap-2 rounded-[10px]
            bg-gradient-to-r from-indigo-600 to-purple-600
            hover:from-indigo-500 hover:to-purple-500
            px-5 py-2.5 text-sm font-semibold text-white
            shadow-lg shadow-indigo-500/20
            transition-all duration-150 ease-out
            hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-500/30
            active:scale-[0.98]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
            motion-reduce:hover:scale-100 motion-reduce:active:scale-100
          "
          style={{ minHeight: "44px" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 4v16m8-8H4" />
          </svg>
          New project
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Projects"
          value={projects.length}
          gradient="blue"
          delay={60}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
        />
        <StatCard
          label="Errors (24h)"
          value={totalErrors24h}
          gradient="red"
          delay={120}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Critical Alerts"
          value={criticalAlerts}
          gradient="amber"
          delay={180}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.834-2.694-.834-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
        />
        <StatCard
          label="Resolved Today"
          value={resolvedToday}
          gradient="emerald"
          delay={240}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* ── Project Grid ── */}
      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="mt-8 mb-4 flex items-center justify-between animate-hero" style={{ animationDelay: "200ms" }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Your Projects
            </h2>
            <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </span>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, idx) => {
              const summary = projectSummaries.get(project.id);
              return (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  createdAt={project.createdAt}
                  errorCount24h={summary?.errorCount24h ?? 0}
                  worstSeverity={summary?.worstSeverity ?? null}
                  dailyCounts={summary?.dailyCounts ?? [0, 0, 0, 0, 0, 0, 0]}
                  index={idx}
                />
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-16 flex flex-col items-center text-center animate-hero" style={{ animationDelay: "100ms" }}>
      <div className="rounded-card border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20 px-12 py-16 max-w-md shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 mb-4">
          <svg className="h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No projects yet</p>
        <p className="mt-2 max-w-xs text-sm text-zinc-600 dark:text-zinc-400">
          Create your first project to get an API key and start capturing errors.
        </p>
        <Link
          href="/projects/new"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-150 ease-out hover:scale-[1.03] active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
          style={{ minHeight: "44px" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 4v16m8-8H4" />
          </svg>
          Create your first project
        </Link>
      </div>
    </div>
  );
}
