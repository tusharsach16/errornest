import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerUserId } from "@/lib/session";
import {
  PrismaProjectRepository,
  PrismaProjectMemberRepository,
} from "@/server/repositories/prisma-project.repository";
import { TeamClient } from "./TeamClient";
import type { Role } from "@/server/domain/entities";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const projectRepo = new PrismaProjectRepository();
  const project = await projectRepo.findById(params.id);
  const name = project?.name ?? "Project";
  return {
    title: `${name} — Team · ErrorNest`,
    description: `Manage team members and roles for the ${name} project.`,
  };
}

const ALLOWED_ROLES: Role[] = ["OWNER", "ADMIN"];

export default async function TeamPage({ params }: Props) {
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

  if (!ALLOWED_ROLES.includes(role)) {
    redirect(`/projects/${params.id}?message=access-denied`);
  }

  const members = await memberRepo.listWithUserDetails(params.id);

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-12">
      {/* ── Tabs ── */}
      <nav aria-label="Project navigation" className="mb-6 flex gap-1 border-b border-gray-200 dark:border-zinc-800">
        <Link
          href={`/projects/${params.id}`}
          className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 transition-colors duration-[150ms] hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Overview
        </Link>
        <Link
          href={`/projects/${params.id}/errors`}
          className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 transition-colors duration-[150ms] hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Errors
        </Link>
        <span
          className="border-b-2 border-indigo-600 dark:border-indigo-500 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400"
          aria-current="page"
        >
          Team
        </span>
      </nav>

      {/* ── Title Heading ── */}
      <div className="space-y-1 animate-hero">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Team Management
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          {project.name} — Team
        </h1>
      </div>

      <TeamClient
        projectId={params.id}
        projectName={project.name}
        currentUserId={userId}
        currentRole={role as "OWNER" | "ADMIN"}
        initialMembers={members}
      />
    </main>
  );
}
