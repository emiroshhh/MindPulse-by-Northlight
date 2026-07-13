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
import { chatCopyFor } from '@/lib/mindpulse/i18n';
import { ChatPanel } from './chat-panel';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
});

function stubChatFetch(reply = 'Here is a small next step.') {
  const fetchMock = vi.fn().mockImplementation((url: string) => {
    if (String(url).includes('/api/chat')) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            reply,
            usage: {
              limit: 5,
              used: 1,
              remaining: 4,
              accountRequired: true,
            },
          }),
          { status: 200 },
        ),
      );
    }
    return Promise.resolve(new Response('{"plan":{}}', { status: 201 }));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('ChatPanel guided intake', () => {
  it('composes a structured first message from the intake fields', async () => {
    const fetchMock = stubChatFetch();
    render(
      <ChatPanel
        user={null}
        language="en"
        initialMode="study"
        fixedMode
        copy={chatCopyFor('en')}
      />,
    );

    // Guided start renders instead of the plain empty state.
    expect(await screen.findByText('Guided start')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('e.g. Quadratic functions'), {
      target: { value: 'Photosynthesis' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('e.g. I mix up the formula steps…'),
      { target: { value: 'Light vs dark reactions' } },
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Get my first answer' }),
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [, init] = fetchMock.mock.calls[0]!;
    const payload = JSON.parse(String(init?.body)) as { message: string };
    expect(payload.message).toContain('Subject or topic: Photosynthesis');
    expect(payload.message).toContain(
      'What feels confusing?: Light vs dark reactions',
    );
    // The intake form disappears once the conversation starts.
    await waitFor(() =>
      expect(screen.queryByText('Guided start')).not.toBeInTheDocument(),
    );
  });

  it('offers a save-result completion state after an assistant reply (guest)', async () => {
    stubChatFetch('A focused plan for you.');
    render(
      <ChatPanel
        user={null}
        language="en"
        initialMode="planner"
        fixedMode
        copy={chatCopyFor('en')}
      />,
    );
    fireEvent.change(
      await screen.findByPlaceholderText(
        'e.g. Math homework, essay draft, flashcards…',
      ),
      { target: { value: 'Essay and flashcards' } },
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Get my first answer' }),
    );

    const save = await screen.findByRole('button', {
      name: 'Save this result',
    });
    fireEvent.click(save);
    expect(
      await screen.findByText('Saved on this device ✓'),
    ).toBeInTheDocument();
    const stored = JSON.parse(
      localStorage.getItem('mindpulse-guest-tool-results-v1') ?? '[]',
    ) as Array<{ content: string; mode: string }>;
    expect(stored).toHaveLength(1);
    expect(stored[0]!.content).toBe('A focused plan for you.');
    expect(stored[0]!.mode).toBe('planner');
  });

  it('announces new messages via an aria-live log region', () => {
    render(
      <ChatPanel
        user={null}
        language="en"
        initialMode="study"
        fixedMode
        copy={chatCopyFor('en')}
      />,
    );
    const log = screen.getByRole('log');
    expect(log).toHaveAttribute('aria-live', 'polite');
  });
});
