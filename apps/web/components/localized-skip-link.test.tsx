// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  LANGUAGE_KEY,
  setLanguagePreference,
} from '@/lib/mindpulse/local-store';
import { LanguageProvider } from './language-provider';
import { LocalizedSkipLink } from './localized-skip-link';

afterEach(cleanup);

describe('LocalizedSkipLink', () => {
  it('hydrates from English without mismatches, then synchronizes stored and live locale changes', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const cases = [
      ['es', 'Ir al contenido', 'es'],
      ['ru', 'Перейти к содержимому', 'ru'],
      ['kk', 'Мазмұнға өту', 'kk'],
      ['fr', 'Skip to content', 'en'],
    ] as const;

    for (const [stored, label, expectedLanguage] of cases) {
      localStorage.clear();
      localStorage.setItem(LANGUAGE_KEY, JSON.stringify(stored));
      document.documentElement.lang = 'en';
      const container = document.createElement('div');
      container.innerHTML =
        '<a href="#main-content" class="skip-link" lang="en">Skip to content</a>';
      document.body.append(container);

      // This is the no-JavaScript/delayed-JavaScript fallback emitted by SSR.
      expect(container.textContent).toBe('Skip to content');
      expect(document.documentElement.lang).toBe('en');

      let root: ReturnType<typeof hydrateRoot> | undefined;
      await act(async () => {
        root = hydrateRoot(
          container,
          <LanguageProvider>
            <LocalizedSkipLink />
          </LanguageProvider>,
        );
      });
      await waitFor(() => {
        expect(container).toHaveTextContent(label);
        expect(container.querySelector('a')).toHaveAttribute(
          'lang',
          expectedLanguage,
        );
        expect(document.documentElement.lang).toBe(expectedLanguage);
      });
      expect(root).toBeDefined();
      await act(async () => root!.unmount());
      expect(container).toBeEmptyDOMElement();
      container.remove();
    }

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();

    localStorage.clear();
    document.documentElement.lang = 'en';
    render(
      <LanguageProvider>
        <LocalizedSkipLink />
      </LanguageProvider>,
    );
    expect(await screen.findByText('Skip to content')).toBeInTheDocument();
    setLanguagePreference('es');
    expect(await screen.findByText('Ir al contenido')).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('es');
  });
});
