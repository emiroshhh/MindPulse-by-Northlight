import type { Metadata } from 'next';
import { ArrowLeft, Brain, LineChart, Target } from 'lucide-react';
import Link from 'next/link';
import { SiteFooter } from '@/components/mindpulse/site-footer';

export const metadata: Metadata = { title: 'Impact' };

const betaGoals = [
  '50 student users',
  '20 feedback responses',
  '500+ AI sessions/messages',
  'Improve based on feedback',
];

const futureMetrics = [
  'Students reached',
  'AI sessions completed',
  'Feedback responses',
  'Returning users',
  '% who said MindPulse helped them plan better',
];

export default function ImpactPage() {
  return (
    <div className="ambient min-h-screen">
      <header className="border-b border-ink/5 bg-canvas/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link href="/app" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-canvas">
              <Brain size={20} />
            </span>
            <b>MindPulse</b>
          </Link>
          <Link
            href="/app"
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-canvas"
          >
            Dashboard
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
            <LineChart size={15} /> Public beta impact
          </p>
          <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-[-.04em] sm:text-6xl">
            Building something useful for real students
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-muted">
            The goal of the beta is simple: learn whether MindPulse helps
            students feel less overwhelmed and more able to plan, study,
            reflect, break goals down, and stay consistent.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-mp bg-surface p-6 shadow-soft">
            <h2 className="text-2xl font-semibold">The problem</h2>
            <p className="mt-3 leading-8 text-muted">
              Students often feel overwhelmed and lack structure. Even when
              they know what matters, the first step can feel unclear, too big,
              or emotionally heavy.
            </p>
          </article>
          <article className="rounded-mp bg-surface p-6 shadow-soft">
            <h2 className="text-2xl font-semibold">The solution</h2>
            <p className="mt-3 leading-8 text-muted">
              MindPulse gives students a calm place to plan a day, get study
              help, reset motivation, build habits, break goals into actions,
              and reflect without self-blame.
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-[2rem] bg-sage-soft p-7 shadow-soft sm:p-8">
          <div className="flex items-center gap-3">
            <Target className="text-sage" />
            <h2 className="text-3xl font-semibold">Current beta goals</h2>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {betaGoals.map((goal) => (
              <div key={goal} className="rounded-2xl bg-canvas/80 p-4">
                <p className="font-semibold">{goal}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] bg-surface p-7 shadow-soft sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-sage">
            Future metrics
          </p>
          <h2 className="mt-2 text-3xl font-semibold">
            No fake numbers — only beta results when they exist.
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {futureMetrics.map((metric) => (
              <article
                key={metric}
                className="rounded-2xl border border-ink/5 bg-canvas/70 p-4"
              >
                <h3 className="font-semibold">{metric}</h3>
                <p className="mt-2 text-sm text-muted">
                  Coming after beta launch.
                </p>
              </article>
            ))}
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
