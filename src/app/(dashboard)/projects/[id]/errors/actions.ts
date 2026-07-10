"use server";

import { getServerUserId } from "@/lib/session";
import { redirect } from "next/navigation";
import { PrismaErrorRepository } from "@/server/repositories/prisma-error.repository";
import { PrismaProjectMemberRepository } from "@/server/repositories/prisma-project.repository";
import type { ErrorGroupFilters } from "@/server/domain/entities";

export type ListGroupsResult =
  | { ok: true; items: SerializableErrorGroup[]; nextCursor: string | null }
  | { ok: false; error: string };

export interface SerializableErrorGroup {
  id: string;
  projectId: string;
  fingerprint: string;
  title: string;
  status: "OPEN" | "RESOLVED" | "IGNORED";
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  occurrenceCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
}

export async function listErrorGroupsAction(
  projectId: string,
  filters: ErrorGroupFilters,
): Promise<ListGroupsResult> {
  const userId = await getServerUserId();
  if (!userId) redirect("/login");

  const memberRepo = new PrismaProjectMemberRepository();
  const role = await memberRepo.getRole(projectId, userId);
  if (!role) return { ok: false, error: "Not found" };

  try {
    const repo = new PrismaErrorRepository();
    const { items, nextCursor } = await repo.listGroups(projectId, filters);

    // Dates must be serialisable across the server→client boundary.
    const serialized: SerializableErrorGroup[] = items.map((g) => ({
      ...g,
      firstSeenAt: g.firstSeenAt.toISOString(),
      lastSeenAt: g.lastSeenAt.toISOString(),
    }));

    return { ok: true, items: serialized, nextCursor };
  } catch {
    return { ok: false, error: "Failed to load errors" };
  }
}
