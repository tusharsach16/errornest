"use server";

import { getServerUserId } from "@/lib/session";
import { PrismaProjectRepository } from "@/server/repositories/prisma-project.repository";

export async function getUserProjectIdsAction(): Promise<string[]> {
  const userId = await getServerUserId();
  if (!userId) return [];
  const projectRepo = new PrismaProjectRepository();
  const projects = await projectRepo.listForUser(userId);
  return projects.map((p) => p.id);
}
