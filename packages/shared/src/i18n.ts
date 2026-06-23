import type { Locale } from './types';

export const translations = {
  en: {
    brandTagline: 'A quiet place to check in',
    today: 'Today',
    companion: 'Companion',
    journal: 'Journal',
    exercises: 'Exercises',
    insights: 'Insights',
    safety: 'Safety',
    settings: 'Settings',
    greeting: 'How are you arriving today?',
    greetingSub: 'No right answer. Take a breath and notice what is here.',
    moodPrompt: 'A quick check-in',
    saveCheckIn: 'Save check-in',
    privacyNote: 'Private to you',
    talk: 'Talk to MindPulse',
    talkSub: 'A calm space to think out loud. Not therapy or emergency care.',
    journalPrompt: 'What has been taking up space in your mind?',
    save: 'Save',
    crisisTitle: 'You deserve real-time support',
    crisisBody:
      'Please reach out to a trusted adult nearby or use one of these resources now.',
  },
  ru: {
    brandTagline: 'Тихое место, чтобы прислушаться к себе',
    today: 'Сегодня',
    companion: 'Собеседник',
    journal: 'Дневник',
    exercises: 'Практики',
    insights: 'Обзор',
    safety: 'Безопасность',
    settings: 'Настройки',
    greeting: 'С каким настроением ты сегодня?',
    greetingSub: 'Нет правильного ответа. Вдохни и заметь, что чувствуешь.',
    moodPrompt: 'Быстрая отметка',
    saveCheckIn: 'Сохранить',
    privacyNote: 'Видно только тебе',
    talk: 'Поговорить с MindPulse',
    talkSub:
      'Спокойное место, чтобы подумать вслух. Не терапия и не экстренная помощь.',
    journalPrompt: 'Что занимает твои мысли?',
    save: 'Сохранить',
    crisisTitle: 'Ты заслуживаешь поддержки прямо сейчас',
    crisisBody:
      'Пожалуйста, обратись к взрослому, которому доверяешь и который рядом, или используй один из этих ресурсов.',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type TranslationKey = keyof (typeof translations)['en'];
export function t(locale: Locale, key: TranslationKey) {
  return translations[locale][key];
}
