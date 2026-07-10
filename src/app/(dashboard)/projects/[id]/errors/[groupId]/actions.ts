"use server";

import { getServerUserId } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PrismaErrorRepository } from "@/server/repositories/prisma-error.repository";
import { PrismaProjectMemberRepository } from "@/server/repositories/prisma-project.repository";

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

export interface SerializableErrorEvent {
  id: string;
  errorGroupId: string;
  message: string;
  stackTrace: string | null;
  browser: string | null;
  url: string | null;
  createdAt: string;
}

export type GetGroupResult =
  | { ok: true; group: SerializableErrorGroup }
  | { ok: false; error: string };

export type ListEventsResult =
  | { ok: true; items: SerializableErrorEvent[]; nextCursor: string | null }
  | { ok: false; error: string };

export async function getErrorGroupAction(
  projectId: string,
  groupId: string,
): Promise<GetGroupResult> {
  const userId = await getServerUserId();
  if (!userId) redirect("/login");

  const memberRepo = new PrismaProjectMemberRepository();
  const role = await memberRepo.getRole(projectId, userId);
  if (!role) return { ok: false, error: "Not found" };

  try {
    const group = await db.errorGroup.findFirst({
      where: { id: groupId, projectId },
    });

    if (!group) return { ok: false, error: "Not found" };

    return {
      ok: true,
      group: {
        ...group,
        status: group.status as SerializableErrorGroup["status"],
        severity: group.severity as SerializableErrorGroup["severity"],
        firstSeenAt: group.firstSeenAt.toISOString(),
        lastSeenAt: group.lastSeenAt.toISOString(),
      },
    };
  } catch {
    return { ok: false, error: "Failed to load error group" };
  }
}

export async function listErrorEventsAction(
  projectId: string,
  groupId: string,
  cursor?: string,
): Promise<ListEventsResult> {
  const userId = await getServerUserId();
  if (!userId) redirect("/login");

  const memberRepo = new PrismaProjectMemberRepository();
  const role = await memberRepo.getRole(projectId, userId);
  if (!role) return { ok: false, error: "Not found" };

  try {
    const repo = new PrismaErrorRepository();
    const { items, nextCursor } = await repo.listEvents(groupId, cursor);

    const serialized: SerializableErrorEvent[] = items.map((e) => ({
      id: e.id,
      errorGroupId: e.errorGroupId,
      message: e.message,
      stackTrace: e.stackTrace ?? null,
      browser: e.browser ?? null,
      url: e.url ?? null,
      createdAt: e.createdAt.toISOString(),
    }));

    return { ok: true, items: serialized, nextCursor };
  } catch {
    return { ok: false, error: "Failed to load events" };
  }
}