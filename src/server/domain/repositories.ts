import type {
  Project,
  ProjectMember,
  ErrorGroup,
  ErrorEvent,
  ErrorGroupFilters,
  Role,
  Severity,
} from "./entities";

export interface MemberWithUser {
  id: string;
  projectId: string;
  userId: string;
  role: Role;
  userName: string | null;
  userEmail: string;
}

/**
 * Each interface is scoped to one entity (Interface Segregation) so a
 * service only depends on the slice it actually needs. Concrete
 * implementations live in src/server/repositories/*, currently backed by
 * Prisma. Swapping the datastore later means writing a new class here —
 * services and API routes never change (Dependency Inversion).
 */

export interface IProjectRepository {
  create(input: { name: string; slug: string; ownerId: string }): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findBySlug(slug: string): Promise<Project | null>;
  listForUser(userId: string): Promise<Project[]>;
  softDelete(id: string): Promise<void>;
}

export interface IProjectMemberRepository {
  add(projectId: string, userId: string, role: Role): Promise<ProjectMember>;
  updateRole(projectId: string, userId: string, role: Role): Promise<ProjectMember>;
  remove(projectId: string, userId: string): Promise<void>;
  getRole(projectId: string, userId: string): Promise<Role | null>;
  list(projectId: string): Promise<ProjectMember[]>;
  listWithUserDetails(projectId: string): Promise<MemberWithUser[]>;
}

export interface IErrorRepository {
  /** Find an existing group by its fingerprint, or null if this is a new error type. */
  findGroupByFingerprint(projectId: string, fingerprint: string): Promise<ErrorGroup | null>;
  createGroup(input: {
    projectId: string;
    fingerprint: string;
    title: string;
    severity: ErrorGroup["severity"];
  }): Promise<ErrorGroup>;
  incrementGroup(groupId: string): Promise<ErrorGroup>;
  appendEvent(input: Omit<ErrorEvent, "id" | "createdAt">): Promise<ErrorEvent>;
  listGroups(projectId: string, filters: ErrorGroupFilters): Promise<{ items: ErrorGroup[]; nextCursor: string | null }>;
  listEvents(groupId: string, cursor?: string, limit?: number): Promise<{ items: ErrorEvent[]; nextCursor: string | null }>;
  updateStatus(groupId: string, status: ErrorGroup["status"]): Promise<ErrorGroup>;
  getDailyEventCounts(projectId: string, days: number): Promise<{ date: string; count: number }[]>;

  /* ── Aggregate queries for dashboard overview ── */
  countEventsForUser(userId: string, since: Date): Promise<number>;
  countGroupsBySeverityForUser(userId: string, severity: Severity, status?: ErrorGroup["status"]): Promise<number>;
  countResolvedForUser(userId: string, since: Date): Promise<number>;
  getDailyEventCountsForUser(userId: string, days: number): Promise<{ date: string; count: number }[]>;
  getProjectSummaries(projectIds: string[]): Promise<Map<string, { errorCount24h: number; worstSeverity: Severity | null; dailyCounts: number[] }>>;
}

export interface IApiKeyRepository {
  create(projectId: string, hashedKey: string, label?: string): Promise<{ id: string }>;
  findByHash(hashedKey: string): Promise<{ projectId: string; revokedAt: Date | null } | null>;
  revoke(id: string): Promise<void>;
}
