import { describe, expect, it } from 'vitest';
import { t, translations } from '../src/i18n';
import type { TranslationKey } from '../src/i18n';

describe('i18n t() function', () => {
  it('returns the correct english translation', () => {
    expect(t('en', 'brandTagline')).toBe(translations.en.brandTagline);
    expect(t('en', 'today')).toBe(translations.en.today);
    expect(t('en', 'crisisTitle')).toBe(translations.en.crisisTitle);
  });

  it('returns the correct russian translation', () => {
    expect(t('ru', 'brandTagline')).toBe(translations.ru.brandTagline);
    expect(t('ru', 'today')).toBe(translations.ru.today);
    expect(t('ru', 'crisisTitle')).toBe(translations.ru.crisisTitle);
  });
});
