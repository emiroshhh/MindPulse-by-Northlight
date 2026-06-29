import type { Metadata } from 'next';
import { ArrowLeft, Brain, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { SiteFooter } from '@/components/mindpulse/site-footer';

export const metadata: Metadata = { title: 'Privacy' };

const privacyNotes = [
  {
    title: 'Guest use',
    copy: 'Guest chat history and focus state are stored locally in your browser on your device. Guest history is not synced to an account.',
  },
  {
    title: 'Accounts',
    copy: 'If you create an account, MindPulse may store your account chat history in its database so it can load again after you log in.',
  },
  {
    title: 'Usage limits',
    copy: 'MindPulse tracks daily message usage for guests and accounts to protect Gemini API costs and keep the beta available.',
  },
  {
    title: 'Feedback',
    copy: 'Feedback is optional. If an external feedback form is connected, it opens in a new tab. Please do not include private chat content.',
  },
];

export default function PrivacyPage() {
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

      <main id="main-content" className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <Link
          href="/app"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-5 text-sm font-semibold text-ink shadow-soft hover:bg-sage-soft"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </Link>

        <section className="mt-10 rounded-[2rem] bg-surface p-7 shadow-soft sm:p-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-sage-soft px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-sage">
            <ShieldCheck size={15} /> Plain-language privacy
          </p>
          <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-[-.04em] sm:text-6xl">
            Privacy for the MindPulse beta
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-muted">
            MindPulse is an AI student-support beta. It is designed to help with
            studying, planning, reflection, goals, and consistency — not to
            collect sensitive personal information.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {privacyNotes.map((item) => (
            <article
              key={item.title}
              className="rounded-mp bg-surface p-6 shadow-soft"
            >
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{item.copy}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-[2rem] bg-sage-soft p-7 shadow-soft sm:p-8">
          <h2 className="text-3xl font-semibold">Please do not share</h2>
          <p className="mt-4 leading-8 text-muted">
            Do not enter passwords, financial details, private documents,
            sensitive personal information, or anything you would not want an AI
            tool to process. AI can make mistakes, so use MindPulse as study and
            planning support, not as a final authority.
          </p>
        </section>

        <section className="mt-6 rounded-[2rem] bg-surface p-7 shadow-soft sm:p-8">
          <h2 className="text-3xl font-semibold">What MindPulse is not</h2>
          <p className="mt-4 leading-8 text-muted">
            MindPulse is not a therapist, doctor, emergency service, or crisis
            service. If you are in immediate danger or need urgent help, contact
            local emergency services or a trusted person right away.
          </p>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
