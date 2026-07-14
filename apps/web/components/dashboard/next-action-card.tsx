'use client';

import { ArrowRight, CheckCircle2, Loader2, Target } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import type { UiCopy } from '@/lib/mindpulse/i18n';
import { authHeaders } from '@/lib/mindpulse/client-auth';
import { sendBetaEvent } from '@/lib/mindpulse/beta-events';
import {
  NEXT_ACTION_KEY,
  ONBOARDED_KEY,
  readJson,
  writeJson,
} from '@/lib/mindpulse/local-store';
import type {
  LanguageCode,
  MindPulseTool,
  ModeId,
} from '@/lib/mindpulse/tools';

type StoredNextAction = {
  text: string;
  mode: ModeId;
  createdAt: string;
};

type CrisisResourceLink = {
  id: string;
  name: string;
  description: string;
  url: string;
  availability: string;
};

/**
 * The one primary dashboard card: either shows the current next action with a
 * Done button, or the quick-start flow (pick need -> one real task -> one
 * small suggested action). Stored locally on the device for guests and
 * accounts alike — it is deliberately a lightweight pointer, not a task DB.
 */
export function NextActionCard({
  language,
  copy,
  tools,
}: {
  language: LanguageCode;
  copy: UiCopy['nextAction'];
  tools: MindPulseTool[];
}) {
  const [current, setCurrent] = useState<StoredNextAction | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<ModeId | 'recovery'>('study');
  const [task, setTask] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [celebrate, setCelebrate] = useState(false);
  const [crisis, setCrisis] = useState<{
    reply: string;
    resources: CrisisResourceLink[];
  } | null>(null);

  useEffect(() => {
    setCurrent(readJson<StoredNextAction | null>(NEXT_ACTION_KEY, null));
    setHydrated(true);
  }, []);

  function persist(next: StoredNextAction | null) {
    setCurrent(next);
    writeJson(NEXT_ACTION_KEY, next);
  }

  async function suggest(event: FormEvent) {
    event.preventDefault();
    const text = task.trim();
    if (!text || loading || mode === 'recovery') return;
    setLoading(true);
    setError('');
    setCrisis(null);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          language,
          message: `Suggest exactly ONE small, concrete next action (1-2 sentences, something startable in the next 15 minutes) for this situation. No lists, no plan, just the single smallest useful step: ${text}`,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
        accountRequired?: boolean;
        crisis?: boolean;
        resources?: CrisisResourceLink[];
      };
      if (body.crisis && body.reply) {
        setCrisis({ reply: body.reply, resources: body.resources ?? [] });
        return;
      }
      if (response.status === 429) {
        setError(body.accountRequired ? copy.limitGuest : copy.limitAccount);
        return;
      }
      if (!response.ok || !body.reply) {
        setError(copy.error);
        return;
      }
      setSuggestion(body.reply);
    } catch {
      setError(copy.error);
    } finally {
      setLoading(false);
    }
  }

  function setAsNext() {
    if (!suggestion || mode === 'recovery') return;
    persist({
      text: suggestion,
      mode,
      createdAt: new Date().toISOString(),
    });
    setSuggestion('');
    setTask('');
    sendBetaEvent('next_action_set');
    if (!readJson(ONBOARDED_KEY, false)) {
      writeJson(ONBOARDED_KEY, true);
      sendBetaEvent('onboarding_completed');
    }
  }

  function markDone() {
    persist(null);
    setCelebrate(true);
    sendBetaEvent('action_completed');
  }

  if (!hydrated) {
    return (
      <section className="rounded-[2rem] bg-surface p-6 shadow-soft sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-sage">
          {copy.eyebrow}
        </p>
      </section>
    );
  }

  if (current) {
    return (
      <section className="rounded-[2rem] border-2 border-sage/40 bg-surface p-6 shadow-soft sm:p-8">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-sage">
          <Target size={15} /> {copy.eyebrow}
        </p>
        <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">
          {copy.currentTitle}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8">{current.text}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={markDone}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-sage px-6 font-semibold text-canvas"
          >
            <CheckCircle2 size={17} /> {copy.doneButton}
          </button>
          <button
            type="button"
            onClick={() => persist(null)}
            className="min-h-12 rounded-full bg-canvas/70 px-6 font-semibold text-muted hover:text-ink"
          >
            {copy.changeButton}
          </button>
        </div>
        <p className="mt-4 text-xs text-muted">{copy.localNote}</p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] bg-surface p-6 shadow-soft sm:p-8">
      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-sage">
        <Target size={15} /> {copy.eyebrow}
      </p>
      {celebrate && (
        <p
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-sage-soft px-4 py-2 text-sm font-semibold"
          role="status"
        >
          <CheckCircle2 size={15} className="text-sage" />
          {copy.doneCelebration}
        </p>
      )}
      <h1 className="mt-3 text-3xl font-semibold tracking-[-.03em] sm:text-4xl">
        {copy.quickStartTitle}
      </h1>
      <p className="mt-3 max-w-2xl leading-8 text-muted">
        {copy.quickStartIntro}
      </p>

      {crisis ? (
        <div
          role="alert"
          className="mt-6 rounded-[1.5rem] border-2 border-danger/40 bg-canvas/60 p-5"
        >
          {crisis.reply.split('\n\n').map((paragraph, index) => (
            <p key={index} className={`leading-8 ${index > 0 ? 'mt-3' : ''}`}>
              {paragraph}
            </p>
          ))}
          <ul className="mt-3 space-y-2">
            {crisis.resources.map((resource) => (
              <li key={resource.id}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline decoration-danger/50 underline-offset-4"
                >
                  {resource.name}
                </a>
                <p className="text-sm text-muted">{resource.description}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : suggestion ? (
        <div className="mt-6 rounded-[1.5rem] bg-sage-soft/70 p-5">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-sage">
            {copy.resultLabel}
          </p>
          <p className="mt-2 text-lg leading-8">{suggestion}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={setAsNext}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 font-semibold text-canvas"
            >
              {copy.setAsNext} <ArrowRight size={15} />
            </button>
            <button
              type="button"
              onClick={() => setSuggestion('')}
              className="min-h-11 rounded-full bg-canvas/80 px-5 font-semibold text-muted hover:text-ink"
            >
              {copy.tryAgain}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={suggest} className="mt-6">
          <fieldset>
            <legend className="text-sm font-semibold">{copy.needLabel}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  role="radio"
                  aria-checked={mode === tool.id}
                  onClick={() => setMode(tool.id)}
                  className={`min-h-10 rounded-full px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage ${
                    mode === tool.id
                      ? 'bg-ink text-canvas'
                      : 'bg-canvas/70 text-muted hover:text-ink'
                  }`}
                >
                  {tool.shortTitle}
                </button>
              ))}
              <button
                type="button"
                role="radio"
                aria-checked={mode === 'recovery'}
                onClick={() => setMode('recovery')}
                className={`min-h-10 rounded-full px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage ${
                  mode === 'recovery'
                    ? 'bg-ink text-canvas'
                    : 'bg-warm/25 text-muted hover:text-ink'
                }`}
              >
                {copy.recoveryOption}
              </button>
            </div>
          </fieldset>

          {mode === 'recovery' ? (
            <div className="mt-4 rounded-[1.5rem] bg-warm/15 p-5">
              <p className="text-sm leading-7 text-muted">
                {copy.recoveryHint}
              </p>
              <Link
                href="/recovery"
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 font-semibold text-canvas"
              >
                {copy.recoveryOption} <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <>
              <label className="mt-4 block">
                <span className="text-sm font-semibold">{copy.taskLabel}</span>
                <textarea
                  value={task}
                  onChange={(event) => setTask(event.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder={copy.taskPlaceholder}
                  className="mt-1 w-full resize-none rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-sage"
                />
              </label>
              {error && (
                <p
                  className="mt-3 rounded-mp bg-warm/15 p-3 text-sm text-danger"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || !task.trim()}
                className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-sage px-6 font-semibold text-canvas disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    {copy.loading}
                  </>
                ) : (
                  copy.submit
                )}
              </button>
            </>
          )}
        </form>
      )}
    </section>
  );
}
