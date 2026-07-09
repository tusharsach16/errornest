"use server";

import { redirect } from "next/navigation";
import { getServerUserId } from "@/lib/session";
import { createProjectSchema } from "@/lib/validators/project.validators";
import { ProjectService } from "@/server/services/project.service";
import {
  PrismaProjectRepository,
  PrismaProjectMemberRepository,
} from "@/server/repositories/prisma-project.repository";
import { PrismaApiKeyRepository } from "@/server/repositories/prisma-api-key.repository";

export type CreateProjectState = {
  fieldError?: string;
  formError?: string;
  result?: { projectId: string; apiKey: string };
};

export async function createProjectAction(
  _prev: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const userId = await getServerUserId();
  if (!userId) redirect("/login");

  const parsed = createProjectSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { fieldError: parsed.error.issues[0]?.message ?? "Invalid name" };
  }

  try {
    const service = new ProjectService(
      new PrismaProjectRepository(),
      new PrismaProjectMemberRepository(),
      new PrismaApiKeyRepository(),
    );
    const { project, apiKey } = await service.createProject(userId, parsed.data.name);
    return { result: { projectId: project.id, apiKey } };
  } catch {
    return { formError: "Failed to create project. Please try again." };
  }
}
