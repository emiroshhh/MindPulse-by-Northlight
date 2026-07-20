'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  applyDocumentLanguage,
  readLanguagePreference,
  setLanguagePreference,
  subscribeToLanguagePreference,
} from '@/lib/mindpulse/local-store';
import type { LanguageCode } from '@/lib/mindpulse/tools';

export type LanguagePreferenceValue = readonly [
  LanguageCode,
  (language: LanguageCode) => void,
];

export const LanguagePreferenceContext =
  createContext<LanguagePreferenceValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    setLanguageState(readLanguagePreference());
    return subscribeToLanguagePreference(setLanguageState);
  }, []);

  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState(next);
    setLanguagePreference(next);
  }, []);

  const value = useMemo(
    () => [language, setLanguage] as const,
    [language, setLanguage],
  );

  // The provider owns the whole visible application subtree. Its single state
  // update commits localized copy, metadata, and the skip link before this
  // parent layout effect changes the document's declared language.
  useLayoutEffect(() => {
    applyDocumentLanguage(language);
  }, [language]);

  return (
    <LanguagePreferenceContext.Provider value={value}>
      {children}
    </LanguagePreferenceContext.Provider>
  );
}
