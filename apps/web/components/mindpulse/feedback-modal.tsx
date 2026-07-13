'use client';

import { ExternalLink, MessageSquareText, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { copyFor } from '../../lib/mindpulse/i18n';
import {
  FEEDBACK_KEY,
  readJson,
  writeJson,
} from '../../lib/mindpulse/local-store';
import type { LanguageCode } from '../../lib/mindpulse/tools';

type FeedbackOpenEntry = {
  action: 'opened_external_feedback';
  feedbackUrlConfigured: boolean;
  createdAt: string;
};

const feedbackUrl = process.env.NEXT_PUBLIC_FEEDBACK_URL?.trim() ?? '';

export function FeedbackModal({
  compact = false,
  language = 'en',
  label,
}: {
  compact?: boolean;
  language?: LanguageCode;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const hasFeedbackUrl = useMemo(() => /^https?:\/\//.test(feedbackUrl), []);
  const feedback = copyFor(language).feedback;
  const buttonLabel = label ?? feedback.label;

  function markFeedbackOpened() {
    const entries = readJson<FeedbackOpenEntry[]>(FEEDBACK_KEY, []);
    const entry: FeedbackOpenEntry = {
      action: 'opened_external_feedback',
      feedbackUrlConfigured: hasFeedbackUrl,
      createdAt: new Date().toISOString(),
    };
    writeJson<FeedbackOpenEntry[]>(
      FEEDBACK_KEY,
      [entry, ...entries].slice(0, 20),
    );
    setDone(true);
  }

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          setDone(false);
        }}
        className={
          compact
            ? 'font-semibold hover:text-ink'
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
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] bg-surface p-6 shadow-soft">
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
                onClick={() => setOpen(false)}
                className="rounded-full bg-canvas p-2 text-muted hover:text-ink"
                aria-label={feedback.close}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-sm leading-7 text-muted">{feedback.intro}</p>

              {hasFeedbackUrl ? (
                <a
                  href={feedbackUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={markFeedbackOpened}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-5 font-semibold text-canvas"
                >
                  {feedback.send} <ExternalLink size={17} />
                </a>
              ) : (
                <div className="rounded-mp bg-canvas/80 p-4">
                  <h3 className="font-semibold">{feedback.unavailableTitle}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {feedback.unavailableCopy}
                  </p>
                </div>
              )}

              {done && (
                <div className="rounded-mp bg-sage-soft p-4">
                  <h3 className="font-semibold">{feedback.thanksTitle}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {feedback.thanksCopy}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
