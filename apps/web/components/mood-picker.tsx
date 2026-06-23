import React from 'react';
import type { MoodKey } from '@mindpulse/shared';

const MOODS: Array<{
  key: MoodKey;
  emoji: string;
  en: string;
  ru: string;
  color: string;
}> = [
  {
    key: 'rough',
    emoji: '◡',
    en: 'Rough',
    ru: 'Тяжело',
    color: 'bg-mood-rough',
  },
  { key: 'low', emoji: '⌒', en: 'Low', ru: 'Грустно', color: 'bg-mood-low' },
  { key: 'okay', emoji: '—', en: 'Okay', ru: 'Нормально', color: 'bg-mist' },
  { key: 'good', emoji: '◠', en: 'Good', ru: 'Хорошо', color: 'bg-sage-soft' },
  {
    key: 'great',
    emoji: '⌣',
    en: 'Great',
    ru: 'Отлично',
    color: 'bg-mood-great',
  },
];

export function MoodPicker({
  value,
  onChange,
  locale,
}: {
  value: MoodKey | null;
  onChange: (mood: MoodKey) => void;
  locale: 'en' | 'ru';
}) {
  return (
    <div
      className="grid grid-cols-5 gap-2"
      role="radiogroup"
      aria-label={locale === 'en' ? 'Choose your mood' : 'Выбери настроение'}
    >
      {MOODS.map((mood) => (
        <button
          key={mood.key}
          type="button"
          role="radio"
          aria-checked={value === mood.key}
          onClick={() => onChange(mood.key)}
          className={`group flex min-w-0 flex-col items-center gap-2 rounded-2xl border px-1 py-3 transition outline-none focus-visible:ring-2 focus-visible:ring-sage ${value === mood.key ? 'border-sage bg-sage-soft/50 shadow-sm' : 'border-transparent hover:bg-canvas'}`}
        >
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-full text-xl font-bold text-mood-ink transition group-hover:scale-105 ${mood.color}`}
          >
            {mood.emoji}
          </span>
          <span className="truncate text-xs font-medium text-muted">
            {mood[locale]}
          </span>
        </button>
      ))}
    </div>
  );
}
