# MindPulse

MindPulse by Northlight is an authenticated AI study and self-growth web app for students. It combines a polished public landing page, secure accounts, AI chat, saved history, and an Agent workspace for turning messy study pressure into clear next actions.

## Stack

- Next.js 15 / React 19
- OpenNext Cloudflare adapter
- Cloudflare Workers + Static Assets
- Cloudflare D1 for users, sessions, chat history, and saved Agent plans
- Gemini Interactions API through server-only routes
- Tailwind CSS

## App structure

- `/` — public landing page
- `/signup` — create account
- `/login` — log in
- `/logout` — invalidates the session and redirects home
- `/app` — protected dashboard with AI Chat, Agent, history, and settings surfaces
- `/api/auth/signup`
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/me`
- `/api/chat`
- `/api/chat/history`
- `/api/agent`

## Security model

- Passwords are never stored in plain text.
- Passwords are stored as salted PBKDF2-SHA-256 hashes using WebCrypto.
- Argon2id is preferred in general, but a native/wasm Argon2 dependency would make this OpenNext Cloudflare Worker deployment more fragile. PBKDF2-SHA-256 is available in Workers WebCrypto and uses a unique salt per password.
- Session tokens are stored only in `HttpOnly`, `Secure`, `SameSite=Lax` cookies.
- D1 stores only an HMAC-SHA-256 hash of each session token.
- Login errors are generic: `Invalid email or password`.
- API keys, session tokens, password hashes, and raw passwords are never logged.

## Required secrets

Set these in Cloudflare Workers secrets / environment variables:

```text
GEMINI_API_KEY=your Gemini key
SESSION_SECRET=a random string with at least 32 characters
```

Optional:

```text
GEMINI_MODEL=gemini-3.5-flash
```

Never expose the Gemini key as `NEXT_PUBLIC_*`.

## Create the D1 database

```bash
npx wrangler d1 create mindpulse-db
```

Copy the returned `database_id`, then update `wrangler.jsonc` and `apps/web/wrangler.jsonc` by uncommenting the `d1_databases` block:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "mindpulse-db",
    "database_id": "YOUR_DATABASE_ID"
  }
]
```

## Run migrations

Apply the auth/session/history schema:

```bash
npx wrangler d1 migrations apply mindpulse-db --local
npx wrangler d1 migrations apply mindpulse-db --remote
```

The Wrangler migration file is:

```text
migrations/0001_mindpulse_auth.sql
```

If you prefer direct SQL execution:

```bash
npx wrangler d1 execute mindpulse-db --local --file migrations/0001_mindpulse_auth.sql
npx wrangler d1 execute mindpulse-db --remote --file migrations/0001_mindpulse_auth.sql
```

## Local development

Use Node 22:

```bash
npm install
```

Create `apps/web/.env.local`:

```text
GEMINI_API_KEY=your development Gemini key
SESSION_SECRET=local-dev-secret-at-least-32-characters
```

For full auth locally, create the D1 database and apply the local migration. Then run:

```bash
npm run dev
```

## Build and deploy

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx wrangler deploy
```

Cloudflare Workers Builds settings:

- Root directory: `/`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

Before deployment, make sure:

1. `DB` D1 binding is configured.
2. D1 migrations have been applied remotely.
3. `GEMINI_API_KEY` is set as a secret.
4. `SESSION_SECRET` is set as a secret and is at least 32 characters.

## API notes

`POST /api/chat` requires an authenticated session. Messages are saved to `chat_messages` by `user_id`.

Example body:

```json
{ "message": "Explain cellular respiration simply", "mode": "study" }
```

Valid modes:

```text
study, planner, motivation, habit, goal, reflection
```

`POST /api/agent` saves structured Agent results for the logged-in user.

## Safety disclaimer

MindPulse is an AI study assistant, not a doctor or therapist. It can make mistakes, so students should verify important academic information and seek real-world help for emergencies or serious mental health concerns.
