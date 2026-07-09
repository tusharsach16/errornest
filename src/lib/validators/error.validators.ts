import { z } from "zod";

// Same schema is meant to be imported by both the ingestion API route and
// any client-side test harness, so client and server never disagree on
// what's valid (per PDF "Data & CRUD" requirement).
export const incomingErrorSchema = z.object({
  message: z.string().min(1).max(2000),
  stackTrace: z.string().max(20_000).optional(),
  severity: z.enum(["INFO", "WARNING", "ERROR", "CRITICAL"]).optional(),
  url: z.string().url().optional(),
  browser: z.string().max(300).optional(),
  userContext: z.record(z.unknown()).optional(),
});

export type IncomingErrorInput = z.infer<typeof incomingErrorSchema>;

export const errorGroupFilterSchema = z.object({
  status: z.enum(["OPEN", "RESOLVED", "IGNORED"]).optional(),
  severity: z.enum(["INFO", "WARNING", "ERROR", "CRITICAL"]).optional(),
  search: z.string().max(200).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});
