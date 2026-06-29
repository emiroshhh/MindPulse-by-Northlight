import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  LockKeyhole,
  MessageSquareText,
  Repeat2,
  Sparkles,
  Target,
  Wand2,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { SiteFooter } from '@/components/mindpulse/site-footer';

const features = [
  ['AI Study Help', BookOpen],
  ['Daily Planner', CalendarDays],
  ['Motivation Reset', Zap],
  ['Habit Coach', Repeat2],
  ['Goal Breakdown', Target],
  ['Quick Reflection', Sparkles],
  ['AI Chat', MessageSquareText],
  ['AI Agent', Wand2],
] as const;

export default function LandingPage() {
  return (
    <div className="ambient min-h-screen overflow-hidden">
      <header className="sticky top-0 z-40 border-b border-ink/5 bg-canvas/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-canvas">
              <Brain size={20} />
            </span>
            <span>
              <b className="block text-sm">MindPulse</b>
              <small className="font-semibold uppercase tracking-[.18em] text-muted">
                by Northlight
              </small>
            </span>
          </Link>
          <div className="hidden gap-7 text-sm font-semibold text-muted md:flex">
            <a href="#features" className="hover:text-ink">
              Features
            </a>
            <a href="#how" className="hover:text-ink">
              How it works
            </a>
            <Link href="/login" className="hover:text-ink">
              Login
            </Link>
          </div>
          <Link
            href="/signup"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-canvas hover:bg-sage"
          >
            Get started <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      <main id="main-content">
        <section className="px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-sage/20 bg-surface px-4 py-2 text-xs font-semibold text-sage">
                <Sparkles size={15} /> AI study + self-growth workspace
              </span>
              <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-.045em] sm:text-6xl lg:text-7xl">
                Study better. Plan smarter.{' '}
                <span className="text-sage">Stay consistent.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
                MindPulse is an AI study and self-growth assistant for daily
                planning, motivation, habits, and learning. Turn messy thoughts
                into clear next steps and keep your progress organized.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-sage px-7 font-semibold text-canvas shadow-soft hover:-translate-y-1 hover:bg-ink"
                >
                  Get started <ArrowRight size={18} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex min-h-14 items-center justify-center rounded-full border border-ink/10 bg-surface px-7 font-semibold hover:bg-sage-soft"
                >
                  Log in
                </Link>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/60 bg-surface/90 p-6 shadow-soft sm:p-8">
              <div className="rounded-[1.5rem] bg-ink p-5 text-canvas">
                <p className="text-sm text-canvas/65">Today, just this:</p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Finish chemistry practice set
                </h2>
                <p className="mt-3 text-sm leading-6 text-canvas/70">
                  While you were away, MindPulse moved two tasks forward and
                  picked one calm focus.
                </p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {['AI chat remembers context', 'Agent plans next steps'].map(
                  (text) => (
                    <div key={text} className="rounded-2xl bg-sage-soft/70 p-4">
                      <CheckCircle2 className="text-sage" size={18} />
                      <p className="mt-3 text-sm font-semibold">{text}</p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        <section
          id="how"
          className="scroll-mt-24 bg-ink px-5 py-20 text-canvas sm:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-sage-soft">
              How it works
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                [
                  '01',
                  'Create your account',
                  'Your history follows your login securely.',
                ],
                [
                  '02',
                  'Tell MindPulse what you need',
                  'Ask for study help, planning, motivation, habits, or reflection.',
                ],
                [
                  '03',
                  'Get practical support',
                  'Use AI chat help, saved history, and Agent support.',
                ],
              ].map(([n, title, copy]) => (
                <div
                  key={n}
                  className="rounded-mp border border-white/10 bg-white/5 p-6"
                >
                  <b className="text-sage-soft">{n}</b>
                  <h2 className="mt-8 text-xl font-semibold">{title}</h2>
                  <p className="mt-3 text-canvas/65">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-sage">
              Features
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl font-semibold sm:text-5xl">
              Everything a student needs to get unstuck.
            </h2>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(([title, Icon]) => (
                <div
                  key={title}
                  className="rounded-mp bg-surface p-5 shadow-soft"
                >
                  <Icon className="text-sage" size={21} />
                  <h3 className="mt-5 font-semibold">{title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-sage">
                Why students use it
              </p>
              <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">
                Relief first. Progress second.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Helps with procrastination',
                'Makes studying feel less overwhelming',
                'Turns messy thoughts into clear next steps',
                'Keeps progress organized',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-mp bg-surface p-5 shadow-soft"
                >
                  <CheckCircle2 className="text-sage" />
                  <p className="mt-4 font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 rounded-[2rem] bg-sage-soft p-8 shadow-soft lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <LockKeyhole className="text-sage" />
              <h2 className="mt-4 text-2xl font-semibold">
                Private accounts, saved progress.
              </h2>
              <p className="mt-2 max-w-2xl leading-7 text-muted">
                Your chat history and Agent plans are connected to your login,
                not public browser state. Passwords are stored only as secure
                salted hashes, never as plain text.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-6 font-semibold text-canvas"
              >
                Create your free account
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-surface px-6 font-semibold"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>

        <div className="px-5 pb-10 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <SiteFooter />
          </div>
        </div>
      </main>
    </div>
  );
}
