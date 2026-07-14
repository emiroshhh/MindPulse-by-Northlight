'use client';

import { useEffect } from 'react';
import {
  LANGUAGE_KEY,
  applyDocumentLanguage,
  readJson,
} from '@/lib/mindpulse/local-store';
import { isLanguageCode } from '@/lib/mindpulse/tools';

/**
 * Applies the stored language to <html lang> on every page load, including
 * pages without their own language state (login, privacy, case study…).
 * Pages with a language picker also call applyDocumentLanguage on change.
 */
export function LanguageHtmlSync() {
  useEffect(() => {
    const stored = readJson<string | null>(LANGUAGE_KEY, null);
    if (stored && isLanguageCode(stored)) applyDocumentLanguage(stored);
  }, []);
  return null;
}
