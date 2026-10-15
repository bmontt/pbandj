// Best-effort, in-memory, fixed-window rate limiter keyed by client IP.
//
// Limits on serverless (Vercel): each function instance keeps its own counters,
// counters reset on cold start, and concurrent instances don't share state, so the
// effective limit is "limit x number of warm instances". It stops casual abuse and
// scripted bursts against one instance; it is not a hard guarantee. For a strict
// limit, move this to a shared store (e.g. Upstash Redis) or a Vercel Firewall rule.

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()
const MAX_TRACKED_KEYS = 10_000

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number }

export function rateLimit(
  scope: string,
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now()
  const id = `${scope}:${key}`

  if (buckets.size >= MAX_TRACKED_KEYS) prune(now)

  const bucket = buckets.get(id)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterSeconds: 0 }
  }

  bucket.count += 1
  if (bucket.count > limit) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) }
  }
  return { ok: true, retryAfterSeconds: 0 }
}

function prune(now: number) {
  for (const [id, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(id)
  }
  // Still full of live buckets: drop the oldest entries rather than grow without bound.
  if (buckets.size >= MAX_TRACKED_KEYS) {
    const excess = buckets.size - MAX_TRACKED_KEYS / 2
    let removed = 0
    for (const id of buckets.keys()) {
      if (removed++ >= excess) break
      buckets.delete(id)
    }
  }
}
