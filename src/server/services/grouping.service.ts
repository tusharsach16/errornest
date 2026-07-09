import { createHash } from "crypto";
import type { IncomingErrorPayload } from "../domain/entities";

/**
 * Turns an incoming error into a stable fingerprint so repeated occurrences
 * of "the same" error collapse into one ErrorGroup instead of one row per
 * event. Kept as its own class (not a free function buried in the service)
 * so the algorithm can be swapped/tested independently — e.g. a smarter
 * version that normalizes stack frames across library versions.
 */
export class GroupingService {
  fingerprint(payload: IncomingErrorPayload): string {
    const normalizedMessage = this.normalizeMessage(payload.message);
    const topFrame = this.extractTopFrame(payload.stackTrace);
    const raw = `${normalizedMessage}::${topFrame}`;
    return createHash("sha256").update(raw).digest("hex").slice(0, 16);
  }

  titleFor(payload: IncomingErrorPayload): string {
    return payload.message.slice(0, 140);
  }

  private normalizeMessage(message: string): string {
    // Strip dynamic bits (ids, numbers, quoted values) so "user 123 not
    // found" and "user 456 not found" fingerprint the same.
    return message
      .replace(/\b\d+\b/g, "#")
      .replace(/["'][^"']*["']/g, "#")
      .trim()
      .toLowerCase();
  }

  private extractTopFrame(stackTrace?: string): string {
    if (!stackTrace) return "no-stack";
    const firstLine = stackTrace.split("\n").find((l) => l.trim().length > 0);
    return firstLine?.trim() ?? "no-stack";
  }
}
