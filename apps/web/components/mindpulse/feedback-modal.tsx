'use client';

import { MessageSquareText, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { FEEDBACK_KEY, readJson, writeJson } from '@/lib/mindpulse/local-store';

type FeedbackEntry = {
  usedFor: string;
  helpful: 'Yes' | 'Somewhat' | 'No';
  improve: string;
  useAgain: 'Yes' | 'Maybe' | 'No';
  testimonial: 'Yes' | 'No';
  createdAt: string;
};

export function FeedbackModal() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [usedFor, setUsedFor] = useState('');
  const [helpful, setHelpful] = useState<FeedbackEntry['helpful']>('Yes');
  const [improve, setImprove] = useState('');
  const [useAgain, setUseAgain] = useState<FeedbackEntry['useAgain']>('Yes');
  const [testimonial, setTestimonial] =
    useState<FeedbackEntry['testimonial']>('No');

  function submit(event: FormEvent) {
    event.preventDefault();
    const entries = readJson<FeedbackEntry[]>(FEEDBACK_KEY, []);
    writeJson<FeedbackEntry[]>(
      FEEDBACK_KEY,
      [
        {
          usedFor: usedFor.slice(0, 400),
          helpful,
          improve: improve.slice(0, 800),
          useAgain,
          testimonial,
          createdAt: new Date().toISOString(),
        },
        ...entries,
      ].slice(0, 20),
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
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-5 text-sm font-semibold text-ink shadow-soft hover:bg-sage-soft"
      >
        <MessageSquareText size={16} /> Feedback
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
            {done ? (
              <div className="mt-6 rounded-mp bg-sage-soft p-5">
                <h3 className="font-semibold">Thank you — genuinely.</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Your feedback was saved locally on this device for Phase 2. It
                  does not include your private chat content.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-4">
                <label className="block text-sm font-semibold">
                  What did you use MindPulse for?
                  <input
                    value={usedFor}
                    onChange={(event) => setUsedFor(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-sage"
                    placeholder="Planning, studying, motivation..."
                  />
                </label>
                <RadioGroup
                  label="Was it helpful?"
                  value={helpful}
                  options={['Yes', 'Somewhat', 'No']}
                  onChange={(value) =>
                    setHelpful(value as FeedbackEntry['helpful'])
                  }
                />
                <label className="block text-sm font-semibold">
                  What should be improved?
                  <textarea
                    value={improve}
                    onChange={(event) => setImprove(event.target.value)}
                    rows={4}
                    className="mt-2 w-full resize-none rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-sage"
                    placeholder="Please avoid sharing private details."
                  />
                </label>
                <RadioGroup
                  label="Would you use it again?"
                  value={useAgain}
                  options={['Yes', 'Maybe', 'No']}
                  onChange={(value) =>
                    setUseAgain(value as FeedbackEntry['useAgain'])
                  }
                />
                <RadioGroup
                  label="Can this feedback be used anonymously as a testimonial?"
                  value={testimonial}
                  options={['Yes', 'No']}
                  onChange={(value) =>
                    setTestimonial(value as FeedbackEntry['testimonial'])
                  }
                />
                <p className="rounded-2xl bg-canvas/80 p-3 text-xs leading-5 text-muted">
                  Feedback is stored only in this browser for now. MindPulse
                  does not store private chat content in this form.
                </p>
                <button className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-5 font-semibold text-canvas">
                  Send feedback
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function RadioGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              value === option
                ? 'bg-ink text-canvas'
                : 'bg-canvas text-muted hover:text-ink'
            }`}
          >
            <input
              type="radio"
              checked={value === option}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
