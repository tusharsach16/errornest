// Simple in-memory token bucket, sufficient for this project's scale.
// If this ever needs to run across multiple server instances, swap the
// Map below for Redis (INCR + EXPIRE) — nothing else in the codebase
// needs to change since callers only see checkRateLimit().

const WINDOW_MS = 15 * 60 * 1000; // 15 min
const MAX_REQUESTS = 300; // per key, per window

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
