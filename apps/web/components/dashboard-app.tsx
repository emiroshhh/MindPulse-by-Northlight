'use client';

import {
  Brain,
  CheckCircle2,
  Globe2,
  History,
  Loader2,
  LogIn,
  LogOut,
  ShieldCheck,
  Target,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { chatCopyFor, copyFor, getToolsForLanguage } from '@/lib/mindpulse/i18n';
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
  type LanguageCode,
} from '@/lib/mindpulse/tools';
import { ChatPanel } from './mindpulse/chat-panel';
import { FeedbackModal } from './mindpulse/feedback-modal';
import { SiteFooter } from './mindpulse/site-footer';
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

export function DashboardApp({ user: initialUser }: { user: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser);
  // authReady starts true if the server already confirmed a user (no flash needed).
  // If the server passed null, we wait for /api/auth/me before showing guest UI.
  const [authReady, setAuthReady] = useState(Boolean(initialUser));
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [todayFocus, setTodayFocus] = useState('');
  const [showGuestBanner, setShowGuestBanner] = useState(false);
  const [agentInput, setAgentInput] = useState('');
  const [agentOutput, setAgentOutput] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const isGuest = !user;

  const ui = useMemo(() => copyFor(language), [language]);
  const chatCopy = useMemo(() => chatCopyFor(language), [language]);
  const localizedTools = useMemo(() => getToolsForLanguage(language), [language]);

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
        if (active) {
          if (response.ok) {
            const body = (await response.json().catch(() => ({}))) as AuthMeBody;
            setUser(body.user ?? null);
          } else if (response.status === 401) {
            setUser(null);
          }
          // For other status codes (network error handled in catch), keep initialUser.
        }
      } catch {
        // Keep server-rendered state if the lightweight session check fails.
      } finally {
        // Always mark auth as ready so the UI stops blocking on the check.
        if (active) setAuthReady(true);
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
    setSaveError('');
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
      setAgentOutput(body.reply ?? ui.agentFallback);
    } finally {
      setAgentLoading(false);
    }
  }

  async function savePlan() {
    if (!agentOutput.trim()) return;
    setSaved(false);
    setSaveError('');

    // Do not save while session check is still in progress.
    if (!authReady) {
      setSaveError(ui.authChecking);
      return;
    }

    if (!user) {
      // Confirmed guest — save locally.
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

    // Logged-in user — POST to account.
    const response = await fetch('/api/agent', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: agentInput.slice(0, 80) || 'MindPulse Agent plan',
        content: agentOutput,
      }),
    });
    if (response.ok) {
      setSaved(true);
    } else if (response.status === 401) {
      setSaveError(ui.agentNeedLogin);
    } else {
      setSaveError(ui.agentFallback);
    }
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
              {ui.navDashboard}
            </Link>
            <Link href="/why" className="hover:text-ink">
              {ui.navWhy}
            </Link>
            <a href="#agent" className="hover:text-ink">
              {ui.navAgent}
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
            {/* Hide auth-dependent nav buttons until session is confirmed */}
            {authReady && (
              user ? (
                <Link
                  href="/logout"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-canvas"
                >
                  <LogOut size={15} /> {ui.navLogout}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-surface px-4 text-sm font-semibold text-ink shadow-soft"
                  >
                    <LogIn size={15} /> {ui.navLogin}
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-canvas"
                  >
                    <UserPlus size={15} /> {ui.navSignup}
                  </Link>
                </>
              )
            )}
          </div>
        </nav>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {/* Guest banner — only show after auth check confirms user is null */}
        {authReady && isGuest && showGuestBanner && (
          <section className="mb-6 rounded-[1.75rem] border border-sage/20 bg-sage-soft/70 p-5 shadow-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-3xl text-sm leading-6 text-muted">
                {ui.guestBannerText}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/signup"
                  className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-canvas"
                >
                  {ui.guestBannerCreate}
                </Link>
                <Link
                  href="/login"
                  className="rounded-full bg-canvas px-4 py-2 text-sm font-semibold text-ink"
                >
                  {ui.guestBannerLogin}
                </Link>
                <button
                  onClick={() => {
                    writeJson(GUEST_BANNER_KEY, true);
                    setShowGuestBanner(false);
                  }}
                  className="rounded-full bg-canvas/70 px-4 py-2 text-sm font-semibold text-muted"
                >
                  {ui.guestBannerContinue}
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="grid gap-5 lg:grid-cols-[1fr_22rem]">
          <div className="overflow-hidden rounded-[2rem] bg-surface p-6 shadow-soft sm:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-sage-soft px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-sage">
                {ui.heroBeta}
              </span>
              <span className="rounded-full bg-canvas px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-muted">
                {ui.heroBuiltBy}
              </span>
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight tracking-[-.045em] sm:text-6xl">
              {ui.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
              {ui.heroSubtitle}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#chat"
                className="inline-flex min-h-12 items-center rounded-full bg-sage px-6 font-semibold text-canvas"
              >
                {ui.heroOpenChat}
              </a>
              <Link
                href="/why"
                className="inline-flex min-h-12 items-center rounded-full bg-canvas px-6 font-semibold text-ink"
              >
                {ui.heroWhy}
              </Link>
              <FeedbackModal />
            </div>
          </div>
          <aside className="rounded-[2rem] bg-ink p-6 text-canvas shadow-soft">
            <Target className="text-sage-soft" />
            <h2 className="mt-5 text-xl font-semibold">{ui.focusTitle}</h2>
            <textarea
              value={todayFocus}
              onChange={(event) => setTodayFocus(event.target.value)}
              rows={4}
              className="mt-4 w-full resize-none rounded-2xl border border-canvas/10 bg-canvas/10 px-4 py-3 text-sm text-canvas outline-none placeholder:text-canvas/45 focus:border-sage-soft"
              placeholder={ui.focusPlaceholder}
            />
            <p className="mt-3 text-sm leading-6 text-canvas/70">
              {ui.focusNote}
            </p>
            <div className="mt-5 rounded-2xl bg-canvas/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-sage-soft">
                {!authReady
                  ? ui.authChecking
                  : isGuest
                    ? ui.planGuestLabel
                    : ui.planAccountLabel}
              </p>
              {authReady && (
                <p className="mt-2 text-sm leading-6 text-canvas/75">
                  {isGuest ? ui.planGuestDesc : ui.planAccountDesc}
                </p>
              )}
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {ui.featureCards.map(([title, copy]) => (
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
                {ui.toolsLabel}
              </p>
              <h2 className="mt-2 text-3xl font-semibold">
                {ui.toolsTitle}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted">
              {ui.toolsDesc}
            </p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {localizedTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} openLabel={ui.toolOpenLabel} />
            ))}
          </div>
        </section>

        <section id="chat" className="scroll-mt-24">
          <ChatPanel
            user={user}
            language={language}
            copy={chatCopy}
            authReady={authReady}
            className="mt-8"
          />
        </section>

        <section
          id="agent"
          className="mt-8 rounded-[2rem] bg-surface p-6 shadow-soft"
        >
          <p className="text-xs font-bold uppercase tracking-[.2em] text-sage">
            {ui.agentLabel}
          </p>
          <h2 className="mt-3 text-3xl font-semibold">
            {ui.agentTitle}
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {ui.agentPrompts.map((prompt) => (
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
                placeholder={ui.agentPlaceholder}
              />
              <button className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 font-semibold text-canvas">
                {agentLoading && <Loader2 size={16} className="animate-spin" />}
                {ui.agentGenerate}
              </button>
            </form>
            <div className="rounded-mp bg-canvas/70 p-5">
              <h3 className="font-semibold">{ui.agentOutputTitle}</h3>
              <div className="mt-4 min-h-[12rem] text-sm leading-7">
                {agentOutput ? (
                  <SafeMarkdown>{agentOutput}</SafeMarkdown>
                ) : (
                  <p className="text-muted">{ui.agentOutputEmpty}</p>
                )}
              </div>
              <button
                onClick={() => void savePlan()}
                disabled={!agentOutput}
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-sage px-4 text-sm font-semibold text-canvas disabled:opacity-40"
              >
                {ui.agentSave} {saved && <CheckCircle2 size={15} />}
              </button>
              {saved && isGuest && (
                <p className="mt-2 text-xs font-semibold text-sage">
                  {ui.agentSavedLocal}
                </p>
              )}
              {saveError && (
                <p className="mt-2 text-xs font-semibold text-danger">
                  {saveError}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-mp bg-surface p-5 shadow-soft">
          <h2 className="flex items-center gap-2 font-semibold">
            <History size={18} className="text-sage" /> {ui.recentTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {!authReady
              ? ui.authChecking
              : isGuest
                ? ui.recentGuest
                : ui.recentAccount}
          </p>
        </section>

        <SiteFooter language={language} />
      </main>
    </div>
  );
}
