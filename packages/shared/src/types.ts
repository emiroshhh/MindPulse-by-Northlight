export type Locale = 'en' | 'ru';

export type MoodKey = 'great' | 'good' | 'okay' | 'low' | 'rough';

export interface Profile {
  id: string;
  displayName: string;
  locale: Locale;
  onboardingCompleted: boolean;
  goals: string[];
  createdAt: string;
}

export interface MoodEntry {
  id: string;
  userId: string;
  mood: MoodKey;
  intensity: number;
  tags: string[];
  note?: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  body: string;
  promptId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  safetyFlag: boolean;
  createdAt: string;
}

export interface Exercise {
  key: string;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  minutes: number;
  category: 'calm' | 'ground' | 'reflect' | 'rest';
  steps: Array<{
    title: Record<Locale, string>;
    body: Record<Locale, string>;
    seconds?: number;
  }>;
}
