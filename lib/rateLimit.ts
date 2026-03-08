/**
 * Simple in-memory rate limiter.
 * Resets on server restart — suitable for single-instance deployments.
 * Swap the store for Redis (e.g. @upstash/ratelimit) for multi-instance.
 */

interface Entry { count: number; resetAt: number }
const store = new Map<string, Entry>();

export function checkRateLimit(
  key: string,
  opts: { max: number; windowMs: number } = { max: 5, windowMs: 60 * 60 * 1000 }
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, remaining: opts.max - 1, retryAfterMs: 0 };
  }

  if (entry.count >= opts.max) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: opts.max - entry.count, retryAfterMs: 0 };
}
