import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerUserId } from "@/lib/session";
import {
  PrismaProjectRepository,
  PrismaProjectMemberRepository,
} from "@/server/repositories/prisma-project.repository";
import { PrismaErrorRepository } from "@/server/repositories/prisma-error.repository";
import { OverviewChart } from "./OverviewChart";

interface Props {
  params: { id: string };
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

export default async function ProjectOverviewPage({ params }: Props) {
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
      <nav aria-label="Project navigation" className="mb-6 flex gap-1 border-b border-gray-200">
        <span
          className="border-b-2 border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600"
          aria-current="page"
        >
          Overview
        </span>
        <Link
          href={`/projects/${params.id}/errors`}
          className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 transition-colors duration-[150ms] hover:text-gray-900"
        >
          Errors
        </Link>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
        {project.name}
      </h1>

      {hasAnyData ? (
        <div className="mt-8 space-y-8">
          <section aria-labelledby="chart-heading">
            <h2
              id="chart-heading"
              className="mb-4 text-base font-semibold text-gray-700"
            >
              Error volume — last 14 days
            </h2>
            <div className="rounded-card border border-gray-200 bg-white p-6">
              <OverviewChart data={dailyCounts} />
            </div>
          </section>

          <section aria-labelledby="top-groups-heading">
            <h2
              id="top-groups-heading"
              className="mb-4 text-base font-semibold text-gray-700"
            >
              Top 5 error groups
            </h2>
            <ol className="rounded-card border border-gray-200 bg-white divide-y divide-gray-100">
              {topGroups.map((group, idx) => (
                <li key={group.id}>
                  <Link
                    href={`/projects/${params.id}/errors/${group.id}`}
                    className="flex items-center gap-4 px-6 py-4 transition-colors duration-[150ms] hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-600/40"
                  >
                    <span className="w-5 shrink-0 text-right text-sm font-semibold tabular-nums text-gray-400">
                      {idx + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                      {group.title}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-gray-500">
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
  const snippet = `curl -X POST https://errornest.app/api/errors/ingest \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: YOUR_API_KEY" \\
  -d '{"message":"Test error","severity":"ERROR"}'`;

  return (
    <div className="mt-8 rounded-card border border-dashed border-indigo-200 bg-indigo-50 px-8 py-12 text-center">
      <p className="text-lg font-semibold text-indigo-900">
        No errors captured yet for {projectName}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-indigo-700">
        Send your first error using your API key. Here&apos;s a quick curl
        example:
      </p>
      <pre className="mx-auto mt-6 max-w-xl overflow-x-auto rounded-card bg-gray-900 px-4 py-4 text-left font-mono text-xs leading-relaxed text-gray-100">
        {snippet}
      </pre>
    </div>
  );
}

const SEVERITY_CLASSES: Record<string, string> = {
  INFO: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  WARNING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  ERROR: "bg-red-50 text-red-700 ring-1 ring-red-200",
  CRITICAL: "bg-red-100 text-red-800 ring-1 ring-red-300 font-semibold",
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
