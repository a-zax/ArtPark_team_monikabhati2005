/**
 * ENTERPRISE RATE LIMITER
 * ─────────────────────────────────────────────────────────────
 * Sliding Window Token Bucket algorithm.
 *  - Each unique IP gets a fixed number of tokens per window.
 *  - Tokens regenerate proportionally as time slides forward.
 *  - Zero external dependencies — pure in-memory Map.
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS    = 60_000; // 1 minute window
const MAX_REQUESTS = 20;     // max requests per window per IP

export function rateLimit(ip: string): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  let entry = store.get(ip);

  if (!entry) {
    entry = { tokens: MAX_REQUESTS - 1, lastRefill: now };
    store.set(ip, entry);
    return { allowed: true, remaining: entry.tokens, resetMs: WINDOW_MS };
  }

  // Sliding window refill — proportional to time elapsed
  const elapsed = now - entry.lastRefill;
  const refill   = Math.floor((elapsed / WINDOW_MS) * MAX_REQUESTS);

  if (refill > 0) {
    entry.tokens    = Math.min(MAX_REQUESTS, entry.tokens + refill);
    entry.lastRefill = now;
  }

  if (entry.tokens <= 0) {
    const resetMs = WINDOW_MS - (now - entry.lastRefill);
    return { allowed: false, remaining: 0, resetMs };
  }

  entry.tokens -= 1;
  return { allowed: true, remaining: entry.tokens, resetMs: WINDOW_MS };
}

// Periodically purge stale entries to prevent memory leaks
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS * 2;
  store.forEach((entry, key) => {
    if (entry.lastRefill < cutoff) store.delete(key);
  });
}, WINDOW_MS);
