import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerUserId } from "@/lib/session";
import { PrismaProjectRepository } from "@/server/repositories/prisma-project.repository";
import type { Project } from "@/server/domain/entities";

export const metadata: Metadata = {
  title: "Your Projects — ErrorNest",
  description:
    "View and manage all your ErrorNest projects. Create a new project to start monitoring production errors in real time.",
};

export default async function ProjectsPage() {
  const userId = await getServerUserId();
  if (!userId) redirect("/login");

  const repo = new PrismaProjectRepository();
  const projects: Project[] = await repo.listForUser(userId!);

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Projects</h1>
        <Link
          href="/projects/new"
          className="inline-flex items-center rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-[150ms] hover:bg-indigo-700"
          style={{ minHeight: "44px" }}
        >
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}/errors`}
                className="block rounded-card border border-gray-200 bg-white p-6 transition-shadow duration-[150ms] hover:shadow-md"
              >
                <p className="text-base font-semibold text-gray-900">{project.name}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Created{" "}
                  {new Date(project.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <div className="rounded-card border border-dashed border-gray-300 bg-gray-50 px-12 py-16">
        <p className="text-lg font-semibold text-gray-900">No projects yet</p>
        <p className="mt-2 max-w-xs text-sm text-gray-500">
          Create your first project to get an API key and start capturing errors.
        </p>
        <Link
          href="/projects/new"
          className="mt-6 inline-flex items-center rounded bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-[150ms] hover:bg-indigo-700"
          style={{ minHeight: "44px" }}
        >
          Create your first project
        </Link>
      </div>
    </div>
  );
}
