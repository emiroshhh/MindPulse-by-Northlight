'use client';

import { Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';
import {
  GUEST_CHAT_KEY,
  GUEST_TOOL_RESULTS_KEY,
  localId,
  readJson,
  writeJson,
} from '@/lib/mindpulse/local-store';
import { authHeaders } from '@/lib/mindpulse/client-auth';
import { getToolsForLanguage } from '@/lib/mindpulse/i18n';
import {
  toolsByMode,
  type LanguageCode,
  type ModeId,
} from '@/lib/mindpulse/tools';
import { SafeMarkdown } from '../safe-markdown';

export type MindPulseUser = { id?: string; email: string; name: string };

export type CrisisResourceLink = {
  id: string;
  name: string;
  description: string;
  url: string;
  availability: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: ModeId;
  created_at: string;
  crisis?: boolean;
  resources?: CrisisResourceLink[];
};

type ChatUsage = {
  limit: number;
  used: number;
  remaining: number;
  accountRequired: boolean;
};

type ChatApiBody = {
  reply?: string;
  error?: string;
  limit?: number;
  accountRequired?: boolean;
  remaining?: number;
  usage?: ChatUsage;
  crisis?: boolean;
  resources?: CrisisResourceLink[];
};

export type ChatPanelCopy = {
  chooseMode: string;
  emptyGuest: string;
  emptyAuth: string;
  guestLimitLabel: string;
  accountLimitLabel: string;
  usageRemaining: (remaining: number) => string;
  guestLimitReached: string;
  accountLimitReached: string;
  signup: string;
  login: string;
  send: string;
  safetyNote: string;
  fallbackError: string;
  loading: string;
  /** Shown in the empty-messages area while auth check is pending */
  authChecking?: string;
  /** Heading above crisis support resource links */
  crisisResourcesLabel?: string;
  intakeTitle?: string;
  intakeStart?: string;
  intakeSkip?: string;
  saveResult?: string;
  resultSavedAccount?: string;
  resultSavedLocal?: string;
  saveFailed?: string;
};

export function ChatPanel({
  user,
  language,
  initialMode = 'study',
  fixedMode = false,
  copy,
  examples = [],
  emptyHint,
  className = '',
  authReady = true,
}: {
  user: MindPulseUser | null;
  language: LanguageCode;
  initialMode?: ModeId;
  fixedMode?: boolean;
  copy: ChatPanelCopy;
  examples?: string[];
  emptyHint?: string;
  className?: string;
  /** Set to false while the parent is still confirming the user session.
   *  ChatPanel will not load history (guest or account) until this is true. */
  authReady?: boolean;
}) {
  const [mode, setMode] = useState<ModeId>(initialMode);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyReady, setHistoryReady] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [usage, setUsage] = useState<ChatUsage | null>(null);
  const [limitAccountRequired, setLimitAccountRequired] = useState(false);
  const [intakeValues, setIntakeValues] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<
    'idle' | 'saving' | 'saved' | 'failed'
  >('idle');
  const isGuest = !user;

  const displayModes = useMemo(() => getToolsForLanguage(language), [language]);
  const selectedMode = useMemo(
    () => displayModes.find((t) => t.id === mode) ?? toolsByMode[mode],
    [displayModes, mode],
  );

  const loadHistory = useCallback(async () => {
    setHistoryReady(false);
    if (!user) {
      setMessages(readJson<ChatMessage[]>(GUEST_CHAT_KEY, []));
      setHistoryReady(true);
      return;
    }
    const response = await fetch('/api/chat/history', {
      credentials: 'same-origin',
      headers: authHeaders(),
    });
    if (!response.ok) {
      setHistoryReady(true);
      return;
    }
    const body = (await response.json()) as { messages?: ChatMessage[] };
    setMessages([...(body.messages ?? [])].reverse());
    setHistoryReady(true);
  }, [user]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Only load history once the parent has confirmed the auth state.
  // Without this guard, a server-rendered guest (initialUser = null due to
  // Cloudflare cookies() unreliability) would flash guest local history
  // before the /api/auth/me check confirms the real user.
  useEffect(() => {
    if (!authReady) return;
    void loadHistory();
    setUsage(null);
    setLimitAccountRequired(false);
  }, [loadHistory, authReady]);

  useEffect(() => {
    if (isGuest && historyReady) writeJson(GUEST_CHAT_KEY, messages.slice(-80));
  }, [historyReady, isGuest, messages]);

  async function sendChat(event?: FormEvent, example?: string) {
    event?.preventDefault();
    const text = (example ?? chatInput).trim();
    if (!text || chatLoading) return;
    setChatLoading(true);
    setChatError('');
    setLimitAccountRequired(false);
    setChatInput('');
    const localUser: ChatMessage = {
      id: localId('local-user'),
      role: 'user',
      content: text,
      mode,
      created_at: new Date().toISOString(),
    };
    setMessages((items) => [...items, localUser]);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          mode,
          language,
          history: messages
            .filter((item) => item.mode === mode)
            .slice(-6)
            .map(({ role, content }) => ({ role, content })),
        }),
      });
      const body = (await response.json().catch(() => ({}))) as ChatApiBody;
      if (response.status === 429 && body.error === 'daily_limit_reached') {
        setChatError(
          body.accountRequired
            ? copy.guestLimitReached
            : copy.accountLimitReached,
        );
        setLimitAccountRequired(Boolean(body.accountRequired));
        if (typeof body.limit === 'number') {
          setUsage({
            limit: body.limit,
            used: body.limit,
            remaining: 0,
            accountRequired: Boolean(body.accountRequired),
          });
        }
        return;
      }
      if (!response.ok || !body.reply) {
        console.error('[MindPulse] chat failed:', body);
        setChatError(copy.fallbackError);
        return;
      }
      if (body.usage) setUsage(body.usage);
      setSaveState('idle');
      setMessages((items) => [
        ...items,
        {
          id: localId('local-ai'),
          role: 'assistant',
          content: body.reply!,
          mode,
          created_at: new Date().toISOString(),
          ...(body.crisis
            ? { crisis: true, resources: body.resources ?? [] }
            : {}),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  function submitIntake(event: FormEvent) {
    event.preventDefault();
    const fields = selectedMode.intake ?? [];
    const parts = fields
      .map((field) => {
        const value = (intakeValues[field.id] ?? '').trim();
        return value ? `${field.label}: ${value}` : '';
      })
      .filter(Boolean);
    if (!parts.length) return;
    void sendChat(undefined, parts.join('\n'));
  }

  const lastAssistant = [...messages]
    .reverse()
    .find((item) => item.role === 'assistant' && !item.crisis);

  async function saveLastResult() {
    if (!lastAssistant || saveState === 'saving') return;
    setSaveState('saving');
    const title = `${selectedMode.title} · ${new Date().toISOString().slice(0, 10)}`;
    if (!user) {
      try {
        const existing = readJson<
          Array<{
            id: string;
            mode: ModeId;
            title: string;
            content: string;
            created_at: string;
          }>
        >(GUEST_TOOL_RESULTS_KEY, []);
        writeJson(
          GUEST_TOOL_RESULTS_KEY,
          [
            {
              id: localId('tool-result'),
              mode,
              title,
              content: lastAssistant.content,
              created_at: new Date().toISOString(),
            },
            ...existing,
          ].slice(0, 20),
        );
        setSaveState('saved');
      } catch {
        setSaveState('failed');
      }
      return;
    }
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: lastAssistant.content,
          kind: 'tool_result',
        }),
      });
      setSaveState(response.ok ? 'saved' : 'failed');
    } catch {
      setSaveState('failed');
    }
  }

  const showIntake =
    fixedMode &&
    authReady &&
    historyReady &&
    messages.length === 0 &&
    (selectedMode.intake?.length ?? 0) > 0;

  // Derive the empty-state message shown before any messages exist
  const emptyStateText = !authReady
    ? (copy.authChecking ?? 'Checking your session…')
    : emptyHint
      ? emptyHint
      : isGuest
        ? copy.emptyGuest
        : copy.emptyAuth;

  return (
    <section
      className={`grid gap-5 ${fixedMode ? '' : 'lg:grid-cols-[20rem_1fr]'} ${className}`}
    >
      {!fixedMode && (
        <div className="rounded-mp bg-surface p-5 shadow-soft">
          <h2 className="font-semibold">{copy.chooseMode}</h2>
          <div className="mt-4 space-y-2">
            {displayModes.map((item) => (
              <button
                key={item.id}
                onClick={() => setMode(item.id)}
                className={`min-h-11 w-full rounded-2xl p-3 text-left text-sm font-semibold ${
                  mode === item.id
                    ? 'bg-sage-soft text-ink'
                    : 'bg-canvas/60 text-muted'
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="rounded-[2rem] bg-surface shadow-soft">
        <div className="border-b border-ink/5 p-5 sm:p-6">
          <h2 className="text-xl font-semibold sm:text-2xl">
            {selectedMode.title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            {selectedMode.copy}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[.16em] text-sage">
            {user ? copy.accountLimitLabel : copy.guestLimitLabel}
            {usage ? ` · ${copy.usageRemaining(usage.remaining)}` : ''}
          </p>
          {examples.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example}
                  onClick={() => void sendChat(undefined, example)}
                  className="min-h-11 rounded-full bg-sage-soft px-4 py-2 text-left text-xs font-semibold leading-5 text-ink transition hover:bg-sage hover:text-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                >
                  {example}
                </button>
              ))}
            </div>
          )}
        </div>
        <div
          className="max-h-[32rem] min-h-[24rem] space-y-4 overflow-y-auto bg-canvas/40 p-4 sm:p-5"
          role="log"
          aria-live="polite"
        >
          {showIntake ? (
            <form
              onSubmit={submitIntake}
              className="rounded-mp bg-surface p-4 sm:p-5"
            >
              <p className="text-xs font-bold uppercase tracking-[.16em] text-sage">
                {copy.intakeTitle ?? 'Guided start'}
              </p>
              <div className="mt-3 space-y-3">
                {(selectedMode.intake ?? []).map((field) => (
                  <label key={field.id} className="block">
                    <span className="text-sm font-semibold">{field.label}</span>
                    {field.multiline ? (
                      <textarea
                        value={intakeValues[field.id] ?? ''}
                        onChange={(event) =>
                          setIntakeValues((current) => ({
                            ...current,
                            [field.id]: event.target.value,
                          }))
                        }
                        maxLength={field.maxLength}
                        rows={3}
                        placeholder={field.placeholder}
                        className="mt-1 w-full resize-none rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 text-sm outline-none focus:border-sage"
                      />
                    ) : (
                      <input
                        value={intakeValues[field.id] ?? ''}
                        onChange={(event) =>
                          setIntakeValues((current) => ({
                            ...current,
                            [field.id]: event.target.value,
                          }))
                        }
                        maxLength={field.maxLength}
                        placeholder={field.placeholder}
                        className="mt-1 w-full rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 text-sm outline-none focus:border-sage"
                      />
                    )}
                  </label>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-sage px-5 text-sm font-semibold text-canvas"
                >
                  {copy.intakeStart ?? 'Get my first answer'}
                </button>
                <p className="text-xs text-muted">{copy.intakeSkip ?? ''}</p>
              </div>
            </form>
          ) : !messages.length ? (
            <p className="rounded-mp bg-surface p-4 text-sm leading-7 text-muted">
              {emptyStateText}
            </p>
          ) : null}
          {messages.map((message) =>
            message.crisis ? (
              <div
                key={message.id}
                role="alert"
                className="rounded-[1.35rem] border-2 border-danger/40 bg-surface px-4 py-4 text-sm leading-7"
              >
                {message.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className={index > 0 ? 'mt-3' : ''}>
                    {paragraph}
                  </p>
                ))}
                {(message.resources?.length ?? 0) > 0 && (
                  <div className="mt-4 border-t border-ink/10 pt-3">
                    <p className="text-xs font-bold uppercase tracking-[.14em] text-danger">
                      {copy.crisisResourcesLabel ?? 'Support options'}
                    </p>
                    <ul className="mt-2 space-y-2">
                      {message.resources!.map((resource) => (
                        <li key={resource.id}>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-ink underline decoration-danger/50 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                          >
                            {resource.name}
                          </a>
                          <p className="text-muted">{resource.description}</p>
                          <p className="text-xs text-muted">
                            {resource.availability}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[92%] rounded-[1.35rem] px-4 py-3 text-sm leading-7 sm:max-w-[85%] ${
                    message.role === 'user'
                      ? 'rounded-br-md bg-ink text-canvas'
                      : 'rounded-bl-md bg-surface'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <SafeMarkdown>{message.content}</SafeMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ),
          )}
          {chatLoading && (
            <div className="flex items-center gap-3 rounded-mp bg-surface p-4 text-sm font-medium text-muted">
              <Loader2 className="animate-spin text-sage" size={18} />
              <span>{copy.loading}</span>
            </div>
          )}
          {fixedMode && lastAssistant && !chatLoading && (
            <div className="flex flex-wrap items-center gap-3">
              {saveState === 'saved' ? (
                <p
                  className="rounded-full bg-sage-soft px-4 py-2 text-xs font-semibold text-ink"
                  role="status"
                >
                  {isGuest
                    ? (copy.resultSavedLocal ?? 'Saved on this device ✓')
                    : (copy.resultSavedAccount ?? 'Saved to your account ✓')}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => void saveLastResult()}
                  disabled={saveState === 'saving'}
                  className="min-h-11 rounded-full bg-surface px-4 py-2 text-xs font-semibold text-ink shadow-soft hover:bg-sage-soft disabled:opacity-50"
                >
                  {copy.saveResult ?? 'Save this result'}
                </button>
              )}
              {saveState === 'failed' && (
                <p className="text-xs text-danger" role="alert">
                  {copy.saveFailed ?? 'Could not save. Please try again.'}
                </p>
              )}
            </div>
          )}
        </div>
        {chatError && (
          <div className="mx-4 mt-4 rounded-2xl bg-warm/15 p-4 text-sm leading-6 text-danger sm:mx-5">
            <p>{chatError}</p>
            {limitAccountRequired && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/signup"
                  className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-xs font-semibold text-canvas"
                >
                  {copy.signup}
                </Link>
                <Link
                  href="/login"
                  className="inline-flex min-h-11 items-center rounded-full bg-canvas px-4 text-xs font-semibold text-ink"
                >
                  {copy.login}
                </Link>
              </div>
            )}
          </div>
        )}
        <form onSubmit={(event) => void sendChat(event)} className="p-4 sm:p-5">
          <textarea
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            maxLength={1000}
            rows={3}
            className="w-full resize-none rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-sage"
            placeholder={
              selectedMode.examples[0] ?? `Ask ${selectedMode.title}...`
            }
          />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">{copy.safetyNote}</p>
            <button
              disabled={chatLoading}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-sage px-5 font-semibold text-canvas disabled:opacity-50 sm:w-auto"
            >
              {copy.send} <Send size={15} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
