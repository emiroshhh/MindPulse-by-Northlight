'use client';

import {
  Brain,
  CheckCircle2,
  Globe2,
  History,
  Loader2,
  LogIn,
  LogOut,
  MessageSquareText,
  ShieldCheck,
  Target,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  GUEST_AGENT_KEY,
  GUEST_BANNER_KEY,
  GUEST_FOCUS_KEY,
  LANGUAGE_KEY,
  localId,
  readJson,
  writeJson,
} from '@/lib/mindpulse/local-store';
import {
  languages,
  mindPulseTools,
  type LanguageCode,
} from '@/lib/mindpulse/tools';
import { ChatPanel, type ChatPanelCopy } from './mindpulse/chat-panel';
import { FeedbackModal } from './mindpulse/feedback-modal';
import { ToolCard } from './mindpulse/tool-card';
import { SafeMarkdown } from './safe-markdown';

type User = { id?: string; email: string; name: string };
type AuthMeBody = { user?: User | null };
type AgentPlan = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

const agentPrompts = [
  'Turn my exam panic into a 3-day study plan',
  'Break my semester project into next actions',
  'I keep procrastinating. Give me the smallest first step',
];

function chatCopyFor(language: LanguageCode): ChatPanelCopy {
  return {
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
    fallbackError:
      language === 'ru'
        ? 'MindPulse сейчас не смог ответить. Попробуй ещё раз.'
        : language === 'kk'
          ? 'MindPulse қазір жауап бере алмады. Қайта байқап көр.'
          : 'MindPulse could not answer right now. Please try again.',
  };
}

export function DashboardApp({ user: initialUser }: { user: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [todayFocus, setTodayFocus] = useState('');
  const [showGuestBanner, setShowGuestBanner] = useState(false);
  const [agentInput, setAgentInput] = useState('');
  const [agentOutput, setAgentOutput] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const isGuest = !user;
  const chatCopy = useMemo(() => chatCopyFor(language), [language]);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

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
        // Keep server-rendered state if the lightweight session check fails.
      }
    }
    void reconcileSession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const storedLanguage = readJson<LanguageCode | null>(LANGUAGE_KEY, null);
    if (storedLanguage && languages.some((item) => item.id === storedLanguage))
      setLanguage(storedLanguage);
    setTodayFocus(readJson(GUEST_FOCUS_KEY, ''));
    setShowGuestBanner(!readJson(GUEST_BANNER_KEY, false));
  }, []);

  useEffect(() => {
    writeJson(LANGUAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    writeJson(GUEST_FOCUS_KEY, todayFocus);
  }, [todayFocus]);

  async function runAgent(prompt = agentInput) {
    const text = prompt.trim();
    if (!text || agentLoading) return;
    setAgentInput(text);
    setAgentLoading(true);
    setSaved(false);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'planner',
          language,
          message: `Act as the MindPulse Agent. Create a structured student plan with these sections: Goal, Plan, Next 3 actions, Deadline, Motivation reset, Possible obstacles, Smallest first step. Be practical and supportive. User request: ${text}`,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        reply?: string;
      };
      setAgentOutput(
        body.reply ?? 'MindPulse Agent could not generate a plan right now.',
      );
    } finally {
      setAgentLoading(false);
    }
  }

  async function savePlan() {
    if (!agentOutput.trim()) return;
    if (!user) {
      const plans = readJson<AgentPlan[]>(GUEST_AGENT_KEY, []);
      writeJson(
        GUEST_AGENT_KEY,
        [
          {
            id: localId('guest-agent'),
            title: agentInput.slice(0, 80) || 'MindPulse Agent plan',
            content: agentOutput,
            created_at: new Date().toISOString(),
          },
          ...plans,
        ].slice(0, 20),
      );
      setSaved(true);
      return;
    }
    const response = await fetch('/api/agent', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: agentInput.slice(0, 80) || 'MindPulse Agent plan',
        content: agentOutput,
      }),
    });
    setSaved(response.ok);
  }

  return (
    <div className="ambient min-h-screen">
      <header className="sticky top-0 z-40 border-b border-ink/5 bg-canvas/85 backdrop-blur-xl">
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
          <div className="hidden gap-6 text-sm font-semibold text-muted lg:flex">
            <Link href="/app" className="hover:text-ink">
              Dashboard
            </Link>
            <Link href="/why" className="hover:text-ink">
              Why I built this
            </Link>
            <a href="#agent" className="hover:text-ink">
              Agent
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
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
        {isGuest && showGuestBanner && (
          <section className="mb-6 rounded-[1.75rem] border border-sage/20 bg-sage-soft/70 p-5 shadow-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-3xl text-sm leading-6 text-muted">
                Create a free account to continue with more messages and save
                your progress. Guest history stays local to this device.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/signup"
                  className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-canvas"
                >
                  Create free account
                </Link>
                <Link
                  href="/login"
                  className="rounded-full bg-canvas px-4 py-2 text-sm font-semibold text-ink"
                >
                  Log in
                </Link>
                <button
                  onClick={() => {
                    writeJson(GUEST_BANNER_KEY, true);
                    setShowGuestBanner(false);
                  }}
                  className="rounded-full bg-canvas/70 px-4 py-2 text-sm font-semibold text-muted"
                >
                  Continue as guest
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="grid gap-5 lg:grid-cols-[1fr_22rem]">
          <div className="overflow-hidden rounded-[2rem] bg-surface p-6 shadow-soft sm:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-sage-soft px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-sage">
                Beta
              </span>
              <span className="rounded-full bg-canvas px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-muted">
                Built by a student, for students
              </span>
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight tracking-[-.045em] sm:text-6xl">
              A calmer student workspace for messy days.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
              MindPulse helps you study, plan, reset motivation, build habits,
              break down goals, and reflect without guilt. Start as a guest, or
              create a free account when you want saved progress.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#chat"
                className="inline-flex min-h-12 items-center rounded-full bg-sage px-6 font-semibold text-canvas"
              >
                Open AI chat
              </a>
              <Link
                href="/why"
                className="inline-flex min-h-12 items-center rounded-full bg-canvas px-6 font-semibold text-ink"
              >
                Why I built this
              </Link>
              <FeedbackModal />
            </div>
          </div>
          <aside className="rounded-[2rem] bg-ink p-6 text-canvas shadow-soft">
            <Target className="text-sage-soft" />
            <h2 className="mt-5 text-xl font-semibold">Today’s focus</h2>
            <textarea
              value={todayFocus}
              onChange={(event) => setTodayFocus(event.target.value)}
              rows={4}
              className="mt-4 w-full resize-none rounded-2xl border border-canvas/10 bg-canvas/10 px-4 py-3 text-sm text-canvas outline-none placeholder:text-canvas/45 focus:border-sage-soft"
              placeholder="One useful thing for today..."
            />
            <p className="mt-3 text-sm leading-6 text-canvas/70">
              No shame streaks. Pick one useful return today and let the rest
              become easier after that.
            </p>
            <div className="mt-5 rounded-2xl bg-canvas/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-sage-soft">
                {isGuest ? 'Guest plan' : 'Account plan'}
              </p>
              <p className="mt-2 text-sm leading-6 text-canvas/75">
                {isGuest
                  ? '5 free guest messages/day · local history only'
                  : '20 free messages/day · D1 chat history enabled'}
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ['Free student beta', 'No payments, subscriptions, or ads.'],
            ['Guest-first', 'Try MindPulse without a login wall.'],
            [
              'Private by design',
              'API keys and account data stay server-side.',
            ],
          ].map(([title, copy]) => (
            <article
              key={title}
              className="rounded-mp bg-surface p-5 shadow-soft"
            >
              <ShieldCheck className="text-sage" size={20} />
              <h2 className="mt-4 font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
            </article>
          ))}
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-sage">
                Six tools
              </p>
              <h2 className="mt-2 text-3xl font-semibold">
                Choose what kind of support you need.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted">
              Each tool opens a focused chat mode with examples, while
              preserving the same guest/account limits and language setting.
            </p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mindPulseTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        <section id="chat" className="scroll-mt-24">
          <ChatPanel
            user={user}
            language={language}
            copy={chatCopy}
            className="mt-8"
          />
        </section>

        <section
          id="agent"
          className="mt-8 rounded-[2rem] bg-surface p-6 shadow-soft"
        >
          <p className="text-xs font-bold uppercase tracking-[.2em] text-sage">
            AI Agent
          </p>
          <h2 className="mt-3 text-3xl font-semibold">
            Turn vague pressure into a plan.
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {agentPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => void runAgent(prompt)}
                className="rounded-full bg-sage-soft px-4 py-2 text-sm font-semibold text-ink"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void runAgent();
              }}
            >
              <textarea
                value={agentInput}
                onChange={(event) => setAgentInput(event.target.value)}
                rows={8}
                className="w-full resize-none rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-sage"
                placeholder="I have a biology exam Friday and I am behind..."
              />
              <button className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 font-semibold text-canvas">
                {agentLoading && <Loader2 size={16} className="animate-spin" />}
                Generate next step
              </button>
            </form>
            <div className="rounded-mp bg-canvas/70 p-5">
              <h3 className="font-semibold">Structured output</h3>
              <div className="mt-4 min-h-[12rem] text-sm leading-7">
                {agentOutput ? (
                  <SafeMarkdown>{agentOutput}</SafeMarkdown>
                ) : (
                  <p className="text-muted">
                    Your Agent result will show Goal, Plan, Next 3 actions,
                    Deadline, Motivation reset, Obstacles, and Smallest first
                    step.
                  </p>
                )}
              </div>
              <button
                onClick={() => void savePlan()}
                disabled={!agentOutput}
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-sage px-4 text-sm font-semibold text-canvas disabled:opacity-40"
              >
                Save plan {saved && <CheckCircle2 size={15} />}
              </button>
              {saved && isGuest && (
                <p className="mt-2 text-xs font-semibold text-sage">
                  Saved locally on this device.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-mp bg-surface p-5 shadow-soft">
          <h2 className="flex items-center gap-2 font-semibold">
            <History size={18} className="text-sage" /> Recent sessions
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {isGuest
              ? 'Guest conversations stay in this browser. Open the chat above to continue your local session.'
              : 'Your latest account conversations load inside the chat panel and are saved to D1.'}
          </p>
        </section>

        <footer className="mt-8 flex flex-col gap-4 rounded-mp bg-surface p-5 text-sm text-muted shadow-soft lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-4">
            <Link href="/app" className="font-semibold hover:text-ink">
              Dashboard
            </Link>
            <Link href="/why" className="font-semibold hover:text-ink">
              Why I built this
            </Link>
            {isGuest && (
              <>
                <Link href="/login" className="font-semibold hover:text-ink">
                  Login
                </Link>
                <Link href="/signup" className="font-semibold hover:text-ink">
                  Sign up
                </Link>
              </>
            )}
          </div>
          <p className="flex items-center gap-2">
            <MessageSquareText size={16} className="text-sage" />
            Privacy note: MindPulse is not therapy or emergency help.
          </p>
        </footer>
      </main>
    </div>
  );
}
