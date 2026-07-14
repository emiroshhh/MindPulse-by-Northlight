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
import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyFor, getToolsForLanguage } from '@/lib/mindpulse/i18n';
import { NextActionCard } from './next-action-card';

const copy = copyFor('en').nextAction;
const tools = getToolsForLanguage('en');

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
});

function renderCard() {
  return render(<NextActionCard language="en" copy={copy} tools={tools} />);
}

describe('NextActionCard quick start', () => {
  it('suggests one next action and stores it on acceptance', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (String(url).includes('/api/chat')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ reply: 'Write three bullet points.' }),
            { status: 200 },
          ),
        );
      }
      return Promise.resolve(new Response('{}', { status: 200 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    renderCard();

    expect(
      await screen.findByText('Get one clear next action'),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Essay due Friday/), {
      target: { value: 'Essay due Friday, not started' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Suggest my next action' }),
    );
    expect(
      await screen.findByText('Write three bullet points.'),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Set as my next action/ }),
    );
    // The stored action becomes the primary card with a Done button.
    expect(await screen.findByText('Your next action')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Done/ })).toBeInTheDocument();
    const stored = JSON.parse(
      localStorage.getItem('mindpulse-next-action-v1') ?? 'null',
    ) as { text: string } | null;
    expect(stored?.text).toBe('Write three bullet points.');
    // First accepted action marks onboarding complete.
    expect(localStorage.getItem('mindpulse-onboarded-v1')).toBe('true');
  });

  it('completing the action clears it and celebrates', async () => {
    localStorage.setItem(
      'mindpulse-next-action-v1',
      JSON.stringify({
        text: 'Review chapter 3 for 10 minutes',
        mode: 'study',
        createdAt: new Date().toISOString(),
      }),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 200 })),
    );
    renderCard();
    fireEvent.click(await screen.findByRole('button', { name: /Done/ }));
    await waitFor(() =>
      expect(localStorage.getItem('mindpulse-next-action-v1')).toBe('null'),
    );
    expect(
      screen.getByText('Nice. One real step beats a perfect plan.'),
    ).toBeInTheDocument();
  });

  it('routes the recovery need to Recovery Mode instead of chat', async () => {
    renderCard();
    fireEvent.click(
      await screen.findByRole('radio', {
        name: 'I missed work and need to restart',
      }),
    );
    const link = screen.getByRole('link', {
      name: /I missed work and need to restart/,
    });
    expect(link).toHaveAttribute('href', '/recovery');
  });
});
