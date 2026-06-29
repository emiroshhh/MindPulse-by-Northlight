import type { Metadata } from 'next';
import { ArrowLeft, Brain, MessageSquareText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { FeedbackModal } from '@/components/mindpulse/feedback-modal';
import { SiteFooter } from '@/components/mindpulse/site-footer';
import { mindPulseTools } from '@/lib/mindpulse/tools';

export const metadata: Metadata = { title: 'Why I built this' };

export default function WhyPage() {
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
          <div className="flex items-center gap-2">
            <FeedbackModal />
            <Link
              href="/app"
              className="hidden min-h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-canvas sm:inline-flex"
            >
              Dashboard
            </Link>
          </div>
        </nav>
      </header>

      <main id="main-content" className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <Link
          href="/app"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-5 text-sm font-semibold text-ink shadow-soft hover:bg-sage-soft"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </Link>

        <section className="mt-10 rounded-[2rem] bg-surface p-7 shadow-soft sm:p-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-sage-soft px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-sage">
            <Sparkles size={15} /> Built by a student, for students
          </p>
          <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-[-.04em] sm:text-6xl">
            Why I built MindPulse
          </h1>
          <div className="mt-8 space-y-6 text-lg leading-9 text-muted">
            <p>
              I built MindPulse because student life can get noisy very quickly:
              assignments, exams, ideas, plans, goals, and the quiet pressure of
              feeling like you should already have a perfect system.
            </p>
            <p>
              I wanted one calm place where a student could open a page, write
              what is on their mind, and get a useful next step — not a lecture,
              not a guilt trip, and not another complicated productivity system.
            </p>
            <p>
              The design philosophy is simple: forgiveness over guilt. If you
              fall behind, MindPulse should help you return. If a goal feels too
              big, it should help you make it smaller. If your day feels
              chaotic, it should help you find one clear thing to do next.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            [
              'The problem',
              'Students often know they need to study, plan, or reflect — but the first step is the hardest part.',
            ],
            [
              'The beta',
              'MindPulse is free while it grows. Guest access stays open, and accounts save progress privately.',
            ],
            [
              'The future',
              'The product should improve from real student feedback, not fake startup noise.',
            ],
          ].map(([title, copy]) => (
            <article
              key={title}
              className="rounded-mp bg-surface p-6 shadow-soft"
            >
              <MessageSquareText className="text-sage" />
              <h2 className="mt-5 text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{copy}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-[2rem] bg-sage-soft p-7 shadow-soft sm:p-8">
          <h2 className="text-3xl font-semibold">What I’m trying to build</h2>
          <p className="mt-4 max-w-3xl leading-8 text-muted">
            MindPulse is meant to become a student-support platform that feels
            practical, kind, and organized. The free beta exists so real
            students can try it, find what is missing, and help shape the next
            version.
          </p>
        </section>

        <section className="mt-6 rounded-[2rem] bg-surface p-7 shadow-soft sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-sage">
                Explore MindPulse
              </p>
              <h2 className="mt-2 text-3xl font-semibold">
                Open the tool that matches today.
              </h2>
            </div>
            <Link
              href="/app"
              className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-canvas"
            >
              Back to dashboard
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {mindPulseTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.route}
                className="rounded-2xl border border-ink/5 bg-canvas/70 p-4 transition hover:-translate-y-0.5 hover:bg-sage-soft"
              >
                <span className="text-sm font-semibold text-ink">
                  {tool.title}
                </span>
                <span className="mt-1 block text-sm leading-6 text-muted">
                  {tool.copy}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <SiteFooter note="MindPulse is practical study support, built carefully and improved through feedback." />
      </main>
    </div>
  );
}
