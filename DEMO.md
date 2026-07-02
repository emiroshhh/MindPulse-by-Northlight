# MindPulse Demo Guide

This guide is for university admissions, mentor reviews, competitions, collaborator conversations, and beta onboarding. Keep the demonstration honest: MindPulse is a working public beta, not a product with proven impact metrics.

## Before the demo

1. Open `/app` in a private window to demonstrate guest-first access.
2. Prepare one real student scenario rather than a generic “hello”.
3. Check that the feedback form is configured.
4. Have `/case-study`, `/privacy`, and `/impact` ready in separate tabs.
5. Never show environment variables, cookies, session tokens, database rows, or API keys.

## 60-second demo

**0–10 seconds — problem**

> Students often know what they need to do, but the work feels scattered or too large to start. MindPulse gives them one calm workspace for the next useful action.

**10–25 seconds — product**

Open `/app` as a guest and show the six tools: Study, Planner, Motivation, Habits, Goals, and Reflection. Mention that login is optional.

**25–45 seconds — real task**

Open Planner and enter:

> I have 90 minutes, low energy, a math test tomorrow, and two homework tasks. Build a realistic plan with breaks.

Point out the top priority, time blocks, fallback, and tiny first action.

**45–60 seconds — engineering and honesty**

> The app runs on Next.js and Cloudflare Workers, uses D1 for accounts and history, and calls Gemini only from the server. Guest access has five daily messages, accounts have twenty, and the beta collects optional feedback without claiming proven impact yet.

## Two-minute demo

1. **Explain the user problem.** Students use disconnected planning, study, and motivation tools; starting is often the hardest step.
2. **Open the guest dashboard.** Show that `/app` does not redirect to login.
3. **Show the six modes.** Explain that each mode changes the AI behavior rather than simply changing a title.
4. **Run one Planner prompt.** Highlight realistic constraints and the smallest first action.
5. **Switch to Study.** Use a process-oriented prompt and point out explanation, example, and quick check.
6. **Switch the UI language.** Briefly show Russian or Kazakh localization.
7. **Explain accounts.** Accounts raise the daily allowance and save D1-backed history; guest state stays local.
8. **Open `/beta` and `/case-study`.** Show the tester journey and distinguish completed work from future measurements.
9. **Close with boundaries.** MindPulse is not therapy or emergency support, and AI answers should be verified.

## Five-minute walkthrough

### 1. Context and product decision — 45 seconds

Describe the target user: a student balancing deadlines, revision, routines, and personal goals. Explain the choice to build one focused workspace instead of a general chatbot.

### 2. Guest-first onboarding — 45 seconds

- Open `/app` in private browsing.
- Show the five-message guest allowance.
- Set one “Today’s focus”.
- Explain that guest history and focus remain on the device.

### 3. AI tool intelligence — 90 seconds

Demonstrate two contrasting modes:

- **Study:** a difficult concept with a request for an explanation and quick quiz.
- **Planner or Motivation:** a constrained, low-energy situation requiring one tiny start.

Explain that system instructions are mode-specific, conversation context is bounded, and keys remain server-side.

### 4. Account value — 45 seconds

Explain—without exposing credentials—that signup/login creates a server-side session, account users receive twenty daily messages, and chat history plus Agent plans are saved in D1.

### 5. Safety and privacy — 30 seconds

Open `/privacy`. Explain local guest state, D1 account history, server-side secrets, usage limits, and the boundary between normal productivity stress and serious safety risk.

### 6. Beta and engineering story — 45 seconds

Open `/case-study` and `/impact`. Mention:

- Next.js, TypeScript, OpenNext, Workers, D1, Gemini, and automated tests;
- auth/session/logout debugging as a difficult production problem;
- no invented metrics;
- feedback-driven next steps.

## Sample prompts

### Study Help

> Explain quadratic functions step by step, show one example, then give me three questions to check my understanding.

### Daily Planner

> Plan 4pm–9pm with chemistry homework, dinner, exam revision, and a real break. My energy is low.

### Motivation Reset

> I avoided my essay all afternoon and feel behind. Give me one tiny action and a plan for the next 10 minutes.

### Habit Coach

> Build a 10-minute review habit for school days with a trigger, low-energy fallback, and restart rule.

### Goal Breakdown

> Break a one-month student portfolio project into milestones, blockers, and the first three actions.

### Quick Reflection

> Guide me through a five-minute reflection: one win, one friction point, one lesson, and one adjustment for tomorrow.

## Explaining MindPulse in an interview

### What did you build?

> I built a guest-first multilingual AI workspace for students. It has six mode-specific tools, optional accounts, D1-backed history, server-enforced usage limits, a structured planning Agent, and public beta/privacy/case-study pages. The production app runs on Cloudflare Workers through OpenNext.

### What problem does it solve?

> It helps students who feel overwhelmed by scattered tasks or oversized goals turn a real situation into one manageable next action. It does not try to replace teachers or mental-health professionals.

### What was technically difficult?

> The hardest work was production auth and session reliability across Next.js, OpenNext, Cloudflare Workers, browser cookie behavior, and D1. I added explicit session verification, safe token fallbacks, non-mutating GET logout behavior, server-side quota enforcement, focused tests, and production smoke testing. Another challenge was keeping six AI modes genuinely different while maintaining safety and concise prompt assembly.

## Demo mistakes to avoid

- Do not say MindPulse has improved grades or mental health without evidence.
- Do not call it therapy, diagnosis, or emergency support.
- Do not show secrets, production logs containing cookies, or private user data.
- Do not demonstrate every feature at equal depth; one real task is more convincing.
- Do not describe Supabase as the active database—the current production app uses Cloudflare D1.
