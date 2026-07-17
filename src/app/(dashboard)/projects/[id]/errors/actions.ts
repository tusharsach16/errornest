"use server";

import { getServerUserId } from "@/lib/session";
import { redirect } from "next/navigation";
import { PrismaErrorRepository } from "@/server/repositories/prisma-error.repository";
import { PrismaProjectMemberRepository } from "@/server/repositories/prisma-project.repository";
import { PrismaSavedSearchRepository } from "@/server/repositories/prisma-saved-search.repository";
import { RbacService } from "@/server/services/rbac.service";
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

export type UpdateStatusResult = { ok: true } | { ok: false; error: string };

export type ErrorStatus = "OPEN" | "RESOLVED" | "IGNORED";

export async function updateErrorStatusAction(
  projectId: string,
  groupId: string,
  status: ErrorStatus,
): Promise<UpdateStatusResult> {
  const userId = await getServerUserId();
  if (!userId) redirect("/login");

  const memberRepo = new PrismaProjectMemberRepository();
  const rbac = new RbacService(memberRepo);

  try {
    await rbac.assertRole(projectId, userId, "MEMBER");
  } catch {
    return { ok: false, error: "You do not have permission to change error status." };
  }

  try {
    const repo = new PrismaErrorRepository();
    await repo.updateStatus(groupId, status);
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to update status. Please try again." };
  }
}

export type SaveSearchResult =
  | { ok: true; search: { id: string; name: string; filters: any } }
  | { ok: false; error: string };

export async function saveSearchAction(
  projectId: string,
  name: string,
  filters: any,
): Promise<SaveSearchResult> {
  const userId = await getServerUserId();
  if (!userId) redirect("/login");

  const memberRepo = new PrismaProjectMemberRepository();
  const role = await memberRepo.getRole(projectId, userId);
  if (!role) return { ok: false, error: "Access denied" };

  try {
    const repo = new PrismaSavedSearchRepository();
    const search = await repo.create({ projectId, userId, name, filters });
    return {
      ok: true,
      search: {
        id: search.id,
        name: search.name,
        filters: search.filters,
      },
    };
  } catch {
    return { ok: false, error: "Failed to save search. Please try again." };
  }
}

export type DeleteSearchResult = { ok: true } | { ok: false; error: string };

export async function deleteSearchAction(searchId: string): Promise<DeleteSearchResult> {
  const userId = await getServerUserId();
  if (!userId) redirect("/login");

  try {
    const repo = new PrismaSavedSearchRepository();
    const search = await repo.findById(searchId);
    if (!search) return { ok: false, error: "Saved search not found." };

    if (search.userId !== userId) {
      return { ok: false, error: "Access denied: You do not own this saved search." };
    }

    const memberRepo = new PrismaProjectMemberRepository();
    const role = await memberRepo.getRole(search.projectId, userId);
    if (!role) return { ok: false, error: "Access denied: You are not a member of this project." };

    await repo.delete(searchId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to delete saved search. Please try again." };
  }
}
