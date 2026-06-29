// Simple in-memory, per-IP fixed-window rate limiter.
// Sufficient for a single-instance deployment to deter spam / cost abuse on
// public unauthenticated endpoints. For multi-instance, swap for a shared store.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

/**
 * Returns true if the request is allowed, false if the limit is exceeded.
 * @param key   Identifier (e.g. "chat:1.2.3.4")
 * @param limit Max requests per window
 * @param windowMs Window length in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  // Opportunistic cleanup of expired buckets (avoid unbounded growth).
  if (now - lastSweep > 60_000) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
    lastSweep = now;
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/** Extract the client IP from x-forwarded-for (first hop), with a safe fallback. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
