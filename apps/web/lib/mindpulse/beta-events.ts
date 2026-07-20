'use client';

import type { BetaEvent } from '@mindpulse/shared';

export const LAST_VISIT_KEY = 'mindpulse-last-visit-v1';

/** Fire-and-forget: measurement must never affect the user experience. */
export function sendBetaEvent(name: BetaEvent): void {
  try {
    void fetch('/api/events', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Ignore: no retry queue, no beacon fallback, no user impact.
  }
}

/**
 * Counts a voluntary repeat visit: fires only when a previous visit happened
 * on an earlier day. Stores only a local date stamp on the device.
 */
export function sendReturningVisitOnce(): void {
  if (typeof window === 'undefined') return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const last = window.localStorage.getItem(LAST_VISIT_KEY);
    window.localStorage.setItem(LAST_VISIT_KEY, today);
    if (last && last !== today) sendBetaEvent('returning_visit');
  } catch {
    // localStorage unavailable: skip measurement.
  }
}
