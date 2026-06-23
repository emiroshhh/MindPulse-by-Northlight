import type { ChatMessage, JournalEntry, MoodEntry } from '@mindpulse/shared';

export interface LocalState {
  onboardingComplete: boolean;
  locale: 'en' | 'ru';
  name: string;
  moods: MoodEntry[];
  journals: JournalEntry[];
  messages: ChatMessage[];
  exerciseCompletions: string[];
  aiContextEnabled: boolean;
}

export const DEMO_STATE: LocalState = {
  onboardingComplete: false,
  locale: 'en',
  name: '',
  moods: [
    {
      id: 'seed-mood-1',
      userId: 'demo',
      mood: 'okay',
      intensity: 3,
      tags: ['school'],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'seed-mood-2',
      userId: 'demo',
      mood: 'good',
      intensity: 4,
      tags: ['friends'],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  journals: [],
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hi — I’m here to help you slow things down and sort through what’s on your mind. What would feel useful to talk about?',
      safetyFlag: false,
      createdAt: new Date().toISOString(),
    },
  ],
  exerciseCompletions: [],
  aiContextEnabled: false,
};

const KEY = 'mindpulse-state-v1';

export function loadState(): LocalState {
  if (typeof window === 'undefined') return DEMO_STATE;
  try {
    const value = localStorage.getItem(KEY);
    return value
      ? { ...DEMO_STATE, ...(JSON.parse(value) as LocalState) }
      : DEMO_STATE;
  } catch {
    return DEMO_STATE;
  }
}

export function saveState(state: LocalState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function downloadExport(state: LocalState) {
  const safeState = {
    ...state,
    messages: state.messages,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(safeState, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `mindpulse-export-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function clearState() {
  localStorage.removeItem(KEY);
}
