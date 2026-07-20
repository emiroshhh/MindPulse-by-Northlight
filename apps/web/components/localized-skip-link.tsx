'use client';

import { useLanguagePreference } from '@/lib/mindpulse/use-language-preference';
import type { LanguageCode } from '@/lib/mindpulse/tools';

const LABELS: Record<LanguageCode, string> = {
  en: 'Skip to content',
  ru: 'Перейти к содержимому',
  kk: 'Мазмұнға өту',
  es: 'Ir al contenido',
};

export function LocalizedSkipLink() {
  const [language] = useLanguagePreference();

  return (
    <a href="#main-content" className="skip-link" lang={language}>
      {LABELS[language]}
    </a>
  );
}
