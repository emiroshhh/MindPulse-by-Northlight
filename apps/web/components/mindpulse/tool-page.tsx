'use client';

import {
  ArrowLeft,
  Brain,
  Globe2,
  LogIn,
  LogOut,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LANGUAGE_KEY, readJson, writeJson } from '@/lib/mindpulse/local-store';
import {
  isLanguageCode,
  languages,
  type LanguageCode,
  type MindPulseTool,
} from '@/lib/mindpulse/tools';
import {
  ChatPanel,
  type ChatPanelCopy,
  type MindPulseUser,
} from './chat-panel';
import { FeedbackModal } from './feedback-modal';

type AuthMeBody = { user?: MindPulseUser | null };

export function ToolPage({
  tool,
  user: initialUser,
}: {
  tool: MindPulseTool;
  user: MindPulseUser | null;
}) {
  const [user, setUser] = useState<MindPulseUser | null>(initialUser);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const isGuest = !user;
  const chatCopy: ChatPanelCopy = {
    chooseMode: 'Choose a mode',
    emptyGuest:
      'Your guest conversation will appear here and stay in this browser.',
    emptyAuth: 'Your saved conversation history will appear here.',
    guestLimitLabel: '5 free guest messages/day',
    accountLimitLabel: '20 free messages/day',
    guestLimitReached:
      'You’ve reached today’s free guest limit. Create a free account to continue with more messages and save your progress.',
    accountLimitReached:
      'You’ve reached today’s free account limit. Come back tomorrow.',
    signup: 'Create free account',
    login: 'Log in',
    send: 'Send',
    safetyNote: 'AI can make mistakes. MindPulse is not a doctor or therapist.',
    fallbackError: 'MindPulse could not answer right now. Please try again.',
  };

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    const storedLanguage = readJson<LanguageCode | null>(LANGUAGE_KEY, null);
    if (storedLanguage && isLanguageCode(storedLanguage))
      setLanguage(storedLanguage);
  }, []);

  useEffect(() => {
    writeJson(LANGUAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    let active = true;
    async function reconcileSession() {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'same-origin',
          cache: 'no-store',
        });
        if (!active) return;
        if (response.ok) {
          const body = (await response.json().catch(() => ({}))) as AuthMeBody;
          setUser(body.user ?? null);
          return;
        }
        if (response.status === 401) setUser(null);
      } catch {
        // Keep the server-rendered state if the lightweight session check fails.
      }
    }
    void reconcileSession();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="ambient min-h-screen">
      <header className="sticky top-0 z-40 border-b border-ink/5 bg-canvas/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/app" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-canvas">
              <Brain size={20} />
            </span>
            <b>MindPulse</b>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex min-h-10 items-center gap-2 rounded-full bg-surface px-3 text-sm font-semibold text-muted shadow-soft">
              <Globe2 size={15} />
              <span className="sr-only">Language</span>
              <select
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as LanguageCode)
                }
                aria-label="Language"
                className="bg-transparent font-semibold text-ink outline-none"
              >
                {languages.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            {user ? (
              <Link
                href="/logout"
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-canvas"
              >
                <LogOut size={15} /> Logout
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-surface px-4 text-sm font-semibold text-ink shadow-soft"
                >
                  <LogIn size={15} /> Log in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-canvas"
                >
                  <UserPlus size={15} /> Sign up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main id="main-content" className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <Link
          href="/app"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-5 text-sm font-semibold text-ink shadow-soft hover:bg-sage-soft"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </Link>

        <section className="mt-8 grid gap-6 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
          <div>
            <p className="inline-flex rounded-full bg-sage-soft px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-sage">
              Free student beta
            </p>
            <h1 className="mt-5 text-5xl font-semibold tracking-[-.04em] sm:text-6xl">
              {tool.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
              {tool.explanation}
            </p>
          </div>
          <div className="rounded-[2rem] bg-surface p-6 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-sage">
              {isGuest ? 'Guest access' : 'Account access'}
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              {isGuest ? 'Try it without login.' : 'Synced to your account.'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {isGuest
                ? 'Guest chat stays local and has 5 free AI messages per day.'
                : 'Your account has 20 free AI messages per day and saves chat history in D1.'}
            </p>
            {isGuest && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/signup"
                  className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-canvas"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="rounded-full bg-canvas px-4 py-2 text-sm font-semibold text-ink"
                >
                  Log in
                </Link>
              </div>
            )}
          </div>
        </section>

        <ChatPanel
          user={user}
          language={language}
          initialMode={tool.id}
          fixedMode
          copy={chatCopy}
          examples={tool.examples}
          className="mt-8"
        />

        <footer className="mt-10 flex flex-col gap-3 rounded-mp bg-surface p-5 text-sm text-muted shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-4">
            <Link href="/app" className="font-semibold hover:text-ink">
              Dashboard
            </Link>
            <Link href="/why" className="font-semibold hover:text-ink">
              Why I built this
            </Link>
            <span>Privacy note: no therapy, no public chat sharing.</span>
          </div>
          <FeedbackModal />
        </footer>
      </main>
    </div>
  );
}
