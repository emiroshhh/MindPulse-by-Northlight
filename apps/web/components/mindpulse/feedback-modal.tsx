'use client';

import { Loader2, MessageSquareText, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FEEDBACK_FLOWS,
  FEEDBACK_SUGGESTION_MAX,
  type FeedbackFlow,
} from '@mindpulse/shared';
import { copyFor } from '../../lib/mindpulse/i18n';
import type { LanguageCode } from '../../lib/mindpulse/tools';

type TriState = boolean | null;

type CrisisResourceLink = {
  id: string;
  name: string;
  description: string;
  url: string;
  availability: string;
};

type FeedbackApiBody = {
  ok?: boolean;
  error?: string;
  crisis?: boolean;
  reply?: string;
  resources?: CrisisResourceLink[];
};

function deviceCategory(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  if (window.innerWidth < 768) return 'mobile';
  if (window.innerWidth < 1024) return 'tablet';
  return 'desktop';
}

export function FeedbackModal({
  compact = false,
  language = 'en',
  label,
  flow: initialFlow = 'other',
}: {
  compact?: boolean;
  language?: LanguageCode;
  label?: string;
  /** Which product surface the modal was opened from (prefills the selector). */
  flow?: FeedbackFlow;
}) {
  const [open, setOpen] = useState(false);
  const [flow, setFlow] = useState<FeedbackFlow>(initialFlow);
  const [helped, setHelped] = useState<TriState>(null);
  const [confusing, setConfusing] = useState<TriState>(null);
  const [matchedExpectation, setMatchedExpectation] = useState<TriState>(null);
  const [suggestion, setSuggestion] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<
    'idle' | 'sending' | 'done' | 'error' | 'rate_limited' | 'crisis'
  >('idle');
  const [crisis, setCrisis] = useState<{
    reply: string;
    resources: CrisisResourceLink[];
  } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const feedback = copyFor(language).feedback;
  const buttonLabel = label ?? feedback.label;

  const close = useCallback(() => {
    setOpen(false);
    openerRef.current?.focus();
  }, []);

  // Focus trap + Escape. The dialog is small, so a manual trap keeps the
  // dependency surface at zero.
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusables = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('disabled'));
    focusables()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  function openModal(event: React.MouseEvent<HTMLButtonElement>) {
    openerRef.current = event.currentTarget;
    setOpen(true);
    setStatus('idle');
    setCrisis(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!consent || status === 'sending') return;
    setStatus('sending');
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flow,
          helped,
          confusing,
          matchedExpectation,
          suggestion: suggestion.trim(),
          locale: language,
          deviceCategory: deviceCategory(),
          consent: true,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as FeedbackApiBody;
      if (body.crisis && body.reply) {
        setCrisis({ reply: body.reply, resources: body.resources ?? [] });
        setStatus('crisis');
        return;
      }
      if (response.status === 429) {
        setStatus('rate_limited');
        return;
      }
      if (!response.ok || !body.ok) {
        setStatus('error');
        return;
      }
      setStatus('done');
      setSuggestion('');
      setHelped(null);
      setConfusing(null);
      setMatchedExpectation(null);
      setConsent(false);
    } catch {
      setStatus('error');
    }
  }

  const triStateRow = (
    label: string,
    value: TriState,
    onChange: (next: TriState) => void,
    idPrefix: string,
  ) => (
    <fieldset className="rounded-mp bg-canvas/70 p-3">
      <legend className="px-1 text-sm font-semibold">{label}</legend>
      <div className="mt-1 flex gap-2" role="radiogroup" aria-label={label}>
        {(
          [
            [true, feedback.yes],
            [false, feedback.no],
            [null, feedback.skip],
          ] as const
        ).map(([option, optionLabel]) => (
          <button
            key={`${idPrefix}-${String(option)}`}
            type="button"
            role="radio"
            aria-checked={value === option}
            onClick={() => onChange(option)}
            className={`min-h-10 rounded-full px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage ${
              value === option
                ? 'bg-ink text-canvas'
                : 'bg-surface text-muted hover:text-ink'
            }`}
          >
            {optionLabel}
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <>
      <button
        onClick={openModal}
        className={
          compact
            ? 'inline-flex min-h-10 items-center font-semibold hover:text-ink'
            : 'inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-5 text-sm font-semibold text-ink shadow-soft hover:bg-sage-soft'
        }
      >
        {compact ? (
          buttonLabel
        ) : (
          <>
            <MessageSquareText size={16} /> {buttonLabel}
          </>
        )}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
        >
          <div
            ref={dialogRef}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] bg-surface p-6 shadow-soft"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-sage">
                  {feedback.eyebrow}
                </p>
                <h2 id="feedback-title" className="mt-2 text-2xl font-semibold">
                  {feedback.title}
                </h2>
              </div>
              <button
                onClick={close}
                className="rounded-full bg-canvas p-2 text-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                aria-label={feedback.close}
              >
                <X size={18} />
              </button>
            </div>

            {status === 'done' ? (
              <div className="mt-6 rounded-mp bg-sage-soft p-4" role="status">
                <h3 className="font-semibold">{feedback.thanksTitle}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {feedback.thanksCopy}
                </p>
              </div>
            ) : status === 'crisis' && crisis ? (
              <div
                className="mt-6 rounded-mp border-2 border-danger/40 bg-canvas/70 p-4"
                role="alert"
              >
                {crisis.reply.split('\n\n').map((paragraph, index) => (
                  <p
                    key={index}
                    className={`text-sm leading-7 ${index > 0 ? 'mt-3' : ''}`}
                  >
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
                      <p className="text-sm text-muted">
                        {resource.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-4">
                <p className="text-sm leading-7 text-muted">{feedback.intro}</p>

                <label className="block">
                  <span className="text-sm font-semibold">
                    {feedback.flowLabel}
                  </span>
                  <select
                    value={flow}
                    onChange={(event) =>
                      setFlow(event.target.value as FeedbackFlow)
                    }
                    className="mt-1 w-full rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-sage"
                  >
                    {FEEDBACK_FLOWS.map((option) => (
                      <option key={option} value={option}>
                        {feedback.flowOptions[option]}
                      </option>
                    ))}
                  </select>
                </label>

                {triStateRow(feedback.helpedLabel, helped, setHelped, 'helped')}
                {triStateRow(
                  feedback.confusingLabel,
                  confusing,
                  setConfusing,
                  'confusing',
                )}
                {triStateRow(
                  feedback.expectationLabel,
                  matchedExpectation,
                  setMatchedExpectation,
                  'expectation',
                )}

                <label className="block">
                  <span className="text-sm font-semibold">
                    {feedback.suggestionLabel}
                  </span>
                  <textarea
                    value={suggestion}
                    onChange={(event) => setSuggestion(event.target.value)}
                    maxLength={FEEDBACK_SUGGESTION_MAX}
                    rows={3}
                    placeholder={feedback.suggestionPlaceholder}
                    className="mt-1 w-full resize-none rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-sage"
                  />
                </label>

                <label className="flex items-start gap-3 rounded-mp bg-canvas/70 p-3">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-1 h-5 w-5 accent-[#5a7d6c]"
                  />
                  <span className="text-sm leading-6">
                    {feedback.consentLabel}
                  </span>
                </label>

                <p className="text-xs leading-5 text-muted">
                  {feedback.privacyNote}
                </p>

                {status === 'error' && (
                  <p
                    className="rounded-mp bg-warm/15 p-3 text-sm text-danger"
                    role="alert"
                  >
                    {feedback.errorCopy}
                  </p>
                )}
                {status === 'rate_limited' && (
                  <p className="rounded-mp bg-warm/15 p-3 text-sm" role="alert">
                    {feedback.rateLimited}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!consent || status === 'sending'}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-5 font-semibold text-canvas disabled:opacity-50"
                >
                  {status === 'sending' ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      {feedback.sending}
                    </>
                  ) : (
                    feedback.send
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
