import type { Exercise, Locale, MoodKey } from './types';

export const EXERCISES: Exercise[] = [
  {
    key: 'box-breathing',
    title: { en: 'Box breathing', ru: 'Дыхание по квадрату' },
    summary: {
      en: 'A steady four-part breath to create a little space.',
      ru: 'Ровное дыхание из четырёх частей, чтобы дать себе немного пространства.',
    },
    minutes: 2,
    category: 'calm',
    steps: [
      {
        title: { en: 'Breathe in', ru: 'Вдох' },
        body: {
          en: 'Inhale gently through your nose.',
          ru: 'Мягко вдохни через нос.',
        },
        seconds: 4,
      },
      {
        title: { en: 'Hold', ru: 'Задержка' },
        body: {
          en: 'Pause without straining.',
          ru: 'Ненадолго задержи дыхание без усилия.',
        },
        seconds: 4,
      },
      {
        title: { en: 'Breathe out', ru: 'Выдох' },
        body: { en: 'Let the air out slowly.', ru: 'Медленно выдохни.' },
        seconds: 4,
      },
      {
        title: { en: 'Rest', ru: 'Пауза' },
        body: {
          en: 'Pause, then repeat if it feels good.',
          ru: 'Сделай паузу и повтори, если тебе комфортно.',
        },
        seconds: 4,
      },
    ],
  },
  {
    key: 'grounding-54321',
    title: { en: '5–4–3–2–1 grounding', ru: 'Заземление 5–4–3–2–1' },
    summary: {
      en: 'Use your senses to return to the room around you.',
      ru: 'Используй чувства, чтобы вернуться в пространство вокруг.',
    },
    minutes: 4,
    category: 'ground',
    steps: [
      {
        title: { en: 'Notice 5 things', ru: 'Заметь 5 вещей' },
        body: {
          en: 'Name five things you can see.',
          ru: 'Назови пять вещей, которые видишь.',
        },
      },
      {
        title: { en: 'Feel 4 things', ru: 'Почувствуй 4 вещи' },
        body: {
          en: 'Notice four sensations of touch.',
          ru: 'Заметь четыре тактильных ощущения.',
        },
      },
      {
        title: { en: 'Hear 3 things', ru: 'Услышь 3 звука' },
        body: {
          en: 'Listen for three sounds.',
          ru: 'Прислушайся к трём звукам.',
        },
      },
      {
        title: { en: 'Smell 2 things', ru: 'Улови 2 запаха' },
        body: {
          en: 'Find two scents, even very faint ones.',
          ru: 'Найди два запаха, даже едва заметных.',
        },
      },
      {
        title: { en: 'Taste 1 thing', ru: 'Заметь 1 вкус' },
        body: {
          en: 'Notice one taste or imagine a familiar one.',
          ru: 'Заметь один вкус или представь знакомый.',
        },
      },
    ],
  },
  {
    key: 'thought-reframe',
    title: { en: 'A kinder reframe', ru: 'Более добрый взгляд' },
    summary: {
      en: 'Look at a difficult thought with curiosity, not judgment.',
      ru: 'Посмотри на трудную мысль с любопытством, а не с осуждением.',
    },
    minutes: 6,
    category: 'reflect',
    steps: [
      {
        title: { en: 'Catch the thought', ru: 'Поймай мысль' },
        body: {
          en: 'Write it exactly as it showed up.',
          ru: 'Запиши её именно так, как она появилась.',
        },
      },
      {
        title: { en: 'Check the evidence', ru: 'Проверь факты' },
        body: {
          en: 'What supports it? What does not?',
          ru: 'Что её подтверждает? А что — нет?',
        },
      },
      {
        title: {
          en: 'Find a fairer sentence',
          ru: 'Найди более честную фразу',
        },
        body: {
          en: 'Try something true, balanced, and kind.',
          ru: 'Попробуй сформулировать честно, взвешенно и бережно.',
        },
      },
    ],
  },
  {
    key: 'body-scan',
    title: { en: 'Mini body scan', ru: 'Короткое сканирование тела' },
    summary: {
      en: 'Notice where your body is holding the day.',
      ru: 'Заметь, где в теле сохранилось напряжение дня.',
    },
    minutes: 5,
    category: 'rest',
    steps: [
      {
        title: { en: 'Settle', ru: 'Устройся' },
        body: {
          en: 'Sit or lie somewhere supported.',
          ru: 'Сядь или ляг так, чтобы чувствовать опору.',
        },
      },
      {
        title: { en: 'Scan slowly', ru: 'Медленно наблюдай' },
        body: {
          en: 'Move attention from forehead to feet.',
          ru: 'Перемещай внимание от лба к стопам.',
        },
      },
      {
        title: { en: 'Soften one place', ru: 'Расслабь одну область' },
        body: {
          en: 'Choose one tense area and let it loosen a little.',
          ru: 'Выбери напряжённое место и позволь ему немного расслабиться.',
        },
      },
    ],
  },
];

const EXERCISE_BY_MOOD: Record<MoodKey, string> = {
  rough: 'grounding-54321',
  low: 'body-scan',
  okay: 'box-breathing',
  good: 'thought-reframe',
  great: 'thought-reframe',
};

const SUGGESTION_REASON: Record<MoodKey, Record<Locale, string>> = {
  rough: {
    en: 'When things feel rough, returning to the room through your senses can make the moment a little smaller.',
    ru: 'Когда особенно тяжело, внимание к окружающим ощущениям может сделать этот момент немного меньше.',
  },
  low: {
    en: 'A slow body check can offer some rest without asking you to change how you feel.',
    ru: 'Медленное внимание к телу может дать немного отдыха, не требуя менять свои чувства.',
  },
  okay: {
    en: 'A short steady breath can create a little space before the rest of the day.',
    ru: 'Короткое ровное дыхание может создать немного пространства перед продолжением дня.',
  },
  good: {
    en: 'A gentle reflection can help you notice what supported this steadier moment.',
    ru: 'Мягкое размышление поможет заметить, что поддержало этот более спокойный момент.',
  },
  great: {
    en: 'You can notice what helped today without turning a good moment into a rule or expectation.',
    ru: 'Можно заметить, что помогло сегодня, не превращая хороший момент в правило или ожидание.',
  },
};

export function suggestExerciseForMood(mood: MoodKey, locale: Locale) {
  const exercise = EXERCISES.find(
    (item) => item.key === EXERCISE_BY_MOOD[mood],
  );
  if (!exercise)
    throw new Error(`Exercise mapping is missing for mood: ${mood}`);
  return { exercise, reason: SUGGESTION_REASON[mood][locale] };
}
