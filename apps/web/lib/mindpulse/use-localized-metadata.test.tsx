// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { publicPageCopyFor } from './public-page-i18n';
import { useLocalizedMetadata } from './use-localized-metadata';

afterEach(() => {
  document.head.innerHTML = '';
});

describe('localized metadata', () => {
  it('keeps localized metadata after a framework head update', async () => {
    document.head.innerHTML =
      '<title>MindPulse</title><meta name="description" content="English">';
    renderHook(() =>
      useLocalizedMetadata(
        'MindPulse · Apoyo para estudiantes',
        'Apoyo de estudio en español.',
      ),
    );
    expect(document.title).toBe('MindPulse · Apoyo para estudiantes');
    act(() => {
      document.title = 'MindPulse';
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute('content', 'English');
    });
    await waitFor(() =>
      expect(document.title).toBe('MindPulse · Apoyo para estudiantes'),
    );
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute('content'),
    ).toBe('Apoyo de estudio en español.');
  });

  it('has localized public-page titles and descriptions for every language', () => {
    for (const language of ['en', 'ru', 'kk', 'es'] as const) {
      for (const page of [
        'privacy',
        'why',
        'beta',
        'case-study',
        'impact',
      ] as const) {
        const copy = publicPageCopyFor(page, language);
        expect(
          copy.metadataTitle.length,
          `${page}/${language} title`,
        ).toBeGreaterThan(3);
        expect(
          copy.metadataDescription.length,
          `${page}/${language} description`,
        ).toBeGreaterThan(30);
        if (language !== 'en') {
          expect(copy.metadataTitle).not.toBe(
            publicPageCopyFor(page, 'en').metadataTitle,
          );
          expect(copy.metadataDescription).not.toBe(
            publicPageCopyFor(page, 'en').metadataDescription,
          );
        }
      }
    }
  });
});
