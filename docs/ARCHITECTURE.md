# MindPulse Architecture

Last updated: 2026-07-14

## Overview

MindPulse is a Next.js 15 (App Router, React 19) application compiled with the
OpenNext Cloudflare adapter and deployed as a single Cloudflare Worker
(`mindpulse`) with Static Assets and a D1 (SQLite) database. There is no other
backend.

```text
Browser (guest-first UI, localStorage for guest state)
   |
   v
Cloudflare Worker (OpenNext bundle)
   ├── middleware.ts            security headers (CSP, HSTS, frame, …)
   ├── SSR pages                landing, dashboard, tools, recovery, docs pages
   └── API routes (app/api/*)
         ├── /api/chat          safety screen → daily quota → AI → output screen
         ├── /api/recovery      safety screen → quota → AI JSON (zod) → fallback
         ├── /api/agent         saved plans/results (GET/POST/PATCH, owner-scoped)
         ├── /api/chat/history  account chat history (owner-scoped)
         ├── /api/insights      per-account activity aggregates
         ├── /api/feedback      anonymous product feedback
         ├── /api/events        allowlisted aggregate beta counters
         └── /api/auth/*        signup, login, logout, me, delete-account, debug*
   |
   ├── AI providers (server-side only)
   │     ├── Google Gemini (default, Interactions API)
   │     └── DeepSeek (optional, AI_PROVIDER=deepseek)
   └── Cloudflare D1 (mindpulse-db)
```

`*` `/api/auth/debug` is disabled unless the `AUTH_DEBUG` env flag is set.

## Data model (D1)

| Table              | Purpose                                                              |
| ------------------ | -------------------------------------------------------------------- |
| `users`            | id, email (unique), PBKDF2 password hash, name, timestamps           |
| `sessions`         | HMAC-SHA-256 hash of the session token (never the raw token), expiry |
| `chat_messages`    | account chat history (user_id, role, content, mode)                  |
| `agent_tasks`      | saved artifacts: `kind` ∈ plan / tool_result / recovery, JSON `data` |
| `user_preferences` | reserved per-user JSON blob                                          |
| `daily_usage`      | atomic daily AI-message counters (account id or hashed guest key)    |
| `rate_limits`      | durable fixed-window counters for auth/feedback/events (hashed keys) |
| `feedback`         | anonymous product feedback — deliberately no user_id/IP/session      |
| `events`           | aggregate beta counters (name, day, count) — no per-user rows        |

Migrations live in `migrations/` (applied with Wrangler). `ensureAuthSchema`
in `apps/web/lib/server/auth.ts` mirrors the schema with `CREATE TABLE IF NOT
EXISTS` as a runtime self-healing layer — new tables/columns must land in both
places.

## Data flow decisions

- **Guest-first**: `/app`, the six tools, and `/recovery` work without login.
  Guest state (chat history, saved plans/results, next action, language) lives
  in localStorage on the device and is never uploaded.
- **Ownership**: every account-scoped query filters by the session user's id
  (`WHERE user_id = ?`); no route accepts a foreign object id for reads or
  writes without that filter, so IDOR is structurally excluded.
- **Quota**: one atomic D1 upsert reserves a message
  (`ON CONFLICT … DO UPDATE … WHERE message_count < ?`), so limits hold across
  Worker isolates and restarts.
- **Sessions**: 32-byte random tokens, stored only as keyed HMAC hashes;
  cookies are `HttpOnly; Secure; SameSite=Lax` (`__Host-` variant included).
  A localStorage fallback token exists for a documented Cloudflare cookie
  reliability issue — see docs/LIMITATIONS.md.
- **AI structured output**: Recovery Mode requires strict JSON validated by a
  zod schema (`packages/shared/src/recovery.ts`) with one repair retry, then a
  deterministic fallback plan built only from the user's own items. Chat output
  is free-text but screened by the deterministic safety layer. Valid recovery
  provider JSON is output-screened before it can be accepted.
- **Deletion atomicity**: account deletion uses one D1 `batch()` transaction
  for limiter, chat, saved artifacts, preferences, usage, session, and user
  rows. A failed statement rolls back the whole batch; cookies clear only
  after the batch succeeds.

## Monorepo layout

```text
apps/web/         Next.js app + Worker routes (the deployed product)
apps/mobile/      Expo workspace — frozen, not deployed, still Supabase-era
packages/shared/  safety engine, recovery schema, feedback/events contracts
migrations/       D1 migrations (0001–0006)
supabase/         legacy pre-D1 artifacts, unused at runtime
```
