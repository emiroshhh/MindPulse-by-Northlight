'use client';

import { Globe2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ENGLISH_ONLY_NOTICE } from '@/lib/mindpulse/marketing-i18n';
import { LANGUAGE_KEY, readJson } from '@/lib/mindpulse/local-store';
import { isLanguageCode, type LanguageCode } from '@/lib/mindpulse/tools';

/**
 * Shown on long-form pages that are intentionally English-only for now.
 * Honest scoping: a clear localized notice instead of a half-translated page.
 */
export function EnglishOnlyNotice() {
  const [language, setLanguage] = useState<LanguageCode>('en');

  useEffect(() => {
    const stored = readJson<string | null>(LANGUAGE_KEY, null);
    if (stored && isLanguageCode(stored)) setLanguage(stored);
  }, []);

  const notice = ENGLISH_ONLY_NOTICE[language];
  if (!notice) return null;
  return (
    <p
      lang={language}
      className="mx-auto mb-6 flex max-w-3xl items-start gap-3 rounded-2xl bg-sage-soft/70 p-4 text-sm leading-6 text-muted"
    >
      <Globe2 size={17} className="mt-0.5 shrink-0 text-sage" />
      <span>{notice}</span>
    </p>
  );
}
