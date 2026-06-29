'use client';

import { ExternalLink, MessageSquareText, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FEEDBACK_KEY, readJson, writeJson } from '@/lib/mindpulse/local-store';

type FeedbackOpenEntry = {
  action: 'opened_external_feedback';
  feedbackUrlConfigured: boolean;
  createdAt: string;
};

const feedbackUrl = process.env.NEXT_PUBLIC_FEEDBACK_URL?.trim() ?? '';

export function FeedbackModal({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const hasFeedbackUrl = useMemo(() => /^https?:\/\//.test(feedbackUrl), []);

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
          'Feedback'
        ) : (
          <>
            <MessageSquareText size={16} /> Feedback
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
                  Student feedback
                </p>
                <h2 id="feedback-title" className="mt-2 text-2xl font-semibold">
                  Help shape MindPulse
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full bg-canvas p-2 text-muted hover:text-ink"
                aria-label="Close feedback"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-sm leading-7 text-muted">
                Feedback is optional and should not include private chat
                content, passwords, financial details, private documents, or
                sensitive personal information.
              </p>

              {hasFeedbackUrl ? (
                <a
                  href={feedbackUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={markFeedbackOpened}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-5 font-semibold text-canvas"
                >
                  Send feedback <ExternalLink size={17} />
                </a>
              ) : (
                <div className="rounded-mp bg-canvas/80 p-4">
                  <h3 className="font-semibold">Feedback form not connected</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Add a real Google Forms or feedback form URL with
                    <code className="mx-1 rounded bg-sage-soft px-1.5 py-0.5 text-xs font-bold text-ink">
                      NEXT_PUBLIC_FEEDBACK_URL
                    </code>
                    before launch. No fake feedback URL is hardcoded.
                  </p>
                </div>
              )}

              {done && (
                <div className="rounded-mp bg-sage-soft p-4">
                  <h3 className="font-semibold">Thank you — genuinely.</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    The feedback form opened in a new tab. MindPulse only saved
                    a local “feedback opened” marker on this device.
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
