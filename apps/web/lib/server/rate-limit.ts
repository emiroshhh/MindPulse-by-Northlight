const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * In-memory limiter. Per-isolate only — on Cloudflare Workers this resets on
 * cold starts and does not coordinate across isolates. Kept as the fallback
 * when D1 is unavailable; use checkRateLimitDurable for real protection.
 */
export function checkRateLimit(key: string, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

/**
 * Rate-limit keys are stored in D1, so never store raw IPs — hash them first.
 */
export async function hashedLimiterKey(scope: string, value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hex = [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return `${scope}:${hex.slice(0, 32)}`;
}

type D1PreparedLike = {
  bind: (...values: unknown[]) => {
    run: () => Promise<{ meta?: { changes?: number } }>;
  };
};

type D1DatabaseLike = {
  prepare: (query: string) => D1PreparedLike;
};

/**
 * Durable, atomic rate limiter backed by D1. Survives Worker restarts and is
 * shared across isolates. A single upsert either increments the counter for
 * the current window (when under the limit) or starts a new window; when the
 * statement changes no rows the caller is over the limit.
 *
 * Falls back to the in-memory limiter if D1 errors, so an infrastructure
 * outage degrades protection instead of blocking every user.
 */
export async function checkRateLimitDurable(
  db: D1DatabaseLike,
  key: string,
  limit = 8,
  windowMs = 60_000,
): Promise<boolean> {
  const now = Date.now();
  const windowStart = String(Math.floor(now / windowMs));
  try {
    const result = await db
      .prepare(
        `INSERT INTO rate_limits (key, window_start, count, updated_at)
         VALUES (?, ?, 1, ?)
         ON CONFLICT(key) DO UPDATE SET
           count = CASE
             WHEN rate_limits.window_start = excluded.window_start
               THEN rate_limits.count + 1
             ELSE 1
           END,
           window_start = excluded.window_start,
           updated_at = excluded.updated_at
         WHERE rate_limits.window_start != excluded.window_start
            OR rate_limits.count < ?`,
      )
      .bind(key, windowStart, new Date(now).toISOString(), limit)
      .run();
    const changes = result.meta?.changes ?? 1;
    return changes > 0;
  } catch {
    return checkRateLimit(`fallback:${key}`, limit, windowMs);
  }
}
