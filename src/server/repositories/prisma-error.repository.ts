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

  /* ═══════════════════════════════════════════════════════════
     Aggregate queries for dashboard overview
     ═══════════════════════════════════════════════════════════ */

  async countEventsForUser(userId: string, since: Date): Promise<number> {
    const rows = await db.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM   "ErrorEvent"  ee
      JOIN   "ErrorGroup"  eg ON eg.id = ee."errorGroupId"
      JOIN   "Project"     p  ON p.id  = eg."projectId"
      LEFT JOIN "ProjectMember" pm ON pm."projectId" = p.id AND pm."userId" = ${userId}
      WHERE  (p."ownerId" = ${userId} OR pm."userId" = ${userId})
        AND  p."deletedAt" IS NULL
        AND  ee."createdAt" >= ${since}
    `;
    return Number(rows[0]?.count ?? 0);
  }

  async countGroupsBySeverityForUser(
    userId: string,
    severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL",
    status?: "OPEN" | "RESOLVED" | "IGNORED",
  ): Promise<number> {
    const severityStr = severity as string;

    if (status) {
      const statusStr = status as string;
      const rows = await db.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(DISTINCT eg.id)::bigint AS count
        FROM   "ErrorGroup" eg
        JOIN   "Project"    p  ON p.id = eg."projectId"
        LEFT JOIN "ProjectMember" pm ON pm."projectId" = p.id AND pm."userId" = ${userId}
        WHERE  (p."ownerId" = ${userId} OR pm."userId" = ${userId})
          AND  p."deletedAt" IS NULL
          AND  eg."severity"::text = ${severityStr}
          AND  eg."status"::text = ${statusStr}
      `;
      return Number(rows[0]?.count ?? 0);
    }

    const rows = await db.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT eg.id)::bigint AS count
      FROM   "ErrorGroup" eg
      JOIN   "Project"    p  ON p.id = eg."projectId"
      LEFT JOIN "ProjectMember" pm ON pm."projectId" = p.id AND pm."userId" = ${userId}
      WHERE  (p."ownerId" = ${userId} OR pm."userId" = ${userId})
        AND  p."deletedAt" IS NULL
        AND  eg."severity"::text = ${severityStr}
    `;
    return Number(rows[0]?.count ?? 0);
  }


  async countResolvedForUser(userId: string, since: Date): Promise<number> {
    const rows = await db.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT eg.id)::bigint AS count
      FROM   "ErrorGroup" eg
      JOIN   "Project"    p  ON p.id = eg."projectId"
      LEFT JOIN "ProjectMember" pm ON pm."projectId" = p.id AND pm."userId" = ${userId}
      WHERE  (p."ownerId" = ${userId} OR pm."userId" = ${userId})
        AND  p."deletedAt" IS NULL
        AND  eg."status" = 'RESOLVED'
        AND  eg."lastSeenAt" >= ${since}
    `;
    return Number(rows[0]?.count ?? 0);
  }

  async getDailyEventCountsForUser(userId: string, days: number): Promise<{ date: string; count: number }[]> {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const rows = await db.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', ee."createdAt") AS day,
             COUNT(*)::bigint                  AS count
      FROM   "ErrorEvent"  ee
      JOIN   "ErrorGroup"  eg ON eg.id = ee."errorGroupId"
      JOIN   "Project"     p  ON p.id  = eg."projectId"
      LEFT JOIN "ProjectMember" pm ON pm."projectId" = p.id AND pm."userId" = ${userId}
      WHERE  (p."ownerId" = ${userId} OR pm."userId" = ${userId})
        AND  p."deletedAt" IS NULL
        AND  ee."createdAt" >= ${since}
      GROUP  BY 1
      ORDER  BY 1 ASC
    `;

    const byDay = new Map(
      rows.map((r) => [r.day.toISOString().slice(0, 10), Number(r.count)]),
    );

    return Array.from({ length: days }, (_, i) => {
      const d = new Date(since);
      d.setUTCDate(d.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10);
      return { date: key, count: byDay.get(key) ?? 0 };
    });
  }

  async getProjectSummaries(
    projectIds: string[],
  ): Promise<Map<string, { errorCount24h: number; worstSeverity: "INFO" | "WARNING" | "ERROR" | "CRITICAL" | null; dailyCounts: number[] }>> {
    if (projectIds.length === 0) return new Map();

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const since7d = new Date();
    since7d.setUTCHours(0, 0, 0, 0);
    since7d.setUTCDate(since7d.getUTCDate() - 6);

    // 1) Error count in last 24h per project
    const countRows = await db.$queryRaw<{ projectId: string; count: bigint }[]>`
      SELECT eg."projectId", COUNT(ee.id)::bigint AS count
      FROM   "ErrorEvent" ee
      JOIN   "ErrorGroup" eg ON eg.id = ee."errorGroupId"
      WHERE  eg."projectId" = ANY(${projectIds})
        AND  ee."createdAt" >= ${since24h}
      GROUP BY eg."projectId"
    `;

    // 2) Worst severity per project (OPEN groups only)
    const SEVERITY_ORDER = ["INFO", "WARNING", "ERROR", "CRITICAL"] as const;
    const sevRows = await db.$queryRaw<{ projectId: string; severity: string }[]>`
      SELECT DISTINCT ON (eg."projectId") eg."projectId", eg."severity"::text
      FROM   "ErrorGroup" eg
      WHERE  eg."projectId" = ANY(${projectIds})
        AND  eg."status" = 'OPEN'
      ORDER BY eg."projectId",
               CASE eg."severity"
                 WHEN 'CRITICAL' THEN 4
                 WHEN 'ERROR'    THEN 3
                 WHEN 'WARNING'  THEN 2
                 WHEN 'INFO'     THEN 1
               END DESC
    `;

    // 3) Daily counts for last 7 days per project
    const dailyRows = await db.$queryRaw<{ projectId: string; day: Date; count: bigint }[]>`
      SELECT eg."projectId",
             date_trunc('day', ee."createdAt") AS day,
             COUNT(*)::bigint AS count
      FROM   "ErrorEvent" ee
      JOIN   "ErrorGroup" eg ON eg.id = ee."errorGroupId"
      WHERE  eg."projectId" = ANY(${projectIds})
        AND  ee."createdAt" >= ${since7d}
      GROUP BY eg."projectId", day
      ORDER BY day ASC
    `;

    // Build result map
    const countMap = new Map(countRows.map((r) => [r.projectId, Number(r.count)]));
    const sevMap = new Map(sevRows.map((r) => [r.projectId, r.severity as typeof SEVERITY_ORDER[number]]));

    const dailyMap = new Map<string, Map<string, number>>();
    for (const r of dailyRows) {
      const key = r.day.toISOString().slice(0, 10);
      if (!dailyMap.has(r.projectId)) dailyMap.set(r.projectId, new Map());
      dailyMap.get(r.projectId)!.set(key, Number(r.count));
    }

    const result = new Map<string, { errorCount24h: number; worstSeverity: typeof SEVERITY_ORDER[number] | null; dailyCounts: number[] }>();

    for (const pid of projectIds) {
      const daily = dailyMap.get(pid) ?? new Map<string, number>();
      const dailyCounts = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(since7d);
        d.setUTCDate(d.getUTCDate() + i);
        return daily.get(d.toISOString().slice(0, 10)) ?? 0;
      });

      result.set(pid, {
        errorCount24h: countMap.get(pid) ?? 0,
        worstSeverity: sevMap.get(pid) ?? null,
        dailyCounts,
      });
    }

    return result;
  }
}