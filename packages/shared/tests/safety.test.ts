import { describe, expect, it } from 'vitest';
import {
  SAFE_CRISIS_REPLY,
  SAFE_OUTPUT_FALLBACK,
  assessModelOutput,
  assessUserInput,
  crisisRepliesFor,
  resourcesForRegion,
  safeOutputFallbacksFor,
  toSafetyLocale,
} from '../src/safety';

describe('safety engine', () => {
  it.each([
    'I want to kill myself',
    "I don't want to be alive",
    'Я хочу умереть',
    'Я хочу покончить с собой',
    'someone is going to hurt me',
    // Kazakh (patterns pending native review)
    'Өлгім келеді',
    'өмір сүргім келмейді',
    'мені өлтіреді',
  ])('flags crisis language: %s', (input) => {
    const result = assessUserInput(input);
    expect(result.flagged).toBe(true);
    expect(result.level).toBe('crisis');
  });
  it('marks abuse disclosure as a concern', () => {
    const result = assessUserInput('my parent hits me');
    expect(result.level).toBe('concern');
    expect(result.categories).toContain('abuse');
  });
  it('marks Russian abuse disclosure as a concern', () => {
    const result = assessUserInput('меня бьют дома');
    expect(result.level).toBe('concern');
    expect(result.categories).toContain('abuse');
  });
  it.each([
    'I need to kill time',
    'That test killed me',
    'The deadline is killing me',
    'I had a rough day',
    // Russian idioms must not trigger crisis routing
    'Я чуть не умерла от смеха',
    'Хочу умереть от смеха',
    'Этот экзамен меня убил',
    'Дедлайн меня убивает',
    // Kazakh idiom (pending native review)
    'күлкіден өлдім',
  ])('does not flag common non-crisis language: %s', (input) =>
    expect(assessUserInput(input).flagged).toBe(false),
  );
  it('blocks diagnostic model claims', () => {
    const result = assessModelOutput('You definitely have depression.');
    expect(result.level).toBe('blocked_output');
    expect(result.categories).toContain('medical_claim');
  });
  it('allows warm non-clinical model language', () =>
    expect(
      assessModelOutput('That sounds hard. Would taking one small pause help?')
        .flagged,
    ).toBe(false));
});

describe('localized safety replies', () => {
  it('has a non-empty crisis reply and output fallback for every locale', () => {
    for (const locale of ['en', 'ru', 'kk'] as const) {
      expect(SAFE_CRISIS_REPLY[locale].length).toBeGreaterThan(40);
      expect(SAFE_OUTPUT_FALLBACK[locale].length).toBeGreaterThan(40);
    }
  });
  it('returns a single localized reply for en and ru', () => {
    expect(crisisRepliesFor('en')).toEqual([SAFE_CRISIS_REPLY.en]);
    expect(crisisRepliesFor('ru')).toEqual([SAFE_CRISIS_REPLY.ru]);
  });
  it('pairs Kazakh replies with Russian until native review', () => {
    expect(crisisRepliesFor('kk')).toEqual([
      SAFE_CRISIS_REPLY.kk,
      SAFE_CRISIS_REPLY.ru,
    ]);
    expect(safeOutputFallbacksFor('kk')).toEqual([
      SAFE_OUTPUT_FALLBACK.kk,
      SAFE_OUTPUT_FALLBACK.ru,
    ]);
  });
  it('normalizes unknown locales to English', () => {
    expect(toSafetyLocale('fr')).toBe('en');
    expect(toSafetyLocale(undefined)).toBe('en');
    expect(toSafetyLocale('kk')).toBe('kk');
  });
  it('provides localized resource strings without invented phone numbers', () => {
    for (const resource of resourcesForRegion('KZ')) {
      expect(resource.phone).toBeNull();
      for (const locale of ['en', 'ru', 'kk'] as const) {
        expect(resource.name[locale]).toBeTruthy();
        expect(resource.description[locale]).toBeTruthy();
        expect(resource.availability[locale]).toBeTruthy();
      }
    }
  });
  it('does not assume every user is in Kazakhstan', () => {
    const unknownRegion = resourcesForRegion('UNKNOWN');
    expect(unknownRegion.map((resource) => resource.id)).toEqual([
      'international-find-a-helpline',
    ]);
  });
});
