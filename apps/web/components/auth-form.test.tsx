// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authCopyFor } from '@/lib/mindpulse/auth-i18n';
import { LANGUAGE_KEY } from '@/lib/mindpulse/local-store';
import { AuthForm } from './auth-form';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

describe('AuthForm localization', () => {
  it.each(['en', 'ru', 'kk', 'es'] as const)(
    'renders login and signup copy in %s without fallback',
    async (language) => {
      localStorage.setItem(LANGUAGE_KEY, JSON.stringify(language));
      const copy = authCopyFor(language);
      const { unmount } = render(<AuthForm mode="login" />);
      expect(
        await screen.findByRole('heading', { name: copy.loginTitle }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(copy.email)).toHaveAttribute(
        'placeholder',
        copy.emailPlaceholder,
      );
      expect(document.documentElement.lang).toBe(language);
      unmount();
      render(<AuthForm mode="signup" />);
      expect(
        await screen.findByRole('heading', { name: copy.signupTitle }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(copy.name)).toHaveAttribute(
        'placeholder',
        copy.namePlaceholder,
      );
    },
  );

  it('updates immediately, persists through remount, and keeps html.lang aligned', async () => {
    const { unmount } = render(<AuthForm mode="login" />);
    fireEvent.change(screen.getByLabelText('Language'), {
      target: { value: 'es' },
    });
    expect(
      await screen.findByRole('heading', {
        name: authCopyFor('es').loginTitle,
      }),
    ).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('es');
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe('"es"');
    unmount();
    render(<AuthForm mode="login" />);
    await waitFor(() =>
      expect(screen.getByLabelText('Idioma')).toHaveValue('es'),
    );
  });
});
