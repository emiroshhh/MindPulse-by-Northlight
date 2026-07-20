// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import { cleanup, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';
import { authCopyFor } from './auth-i18n';
import { chatCopyFor, copyFor, getToolsForLanguage } from './i18n';
import { landingCopyFor } from './marketing-i18n';
import {
  LANGUAGE_KEY,
  LANGUAGE_CHANGE_EVENT,
  applyDocumentLanguage,
  readJson,
  setLanguagePreference,
  writeJson,
} from './local-store';
import { PUBLIC_PAGES, publicPageCopyFor } from './public-page-i18n';
import { languages } from './tools';

describe('Spanish product localization', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
  });

  it('offers Español in the shared selector and persists it without hydration state', () => {
    expect(languages.map((language) => language.id)).toEqual([
      'en',
      'ru',
      'kk',
      'es',
    ]);
    expect(languages.at(-1)?.label).toBe('Español');
    writeJson(LANGUAGE_KEY, 'es');
    expect(readJson(LANGUAGE_KEY, 'en')).toBe('es');
    applyDocumentLanguage('es');
    expect(document.documentElement.lang).toBe('es');
  });

  it('contains the required Spanish characters and natural punctuation', () => {
    const serialized = JSON.stringify({
      ui: copyFor('es'),
      chat: chatCopyFor('es'),
      landing: landingCopyFor('es'),
      tools: getToolsForLanguage('es'),
    });
    for (const character of ['á', 'é', 'í', 'ó', 'ú', 'ñ', '¿', '¡']) {
      expect(serialized).toContain(character);
    }
    expect(serialized).toMatch(/ü/i);
  });

  it('localizes rate limits, feedback, and account deletion', () => {
    const ui = copyFor('es');
    expect(ui.nextAction.limitGuest).toContain('límite gratuito');
    expect(ui.feedback.rateLimited).toContain('Vuelve mañana');
    expect(ui.account.deleteTitle).toBe('¿Quieres eliminar tu cuenta?');
    expect(ui.account.deleteWarning.toLowerCase()).toContain(
      'no se puede deshacer',
    );
    expect(ui.account.confirmDelete).toBe('Eliminar permanentemente');
  });

  it('pluralizes live chat usage in every locale', () => {
    expect(chatCopyFor('en').usageRemaining(1)).toBe('1 left today');
    expect(chatCopyFor('ru').usageRemaining(2)).toContain('2');
    expect(chatCopyFor('kk').usageRemaining(3)).toContain('3');
    expect(chatCopyFor('es').usageRemaining(1)).toBe('Te queda 1 hoy');
    expect(chatCopyFor('es').usageRemaining(2)).toBe('Te quedan 2 hoy');
  });

  it('announces same-tab language changes without changing lang before localized content commits', () => {
    const listener = vi.fn();
    window.addEventListener(LANGUAGE_CHANGE_EVENT, listener);
    setLanguagePreference('es');
    expect(document.documentElement.lang).toBe('en');
    expect(readJson(LANGUAGE_KEY, 'en')).toBe('es');
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, listener);
  });

  it('localizes login and signup states', () => {
    const auth = authCopyFor('es');
    expect(auth.login).toBe('Iniciar sesión');
    expect(auth.signup).toBe('Crear cuenta gratuita');
    expect(auth.loginError).toContain('contraseña');
    expect(auth.passwordPlaceholder).toContain('10 caracteres');
  });

  it('provides complete auth copy without English fallback in all locales', () => {
    expect(authCopyFor('ru').loginTitle).toBe('С возвращением');
    expect(authCopyFor('kk').languageLabel).toBe('Тіл');
    expect(authCopyFor('es').emailPlaceholder).toBe('tu@ejemplo.com');
    expect(authCopyFor('ru')).not.toBe(authCopyFor('en'));
    expect(authCopyFor('kk')).not.toBe(authCopyFor('en'));
  });

  it('provides Spanish copy and an accessible Russian/Kazakh English fallback for every long-form page', async () => {
    for (const page of Object.keys(PUBLIC_PAGES) as Array<
      keyof typeof PUBLIC_PAGES
    >) {
      const copy = publicPageCopyFor(page, 'es');
      expect(copy.metadataTitle.length).toBeGreaterThan(3);
      expect(copy.metadataDescription.length).toBeGreaterThan(30);
      expect(copy.title.length).toBeGreaterThan(10);
      expect(copy.intro.length).toBeGreaterThan(40);
      expect(copy.sections.length).toBeGreaterThanOrEqual(5);
      expect(copy.sections.every((section) => section.body.length > 20)).toBe(
        true,
      );
    }
    expect(publicPageCopyFor('privacy', 'es').metadataTitle).toBe('Privacidad');
    expect(publicPageCopyFor('case-study', 'es').metadataTitle).toBe(
      'Caso de estudio',
    );

    for (const language of ['ru', 'kk'] as const) {
      for (const page of Object.keys(PUBLIC_PAGES) as Array<
        keyof typeof PUBLIC_PAGES
      >) {
        cleanup();
        localStorage.setItem(LANGUAGE_KEY, JSON.stringify(language));
        document.documentElement.lang = 'en';
        document.head.innerHTML =
          '<title>MindPulse</title><meta name="description" content="English">';
        const { container } = render(
          React.createElement(LocalizedPublicPage, { page }),
        );
        const englishCopy = publicPageCopyFor(page, 'en');
        await waitFor(() => {
          expect(document.documentElement.lang).toBe('en');
          expect(container.firstElementChild).toHaveAttribute('lang', language);
          expect(
            container.querySelector('main > div[lang="en"]'),
          ).not.toBeNull();
          expect(container.querySelector('h1')).toHaveTextContent(
            englishCopy.title,
          );
          expect(document.title).toBe(
            `${englishCopy.metadataTitle} · MindPulse`,
          );
          expect(
            document.querySelector('meta[name="description"]'),
          ).toHaveAttribute('content', englishCopy.metadataDescription);
        });
      }
    }
    cleanup();
  });

  it('keeps layout-sensitive selectors and controls safe at 320 px', () => {
    const files = [
      'components/landing-page.tsx',
      'components/dashboard-app.tsx',
      'components/mindpulse/tool-page.tsx',
      'components/recovery/recovery-flow.tsx',
      'components/mindpulse/localized-public-page.tsx',
    ];
    for (const file of files) {
      const source = readFileSync(path.resolve(process.cwd(), file), 'utf8');
      expect(source, file).toContain('flex-wrap');
      expect(source, file).toContain('min-h-11');
    }
    const publicPage = readFileSync(
      path.resolve(
        process.cwd(),
        'components/mindpulse/localized-public-page.tsx',
      ),
      'utf8',
    );
    expect(publicPage).toContain('overflow-x-hidden');
    expect(publicPage).toContain('break-words');

    const layout = readFileSync(
      path.resolve(process.cwd(), 'app/layout.tsx'),
      'utf8',
    );
    expect(layout).toContain('<html lang="en">');
    expect(layout).not.toContain('dangerouslySetInnerHTML');
    expect(layout).not.toContain('suppressHydrationWarning');

    const languageHook = readFileSync(
      path.resolve(process.cwd(), 'lib/mindpulse/use-language-preference.ts'),
      'utf8',
    );
    expect(languageHook).toContain('useLayoutEffect');
  });
});
