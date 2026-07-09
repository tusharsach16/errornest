// Pure domain types. Nothing here imports Prisma, Next.js, or any framework —
// this is the boundary that keeps business logic testable and swappable.

export type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
export type ErrorStatus = "OPEN" | "RESOLVED" | "IGNORED";
export type Severity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export interface Project {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: Date;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: Role;
}

export interface ErrorGroup {
  id: string;
  projectId: string;
  fingerprint: string;
  title: string;
  status: ErrorStatus;
  severity: Severity;
  occurrenceCount: number;
  firstSeenAt: Date;
  lastSeenAt: Date;
}

export interface ErrorEvent {
  id: string;
  errorGroupId: string;
  message: string;
  stackTrace?: string | null;
  browser?: string | null;
  url?: string | null;
  userContext?: Record<string, unknown> | null;
  createdAt: Date;
}

/** Payload shape a client SDK / curl request sends to the ingestion endpoint. */
export interface IncomingErrorPayload {
  message: string;
  stackTrace?: string;
  severity?: Severity;
  url?: string;
  browser?: string;
  userContext?: Record<string, unknown>;
}

export interface ErrorGroupFilters {
  status?: ErrorStatus;
  severity?: Severity;
  search?: string;
  from?: Date;
  to?: Date;
  cursor?: string;
  limit?: number;
}
