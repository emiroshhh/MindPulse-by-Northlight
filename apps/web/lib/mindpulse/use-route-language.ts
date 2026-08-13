'use client';

import { useCallback, useEffect } from 'react';
import { replaceMarketingLocale, type MarketingLocale } from '../seo';
import { useLanguagePreference } from './use-language-preference';

export function useRouteLanguage(initialLanguage?: MarketingLocale) {
  const [preferredLanguage, setPreferredLanguage] = useLanguagePreference();
  const language = initialLanguage ?? preferredLanguage;

  useEffect(() => {
    if (initialLanguage && preferredLanguage !== initialLanguage) {
      setPreferredLanguage(initialLanguage);
    }
  }, [initialLanguage, preferredLanguage, setPreferredLanguage]);

  const setLanguage = useCallback(
    (next: MarketingLocale) => {
      setPreferredLanguage(next);
      if (initialLanguage && typeof window !== 'undefined') {
        window.location.assign(
          replaceMarketingLocale(window.location.pathname, next),
        );
      }
    },
    [initialLanguage, setPreferredLanguage],
  );

  return [language, setLanguage] as const;
}
