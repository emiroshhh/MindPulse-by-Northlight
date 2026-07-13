'use client';

import { CheckCircle2, RotateCcw } from 'lucide-react';
import type { RecoveryPlan } from '@mindpulse/shared';
import type { UiCopy } from '@/lib/mindpulse/i18n';

export type StoredRecovery = {
  plan: RecoveryPlan;
  source: 'ai' | 'fallback';
  savedId: string | null;
  checkedTitles: string[];
  completed: boolean;
  createdAt: string;
};

export function RecoveryPlanView({
  stored,
  copy,
  savedNote,
  onToggleItem,
  onComplete,
  onStartOver,
}: {
  stored: StoredRecovery;
  copy: UiCopy['recovery'];
  savedNote: string;
  onToggleItem: (title: string) => void;
  onComplete: () => void;
  onStartOver: () => void;
}) {
  const { plan } = stored;
  const checked = new Set(stored.checkedTitles);

  if (stored.completed) {
    return (
      <section
        className="mt-8 rounded-[2rem] bg-surface p-6 shadow-soft sm:p-8"
        role="status"
      >
        <p className="inline-flex items-center gap-2 rounded-full bg-sage-soft px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-sage">
          <CheckCircle2 size={15} /> {copy.completedTitle}
        </p>
        <p className="mt-4 max-w-2xl leading-8 text-muted">
          {copy.completedCopy}
        </p>
        <button
          type="button"
          onClick={onStartOver}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-6 font-semibold text-canvas"
        >
          <RotateCcw size={15} /> {copy.startOver}
        </button>
      </section>
    );
  }

  return (
    <section className="mt-8 space-y-5">
      <div className="rounded-[2rem] bg-surface p-6 shadow-soft sm:p-8">
        <h2 className="text-2xl font-semibold">{copy.planTitle}</h2>
        <p className="mt-3 leading-8">{plan.acknowledgement}</p>
        {stored.source === 'fallback' && (
          <p className="mt-3 rounded-mp bg-canvas/70 p-3 text-sm leading-6 text-muted">
            {copy.fallbackNote}
          </p>
        )}
        <p className="mt-2 text-xs text-muted">{savedNote}</p>
      </div>

      <div className="rounded-[2rem] border-2 border-sage/40 bg-surface p-6 shadow-soft sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-sage">
          {copy.immediateTitle}
        </p>
        <p className="mt-3 text-lg font-semibold leading-8">
          {plan.immediateAction}
        </p>
        <button
          type="button"
          onClick={onComplete}
          className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-sage px-6 font-semibold text-canvas"
        >
          <CheckCircle2 size={16} /> {copy.immediateDoneButton}
        </button>
      </div>

      {plan.urgent.length > 0 && (
        <div className="rounded-[2rem] bg-surface p-6 shadow-soft sm:p-8">
          <h3 className="text-xl font-semibold">{copy.urgentTitle}</h3>
          <ul className="mt-4 space-y-3">
            {plan.urgent.map((item) => (
              <li key={item.title} className="rounded-mp bg-canvas/60 p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checked.has(item.title)}
                    onChange={() => onToggleItem(item.title)}
                    className="mt-1 h-5 w-5 accent-[#5a7d6c]"
                  />
                  <span className={checked.has(item.title) ? 'opacity-60' : ''}>
                    <span className="font-semibold">{item.title}</span>
                    {item.deadline ? (
                      <span className="ml-2 rounded-full bg-warm/20 px-2 py-0.5 text-xs font-semibold">
                        {item.deadline}
                      </span>
                    ) : null}
                    <span className="mt-1 block text-sm leading-6 text-muted">
                      {item.action}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {plan.optional.length > 0 && (
        <div className="rounded-[2rem] bg-surface p-6 shadow-soft sm:p-8">
          <h3 className="text-xl font-semibold">{copy.optionalTitle}</h3>
          <ul className="mt-4 space-y-2">
            {plan.optional.map((item) => (
              <li key={item.title} className="rounded-mp bg-canvas/60 p-4">
                <span className="font-semibold">{item.title}</span>
                {item.reason ? (
                  <span className="mt-1 block text-sm leading-6 text-muted">
                    {item.reason}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {plan.dropped.length > 0 && (
        <div className="rounded-[2rem] bg-surface p-6 shadow-soft sm:p-8">
          <h3 className="text-xl font-semibold">{copy.droppedTitle}</h3>
          <ul className="mt-4 space-y-2">
            {plan.dropped.map((item) => (
              <li key={item.title} className="rounded-mp bg-canvas/60 p-4">
                <span className="font-semibold">{item.title}</span>
                {item.why ? (
                  <span className="mt-1 block text-sm leading-6 text-muted">
                    {item.why}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-start">
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-canvas/70 px-6 text-sm font-semibold text-muted hover:text-ink"
        >
          <RotateCcw size={15} /> {copy.startOver}
        </button>
      </div>
    </section>
  );
}
