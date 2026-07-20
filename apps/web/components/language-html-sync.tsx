'use client';

import { useLanguagePreference } from '@/lib/mindpulse/use-language-preference';

/**
 * Applies the stored language to <html lang> after React commits matching
 * localized content, including on pages without their own language picker.
 */
export function LanguageHtmlSync() {
  useLanguagePreference();
  return null;
}
