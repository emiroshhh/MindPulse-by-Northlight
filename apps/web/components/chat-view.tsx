'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { RefreshCw, Send, Sparkles } from 'lucide-react';
import {
  SAFE_CRISIS_REPLY,
  assessUserInput,
  t,
  type ChatMessage,
  type Locale,
} from '@mindpulse/shared';
import type { LocalState } from '@/lib/storage';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { uid } from '@/lib/utils';
import { Badge, Button, Card, Textarea } from './ui';
import { CrisisPanel } from './crisis-panel';
import { SafeMarkdown } from './safe-markdown';

interface ChatErrorState {
  message: string;
  code?: string;
}

function updateState(
  setState: React.Dispatch<React.SetStateAction<LocalState | null>>,
  update: (current: LocalState) => LocalState,
) {
  setState((current) => (current ? update(current) : current));
}

export function ChatView({
  state,
  setState,
  locale,
}: {
  state: LocalState;
  setState: React.Dispatch<React.SetStateAction<LocalState | null>>;
  locale: Locale;
}) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [crisis, setCrisis] = useState(
    state.messages.some((message) => message.safetyFlag),
  );
  const [error, setError] = useState<ChatErrorState | null>(null);
  const [retry, setRetry] = useState<{
    content: string;
    assistantId: string;
  } | null>(null);
  const [providerMode, setProviderMode] = useState<'live' | 'demo' | null>(
    null,
  );
  const endRef = useRef<HTMLDivElement>(null);

  const starters =
    locale === 'en'
      ? [
          "I'm stressed about exams",
          'Help me wind down',
          'I had a good day',
          'Everything feels like a lot',
        ]
      : [
          'Я переживаю из-за экзаменов',
          'Помоги настроиться на сон',
          'У меня был хороший день',
          'Всё навалилось одновременно',
        ];

  useEffect(
    () => endRef.current?.scrollIntoView({ behavior: 'smooth' }),
    [state.messages, sending],
  );

  const sendMessage = async (
    rawContent: string,
    options: { appendUser?: boolean; replaceAssistantId?: string } = {},
  ) => {
    const content = rawContent.trim();
    if (!content || sending) return;
    const appendUser = options.appendUser ?? true;
    setError(null);
    setRetry(null);
    setSending(true);

    const assessment = assessUserInput(content);
    if (assessment.flagged) setCrisis(true);
    const userMessage: ChatMessage = {
      id: uid('message'),
      role: 'user',
      content,
      safetyFlag: assessment.flagged,
      createdAt: new Date().toISOString(),
    };
    const assistantId = uid('message');
    let requestHistory = state.messages.filter(
      (message) => message.content && message.id !== options.replaceAssistantId,
    );
    if (
      !appendUser &&
      requestHistory.at(-1)?.role === 'user' &&
      requestHistory.at(-1)?.content === content
    )
      requestHistory = requestHistory.slice(0, -1);

    updateState(setState, (current) => ({
      ...current,
      messages: [
        ...current.messages.filter(
          (message) => message.id !== options.replaceAssistantId,
        ),
        ...(appendUser ? [userMessage] : []),
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          safetyFlag: false,
          createdAt: new Date().toISOString(),
        },
      ],
    }));

    const controller = new AbortController();
    const clientTimeout = window.setTimeout(() => controller.abort(), 32_000);
    let complete = '';
    let receivedDone = false;
    let crisisResponse = assessment.flagged;

    try {
      const supabase = getSupabaseBrowserClient();
      const token = supabase
        ? (await supabase.auth.getSession()).data.session?.access_token
        : undefined;
      const response = await fetch('/api/chat', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: content,
          sessionId: 'demo-browser',
          locale,
          history: requestHistory
            .slice(-10)
            .map(({ role, content: text }) => ({ role, content: text })),
          context: {
            enabled: state.aiContextEnabled,
            recentMoods: state.moods.slice(0, 5).map((entry) => ({
              mood: entry.mood,
              intensity: entry.intensity,
              tags: entry.tags.slice(0, 4),
            })),
          },
        }),
      });

      if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
          code?: string;
        };
        const failure = new Error(
          payload.error ?? 'Unable to connect',
        ) as Error & {
          code?: string;
        };
        if (payload.code) failure.code = payload.code;
        throw failure;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';
        for (const raw of events) {
          const type = raw.match(/^event: (.+)$/m)?.[1];
          const data = raw.match(/^data: (.+)$/m)?.[1];
          if (!data) continue;
          const payload = JSON.parse(data) as {
            token?: string;
            crisis?: boolean;
            providerMode?: 'live' | 'demo';
          };
          if (type === 'meta') {
            if (payload.crisis) {
              crisisResponse = true;
              setCrisis(true);
            }
            if (payload.providerMode) setProviderMode(payload.providerMode);
          }
          if (type === 'token' && payload.token) {
            complete += payload.token;
            updateState(setState, (current) => ({
              ...current,
              messages: current.messages.map((message) =>
                message.id === assistantId
                  ? {
                      ...message,
                      content: complete,
                      safetyFlag: crisisResponse,
                    }
                  : message,
              ),
            }));
          }
          if (type === 'done') receivedDone = true;
        }
      }
      if (!receivedDone || !complete.trim())
        throw new Error(
          locale === 'en'
            ? 'The connection ended before the reply was complete.'
            : 'Соединение прервалось до завершения ответа.',
        );
    } catch (cause) {
      const causeWithCode = cause as Error & { code?: string };
      const code = controller.signal.aborted
        ? 'CLIENT_TIMEOUT'
        : (causeWithCode.code ?? 'NETWORK_ERROR');
      const message = controller.signal.aborted
        ? locale === 'en'
          ? 'The reply took too long. You can try again.'
          : 'Ответ занял слишком много времени. Можно попробовать ещё раз.'
        : cause instanceof Error && cause.message !== 'Failed to fetch'
          ? cause.message
          : locale === 'en'
            ? 'The connection dropped. Your message is still saved here.'
            : 'Соединение прервалось. Твоё сообщение осталось сохранено здесь.';
      setError({ message, code });

      const fallback = assessment.flagged
        ? SAFE_CRISIS_REPLY[locale]
        : complete.trim()
          ? `${complete}\n\n${locale === 'en' ? 'The connection paused before this reply finished.' : 'Соединение прервалось до завершения ответа.'}`
          : locale === 'en'
            ? 'I couldn’t finish that reply. Your message is still private here, and you can try again.'
            : 'Не получилось завершить ответ. Твоё сообщение осталось приватным, и можно попробовать ещё раз.';
      updateState(setState, (current) => ({
        ...current,
        messages: current.messages.map((message) =>
          message.id === assistantId
            ? { ...message, content: fallback, safetyFlag: assessment.flagged }
            : message,
        ),
      }));
      if (!assessment.flagged && code !== 'AI_NOT_CONFIGURED')
        setRetry({ content, assistantId });
    } finally {
      window.clearTimeout(clientTimeout);
      setSending(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const content = input.trim();
    if (!content) return;
    setInput('');
    void sendMessage(content);
  };

  return (
    <div className="mx-auto max-w-3xl animate-rise">
      <div className="mb-6">
        <Badge>
          <Sparkles className="mr-1.5" size={14} />
          {locale === 'en'
            ? 'Supportive, not clinical'
            : 'Поддержка, не лечение'}
        </Badge>
        <h2 className="mt-4 text-3xl font-semibold">{t(locale, 'talk')}</h2>
        <p className="mt-2 leading-7 text-muted">{t(locale, 'talkSub')}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {providerMode === 'demo' && (
            <Badge className="bg-mist text-ink">
              {locale === 'en'
                ? 'Safe demo companion'
                : 'Безопасный демо-собеседник'}
            </Badge>
          )}
          <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-ink/10 bg-surface px-3 text-xs font-semibold text-muted transition hover:text-ink">
            <input
              type="checkbox"
              className="h-4 w-4 accent-sage"
              checked={state.aiContextEnabled}
              onChange={(event) =>
                updateState(setState, (current) => ({
                  ...current,
                  aiContextEnabled: event.target.checked,
                }))
              }
            />
            {locale === 'en'
              ? 'Use my recent check-ins'
              : 'Учитывать мои недавние отметки'}
          </label>
          <span className="text-xs text-muted">
            {locale === 'en'
              ? 'Optional · off by default'
              : 'Необязательно · выключено по умолчанию'}
          </span>
        </div>
      </div>

      {crisis && (
        <div className="mb-5">
          <CrisisPanel locale={locale} />
        </div>
      )}

      {state.messages.length <= 1 && (
        <div
          className="mb-4 flex flex-wrap gap-2"
          aria-label="Conversation starters"
        >
          {starters.map((starter) => (
            <button
              key={starter}
              type="button"
              disabled={sending}
              onClick={() => void sendMessage(starter)}
              className="min-h-11 rounded-full border border-ink/10 bg-surface px-4 py-2 text-left text-sm font-medium text-muted transition hover:border-sage hover:bg-sage-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage disabled:opacity-50"
            >
              {starter}
            </button>
          ))}
        </div>
      )}

      <Card className="flex min-h-[62vh] flex-col overflow-hidden">
        <div
          className="scrollbar-none flex-1 space-y-5 overflow-y-auto p-4 sm:p-6"
          aria-live="polite"
          aria-busy={sending}
        >
          {state.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[86%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 sm:max-w-[75%] ${message.role === 'user' ? 'rounded-br-md bg-ink text-canvas' : 'rounded-bl-md bg-sage-soft text-ink'}`}
              >
                {message.content ? (
                  message.role === 'assistant' ? (
                    <SafeMarkdown>{message.content}</SafeMarkdown>
                  ) : (
                    message.content
                  )
                ) : (
                  <span
                    className="flex gap-1 py-2"
                    aria-label={
                      locale === 'en'
                        ? 'MindPulse is thinking'
                        : 'MindPulse думает'
                    }
                  >
                    <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage" />
                    <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage [animation-delay:150ms]" />
                    <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage [animation-delay:300ms]" />
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {error && (
          <div
            className="mx-4 mb-2 flex items-center justify-between gap-3 rounded-xl bg-warm/15 px-3 py-2 text-xs text-danger sm:mx-6"
            role="alert"
          >
            <span>{error.message}</span>
            {retry && (
              <Button
                type="button"
                variant="quiet"
                size="sm"
                className="shrink-0 text-danger"
                disabled={sending}
                onClick={() =>
                  void sendMessage(retry.content, {
                    appendUser: false,
                    replaceAssistantId: retry.assistantId,
                  })
                }
              >
                <RefreshCw size={14} />
                {locale === 'en' ? 'Retry' : 'Повторить'}
              </Button>
            )}
          </div>
        )}

        <form
          onSubmit={submit}
          className="border-t border-ink/5 bg-surface p-3 sm:p-4"
        >
          <div className="flex items-end gap-2">
            <Textarea
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder={
                locale === 'en' ? 'What’s on your mind?' : 'О чём ты думаешь?'
              }
              maxLength={4000}
              aria-label={locale === 'en' ? 'Message' : 'Сообщение'}
            />
            <Button
              type="submit"
              className="h-12 w-12 shrink-0 p-0"
              disabled={!input.trim() || sending}
              aria-label={
                locale === 'en' ? 'Send message' : 'Отправить сообщение'
              }
            >
              <Send size={18} />
            </Button>
          </div>
          <p className="mt-2 px-2 text-[11px] text-muted">
            {locale === 'en'
              ? 'AI can make mistakes. For urgent help, use Safety resources.'
              : 'ИИ может ошибаться. Для срочной помощи используй раздел «Безопасность».'}
          </p>
        </form>
      </Card>
    </div>
  );
}
