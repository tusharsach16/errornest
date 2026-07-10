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
      <nav aria-label="Project navigation" className="mb-6 flex gap-1 border-b border-gray-200">
        <Link
          href={`/projects/${params.id}`}
          className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 transition-colors duration-[150ms] hover:text-gray-900"
        >
          Overview
        </Link>
        <Link
          href={`/projects/${params.id}/errors`}
          className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 transition-colors duration-[150ms] hover:text-gray-900"
        >
          Errors
        </Link>
        <span
          className="border-b-2 border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600"
          aria-current="page"
        >
          Team
        </span>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
        {project.name} — Team
      </h1>

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
