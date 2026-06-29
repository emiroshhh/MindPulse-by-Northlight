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
  localId,
  readJson,
  writeJson,
} from '@/lib/mindpulse/local-store';
import { getToolsForLanguage } from '@/lib/mindpulse/i18n';
import { toolsByMode, type LanguageCode, type ModeId } from '@/lib/mindpulse/tools';
import { SafeMarkdown } from '../safe-markdown';

export type MindPulseUser = { id?: string; email: string; name: string };

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: ModeId;
  created_at: string;
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
};

export type ChatPanelCopy = {
  chooseMode: string;
  emptyGuest: string;
  emptyAuth: string;
  guestLimitLabel: string;
  accountLimitLabel: string;
  guestLimitReached: string;
  accountLimitReached: string;
  signup: string;
  login: string;
  send: string;
  safetyNote: string;
  fallbackError: string;
  /** Shown in the empty-messages area while auth check is pending */
  authChecking?: string;
};

export function ChatPanel({
  user,
  language,
  initialMode = 'study',
  fixedMode = false,
  copy,
  examples = [],
  className = '',
  authReady = true,
}: {
  user: MindPulseUser | null;
  language: LanguageCode;
  initialMode?: ModeId;
  fixedMode?: boolean;
  copy: ChatPanelCopy;
  examples?: string[];
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, mode, language }),
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
      setMessages((items) => [
        ...items,
        {
          id: localId('local-ai'),
          role: 'assistant',
          content: body.reply!,
          mode,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  // Derive the empty-state message shown before any messages exist
  const emptyStateText = !authReady
    ? (copy.authChecking ?? 'Checking your session…')
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
                className={`w-full rounded-2xl p-3 text-left text-sm font-semibold ${
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
        <div className="border-b border-ink/5 p-5">
          <h2 className="text-xl font-semibold">{selectedMode.title}</h2>
          <p className="text-sm text-muted">{selectedMode.copy}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[.16em] text-sage">
            {user ? copy.accountLimitLabel : copy.guestLimitLabel}
            {usage ? ` · ${usage.remaining} left today` : ''}
          </p>
          {examples.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example}
                  onClick={() => void sendChat(undefined, example)}
                  className="rounded-full bg-sage-soft px-4 py-2 text-left text-xs font-semibold text-ink transition hover:bg-sage hover:text-canvas"
                >
                  {example}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="max-h-[32rem] min-h-[24rem] space-y-4 overflow-y-auto bg-canvas/40 p-5">
          {!messages.length && (
            <p className="rounded-mp bg-surface p-4 text-muted">
              {emptyStateText}
            </p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-[1.35rem] px-4 py-3 text-sm leading-7 ${
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
          ))}
          {chatLoading && <Loader2 className="animate-spin text-sage" />}
        </div>
        {chatError && (
          <div className="mx-5 mt-4 rounded-2xl bg-warm/15 p-3 text-sm text-danger">
            <p>{chatError}</p>
            {limitAccountRequired && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/signup"
                  className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-canvas"
                >
                  {copy.signup}
                </Link>
                <Link
                  href="/login"
                  className="rounded-full bg-canvas px-4 py-2 text-xs font-semibold text-ink"
                >
                  {copy.login}
                </Link>
              </div>
            )}
          </div>
        )}
        <form onSubmit={(event) => void sendChat(event)} className="p-5">
          <textarea
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            maxLength={1000}
            rows={3}
            className="w-full resize-none rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-sage"
            placeholder={`Ask ${selectedMode.title}...`}
          />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">{copy.safetyNote}</p>
            <button
              disabled={chatLoading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-sage px-5 font-semibold text-canvas disabled:opacity-50"
            >
              {copy.send} <Send size={15} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
