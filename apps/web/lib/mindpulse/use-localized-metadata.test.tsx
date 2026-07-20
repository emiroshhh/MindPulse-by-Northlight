// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { authCopyFor } from './auth-i18n';
import { copyFor, getToolsForLanguage } from './i18n';
import { landingCopyFor } from './marketing-i18n';
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

  it('has Spanish title and description sources for every required route', () => {
    const ui = copyFor('es');
    const auth = authCopyFor('es');
    const study = getToolsForLanguage('es').find(
      (tool) => tool.id === 'study',
    )!;
    const entries: Array<[string, string, string]> = [
      [
        'landing',
        'MindPulse · Apoyo para estudiantes',
        landingCopyFor('es').heroSubtitle,
      ],
      ['app', `${ui.navDashboard} · MindPulse`, ui.heroSubtitle],
      ['study', `${study.title} · MindPulse`, study.explanation],
      ['recovery', `${ui.recovery.eyebrow} · MindPulse`, ui.recovery.intro],
      ['login', `${auth.loginTitle} · MindPulse`, auth.loginIntro],
      ['signup', `${auth.signupTitle} · MindPulse`, auth.signupIntro],
      ...(['privacy', 'beta', 'case-study', 'impact'] as const).map((page) => {
        const copy = publicPageCopyFor(page, 'es');
        return [
          page,
          `${copy.metadataTitle} · MindPulse`,
          copy.metadataDescription,
        ] as [string, string, string];
      }),
    ];
    for (const [route, title, description] of entries) {
      expect(title, `${route} title`).toMatch(/[áéíóúñ¿]|Apoyo|MindPulse/i);
      expect(description.length, `${route} description length`).toBeGreaterThan(
        30,
      );
      expect(description, `${route} description`).not.toMatch(
        /An AI study and self-growth assistant/i,
      );
    }
  });
});
