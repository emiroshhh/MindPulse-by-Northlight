// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { chatCopyFor, copyFor, getToolsForLanguage } from './i18n';
import { ENGLISH_ONLY_NOTICE, landingCopyFor } from './marketing-i18n';
import { languages } from './tools';

const LOCALES = ['en', 'ru', 'kk', 'es'] as const;

/** Recursively assert that every string leaf is non-empty. */
function assertNoEmptyStrings(value: unknown, path: string) {
  if (typeof value === 'string') {
    expect(value.trim(), `${path} must not be empty`).not.toBe('');
    return;
  }
  if (Array.isArray(value)) {
    expect(value.length, `${path} must not be an empty array`).toBeGreaterThan(
      0,
    );
    value.forEach((item, index) =>
      assertNoEmptyStrings(item, `${path}[${index}]`),
    );
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      assertNoEmptyStrings(child, `${path}.${key}`);
    }
  }
}

describe('translation completeness', () => {
  it.each(LOCALES)('UiCopy has no empty strings in %s', (locale) => {
    assertNoEmptyStrings(copyFor(locale), `copyFor(${locale})`);
  });

  it.each(LOCALES)('chat copy has no empty strings in %s', (locale) => {
    assertNoEmptyStrings(chatCopyFor(locale), `chatCopyFor(${locale})`);
  });

  it.each(LOCALES)('landing copy has no empty strings in %s', (locale) => {
    assertNoEmptyStrings(landingCopyFor(locale), `landingCopyFor(${locale})`);
  });

  it('chat copy exposes the same keys in every locale', () => {
    const enKeys = Object.keys(chatCopyFor('en')).sort();
    for (const locale of ['ru', 'kk', 'es']) {
      expect(Object.keys(chatCopyFor(locale)).sort()).toEqual(enKeys);
    }
  });

  it('all six tools are localized with matching intake fields', () => {
    const english = getToolsForLanguage('en');
    expect(english).toHaveLength(6);
    for (const locale of ['ru', 'kk', 'es']) {
      const localized = getToolsForLanguage(locale);
      expect(localized).toHaveLength(6);
      localized.forEach((tool, index) => {
        const source = english[index]!;
        expect(tool.id).toBe(source.id);
        expect(tool.intake.map((field) => field.id)).toEqual(
          source.intake.map((field) => field.id),
        );
        assertNoEmptyStrings(tool, `${locale}:${tool.id}`);
      });
    }
  });

  it('localized copy actually differs from english', () => {
    const en = copyFor('en');
    for (const locale of ['ru', 'kk', 'es'] as const) {
      const translated = copyFor(locale);
      expect(translated.nextAction.quickStartTitle).not.toBe(
        en.nextAction.quickStartTitle,
      );
      expect(translated.recovery.title).not.toBe(en.recovery.title);
      expect(landingCopyFor(locale).heroSubtitle).not.toBe(
        landingCopyFor('en').heroSubtitle,
      );
    }
  });

  it('kazakh is honestly labeled beta in the language picker', () => {
    const kk = languages.find((language) => language.id === 'kk');
    expect(kk?.label).toContain('beta');
  });

  it('offers Spanish as a first-class language', () => {
    expect(languages.find((language) => language.id === 'es')).toEqual({
      id: 'es',
      label: 'Español',
      prompt: 'Spanish',
    });
    expect(ENGLISH_ONLY_NOTICE.es).toBe('');
  });

  it('english-only pages have a localized notice for ru and kk', () => {
    expect(ENGLISH_ONLY_NOTICE.ru.trim()).not.toBe('');
    expect(ENGLISH_ONLY_NOTICE.kk.trim()).not.toBe('');
  });
});
