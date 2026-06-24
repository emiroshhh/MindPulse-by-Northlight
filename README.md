# MindPulse

MindPulse by Northlight is an AI study and self-growth assistant for students. It explains difficult topics, plans realistic days, resets motivation, builds habits, breaks down goals, and supports reflection.

## Current MVP

- Six modes: Study Help, Daily Planner, Motivation Reset, Habit Coach, Goal Breakdown, and Quick Reflection
- Real Gemini responses through server-only `/api/chat`
- Secure `GEMINI_API_KEY` handling through Cloudflare Worker secrets
- Responsive landing page and product-style chat
- Suggested prompts, recent conversations, Today’s Focus, and a simple Day 1 check-in
- Copy, regenerate, clear chat, character limit, loading, and error states
- Browser-local persistence; no account or database required
- Safety screening and a visible non-clinical disclaimer

## Stack

- Next.js 15 / React 19
- OpenNext Cloudflare adapter
- Cloudflare Worker + Static Assets
- Gemini Interactions REST API
- Tailwind CSS and localStorage

The site and `/api/chat` ship in one Cloudflare Worker. API keys never enter browser code.

## Run locally

Use Node 22, then:

```bash
npm install
npm run dev
```

Copy `.env.example` to `apps/web/.env.local` and add a development Gemini key. Never commit that file.

## Build

```bash
npm run build
npx wrangler deploy --dry-run
```

The root `wrangler.jsonc` deploys the OpenNext Worker and static assets.

## Cloudflare Workers Builds

- Root directory: `/`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

In Cloudflare Dashboard open the Worker project, then Variables and Secrets. Add an encrypted secret:

```text
GEMINI_API_KEY = your Gemini API key
```

Optionally add `GEMINI_MODEL`; the default is `gemini-3.5-flash`. Never use a `NEXT_PUBLIC_*` variable for the key.

## API

`POST /api/chat`

```json
{ "message": "Explain cellular respiration simply", "mode": "study" }
```

Messages must contain 1–1,000 characters. Modes: `study`, `planner`, `motivation`, `habit`, `goal`, `reflection`. Success returns `{ "reply": "..." }`.

## Later

Supabase, login, PDF upload, vector search, payments, and usage limits are outside this MVP. The next stage should begin after testing the core modes with students and reviewing Gemini usage and cost.
