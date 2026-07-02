# MindPulse

MindPulse by Northlight is an AI study and self-growth workspace with English, Russian, and Kazakh interface support. It combines six focused AI tools, guest-first access, optional accounts, saved progress, and practical safety boundaries in one calm interface.

The project is in public beta. Its current goal is to learn whether students can use MindPulse to turn one real academic or personal-development task into a manageable next action. No proven-impact claim is made yet.

## The student problem

Students often balance classes, exams, projects, routines, and personal goals across disconnected tools. The difficult part is frequently not knowing that work matters—it is deciding what to do first, making the task small enough to start, and recovering after a difficult day.

MindPulse is designed for students who want:

- a simple explanation instead of a wall of text;
- a realistic plan instead of an impossible schedule;
- a small restart instead of motivational pressure;
- one workspace instead of several unrelated AI chats.

## Six AI tools

| Tool | Purpose |
| --- | --- |
| Study Help | Explains difficult concepts, demonstrates the process, and offers quick practice checks. |
| Daily Planner | Converts tasks, available time, and energy into a realistic schedule with breaks and fallbacks. |
| Motivation Reset | Helps a student restart calmly with one tiny action and a short next-ten-minute plan. |
| Habit Coach | Designs small habits with triggers, fallback versions, lightweight tracking, and restart rules. |
| Goal Breakdown | Turns ambitious goals into outcomes, milestones, blockers, and ordered next actions. |
| Quick Reflection | Guides a short, non-clinical reflection around a win, friction, lesson, and tomorrow adjustment. |

MindPulse also includes a structured Agent workflow for turning an unclear situation into a goal, plan, next actions, obstacles, and smallest first step.

## Product model

### Guest access

- No login wall for `/app` or the six tool pages.
- Five AI messages per day, enforced server-side.
- Conversation, focus, and saved guest plans remain on the current device.
- Guest data is not written to account chat history.

### Free account

- Twenty AI messages per day, enforced server-side.
- Chat history and saved Agent plans are stored in Cloudflare D1.
- Authentication uses server-created sessions; raw session tokens are not stored in D1.

There are currently no payments, subscriptions, ads, or premium tiers.

## Languages

The interface supports:

- English (`en`)
- Russian (`ru`)
- Kazakh (`kk`)

The AI is instructed to follow the language of the student's latest message and use the selected interface language as a fallback.

This is an interface and response-language feature, not a claim of equivalent trilingual crisis-safety coverage. Deterministic urgent-language screening is currently strongest in English and Russian; reviewed Kazakh safety coverage remains future work.

## Safety and privacy boundaries

MindPulse is a productivity and learning assistant. It is not therapy, medical care, diagnosis, professional mental-health support, or an emergency service.

- Normal school stress and procrastination receive calm, practical support.
- Serious self-harm, abuse, or immediate-danger language exits ordinary productivity coaching and points toward immediate real-world support.
- Important academic information should be verified.
- Gemini and session secrets remain server-side.
- Passwords are stored as uniquely salted PBKDF2-SHA-256 hashes using Workers WebCrypto.
- D1 stores a keyed hash of each session token, not the raw token.
- Feedback is optional and should never contain private chat content or sensitive data.

See the plain-language [privacy page](/apps/web/app/privacy/page.tsx) for the user-facing explanation.

## Technical architecture

```text
Next.js / React UI
        |
        +-- guest local state (localStorage)
        |
        +-- server routes on Cloudflare Workers
                |
                +-- Gemini Interactions API (server-only key)
                +-- Cloudflare D1
                    users / sessions / usage / history / Agent plans
```

Active production storage is Cloudflare D1. Supabase files in the repository are legacy and are not part of the active web runtime.

## Technology stack

- Next.js 15 and React 19
- TypeScript
- Tailwind CSS
- OpenNext Cloudflare adapter
- Cloudflare Workers and Static Assets
- Cloudflare D1
- Gemini Interactions API
- Vitest and Testing Library
- npm workspaces for web, mobile, and shared packages

## Important routes

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/app` | Guest-first dashboard, chat, Agent, focus, and recent state |
| `/study`, `/planner`, `/motivation` | Focused learning, planning, and restart tools |
| `/habits`, `/goals`, `/reflection` | Habit, goal, and reflection tools |
| `/beta` | Beta tester guide |
| `/case-study` | Public portfolio case study |
| `/why`, `/impact`, `/privacy` | Project story, honest beta goals, and privacy boundaries |

## Repository structure

```text
apps/web/        Next.js web application and Worker routes
apps/mobile/     Expo mobile workspace (not the active production web app)
packages/shared/ Shared schemas, exercises, IDs, and safety utilities
migrations/      Cloudflare D1 migrations
```

## Run locally

Prerequisites:

- Node.js 20 or newer
- npm 11-compatible tooling
- a Gemini API key for real AI replies
- Wrangler authentication for D1/Worker preview workflows

Install dependencies:

```powershell
npm ci
```

For a quick UI development server:

```powershell
npm run dev
```

Server-side AI and authenticated flows require the existing server secrets and D1 binding. Apply local D1 migrations with the app configuration:

```powershell
npx wrangler d1 migrations apply mindpulse-db --local --config apps/web/wrangler.jsonc
```

Use the Cloudflare preview workflow for the closest local equivalent to production:

```powershell
npm run preview:cloudflare
```

Do not commit API keys, session secrets, cookies, password hashes, or local environment files.

## Quality checks

Run the same checks expected before a commit or deployment:

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

The production build generates the OpenNext Worker under `apps/web/.open-next`.

## Deploy

1. Confirm the `DB` binding in `apps/web/wrangler.jsonc` points to the intended D1 database.
2. Apply any pending remote migration:

```powershell
npx wrangler d1 migrations apply mindpulse-db --remote --config apps/web/wrangler.jsonc
```

3. Confirm required secrets are stored in Cloudflare, never in source control.
4. Run all quality checks.
5. Deploy through the repository script:

```powershell
npm run deploy
```

Deployment is intentionally not part of ordinary feature implementation. Production changes should be smoke-tested separately.

## Beta and portfolio documentation

- [DEMO.md](DEMO.md) — 60-second, two-minute, and five-minute demo scripts
- [ROADMAP.md](ROADMAP.md) — completed phases and evidence-driven next steps
- [`/case-study`](apps/web/app/case-study/page.tsx) — public product and engineering case study
- [`/beta`](apps/web/app/beta/page.tsx) — tester journey and feedback guidance

## Roadmap summary

Near-term priorities are beta feedback, accessibility, reliability, AI-answer quality, and honest outcome measurement. Mood tracking, journals, payments, ads, subscriptions, and advanced analytics are intentionally deferred until real feedback demonstrates a clear need.

## Honest limitations

- MindPulse is an early beta, not a proven educational intervention.
- Current beta metrics are goals; real results have not been published yet.
- AI answers may be incomplete or wrong.
- Guest enforcement uses a conservative server-derived anonymous key and is not a perfect identity system.
- Account synchronization currently covers chat history and saved Agent plans, not every piece of guest-local state.
- EN/RU/KZ coverage is actively tested, but translation quality still benefits from native-speaker feedback.
- The mobile workspace is not the active deployed product.

## Project status

The active web application is deployed on Cloudflare Workers and is ready for small, supervised public-beta testing. Product decisions should continue to be driven by real student use and explicit feedback rather than invented traction.
