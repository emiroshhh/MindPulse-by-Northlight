import type { Metadata } from 'next';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Code2,
  Database,
  FlaskConical,
  Languages,
  LockKeyhole,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { SiteFooter } from '@/components/mindpulse/site-footer';
import { mindPulseTools } from '@/lib/mindpulse/tools';

export const metadata: Metadata = { title: 'Case study' };

const architecture = [
  [
    'Interface',
    'Next.js and React provide the guest-first dashboard, six tool pages, and EN/RU/KZ UI.',
  ],
  [
    'AI layer',
    'A server-only chat route assembles mode-specific instructions and calls Gemini without exposing the API key.',
  ],
  [
    'Data layer',
    'Cloudflare D1 stores account, session-hash, usage, chat-history, and saved Agent-plan data.',
  ],
  [
    'Runtime',
    'OpenNext packages the application for Cloudflare Workers and Static Assets.',
  ],
] as const;

const built = [
  'Guest access with local conversation state',
  'Account signup, login, logout, and D1-backed history',
  'Six distinct AI support modes and a structured Agent workflow',
  'Daily guest and account limits enforced server-side',
  'English, Russian, and Kazakh interface support',
  'Public privacy, impact, beta, and project-story pages',
] as const;

const nextMeasures = [
  'Students who complete at least one real task',
  'Feedback responses with a concrete improvement idea',
  'Returning beta testers',
  'Which tools students find most useful',
  'Whether students report clearer planning or a more manageable next step',
] as const;

export default function CaseStudyPage() {
  return (
    <div className="ambient min-h-screen">
      <header className="border-b border-ink/5 bg-canvas/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link href="/app" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-canvas">
              <Brain size={20} />
            </span>
            <span>
              <b className="block text-sm">MindPulse</b>
              <small className="font-semibold uppercase tracking-[.16em] text-muted">
                by Northlight
              </small>
            </span>
          </Link>
          <Link
            href="/app"
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-canvas"
          >
            Open the product
          </Link>
        </nav>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <Link
          href="/app"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-5 text-sm font-semibold text-ink shadow-soft hover:bg-sage-soft"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </Link>

        <section className="mt-10 rounded-[2rem] bg-surface p-7 shadow-soft sm:p-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-sage-soft px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-sage">
            <Sparkles size={15} /> Product case study · public beta
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight tracking-[-.04em] sm:text-6xl">
            Designing a calmer AI workspace for students.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-muted">
            MindPulse is a student-focused project by Northlight. It explores
            how one practical AI workspace can help students move from overwhelm
            to a clear next action—without pretending that AI is a teacher,
            therapist, or proven solution to every problem.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-mp bg-ink p-6 text-canvas shadow-soft">
            <Users className="text-sage-soft" />
            <h2 className="mt-5 text-2xl font-semibold">Problem and users</h2>
            <p className="mt-3 leading-8 text-canvas/70">
              The target users are students balancing classes, exams, projects,
              routines, and personal goals. The problem is often not a lack of
              ambition—it is unclear priorities, oversized tasks, scattered
              tools, and difficulty taking the first step.
            </p>
          </article>
          <article className="rounded-mp bg-sage-soft p-6 shadow-soft">
            <Brain className="text-sage" />
            <h2 className="mt-5 text-2xl font-semibold">Product idea</h2>
            <p className="mt-3 leading-8 text-muted">
              Give students one guest-first workspace with focused tools for
              learning, planning, motivation, habits, goals, and reflection.
              Each mode should produce a useful action today rather than a long
              generic speech.
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-[2rem] bg-surface p-7 shadow-soft sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-sage">
            Core product
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Six focused AI tools</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mindPulseTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.route}
                className="rounded-2xl border border-ink/5 bg-canvas/70 p-4 transition hover:-translate-y-0.5 hover:bg-sage-soft"
              >
                <h3 className="font-semibold">{tool.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{tool.copy}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <article className="rounded-mp bg-surface p-6 shadow-soft">
            <Sparkles className="text-sage" />
            <h2 className="mt-4 text-xl font-semibold">AI design choices</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Mode-specific system instructions keep Study instructional,
              Planner realistic, Motivation grounded, Habits forgiving, Goals
              structured, and Reflection non-clinical. Context is bounded and
              answers prioritize one small next action.
            </p>
          </article>
          <article className="rounded-mp bg-surface p-6 shadow-soft">
            <LockKeyhole className="text-sage" />
            <h2 className="mt-4 text-xl font-semibold">Safety and privacy</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Keys remain server-side, session tokens are not stored raw in D1,
              guest history stays local, and serious-risk language exits
              ordinary productivity coaching. MindPulse makes no clinical or
              emergency-service claim.
            </p>
          </article>
          <article className="rounded-mp bg-surface p-6 shadow-soft">
            <Languages className="text-sage" />
            <h2 className="mt-4 text-xl font-semibold">Accessible beta</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Students can try the product without creating an account. The UI
              supports English, Russian, and Kazakh, while accounts remain an
              optional path for more daily messages and saved history.
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-[2rem] bg-ink p-7 text-canvas shadow-soft sm:p-8">
          <div className="flex items-center gap-3">
            <Code2 className="text-sage-soft" />
            <h2 className="text-3xl font-semibold">Technical architecture</h2>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {architecture.map(([title, copy]) => (
              <article key={title} className="rounded-2xl bg-canvas/10 p-5">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-canvas/70">{copy}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-canvas/60">
            <Database size={16} /> TypeScript, automated tests, and production
            builds protect the main user flows.
          </p>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-[2rem] bg-sage-soft p-7 shadow-soft sm:p-8">
            <h2 className="text-2xl font-semibold">What has been built</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-muted">
              {built.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-1 shrink-0 text-sage" size={17} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-[2rem] bg-surface p-7 shadow-soft sm:p-8">
            <h2 className="text-2xl font-semibold">
              What will be measured next
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              These are measurement goals, not current impact claims.
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-muted">
              {nextMeasures.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="mt-6 rounded-[2rem] bg-surface p-7 shadow-soft sm:p-8">
          <div className="flex items-center gap-3">
            <FlaskConical className="text-sage" />
            <h2 className="text-3xl font-semibold">Beta testing flow</h2>
          </div>
          <p className="mt-4 max-w-3xl leading-8 text-muted">
            A tester chooses one tool, uses it for one real student task,
            submits optional feedback, and shares it with another student only
            if it was genuinely useful. The next roadmap decisions should be
            based on this evidence—not invented metrics.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/beta"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sage px-6 font-semibold text-canvas"
            >
              Open beta guide <ArrowRight size={16} />
            </Link>
            <Link
              href="/impact"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-canvas px-6 font-semibold text-ink"
            >
              View honest impact goals
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] bg-sage-soft p-7 shadow-soft sm:p-8">
          <h2 className="text-3xl font-semibold">Roadmap</h2>
          <p className="mt-4 max-w-3xl leading-8 text-muted">
            Near-term work is deliberately modest: learn from beta feedback,
            improve prompt quality and accessibility, verify reliability, and
            document real outcomes. Mood tracking, journals, payments, ads,
            subscriptions, and advanced analytics remain outside the current
            beta until there is evidence they are useful and safe.
          </p>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
