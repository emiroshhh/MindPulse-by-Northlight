'use client';

import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  HeartHandshake,
  History,
  Lightbulb,
  RefreshCw,
  Repeat2,
  Send,
  Sparkles,
  Target,
  Trash2,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { authHeaders } from '@/lib/mindpulse/client-auth';
import { MindPulseAgentSpine } from './mindpulse-agent-spine';
import { SafeMarkdown } from './safe-markdown';

type ModeId =
  | 'study'
  | 'planner'
  | 'motivation'
  | 'habit'
  | 'goal'
  | 'reflection';
type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  mode: ModeId;
};
type Recent = { id: string; prompt: string; reply: string; mode: ModeId };
type Mode = {
  id: ModeId;
  title: string;
  copy: string;
  icon: LucideIcon;
  tone: string;
};

const MODES: Mode[] = [
  {
    id: 'study',
    title: 'Study Help',
    copy: 'Simple explanations, examples, summaries, and practice.',
    icon: BookOpen,
    tone: 'bg-mist',
  },
  {
    id: 'planner',
    title: 'Daily Planner',
    copy: 'Realistic time blocks, breaks, and one clear priority.',
    icon: CalendarDays,
    tone: 'bg-sage-soft',
  },
  {
    id: 'motivation',
    title: 'Motivation Reset',
    copy: 'A grounded reset and one action you can start in 5 minutes.',
    icon: Zap,
    tone: 'bg-warm/20',
  },
  {
    id: 'habit',
    title: 'Habit Coach',
    copy: 'Make a habit smaller, repeatable, and easy to track.',
    icon: Repeat2,
    tone: 'bg-lavender/70',
  },
  {
    id: 'goal',
    title: 'Goal Breakdown',
    copy: 'Milestones, next actions, and a practical timeline.',
    icon: Target,
    tone: 'bg-sand',
  },
  {
    id: 'reflection',
    title: 'Quick Reflection',
    copy: 'Notice wins, learn from friction, and improve tomorrow.',
    icon: Lightbulb,
    tone: 'bg-mood-great/70',
  },
];

const PROMPTS: Array<[string, ModeId]> = [
  ['Make me a realistic study plan for tomorrow', 'planner'],
  ['Explain this topic simply with an example', 'study'],
  ['Help me stop procrastinating and start now', 'motivation'],
  ['Break down my biggest goal into small steps', 'goal'],
  ['Help me reflect on today in five minutes', 'reflection'],
];

const CHAT_KEY = 'mindpulse-student-chat-v1';
const RECENT_KEY = 'mindpulse-student-recent-v1';
const FOCUS_KEY = 'mindpulse-today-focus-v1';
const id = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StudentMindPulseApp() {
  const [mode, setMode] = useState<ModeId>('study');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [recent, setRecent] = useState<Recent[]>([]);
  const [focus, setFocus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const selected = useMemo(
    () => MODES.find((item) => item.id === mode)!,
    [mode],
  );

  useEffect(() => {
    setMessages(read<Message[]>(CHAT_KEY, []));
    setRecent(read<Recent[]>(RECENT_KEY, []));
    setFocus(localStorage.getItem(FOCUS_KEY) ?? '');
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
  }, [messages, ready]);
  useEffect(() => {
    if (ready) localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  }, [recent, ready]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, loading]);

  const pickPrompt = (text: string, nextMode: ModeId) => {
    setMode(nextMode);
    setInput(text);
    inputRef.current?.focus();
    document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' });
  };

  const ask = async (raw: string, appendUser = true, askMode = mode) => {
    const text = raw.trim();
    if (!text || loading) return;
    if (text.length > 1000)
      return setError('Please keep your message under 1,000 characters.');
    setLoading(true);
    setError('');
    if (appendUser)
      setMessages((items) => [
        ...items,
        { id: id('user'), role: 'user', text, mode: askMode },
      ]);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, mode: askMode }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
        status?: number;
      };
      if (!response.ok || !body.reply) {
        console.error('[MindPulse] /api/chat failed:', body);
        throw new Error(body.error);
      }
      setMessages((items) => [
        ...items,
        { id: id('ai'), role: 'assistant', text: body.reply!, mode: askMode },
      ]);
      setRecent((items) =>
        [
          { id: id('recent'), prompt: text, reply: body.reply!, mode: askMode },
          ...items,
        ].slice(0, 6),
      );
    } catch {
      setError(
        'Sorry, MindPulse could not answer right now. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput('');
    void ask(text);
  };

  const regenerate = () => {
    const lastUser = [...messages]
      .reverse()
      .find((item) => item.role === 'user');
    if (!lastUser || loading) return;
    setMessages((items) => {
      const reverseIndex = [...items]
        .reverse()
        .findIndex((item) => item.role === 'assistant');
      const index =
        reverseIndex >= 0 ? items.length - reverseIndex - 1 : reverseIndex;
      return index >= 0 ? items.slice(0, index) : items;
    });
    setMode(lastUser.mode);
    void ask(lastUser.text, false, lastUser.mode);
  };

  const copy = async (message: Message) => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(message.id);
      setTimeout(() => setCopied(null), 1400);
    } catch {
      setError('Copy is not available in this browser.');
    }
  };

  return (
    <div className="ambient min-h-screen overflow-hidden">
      <header className="sticky top-0 z-40 border-b border-ink/5 bg-canvas/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-canvas">
              <Brain size={20} />
            </span>
            <span>
              <b className="block text-sm">MindPulse</b>
              <small className="font-semibold uppercase tracking-[.18em] text-muted">
                by Northlight
              </small>
            </span>
          </a>
          <div className="hidden gap-7 text-sm font-semibold text-muted md:flex">
            <a href="#agent" className="hover:text-ink">
              Daily plan
            </a>
            <a href="#chat" className="hover:text-ink">
              AI tools
            </a>
            <a href="#how" className="hover:text-ink">
              How it works
            </a>
            <a href="#features" className="hover:text-ink">
              Features
            </a>
          </div>
          <a
            href="#chat"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-canvas hover:bg-sage"
          >
            Try MindPulse <ArrowRight size={16} />
          </a>
        </nav>
      </header>

      <main id="main-content">
        <MindPulseAgentSpine />
        <section id="top" className="px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.08fr_.92fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-sage/20 bg-surface px-4 py-2 text-xs font-semibold text-sage">
                <Sparkles size={15} /> Your practical AI study companion
              </span>
              <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-.045em] sm:text-6xl lg:text-7xl">
                Study better. Plan smarter.{' '}
                <span className="text-sage">Stay consistent.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
                MindPulse helps students study better, plan smarter, and stay
                consistent. An AI study and self-growth assistant for daily
                planning, motivation, habits, and learning.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#chat"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-sage px-7 font-semibold text-canvas shadow-soft hover:-translate-y-1 hover:bg-ink"
                >
                  Try MindPulse <ArrowRight size={18} />
                </a>
                <a
                  href="#how"
                  className="inline-flex min-h-14 items-center justify-center rounded-full border border-ink/10 bg-surface px-7 font-semibold hover:bg-sage-soft"
                >
                  See how it works
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-5 text-sm text-muted">
                {[
                  'No login needed',
                  'Private local history',
                  'Six focused modes',
                ].map((x) => (
                  <span key={x} className="flex items-center gap-2">
                    <CheckCircle2 size={17} className="text-sage" />
                    {x}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/60 bg-surface/90 p-6 shadow-soft sm:p-8">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-sage">
                    Today
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">
                    One clear focus
                  </h2>
                </div>
                <span className="h-fit rounded-full bg-sage-soft px-3 py-1 text-xs font-semibold text-sage">
                  Day 1
                </span>
              </div>
              <label
                htmlFor="focus"
                className="mt-6 block text-sm font-semibold"
              >
                What matters most today?
              </label>
              <textarea
                id="focus"
                rows={3}
                maxLength={180}
                value={focus}
                onChange={(e) => {
                  setFocus(e.target.value);
                  localStorage.setItem(FOCUS_KEY, e.target.value);
                }}
                placeholder="Finish my biology revision notes"
                className="mt-2 w-full resize-none rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-sage focus:ring-4 focus:ring-sage/10"
              />
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Mini
                  icon={Clock3}
                  title="Make time visible"
                  copy="Plan work and breaks that fit."
                />
                <Mini
                  icon={Target}
                  title="Start smaller"
                  copy="Choose one doable action."
                />
              </div>
            </div>
          </div>
        </section>

        <section id="chat" className="scroll-mt-24 px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-sage">
              MindPulse tools
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Choose what you need right now.
            </h2>
            <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MODES.map((item) => (
                <ModeCard
                  key={item.id}
                  item={item}
                  active={mode === item.id}
                  onClick={() => setMode(item.id)}
                />
              ))}
            </div>
            <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
              <div className="overflow-hidden rounded-[2rem] border border-ink/5 bg-surface shadow-soft">
                <div className="flex items-center justify-between border-b border-ink/5 px-5 py-4 sm:px-7">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-2xl ${selected.tone}`}
                    >
                      <selected.icon size={19} />
                    </span>
                    <div>
                      <b className="text-sm">{selected.title}</b>
                      <p className="text-xs text-muted">Focused guidance</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMessages([]);
                      setError('');
                      localStorage.removeItem(CHAT_KEY);
                    }}
                    disabled={!messages.length || loading}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-xs font-semibold text-muted hover:bg-canvas hover:text-danger disabled:opacity-40"
                  >
                    <Trash2 size={15} /> Clear chat
                  </button>
                </div>
                <div
                  className="scrollbar-none min-h-[28rem] max-h-[38rem] space-y-5 overflow-y-auto bg-canvas/35 p-4 sm:p-7"
                  aria-live="polite"
                >
                  {!messages.length && (
                    <div className="mx-auto flex min-h-[22rem] max-w-md flex-col items-center justify-center text-center">
                      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-sage-soft text-sage">
                        <Sparkles size={27} />
                      </span>
                      <h3 className="mt-5 text-xl font-semibold">
                        What can we make easier?
                      </h3>
                      <p className="mt-2 leading-7 text-muted">
                        Choose a mode, use a prompt, or describe what you are
                        working through.
                      </p>
                    </div>
                  )}
                  {messages.map((message) => (
                    <ChatBubble
                      key={message.id}
                      message={message}
                      copied={copied === message.id}
                      onCopy={() => void copy(message)}
                    />
                  ))}
                  {loading && (
                    <div className="flex">
                      <div className="rounded-[1.35rem] rounded-bl-md bg-surface px-4 py-3 text-sm text-muted">
                        <span className="animate-pulse">
                          MindPulse is thinking...
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
                {error && (
                  <div
                    role="alert"
                    className="mx-4 mt-3 rounded-2xl bg-warm/15 px-4 py-3 text-sm text-danger sm:mx-7"
                  >
                    {error}
                  </div>
                )}
                <div className="border-t border-ink/5 p-4 sm:p-6">
                  <div className="scrollbar-none mb-4 flex gap-2 overflow-x-auto">
                    {PROMPTS.map(([text, promptMode]) => (
                      <button
                        key={text}
                        onClick={() => pickPrompt(text, promptMode)}
                        className="shrink-0 rounded-full border border-ink/10 bg-canvas/60 px-3 py-2 text-xs text-muted hover:border-sage hover:bg-sage-soft hover:text-ink"
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                  <form
                    onSubmit={submit}
                    className="rounded-[1.4rem] border border-ink/10 bg-canvas/45 p-2 focus-within:border-sage focus-within:ring-4 focus-within:ring-sage/10"
                  >
                    <textarea
                      ref={inputRef}
                      rows={3}
                      maxLength={1000}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        setError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          e.currentTarget.form?.requestSubmit();
                        }
                      }}
                      placeholder={`Ask ${selected.title}...`}
                      className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none"
                    />
                    <div className="flex items-center justify-between px-2 pb-1">
                      <small
                        className={
                          input.length > 900 ? 'text-danger' : 'text-muted'
                        }
                      >
                        {input.length}/1000
                      </small>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={regenerate}
                          disabled={
                            loading || !messages.some((x) => x.role === 'user')
                          }
                          className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-xs font-semibold text-muted hover:bg-sage-soft disabled:opacity-40"
                        >
                          <RefreshCw size={14} /> Regenerate
                        </button>
                        <button
                          disabled={loading || !input.trim()}
                          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sage px-5 text-sm font-semibold text-canvas hover:bg-ink disabled:opacity-40"
                        >
                          Send <Send size={15} />
                        </button>
                      </div>
                    </div>
                  </form>
                  <p className="mt-3 px-2 text-[11px] leading-5 text-muted">
                    MindPulse is an AI study assistant, not a doctor or
                    therapist. For emergencies or serious mental health
                    concerns, contact local emergency services or a trusted
                    person.
                  </p>
                </div>
              </div>
              <aside className="space-y-5">
                <div className="rounded-mp border border-ink/5 bg-surface p-5 shadow-soft">
                  <div className="flex justify-between">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <History size={17} className="text-sage" />
                      Recent
                    </h3>
                    {recent.length > 0 && (
                      <button
                        onClick={() => {
                          setRecent([]);
                          localStorage.removeItem(RECENT_KEY);
                        }}
                        className="text-xs font-semibold text-muted hover:text-danger"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="mt-4 space-y-2">
                    {!recent.length && (
                      <p className="rounded-2xl bg-canvas/60 p-4 text-sm leading-6 text-muted">
                        Your last conversations will appear here on this device.
                      </p>
                    )}
                    {recent.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => pickPrompt(item.prompt, item.mode)}
                        className="w-full rounded-2xl bg-canvas/55 p-3 text-left hover:bg-sage-soft/50"
                      >
                        <p className="line-clamp-2 text-sm font-medium">
                          {item.prompt}
                        </p>
                        <small className="text-muted">
                          {MODES.find((x) => x.id === item.mode)?.title}
                        </small>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-mp bg-ink p-5 text-canvas shadow-soft">
                  <Target size={19} className="text-sage-soft" />
                  <h3 className="mt-4 font-semibold">Today&apos;s check-in</h3>
                  <p className="mt-2 text-sm leading-6 text-canvas/70">
                    No pressure and no complicated streak. Just one useful
                    return today.
                  </p>
                  <div className="mt-4 rounded-2xl bg-white/10 p-3 text-sm">
                    {focus.trim() || 'Add your focus above.'}
                  </div>
                </div>
              </aside>
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
            <h2 className="mt-3 max-w-2xl text-4xl font-semibold sm:text-5xl">
              From a messy thought to a practical next step.
            </h2>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                [
                  '01',
                  'Choose a mode',
                  'Pick the exact kind of help you need.',
                ],
                [
                  '02',
                  'Ask MindPulse',
                  'Describe the topic, challenge, or goal.',
                ],
                ['03', 'Get a practical plan', 'Use clear steps immediately.'],
              ].map(([n, t, c]) => (
                <div
                  key={n}
                  className="rounded-mp border border-white/10 bg-white/5 p-6"
                >
                  <b className="text-sage-soft">{n}</b>
                  <h3 className="mt-8 text-xl font-semibold">{t}</h3>
                  <p className="mt-3 text-canvas/65">{c}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="features" className="scroll-mt-24 px-5 py-20 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-sage">
                Why students use it
              </p>
              <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">
                Less friction. More clarity.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted">
                Useful when you have five minutes, a full study session, or no
                idea where to begin.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [
                  'Simple explanations',
                  'Understand hard topics without jargon.',
                ],
                ['Less procrastination', 'Find a smaller starting point.'],
                ['Clearer goals', 'Know your next three actions.'],
                ['Better consistency', 'Build routines for imperfect days.'],
              ].map(([t, c]) => (
                <div key={t} className="rounded-mp bg-surface p-6 shadow-soft">
                  <CheckCircle2 className="text-sage" />
                  <h3 className="mt-5 font-semibold">{t}</h3>
                  <p className="mt-2 text-sm text-muted">{c}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 rounded-[2rem] bg-sage-soft p-8 sm:flex-row sm:items-center">
            <div>
              <HeartHandshake className="text-sage" />
              <h2 className="mt-4 text-2xl font-semibold">
                Help shape MindPulse.
              </h2>
              <p className="mt-2 text-muted">
                Tell us what students need next.
              </p>
            </div>
            <a
              href="/app"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 font-semibold text-canvas"
            >
              Share feedback <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </main>
      <footer className="border-t border-ink/5 px-5 py-8 text-sm text-muted sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 sm:flex-row">
          <p>
            <b className="text-ink">MindPulse</b> by Northlight · Built for
            students.
          </p>
          <p>AI can make mistakes. Verify important academic information.</p>
        </div>
      </footer>
    </div>
  );
}

function Mini({
  icon: Icon,
  title,
  copy,
}: {
  icon: LucideIcon;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-2xl bg-sage-soft/65 p-4">
      <Icon size={19} className="text-sage" />
      <b className="mt-3 block text-sm">{title}</b>
      <p className="mt-1 text-xs text-muted">{copy}</p>
    </div>
  );
}

function ModeCard({
  item,
  active,
  onClick,
}: {
  item: Mode;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-mp border p-5 text-left transition focus-visible:ring-2 focus-visible:ring-sage ${active ? 'border-sage bg-surface shadow-soft' : 'border-ink/5 bg-surface/70 hover:-translate-y-1 hover:border-sage/40'}`}
    >
      <div className="flex justify-between">
        <span
          className={`grid h-11 w-11 place-items-center rounded-2xl ${item.tone}`}
        >
          <Icon size={20} />
        </span>
        {active && <CheckCircle2 size={19} className="text-sage" />}
      </div>
      <h3 className="mt-4 font-semibold">{item.title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted">{item.copy}</p>
    </button>
  );
}

function ChatBubble({
  message,
  copied,
  onCopy,
}: {
  message: Message;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className="max-w-[90%] sm:max-w-[78%]">
        <div
          className={`rounded-[1.35rem] px-4 py-3 text-sm leading-7 ${message.role === 'user' ? 'rounded-br-md bg-ink text-canvas' : 'rounded-bl-md border border-ink/5 bg-surface'}`}
        >
          {message.role === 'assistant' ? (
            <SafeMarkdown>{message.text}</SafeMarkdown>
          ) : (
            message.text
          )}
        </div>
        {message.role === 'assistant' && (
          <button
            onClick={onCopy}
            className="mt-1 inline-flex min-h-9 items-center gap-1.5 rounded-full px-2 text-[11px] font-semibold text-muted hover:bg-surface"
          >
            {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy answer'}
          </button>
        )}
      </div>
    </div>
  );
}
