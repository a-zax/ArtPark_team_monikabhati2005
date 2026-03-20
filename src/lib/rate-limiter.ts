interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

export function rateLimit(ip: string): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  let entry = store.get(ip);

  if (!entry) {
    entry = { tokens: MAX_REQUESTS - 1, lastRefill: now };
    store.set(ip, entry);
    return { allowed: true, remaining: entry.tokens, resetMs: WINDOW_MS };
  }

  const elapsed = now - entry.lastRefill;
  const refill = Math.floor((elapsed / WINDOW_MS) * MAX_REQUESTS);

  if (refill > 0) {
    entry.tokens = Math.min(MAX_REQUESTS, entry.tokens + refill);
    entry.lastRefill = now;
  }

  if (entry.tokens <= 0) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, WINDOW_MS - (now - entry.lastRefill)),
    };
  }

  entry.tokens -= 1;
  return {
    allowed: true,
    remaining: entry.tokens,
    resetMs: Math.max(0, WINDOW_MS - (now - entry.lastRefill)),
  };
}

setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS * 2;
  for (const [key, entry] of store.entries()) {
    if (entry.lastRefill < cutoff) {
      store.delete(key);
    }
  }
}, WINDOW_MS);
