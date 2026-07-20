# MindPulse Roadmap

MindPulse is a working public beta. This roadmap separates completed engineering from future ideas and keeps priorities tied to real student feedback.

## Completed

### Foundation and product build

- Responsive Next.js web application and shared workspace structure
- Six student-focused tools: Study, Planner, Motivation, Habits, Goals, Reflection
- AI chat and structured Agent workflow
- English, Russian, and Kazakh interface support

### Phase 3 — production auth reliability

- Cloudflare D1 users and sessions
- Signup, login, reload persistence, and intentional POST-only logout
- Session insert/read-back verification
- Request-cookie plus bounded client token fallback for production compatibility
- Tests for session validation and logout prefetch safety

### Phase 4 — beta UX

- Guest-first dashboard and tool routes
- Onboarding, prompt starters, empty/loading states, responsive layouts
- Public Why, Privacy, and Impact pages

### Phase 5 — AI quality and tool intelligence

- Distinct behavior for all six modes
- Concise, action-oriented response guidance
- Bounded conversation context
- Language-following and safety boundaries
- Direct prompt-builder and chat-route tests

### Phase 6 — feedback and beta launch

- Public `/beta` tester journey
- External feedback-form flow with local opened marker only
- Localized feedback and retention copy
- Honest beta goals and privacy reminders

### Phase 7 — portfolio and case study

- Portfolio-grade README
- Public `/case-study`
- Demo scripts and interview explanations
- Explicit roadmap and honest limitation documentation

## Current beta status

- Active production web app runs on Cloudflare Workers/OpenNext.
- Active persistence uses Cloudflare D1; Supabase is legacy and not part of the current web runtime.
- Guests can try the product without login and receive five AI messages per day.
- Free accounts receive twenty messages per day and D1-backed chat history.
- Feedback is optional and collected through the configured external form.
- No validated impact metrics are published yet.

## Near-term priorities

1. Recruit a small, diverse group of student beta testers.
2. Collect feedback tied to one real task rather than general opinions.
3. Fix confusing prompts, navigation, accessibility, and mobile issues found in testing.
4. Review EN/RU/KZ copy with native speakers.
5. Measure returning testers and completed real-task sessions without adding invasive tracking.
6. Continue reliability and security review before expanding access.

## Feedback-driven questions

- Which tool produces the clearest immediate value?
- Where do students abandon the flow?
- Are answers concise enough for tired or overwhelmed students?
- Does account history justify creating an account?
- Which language and translation improvements matter most?
- What information do students hesitate to share, and can the UI make privacy boundaries clearer?

## Future features—only after evidence

- Better cross-device account synchronization
- User-controlled export and deletion improvements
- Accessibility refinements and reduced-motion review
- More structured study practice and revision workflows
- Optional reminders chosen by the student
- Mobile product alignment if web beta evidence supports it
- Carefully scoped collaboration or mentor-sharing workflows

These are possibilities, not commitments.

## Not adding yet

- Payments, subscriptions, premium tiers, or ads
- Mood tracking or a private journal
- Clinical or therapeutic features
- Diagnosis, medical advice, or emergency-service claims
- Advanced behavioral analytics or third-party tracking scripts
- Social feeds, public profiles, or competitive streak systems
- Large new database schemas without validated product need

## Measurement principles

- Never invent user counts, outcomes, testimonials, or retention.
- Separate goals from observed results.
- Ask for testimonial consent explicitly.
- Do not store private chat content in feedback.
- Prefer a small number of meaningful beta signals over broad surveillance.
- Publish results only after the collection method and sample size are clear.
