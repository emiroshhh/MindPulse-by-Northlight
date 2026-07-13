// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  LAST_VISIT_KEY,
  sendBetaEvent,
  sendReturningVisitOnce,
} from './beta-events';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
});

function stubFetch() {
  const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}'));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('sendBetaEvent', () => {
  it('posts the event name to /api/events', () => {
    const fetchMock = stubFetch();
    sendBetaEvent('action_completed');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('/api/events');
    expect(JSON.parse(String(init?.body))).toEqual({
      name: 'action_completed',
    });
  });
});

describe('sendReturningVisitOnce', () => {
  it('does not fire on the first ever visit', () => {
    const fetchMock = stubFetch();
    sendReturningVisitOnce();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(localStorage.getItem(LAST_VISIT_KEY)).toBeTruthy();
  });

  it('does not fire twice on the same day', () => {
    const fetchMock = stubFetch();
    sendReturningVisitOnce();
    sendReturningVisitOnce();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fires once when the previous visit was an earlier day', () => {
    const fetchMock = stubFetch();
    localStorage.setItem(LAST_VISIT_KEY, '2026-01-01');
    sendReturningVisitOnce();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(fetchMock.mock.calls[0]![1]?.body))).toEqual({
      name: 'returning_visit',
    });
    // The stamp is updated so a second call today does nothing.
    sendReturningVisitOnce();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
