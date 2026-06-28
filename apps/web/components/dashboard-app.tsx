'use client';

import {
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Globe2,
  History,
  Loader2,
  LogIn,
  LogOut,
  MessageSquareText,
  Repeat2,
  Send,
  Sparkles,
  Target,
  UserPlus,
  Wand2,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';
import { SafeMarkdown } from './safe-markdown';

type User = { email: string; name: string };
type LanguageCode = 'en' | 'ru' | 'kk';
type ModeId =
  | 'study'
  | 'planner'
  | 'motivation'
  | 'habit'
  | 'goal'
  | 'reflection';
type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: ModeId;
  created_at: string;
};
type AgentPlan = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

const GUEST_CHAT_KEY = 'mindpulse-guest-chat-v1';
const GUEST_FOCUS_KEY = 'mindpulse-today-focus-v1';
const GUEST_AGENT_KEY = 'mindpulse-guest-agent-plans-v1';
const LANGUAGE_KEY = 'mindpulse-language-v1';
const GUEST_BANNER_KEY = 'mindpulse-guest-banner-dismissed-v1';

const languages: Array<{ id: LanguageCode; label: string; prompt: string }> = [
  { id: 'en', label: 'English', prompt: 'English' },
  { id: 'ru', label: 'Русский', prompt: 'Russian' },
  { id: 'kk', label: 'Қазақша', prompt: 'Kazakh' },
];

const uiCopy: Record<
  LanguageCode,
  {
    guestTitle: string;
    guestBody: string;
    syncCta: string;
    continueGuest: string;
    login: string;
    signup: string;
    logout: string;
    language: string;
    emptyGuest: string;
    emptyAuth: string;
    todayFocus: string;
    focusPlaceholder: string;
    guestHistory: string;
    authHistory: string;
    savedLocally: string;
  }
> = {
  en: {
    guestTitle: 'Use MindPulse right away.',
    guestBody:
      'No login wall. Use all six modes now; guest chat history and today focus stay on this device.',
    syncCta:
      'Create a free account to sync across devices and keep your progress safe. Your local history stays on this device for now; account migration is coming soon.',
    continueGuest: 'Continue as guest',
    login: 'Log in',
    signup: 'Create free account',
    logout: 'Logout',
    language: 'Language',
    emptyGuest:
      'Your guest conversation will appear here and stay in this browser.',
    emptyAuth: 'Your saved conversation history will appear here.',
    todayFocus: "Today's focus",
    focusPlaceholder: 'One useful thing for today...',
    guestHistory: 'Showing recent guest messages saved on this device.',
    authHistory: 'Showing your latest saved messages from this account.',
    savedLocally: 'Saved locally on this device.',
  },
  ru: {
    guestTitle: 'MindPulse можно использовать сразу.',
    guestBody:
      'Без обязательного входа. Все шесть режимов доступны сразу; гостевая история и фокус дня хранятся на этом устройстве.',
    syncCta:
      'Создай бесплатный аккаунт, чтобы синхронизировать прогресс между устройствами. Локальная история пока остаётся на этом устройстве; перенос в аккаунт скоро появится.',
    continueGuest: 'Продолжить гостем',
    login: 'Войти',
    signup: 'Создать аккаунт',
    logout: 'Выйти',
    language: 'Язык',
    emptyGuest:
      'Гостевой разговор появится здесь и сохранится в этом браузере.',
    emptyAuth: 'Сохранённая история разговоров появится здесь.',
    todayFocus: 'Фокус на сегодня',
    focusPlaceholder: 'Одна полезная вещь на сегодня...',
    guestHistory:
      'Показаны последние гостевые сообщения, сохранённые на этом устройстве.',
    authHistory: 'Показаны последние сохранённые сообщения этого аккаунта.',
    savedLocally: 'Сохранено локально на этом устройстве.',
  },
  kk: {
    guestTitle: 'MindPulse-ты бірден қолдана аласың.',
    guestBody:
      'Міндетті логин жоқ. Алты режимнің бәрі ашық; қонақ чат тарихы мен бүгінгі фокус осы құрылғыда сақталады.',
    syncCta:
      'Прогресті құрылғылар арасында синхрондау үшін тегін аккаунт ашуға болады. Жергілікті тарих әзірге осы құрылғыда қалады; аккаунтқа көшіру жақында қосылады.',
    continueGuest: 'Қонақ ретінде жалғастыру',
    login: 'Кіру',
    signup: 'Тегін аккаунт ашу',
    logout: 'Шығу',
    language: 'Тіл',
    emptyGuest: 'Қонақ сөйлесуі осында шығады және осы браузерде сақталады.',
    emptyAuth: 'Сақталған сөйлесу тарихы осында шығады.',
    todayFocus: 'Бүгінгі фокус',
    focusPlaceholder: 'Бүгінге бір пайдалы іс...',
    guestHistory:
      'Осы құрылғыда сақталған соңғы қонақ хабарламалары көрсетіледі.',
    authHistory: 'Осы аккаунттағы соңғы сақталған хабарламалар көрсетіледі.',
    savedLocally: 'Осы құрылғыда жергілікті сақталды.',
  },
};

const modes: Array<{
  id: ModeId;
  title: string;
  icon: LucideIcon;
  copy: string;
}> = [
  {
    id: 'study',
    title: 'Study Help',
    icon: BookOpen,
    copy: 'Explain topics and practice.',
  },
  {
    id: 'planner',
    title: 'Daily Planner',
    icon: CalendarDays,
    copy: 'Make time blocks realistic.',
  },
  {
    id: 'motivation',
    title: 'Motivation Reset',
    icon: Zap,
    copy: 'Start with one tiny action.',
  },
  {
    id: 'habit',
    title: 'Habit Coach',
    icon: Repeat2,
    copy: 'Build routines that survive busy days.',
  },
  {
    id: 'goal',
    title: 'Goal Breakdown',
    icon: Target,
    copy: 'Turn goals into milestones.',
  },
  {
    id: 'reflection',
    title: 'Quick Reflection',
    icon: Sparkles,
    copy: 'Learn from today without guilt.',
  },
];

const modeCopy: Record<
  LanguageCode,
  Record<ModeId, { title: string; copy: string }>
> = {
  en: Object.fromEntries(
    modes.map(({ id, title, copy }) => [id, { title, copy }]),
  ) as Record<ModeId, { title: string; copy: string }>,
  ru: {
    study: { title: 'Помощь в учёбе', copy: 'Объяснения, примеры и практика.' },
    planner: { title: 'План на день', copy: 'Реалистичные блоки времени.' },
    motivation: {
      title: 'Сброс мотивации',
      copy: 'Начни с одного маленького действия.',
    },
    habit: {
      title: 'Тренер привычек',
      copy: 'Рутины, которые выдерживают занятые дни.',
    },
    goal: { title: 'Разбор цели', copy: 'Преврати цель в этапы.' },
    reflection: {
      title: 'Быстрая рефлексия',
      copy: 'Понять день без чувства вины.',
    },
  },
  kk: {
    study: { title: 'Оқуға көмек', copy: 'Түсіндіру, мысал және практика.' },
    planner: { title: 'Күндік жоспар', copy: 'Уақыт блоктарын шынайы жасау.' },
    motivation: {
      title: 'Мотивация reset',
      copy: 'Бір кішкентай әрекеттен бастау.',
    },
    habit: {
      title: 'Әдет коучы',
      copy: 'Қарбалас күнге төзетін әдеттер.',
    },
    goal: { title: 'Мақсатты бөлу', copy: 'Мақсатты кезеңдерге айналдыру.' },
    reflection: {
      title: 'Жылдам рефлексия',
      copy: 'Күннен сабақ алу, кінәсіз.',
    },
  },
};

const agentPrompts = [
  'Turn my exam panic into a 3-day study plan',
  'Break my semester project into next actions',
  'I keep procrastinating. Give me the smallest first step',
];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function localId(prefix: string) {
  return typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function DashboardApp({ user }: { user: User | null }) {
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [mode, setMode] = useState<ModeId>('study');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyReady, setHistoryReady] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [agentInput, setAgentInput] = useState('');
  const [agentOutput, setAgentOutput] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [todayFocus, setTodayFocus] = useState('');
  const [showGuestBanner, setShowGuestBanner] = useState(false);
  const isGuest = !user;
  const t = uiCopy[language];
  const displayModes = useMemo(
    () =>
      modes.map((item) => ({
        ...item,
        ...modeCopy[language][item.id],
      })),
    [language],
  );

  const loadHistory = useCallback(async () => {
    setHistoryReady(false);
    if (!user) {
      setMessages(readJson<ChatMessage[]>(GUEST_CHAT_KEY, []));
      setHistoryReady(true);
      return;
    }
    const response = await fetch('/api/chat/history');
    if (!response.ok) {
      setHistoryReady(true);
      return;
    }
    const body = (await response.json()) as { messages?: ChatMessage[] };
    setMessages([...(body.messages ?? [])].reverse());
    setHistoryReady(true);
  }, [user]);

  useEffect(() => {
    const storedLanguage = readJson<LanguageCode | null>(LANGUAGE_KEY, null);
    if (storedLanguage && languages.some((item) => item.id === storedLanguage))
      setLanguage(storedLanguage);
    setTodayFocus(readJson(GUEST_FOCUS_KEY, ''));
    setShowGuestBanner(!readJson(GUEST_BANNER_KEY, false));
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    writeJson(LANGUAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    if (isGuest && historyReady) writeJson(GUEST_CHAT_KEY, messages.slice(-80));
  }, [historyReady, isGuest, messages]);

  useEffect(() => {
    writeJson(GUEST_FOCUS_KEY, todayFocus);
  }, [todayFocus]);

  const selectedMode = useMemo(
    () => displayModes.find((item) => item.id === mode)!,
    [displayModes, mode],
  );

  async function sendChat(event: FormEvent) {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatLoading(true);
    setChatError('');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, mode, language }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
      };
      if (!response.ok || !body.reply) {
        console.error('[MindPulse] chat failed:', body);
        setChatError(
          language === 'ru'
            ? 'MindPulse сейчас не смог ответить. Попробуй ещё раз.'
            : language === 'kk'
              ? 'MindPulse қазір жауап бере алмады. Қайта байқап көр.'
              : 'MindPulse could not answer right now. Please try again.',
        );
        return;
      }
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

  async function runAgent(prompt = agentInput) {
    const text = prompt.trim();
    if (!text || agentLoading) return;
    setAgentInput(text);
    setAgentLoading(true);
    setSaved(false);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
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
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/app" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-canvas">
              <Brain size={20} />
            </span>
            <b>MindPulse</b>
          </Link>
          <div className="hidden gap-6 text-sm font-semibold text-muted md:flex">
            <a href="#dashboard">Dashboard</a>
            <a href="#chat">AI Chat</a>
            <a href="#agent">Agent</a>
            <a href="#history">History</a>
            <a href="#settings">Settings</a>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex min-h-10 items-center gap-2 rounded-full bg-surface px-3 text-sm font-semibold text-muted shadow-soft">
              <Globe2 size={15} />
              <span className="sr-only">{t.language}</span>
              <select
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as LanguageCode)
                }
                aria-label={t.language}
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
                <LogOut size={15} /> {t.logout}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-surface px-4 text-sm font-semibold text-ink shadow-soft"
                >
                  <LogIn size={15} /> {t.login}
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-canvas"
                >
                  <UserPlus size={15} /> {t.signup}
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
                {t.syncCta}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/signup"
                  className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-canvas"
                >
                  {t.signup}
                </Link>
                <Link
                  href="/login"
                  className="rounded-full bg-canvas px-4 py-2 text-sm font-semibold text-ink"
                >
                  {t.login}
                </Link>
                <button
                  onClick={() => {
                    writeJson(GUEST_BANNER_KEY, true);
                    setShowGuestBanner(false);
                  }}
                  className="rounded-full bg-canvas/70 px-4 py-2 text-sm font-semibold text-muted"
                >
                  {t.continueGuest}
                </button>
              </div>
            </div>
          </section>
        )}

        <section id="dashboard" className="grid gap-5 lg:grid-cols-[1fr_22rem]">
          <div className="rounded-[2rem] bg-surface p-6 shadow-soft sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-sage">
              {isGuest ? 'Free student beta' : 'Dashboard'}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              {user ? `Welcome, ${user.name || user.email}.` : t.guestTitle}
            </h1>
            <p className="mt-3 leading-7 text-muted">
              {user ? (
                <>
                  Your account is connected to <b>{user.email}</b>. Chat history
                  and saved Agent plans stay attached to this login.
                </>
              ) : (
                t.guestBody
              )}
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ...displayModes,
                {
                  id: 'chat' as const,
                  title: 'AI Chat',
                  icon: MessageSquareText,
                  copy: 'Ask anything study-related.',
                },
                {
                  id: 'agent' as const,
                  title: 'Agent',
                  icon: Wand2,
                  copy: 'Generate structured plans.',
                },
              ].map((item) => (
                <a
                  key={item.title}
                  href={item.id === 'agent' ? '#agent' : '#chat'}
                  className="rounded-mp bg-canvas/70 p-4 transition hover:-translate-y-1 hover:bg-sage-soft/70"
                >
                  <item.icon className="text-sage" size={20} />
                  <h2 className="mt-4 font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {item.copy}
                  </p>
                </a>
              ))}
            </div>
          </div>
          <aside className="rounded-[2rem] bg-ink p-6 text-canvas shadow-soft">
            <Target className="text-sage-soft" />
            <h2 className="mt-5 text-xl font-semibold">{t.todayFocus}</h2>
            <textarea
              value={todayFocus}
              onChange={(event) => setTodayFocus(event.target.value)}
              rows={4}
              className="mt-4 w-full resize-none rounded-2xl border border-canvas/10 bg-canvas/10 px-4 py-3 text-sm text-canvas outline-none placeholder:text-canvas/45 focus:border-sage-soft"
              placeholder={t.focusPlaceholder}
            />
            <p className="mt-2 text-sm leading-6 text-canvas/70">
              No shame streaks. Pick one useful return today and let the rest
              become easier after that.
            </p>
          </aside>
        </section>

        <section id="chat" className="mt-8 grid gap-5 lg:grid-cols-[20rem_1fr]">
          <div className="rounded-mp bg-surface p-5 shadow-soft">
            <h2 className="font-semibold">Choose a mode</h2>
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
          <div className="rounded-[2rem] bg-surface shadow-soft">
            <div className="border-b border-ink/5 p-5">
              <h2 className="text-xl font-semibold">{selectedMode.title}</h2>
              <p className="text-sm text-muted">{selectedMode.copy}</p>
            </div>
            <div className="max-h-[32rem] min-h-[24rem] space-y-4 overflow-y-auto bg-canvas/40 p-5">
              {!messages.length && (
                <p className="rounded-mp bg-surface p-4 text-muted">
                  {isGuest ? t.emptyGuest : t.emptyAuth}
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
                {chatError}
              </div>
            )}
            <form onSubmit={sendChat} className="p-5">
              <textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                maxLength={1000}
                rows={3}
                className="w-full resize-none rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-sage"
                placeholder={`Ask ${selectedMode.title}...`}
              />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-muted">
                  AI can make mistakes. MindPulse is not a doctor or therapist.
                </p>
                <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sage px-5 font-semibold text-canvas">
                  Send <Send size={15} />
                </button>
              </div>
            </form>
          </div>
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
                  {t.savedLocally}
                </p>
              )}
            </div>
          </div>
        </section>

        <section
          id="history"
          className="mt-8 rounded-mp bg-surface p-5 shadow-soft"
        >
          <h2 className="flex items-center gap-2 font-semibold">
            <History size={18} className="text-sage" /> Recent conversations
          </h2>
          <p className="mt-2 text-sm text-muted">
            {isGuest ? t.guestHistory : t.authHistory}
          </p>
        </section>

        <section
          id="settings"
          className="mt-8 rounded-mp bg-surface p-5 shadow-soft"
        >
          <h2 className="font-semibold">Settings</h2>
          <p className="mt-2 text-sm text-muted">
            Preferences are ready for the next iteration. Private configuration
            stays server-side.
          </p>
        </section>
      </main>
    </div>
  );
}
