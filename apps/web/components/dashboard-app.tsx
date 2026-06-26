'use client';

import {
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  History,
  Loader2,
  LogOut,
  MessageSquareText,
  Repeat2,
  Send,
  Sparkles,
  Target,
  Wand2,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { SafeMarkdown } from './safe-markdown';

type User = { email: string; name: string };
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

const agentPrompts = [
  'Turn my exam panic into a 3-day study plan',
  'Break my semester project into next actions',
  'I keep procrastinating. Give me the smallest first step',
];

export function DashboardApp({ user }: { user: User }) {
  const [mode, setMode] = useState<ModeId>('study');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [agentInput, setAgentInput] = useState('');
  const [agentOutput, setAgentOutput] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void loadHistory();
  }, []);

  const selectedMode = useMemo(
    () => modes.find((item) => item.id === mode)!,
    [mode],
  );

  async function loadHistory() {
    const response = await fetch('/api/chat/history');
    if (!response.ok) return;
    const body = (await response.json()) as { messages?: ChatMessage[] };
    setMessages([...(body.messages ?? [])].reverse());
  }

  async function sendChat(event: FormEvent) {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatLoading(true);
    setChatError('');
    setChatInput('');
    const localUser: ChatMessage = {
      id: `local-user-${Date.now()}`,
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
        body: JSON.stringify({ message: text, mode }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
      };
      if (!response.ok || !body.reply) {
        console.error('[MindPulse] chat failed:', body);
        setChatError('MindPulse could not answer right now. Please try again.');
        return;
      }
      setMessages((items) => [
        ...items,
        {
          id: `local-ai-${Date.now()}`,
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
          <Link
            href="/logout"
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-canvas"
          >
            <LogOut size={15} /> Logout
          </Link>
        </nav>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <section id="dashboard" className="grid gap-5 lg:grid-cols-[1fr_22rem]">
          <div className="rounded-[2rem] bg-surface p-6 shadow-soft sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-sage">
              Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Welcome, {user.name || user.email}.
            </h1>
            <p className="mt-3 leading-7 text-muted">
              Your account is connected to <b>{user.email}</b>. Chat history and
              saved Agent plans stay attached to this login.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ...modes,
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
            <h2 className="mt-5 text-xl font-semibold">
              Today&apos;s check-in
            </h2>
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
              {modes.map((item) => (
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
                  Your saved conversation history will appear here.
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
            Showing your latest saved messages from this account.
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
