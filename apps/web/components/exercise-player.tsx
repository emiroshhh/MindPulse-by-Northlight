'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Exercise, Locale } from '@mindpulse/shared';
import { Button } from './ui';

export function ExercisePlayer({
  exercise,
  locale,
  onClose,
  onComplete,
}: {
  exercise: Exercise;
  locale: Locale;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(exercise.steps[0]?.seconds ?? 0);
  const step = exercise.steps[index];
  useEffect(() => {
    setSeconds(step?.seconds ?? 0);
  }, [step]);
  useEffect(() => {
    if (!seconds) return;
    const timer = window.setInterval(
      () => setSeconds((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [seconds]);
  if (!step) return null;
  const last = index === exercise.steps.length - 1;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={exercise.title[locale]}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-mp-lg bg-surface p-6 shadow-2xl sm:p-9">
        <button
          className="absolute right-5 top-5 rounded-full p-2 text-muted hover:bg-canvas"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <p className="pr-12 text-sm font-semibold text-sage">
          {exercise.title[locale]} · {index + 1}/{exercise.steps.length}
        </p>
        <div className="my-10 flex justify-center">
          <div className="flex h-40 w-40 animate-breathe items-center justify-center rounded-full bg-gradient-to-br from-sage-soft to-lavender text-center">
            <span>
              <strong className="block text-4xl font-light">
                {step.seconds ? seconds || '✓' : index + 1}
              </strong>
              {step.seconds && (
                <small className="mt-1 block text-muted">
                  {locale === 'en' ? 'seconds' : 'секунд'}
                </small>
              )}
            </span>
          </div>
        </div>
        <h2 className="text-center text-2xl font-semibold">
          {step.title[locale]}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-center leading-7 text-muted">
          {step.body[locale]}
        </p>
        <div className="mt-9 flex justify-between">
          <Button
            variant="quiet"
            disabled={index === 0}
            onClick={() => setIndex((value) => value - 1)}
          >
            <ChevronLeft size={18} />
            {locale === 'en' ? 'Back' : 'Назад'}
          </Button>
          <Button
            onClick={() => {
              if (last) {
                onComplete();
                onClose();
              } else setIndex((value) => value + 1);
            }}
          >
            {last ? (
              <>
                <Check size={18} />
                {locale === 'en' ? 'Finish gently' : 'Завершить'}
              </>
            ) : (
              <>
                {locale === 'en' ? 'Next' : 'Дальше'}
                <ChevronRight size={18} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
