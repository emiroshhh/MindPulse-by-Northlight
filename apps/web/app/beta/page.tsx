import type { Metadata } from 'next';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  FlaskConical,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { FeedbackModal } from '@/components/mindpulse/feedback-modal';
import { SiteFooter } from '@/components/mindpulse/site-footer';
import { mindPulseTools } from '@/lib/mindpulse/tools';

export const metadata: Metadata = { title: 'Beta testing' };

const testerSteps = [
  [
    'Try one tool',
    'Choose the mode that matches something you genuinely need today.',
  ],
  [
    'Use one real task',
    'Bring an actual topic, deadline, plan, habit, goal, or reflection.',
  ],
  [
    'Send feedback',
    'Say what helped, what felt unclear, and what you expected instead.',
  ],
  [
    'Share if useful',
    'If it genuinely helped, invite one other student to try the beta.',
  ],
] as const;

export default function BetaPage() {
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
            Open the app
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
            <FlaskConical size={15} /> Student beta guide
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight tracking-[-.04em] sm:text-6xl">
            Test MindPulse on one real task.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-muted">
            MindPulse is a student-focused AI project by Northlight. It is for
            students who need a clearer next step when studying, planning, or
            trying to regain momentum—not another complicated productivity
            system.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-mp bg-sage-soft p-6 shadow-soft">
            <h2 className="text-2xl font-semibold">What it helps with</h2>
            <p className="mt-3 leading-8 text-muted">
              Understanding a topic, planning a realistic day, restarting after
              procrastination, building forgiving habits, breaking down goals,
              and reflecting without self-blame.
            </p>
          </article>
          <article className="rounded-mp bg-surface p-6 shadow-soft">
            <h2 className="text-2xl font-semibold">What it does not do</h2>
            <p className="mt-3 leading-8 text-muted">
              MindPulse is not therapy, medical care, emergency support, or a
              replacement for a teacher or qualified professional. AI can make
              mistakes, so verify important information.
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-[2rem] bg-ink p-7 text-canvas shadow-soft sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-sage-soft">
            A four-step beta test
          </p>
          <h2 className="mt-2 text-3xl font-semibold">
            Useful feedback starts with real use.
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {testerSteps.map(([title, copy], index) => (
              <article key={title} className="rounded-2xl bg-canvas/10 p-4">
                <span className="text-xs font-bold text-sage-soft">
                  0{index + 1}
                </span>
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-canvas/70">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] bg-surface p-7 shadow-soft sm:p-8">
          <h2 className="text-3xl font-semibold">Choose one of six tools</h2>
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

        <section className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-center rounded-[2rem] bg-sage-soft p-7 shadow-soft sm:p-8">
          <div>
            <ShieldCheck className="text-sage" />
            <h2 className="mt-4 text-2xl font-semibold">
              Keep feedback useful and private.
            </h2>
            <p className="mt-3 max-w-3xl leading-8 text-muted">
              Do not share passwords, private documents, financial details,
              sensitive personal information, or private chat content. The
              feedback form is optional and opens separately.
            </p>
            <Link
              href="/privacy"
              className="mt-4 inline-flex font-semibold text-sage hover:text-ink"
            >
              Read the privacy guide →
            </Link>
          </div>
          <FeedbackModal label="Send beta feedback" />
        </section>

        <section className="mt-6 flex flex-col gap-4 rounded-[2rem] bg-surface p-7 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-2xl font-semibold">Come back with one task.</h2>
            <p className="mt-2 text-muted">
              Plan before studying, save one tiny next action, and use
              Reflection at the end of the day.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Link
              href="/case-study"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-canvas px-6 font-semibold text-ink"
            >
              Read the case study
            </Link>
            <Link
              href="/app"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 font-semibold text-canvas"
            >
              Start a real task <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
