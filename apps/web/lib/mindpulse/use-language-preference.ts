'use client';

import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { LanguagePreferenceContext } from '@/components/language-provider';
import type { LanguageCode } from './tools';
import {
  applyDocumentLanguage,
  readLanguagePreference,
  setLanguagePreference,
  subscribeToLanguagePreference,
} from './local-store';

export function useLanguagePreference() {
  const sharedPreference = useContext(LanguagePreferenceContext);
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    const stored = readLanguagePreference();
    setLanguageState(stored);
    return subscribeToLanguagePreference(setLanguageState);
  }, []);

  // Standalone component tests can render without the root provider. In the
  // production tree the provider owns this synchronization for one commit.
  useLayoutEffect(() => {
    if (!sharedPreference) applyDocumentLanguage(language);
  }, [language, sharedPreference]);

  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState(next);
    setLanguagePreference(next);
  }, []);

  return sharedPreference ?? ([language, setLanguage] as const);
}
