import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { JournalEntry, Locale, MoodEntry } from '@mindpulse/shared';

type MobileState = {
  locale: Locale;
  moods: MoodEntry[];
  journals: JournalEntry[];
  setLocale: (locale: Locale) => void;
  addMood: (mood: MoodEntry) => void;
  addJournal: (entry: JournalEntry) => void;
  deleteJournal: (id: string) => void;
};
const Context = createContext<MobileState | null>(null);
const KEY = 'mindpulse-mobile-v1';

export function MindPulseProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as {
          locale?: Locale;
          moods?: MoodEntry[];
          journals?: JournalEntry[];
        };
        if (saved.locale) setLocale(saved.locale);
        if (saved.moods) setMoods(saved.moods);
        if (saved.journals) setJournals(saved.journals);
      })
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    AsyncStorage.setItem(
      KEY,
      JSON.stringify({ locale, moods, journals }),
    ).catch(() => undefined);
  }, [locale, moods, journals]);
  const value = useMemo(
    () => ({
      locale,
      moods,
      journals,
      setLocale,
      addMood: (mood: MoodEntry) => setMoods((items) => [mood, ...items]),
      addJournal: (entry: JournalEntry) =>
        setJournals((items) => [entry, ...items]),
      deleteJournal: (id: string) =>
        setJournals((items) => items.filter((entry) => entry.id !== id)),
    }),
    [locale, moods, journals],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useMindPulse() {
  const value = useContext(Context);
  if (!value) throw new Error('MindPulseProvider missing');
  return value;
}
