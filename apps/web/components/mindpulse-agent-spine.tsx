'use client';

import {
  AlertCircle,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  Moon,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  blocksForDay,
  chooseOneThing,
  clearAgentState,
  formatBlockTime,
  generateInitialPlan,
  getAgentStorageKey,
  isNightState,
  loadAgentState,
  markBlockDone,
  parseDeadlineLines,
  parseJsonArrayFromText,
  runAgentOnOpen,
  saveAgentState,
  settingsWithWeekdayWindow,
  summarizeToday,
  type AgentReport,
  type AgentState,
  type StudyBlock,
} from '@/lib/agent-store';

const EMPTY_DEADLINES = `Chemistry homework, Chemistry, tomorrow, 45
History quiz revision, History, in 3 days, 35`;

export function MindPulseAgentSpine() {
  const [state, setState] = useState<AgentState | null>(null);
  const [ready, setReady] = useState(false);
  const [deadlineText, setDeadlineText] = useState(EMPTY_DEADLINES);
  const [weekdayWindow, setWeekdayWindow] = useState('16-19');
  const [nightCutoffHour, setNightCutoffHour] = useState(21);
  const [windDown, setWindDown] = useState(false);
  const [panicOpen, setPanicOpen] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [addLine, setAddLine] = useState('');

  useEffect(() => {
    const loaded = loadAgentState();
    const result = runAgentOnOpen(loaded);
    setState(result.state);
    setNightCutoffHour(result.state.settings.nightCutoffHour);
    setReady(true);
    if (result.ran && result.report) {
      void polishReport(result.report, result.movedBlocks);
    }
    // The whole agent is intentionally on-open: no cron, no account data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ready && state) saveAgentState(state);
  }, [ready, state]);

  const oneThing = useMemo(() => {
    if (!state) return undefined;
    const reportPick = state.latestReport?.oneThingBlockId
      ? state.studyBlocks.find(
          (block) => block.id === state.latestReport?.oneThingBlockId,
        )
      : undefined;
    return reportPick ?? chooseOneThing(state.studyBlocks, state.deadlines);
  }, [state]);

  const todayBlocks = useMemo(
    () => (state ? blocksForDay(state.studyBlocks) : []),
    [state],
  );
  const restToday = todayBlocks.filter((block) => block.id !== oneThing?.id);
  const upcoming = useMemo(
    () =>
      state
        ? state.studyBlocks
            .filter(
              (block) =>
                block.status !== 'done' &&
                new Date(block.date).getTime() > Date.now() &&
                !todayBlocks.some((today) => today.id === block.id),
            )
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            )
            .slice(0, 4)
        : [],
    [state, todayBlocks],
  );

  if (!ready || !state) {
    return (
      <section className="px-5 pt-10 sm:px-8">
        <div className="mx-auto max-w-7xl rounded-mp bg-surface p-6 shadow-soft">
          <p className="animate-pulse text-sm text-muted">
            Waking up your plan...
          </p>
        </div>
      </section>
    );
  }

  const hasPlan = state.deadlines.length > 0 || state.studyBlocks.length > 0;
  const night = windDown || isNightState(state.settings);

  const setup = (event: FormEvent) => {
    event.preventDefault();
    const deadlines = parseDeadlineLines(deadlineText);
    if (!deadlines.length) return;
    const settings = {
      ...settingsWithWeekdayWindow(state.settings, weekdayWindow),
      nightCutoffHour,
    };
    const planned = generateInitialPlan({
      ...state,
      deadlines,
      settings,
      meta: { ...state.meta, lastOpenedAt: new Date().toISOString() },
    });
    setState(planned);
  };

  const addDeadline = (event: FormEvent) => {
    event.preventDefault();
    const [deadline] = parseDeadlineLines(addLine);
    if (!deadline) return;
    setState((current) => {
      if (!current) return current;
      return generateInitialPlan({
        ...current,
        deadlines: [...current.deadlines, deadline],
      });
    });
    setAddLine('');
  };

  const done = (blockId: string) => {
    setState((current) => {
      if (!current) return current;
      const next = markBlockDone(current, blockId);
      const nextOneThing = chooseOneThing(next.studyBlocks, next.deadlines);
      return {
        ...next,
        latestReport: next.latestReport
          ? { ...next.latestReport, oneThingBlockId: nextOneThing?.id }
          : next.latestReport,
      };
    });
  };

  const reset = () => {
    clearAgentState();
    setState(loadAgentState());
    setDeadlineText(EMPTY_DEADLINES);
    setWindDown(false);
    setPanicOpen(false);
  };

  const panic = () => {
    setPanicOpen((value) => !value);
    setState((current) =>
      current
        ? {
            ...current,
            eventLogs: [
              ...current.eventLogs,
              {
                id: `event-${Date.now()}`,
                type: 'panic' as const,
                ref: oneThing?.id,
                ts: new Date().toISOString(),
              },
            ].slice(-200),
          }
        : current,
    );
  };

  async function polishReport(report: AgentReport, movedBlocks: StudyBlock[]) {
    setPolishing(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'planner',
          message: `Return strict JSON only: {"lines":["..."]}. Rewrite these MindPulse catch-up lines in a warm, forgiving student-planner tone. Keep 1-3 short lines, no guilt, no emojis unless already present. Structured summary: ${JSON.stringify(
            {
              fallbackLines: report.lines,
              moved: movedBlocks.map((block) => ({
                title: block.title,
                subject: block.subject,
                newTime: block.date,
                movedFrom: block.movedFrom,
              })),
            },
          )}`,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
        status?: number;
      };
      if (!response.ok || !body.reply) {
        console.error('[MindPulse] agent wording failed:', body);
        return;
      }
      const lines = parseJsonArrayFromText(body.reply);
      if (!lines) return;
      setState((current) =>
        current?.latestReport?.date === report.date
          ? {
              ...current,
              latestReport: { ...current.latestReport, lines },
            }
          : current,
      );
    } catch (error) {
      console.error('[MindPulse] agent wording unavailable:', error);
    } finally {
      setPolishing(false);
    }
  }

  return (
    <section id="agent" className="px-5 pt-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {!hasPlan ? (
          <SetupCard
            deadlineText={deadlineText}
            weekdayWindow={weekdayWindow}
            nightCutoffHour={nightCutoffHour}
            onDeadlineText={setDeadlineText}
            onWeekdayWindow={setWeekdayWindow}
            onNightCutoffHour={setNightCutoffHour}
            onSubmit={setup}
          />
        ) : night ? (
          <NightCard
            state={state}
            oneThing={oneThing}
            onDone={done}
            onDay={() => setWindDown(false)}
          />
        ) : (
          <DayCard
            state={state}
            oneThing={oneThing}
            restToday={restToday}
            upcoming={upcoming}
            polishing={polishing}
            panicOpen={panicOpen}
            addLine={addLine}
            onAddLine={setAddLine}
            onAddDeadline={addDeadline}
            onDone={done}
            onWindDown={() => setWindDown(true)}
            onPanic={panic}
            onReset={reset}
          />
        )}
      </div>
    </section>
  );
}

function SetupCard({
  deadlineText,
  weekdayWindow,
  nightCutoffHour,
  onDeadlineText,
  onWeekdayWindow,
  onNightCutoffHour,
  onSubmit,
}: {
  deadlineText: string;
  weekdayWindow: string;
  nightCutoffHour: number;
  onDeadlineText: (value: string) => void;
  onWeekdayWindow: (value: string) => void;
  onNightCutoffHour: (value: number) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <div className="grid gap-5 rounded-[2rem] border border-ink/5 bg-surface p-5 shadow-soft lg:grid-cols-[1fr_.8fr] lg:p-7">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-sage-soft px-3 py-1 text-xs font-bold uppercase tracking-[.16em] text-sage">
          <Sparkles size={14} /> MindPulse Agent
        </span>
        <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
          Give me the messy list. I&apos;ll make today lighter.
        </h2>
        <p className="mt-3 max-w-2xl leading-7 text-muted">
          No signup, no long setup. Add a few deadlines and rough study hours;
          MindPulse will create a local plan and catch it up whenever you
          return.
        </p>
      </div>
      <form onSubmit={onSubmit} className="rounded-mp bg-canvas/70 p-4">
        <label className="text-sm font-semibold" htmlFor="agent-deadlines">
          Deadlines
        </label>
        <textarea
          id="agent-deadlines"
          rows={4}
          value={deadlineText}
          onChange={(event) => onDeadlineText(event.target.value)}
          className="mt-2 w-full resize-none rounded-2xl border border-ink/10 bg-surface px-4 py-3 text-sm outline-none focus:border-sage focus:ring-4 focus:ring-sage/10"
          placeholder="Task, Subject, due date, minutes"
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Weekday study hours
            <input
              value={weekdayWindow}
              onChange={(event) => onWeekdayWindow(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-surface px-4 py-3 text-sm outline-none focus:border-sage"
              placeholder="16-19"
            />
          </label>
          <label className="text-sm font-semibold">
            Night cutoff
            <input
              type="number"
              min={18}
              max={23}
              value={nightCutoffHour}
              onChange={(event) =>
                onNightCutoffHour(Number(event.target.value))
              }
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-surface px-4 py-3 text-sm outline-none focus:border-sage"
            />
          </label>
        </div>
        <button className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-sage px-5 font-semibold text-canvas hover:bg-ink">
          Make my first plan <CalendarPlus size={17} />
        </button>
      </form>
    </div>
  );
}

function DayCard({
  state,
  oneThing,
  restToday,
  upcoming,
  polishing,
  panicOpen,
  addLine,
  onAddLine,
  onAddDeadline,
  onDone,
  onWindDown,
  onPanic,
  onReset,
}: {
  state: AgentState;
  oneThing?: StudyBlock | undefined;
  restToday: StudyBlock[];
  upcoming: StudyBlock[];
  polishing: boolean;
  panicOpen: boolean;
  addLine: string;
  onAddLine: (value: string) => void;
  onAddDeadline: (event: FormEvent) => void;
  onDone: (blockId: string) => void;
  onWindDown: () => void;
  onPanic: () => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="rounded-[2rem] border border-ink/5 bg-surface p-5 shadow-soft lg:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-sage">
              Daily spine
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Today, just this:
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onPanic}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-warm/20 px-4 text-sm font-semibold text-ink hover:bg-warm/30"
            >
              <AlertCircle size={16} /> Panic
            </button>
            <button
              onClick={onWindDown}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-canvas hover:bg-sage"
            >
              <Moon size={16} /> Wind down
            </button>
          </div>
        </div>

        {state.latestReport && (
          <div className="mt-5 rounded-mp bg-sage-soft/70 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-sage">
              <Wand2 size={16} />
              While you were away
              {polishing && (
                <span className="text-xs text-muted">polishing...</span>
              )}
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {state.latestReport.lines.map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          </div>
        )}

        {panicOpen && (
          <div className="mt-4 rounded-mp border border-warm/30 bg-warm/10 p-4">
            <h3 className="font-semibold">Tiny emergency plan</h3>
            <p className="mt-1 text-sm leading-6 text-muted">
              Do 20 minutes of{' '}
              <b className="text-ink">
                {oneThing?.title ?? 'the smallest next task'}
              </b>
              , then stop and breathe. This is a stub for the future panic
              agent; no shame, just triage.
            </p>
          </div>
        )}

        {oneThing ? (
          <div className="mt-5 rounded-[1.7rem] bg-ink p-5 text-canvas">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-canvas/65">
                  {formatBlockTime(oneThing)}
                </p>
                <h3 className="mt-1 text-2xl font-semibold">
                  {oneThing.title}
                </h3>
                <p className="mt-2 text-sm text-canvas/70">
                  {oneThing.subject} · {oneThing.durationMin} min
                </p>
              </div>
              <button
                onClick={() => onDone(oneThing.id)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-canvas px-5 text-sm font-semibold text-ink hover:bg-sage-soft"
              >
                Done <CheckCircle2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-mp bg-canvas/70 p-5 text-muted">
            Nothing urgent is waiting. Add a deadline when you want me to help.
          </div>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <PlanList title="Rest of today" blocks={restToday} onDone={onDone} />
          <PlanList title="Coming up" blocks={upcoming} onDone={onDone} />
        </div>
      </div>

      <aside className="space-y-5">
        <form
          onSubmit={onAddDeadline}
          className="rounded-mp bg-surface p-5 shadow-soft"
        >
          <h3 className="font-semibold">Quick add</h3>
          <p className="mt-1 text-sm text-muted">
            Format: task, subject, tomorrow, 45
          </p>
          <input
            value={addLine}
            onChange={(event) => onAddLine(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 text-sm outline-none focus:border-sage"
            placeholder="Math worksheet, Math, in 2 days, 40"
          />
          <button className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-sage-soft px-4 text-sm font-semibold text-ink hover:bg-sage-soft/70">
            Add and replan <CalendarPlus size={16} />
          </button>
        </form>
        <div className="rounded-mp bg-surface p-5 text-sm leading-6 text-muted shadow-soft">
          <Clock3 size={18} className="text-sage" />
          <h3 className="mt-3 font-semibold text-ink">Local-first agent</h3>
          <p className="mt-1">
            Data stays in this browser under <code>{getAgentStorageKey()}</code>
            . The catch-up runs when you open the app, not in a server cron.
          </p>
          <button
            onClick={onReset}
            className="mt-3 text-xs font-semibold text-danger hover:underline"
          >
            Reset local plan
          </button>
        </div>
      </aside>
    </div>
  );
}

function NightCard({
  state,
  oneThing,
  onDone,
  onDay,
}: {
  state: AgentState;
  oneThing?: StudyBlock | undefined;
  onDone: (blockId: string) => void;
  onDay: () => void;
}) {
  const summary = summarizeToday(state);
  return (
    <div className="rounded-[2rem] border border-ink/5 bg-ink p-6 text-canvas shadow-soft sm:p-8">
      <Moon className="text-sage-soft" />
      <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
        Here&apos;s today. It&apos;s handled.
      </h2>
      <p className="mt-3 max-w-2xl leading-7 text-canvas/70">
        Done: {summary.done}. Moved gently: {summary.moved}. Remaining:{' '}
        {summary.remaining}. Tomorrow&apos;s plan is still here; you do not have
        to carry it tonight.
      </p>
      {oneThing && oneThing.status !== 'done' && (
        <div className="mt-6 rounded-mp bg-white/10 p-4">
          <p className="text-sm text-canvas/65">If you want a tiny closure:</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <b>{oneThing.title}</b>
            <button
              onClick={() => onDone(oneThing.id)}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-canvas px-4 text-sm font-semibold text-ink"
            >
              Mark done <CheckCircle2 size={15} />
            </button>
          </div>
        </div>
      )}
      <button
        onClick={onDay}
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-sage-soft px-5 text-sm font-semibold text-ink"
      >
        Back to day view
      </button>
    </div>
  );
}

function PlanList({
  title,
  blocks,
  onDone,
}: {
  title: string;
  blocks: StudyBlock[];
  onDone: (blockId: string) => void;
}) {
  return (
    <div className="rounded-mp bg-canvas/65 p-4">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-3 space-y-2">
        {!blocks.length && (
          <p className="text-sm leading-6 text-muted">
            Nothing else needs the spotlight.
          </p>
        )}
        {blocks.map((block) => (
          <div
            key={block.id}
            className="flex items-center justify-between gap-3 rounded-2xl bg-surface p-3"
          >
            <div>
              <p className="text-sm font-semibold">{block.title}</p>
              <p className="text-xs text-muted">
                {formatBlockTime(block)} · {block.durationMin} min
                {block.status === 'moved' ? ' · moved' : ''}
              </p>
            </div>
            {block.status !== 'done' && (
              <button
                onClick={() => onDone(block.id)}
                className="rounded-full px-3 py-2 text-xs font-semibold text-sage hover:bg-sage-soft"
              >
                Done
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
