import { db } from "@/lib/db";
import type { IErrorRepository } from "../domain/repositories";
import type { ErrorGroupFilters, ErrorEvent } from "../domain/entities";
import type { ErrorEvent as PrismaErrorEvent } from "@prisma/client";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

function toDomainEvent(row: PrismaErrorEvent): ErrorEvent {
  const userContext =
    row.userContext && typeof row.userContext === "object" && !Array.isArray(row.userContext)
      ? (row.userContext as Record<string, unknown>)
      : null;

  return { ...row, userContext };
}

export class PrismaErrorRepository implements IErrorRepository {
  async findGroupByFingerprint(projectId: string, fingerprint: string) {
    return db.errorGroup.findUnique({
      where: { projectId_fingerprint: { projectId, fingerprint } },
    });
  }

  async createGroup(input: {
    projectId: string;
    fingerprint: string;
    title: string;
    severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  }) {
    return db.errorGroup.create({
      data: { ...input, occurrenceCount: 1 },
    });
  }

  async incrementGroup(groupId: string) {
    return db.errorGroup.update({
      where: { id: groupId },
      data: { occurrenceCount: { increment: 1 }, lastSeenAt: new Date() },
    });
  }

  async appendEvent(input: {
    errorGroupId: string;
    message: string;
    stackTrace?: string | null;
    browser?: string | null;
    url?: string | null;
    userContext?: Record<string, unknown> | null;
  }) {
    const row = await db.errorEvent.create({ data: input as never });
    return toDomainEvent(row);
  }

  async listGroups(projectId: string, filters: ErrorGroupFilters) {
    const limit = Math.min(filters.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    const items = await db.errorGroup.findMany({
      where: {
        projectId,
        status: filters.status,
        severity: filters.severity,
        title: filters.search ? { contains: filters.search, mode: "insensitive" } : undefined,
        lastSeenAt: {
          gte: filters.from,
          lte: filters.to,
        },
      },
      orderBy: [{ lastSeenAt: "desc" }, { id: "asc" }], // stable secondary sort
      take: limit + 1,
      ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
    });

    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;

    return {
      items: page,
      nextCursor: hasMore ? page[page.length - 1]!.id : null,
    };
  }

  async listEvents(groupId: string, cursor?: string, limit = DEFAULT_LIMIT) {
    const take = Math.min(limit, MAX_LIMIT);
    const items = await db.errorEvent.findMany({
      where: { errorGroupId: groupId },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = items.length > take;
    const page = hasMore ? items.slice(0, take) : items;

    return {
      items: page.map(toDomainEvent),
      nextCursor: hasMore ? page[page.length - 1]!.id : null,
    };
  }

  async updateStatus(groupId: string, status: "OPEN" | "RESOLVED" | "IGNORED") {
    return db.errorGroup.update({ where: { id: groupId }, data: { status } });
  }

  async getDailyEventCounts(projectId: string, days: number): Promise<{ date: string; count: number }[]> {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const rows = await db.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', ee."createdAt") AS day,
             COUNT(*)::bigint                  AS count
      FROM   "ErrorEvent"  ee
      JOIN   "ErrorGroup"  eg ON eg.id = ee."errorGroupId"
      WHERE  eg."projectId" = ${projectId}
        AND  ee."createdAt" >= ${since}
      GROUP  BY 1
      ORDER  BY 1 ASC
    `;

    const byDay = new Map(
      rows.map((r) => [r.day.toISOString().slice(0, 10), Number(r.count)]),
    );

    // Produce a zero-filled array for every day in the window.
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(since);
      d.setUTCDate(d.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10);
      return { date: key, count: byDay.get(key) ?? 0 };
    });
  }
}