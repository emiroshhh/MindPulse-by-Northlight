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
import { FeedbackModal } from './feedback-modal';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
});

function openModal(name = 'Share feedback') {
  fireEvent.click(screen.getByRole('button', { name }));
}

describe('FeedbackModal', () => {
  it('submits an in-app anonymous feedback form to /api/feedback', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);
    render(<FeedbackModal language="en" flow="dashboard" />);

    openModal();
    // Answer "helped?" with Yes.
    fireEvent.click(screen.getAllByRole('radio', { name: 'Yes' })[0]!);
    fireEvent.change(screen.getByPlaceholderText(/short suggestion/i), {
      target: { value: 'More examples please' },
    });

    const send = screen.getByRole('button', { name: 'Send feedback' });
    // Consent is required before sending.
    expect(send).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(send).toBeEnabled();
    fireEvent.click(send);

    await waitFor(() =>
      expect(screen.getByText('Thank you — genuinely.')).toBeInTheDocument(),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('/api/feedback');
    const payload = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(payload).toMatchObject({
      flow: 'dashboard',
      helped: true,
      suggestion: 'More examples please',
      locale: 'en',
      consent: true,
    });
    expect(['mobile', 'tablet', 'desktop']).toContain(payload.deviceCategory);
    // Nothing sensitive leaves the device.
    expect(Object.keys(payload).sort()).toEqual(
      [
        'confusing',
        'consent',
        'deviceCategory',
        'flow',
        'helped',
        'locale',
        'matchedExpectation',
        'suggestion',
      ].sort(),
    );
  });

  it('shows an error state when the API fails and allows retry', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'feedback_unavailable' }), {
          status: 503,
        }),
      ),
    );
    render(<FeedbackModal language="en" />);
    openModal();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Send feedback' }));
    await waitFor(() =>
      expect(
        screen.getByText(/could not be sent right now/i),
      ).toBeInTheDocument(),
    );
    // The form is still there for retry.
    expect(
      screen.getByRole('button', { name: 'Send feedback' }),
    ).toBeInTheDocument();
  });

  it('closes on Escape and restores focus to the opener', async () => {
    render(<FeedbackModal language="en" />);
    const opener = screen.getByRole('button', { name: 'Share feedback' });
    fireEvent.click(opener);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(opener).toHaveFocus();
  });

  it('uses localized Russian feedback copy', () => {
    render(<FeedbackModal language="ru" />);
    fireEvent.click(screen.getByRole('button', { name: 'Оставить отзыв' }));
    expect(
      screen.getByRole('heading', {
        name: 'Помоги сделать MindPulse полезнее',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Отправить отзыв' }),
    ).toBeInTheDocument();
  });
});
