-- Durable rate limiting for auth endpoints. The previous limiter was an
-- in-memory Map, which is per-isolate on Cloudflare Workers and resets on
-- every cold start, so brute-force protection did not actually hold in
-- production. Keys are scoped strings such as 'login:<hashed ip>'.
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  window_start TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
