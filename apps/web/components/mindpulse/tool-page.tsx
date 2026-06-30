'use client';

import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Globe2,
  LogIn,
  MessageSquareText,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { chatCopyFor, copyFor, getToolsForLanguage } from '@/lib/mindpulse/i18n';
import { authHeaders } from '@/lib/mindpulse/client-auth';
import { LANGUAGE_KEY, readJson, writeJson } from '@/lib/mindpulse/local-store';
import {
  isLanguageCode,
  languages,
  type LanguageCode,
  type MindPulseTool,
} from '@/lib/mindpulse/tools';
import {
  ChatPanel,
  type MindPulseUser,
} from './chat-panel';
import { LogoutButton } from './logout-button';
import { SiteFooter } from './site-footer';

type AuthMeBody = { user?: MindPulseUser | null };

export function ToolPage({
  tool,
  user: initialUser,
}: {
  tool: MindPulseTool;
  user: MindPulseUser | null;
}) {
  const [user, setUser] = useState<MindPulseUser | null>(initialUser);
  // authReady starts true when the server already confirmed the user.
  // If the server passed null (Cloudflare cookies() unreliable), we wait.
  const [authReady, setAuthReady] = useState(Boolean(initialUser));
  const [language, setLanguage] = useState<LanguageCode>('en');
  const isGuest = !user;

  const ui = useMemo(() => copyFor(language), [language]);
  const chatCopy = useMemo(() => chatCopyFor(language), [language]);
  const localizedTool = useMemo<MindPulseTool>(() => {
    const localized = getToolsForLanguage(language).find((t) => t.id === tool.id);
    return localized ?? tool;
  }, [language, tool]);

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
          headers: authHeaders(),
        });
        if (active) {
          if (response.ok) {
            const body = (await response.json().catch(() => ({}))) as AuthMeBody;
            setUser(body.user ?? null);
          } else if (response.status === 401) {
            setUser(null);
          }
        }
      } catch {
        // Keep the server-rendered state if the lightweight session check fails.
      } finally {
        if (active) setAuthReady(true);
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
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link href="/app" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-canvas">
              <Brain size={20} />
            </span>
            <b>MindPulse</b>
          </Link>
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
                <LogoutButton
                  label={ui.navLogout}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-canvas"
                />
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
        <Link
          href="/app"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-5 text-sm font-semibold text-ink shadow-soft hover:bg-sage-soft"
        >
          <ArrowLeft size={16} /> {ui.toolPageBack}
        </Link>

        <section className="mt-8 grid gap-6 lg:grid-cols-[.95fr_1.05fr] lg:items-end">
          <div>
            <p className="inline-flex rounded-full bg-sage-soft px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-sage">
              {ui.toolPageBeta} · {localizedTool.shortTitle}
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-.04em] sm:text-6xl">
              {localizedTool.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
              {localizedTool.explanation}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              {localizedTool.outcome}
            </p>
          </div>

          {/* Access card — neutral until auth is confirmed */}
          <div className="rounded-[2rem] bg-surface p-6 shadow-soft">
            {!authReady ? (
              <p className="text-sm text-muted">{ui.authChecking}</p>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-sage">
                  {isGuest ? ui.toolPageGuestAccess : ui.toolPageAccountAccess}
                </p>
                <h2 className="mt-3 text-2xl font-semibold">
                  {isGuest ? ui.toolPageGuestSlogan : ui.toolPageAccountSlogan}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {isGuest ? ui.toolPageGuestDesc : ui.toolPageAccountDesc}
                </p>
                {isGuest && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href="/signup"
                      className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-canvas"
                    >
                      {ui.toolPageCreate}
                    </Link>
                    <Link
                      href="/login"
                      className="rounded-full bg-canvas px-4 py-2 text-sm font-semibold text-ink"
                    >
                      {ui.toolPageLogin}
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <article className="rounded-mp bg-surface p-5 shadow-soft">
            <CheckCircle2 className="text-sage" size={20} />
            <h2 className="mt-4 font-semibold">{ui.toolPageBestFor}</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
              {localizedTool.bestFor.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-mp bg-surface p-5 shadow-soft lg:col-span-2">
            <MessageSquareText className="text-sage" size={20} />
            <h2 className="mt-4 font-semibold">{ui.toolPagePromptStarters}</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {localizedTool.examples.slice(0, 3).map((example) => (
                <p
                  key={example}
                  className="rounded-2xl bg-canvas/70 p-4 text-sm leading-6 text-muted"
                >
                  &ldquo;{example}&rdquo;
                </p>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-6 rounded-[2rem] bg-sage-soft/70 p-5 shadow-soft sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-sage">
            {ui.toolPageHowToUse}
          </p>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-muted">
            {localizedTool.emptyHint}
          </p>
        </section>

        <ChatPanel
          user={user}
          language={language}
          initialMode={localizedTool.id}
          fixedMode
          copy={chatCopy}
          examples={localizedTool.examples.slice(0, 3)}
          emptyHint={localizedTool.emptyHint}
          authReady={authReady}
          className="mt-8"
        />

        <SiteFooter language={language} />
      </main>
    </div>
  );
}
