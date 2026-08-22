import { describe, expect, it } from 'vitest';
import { isBetaEvent, BETA_EVENTS } from '../src/events';

describe('isBetaEvent', () => {
  it('returns true for all defined beta events', () => {
    for (const event of BETA_EVENTS) {
      expect(isBetaEvent(event)).toBe(true);
    }
  });

  it('returns false for invalid string events', () => {
    expect(isBetaEvent('invalid_event')).toBe(false);
    expect(isBetaEvent('')).toBe(false);
    expect(isBetaEvent('onboarding_completed_123')).toBe(false);
  });

  it('returns false for non-string values', () => {
    expect(isBetaEvent(null)).toBe(false);
    expect(isBetaEvent(undefined)).toBe(false);
    expect(isBetaEvent(123)).toBe(false);
    expect(isBetaEvent({})).toBe(false);
    expect(isBetaEvent([])).toBe(false);
    expect(isBetaEvent(true)).toBe(false);
    expect(isBetaEvent(false)).toBe(false);
  });
});
