// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import {
  checkRateLimit,
  checkRateLimitDurable,
  hashedLimiterKey,
} from './rate-limit';

function mockDb(changesSequence: number[]) {
  let call = 0;
  const run = vi.fn(async () => ({
    meta: {
      changes: changesSequence[Math.min(call++, changesSequence.length - 1)]!,
    },
  }));
  const bind = vi.fn((...values: unknown[]) => {
    void values;
    return { run };
  });
  const prepare = vi.fn((query: string) => {
    void query;
    return { bind };
  });
  return { prepare, run, bind };
}

describe('checkRateLimitDurable', () => {
  it('allows requests while the upsert reports changes', async () => {
    const db = mockDb([1, 1, 0]);
    expect(await checkRateLimitDurable(db, 'login:a', 2, 60_000)).toBe(true);
    expect(await checkRateLimitDurable(db, 'login:a', 2, 60_000)).toBe(true);
    expect(await checkRateLimitDurable(db, 'login:a', 2, 60_000)).toBe(false);
  });

  it('binds the key and limit into a parameterized statement', async () => {
    const db = mockDb([1]);
    await checkRateLimitDurable(db, 'signup:key', 5, 60_000);
    expect(db.prepare.mock.calls[0]![0]).toContain('INSERT INTO rate_limits');
    expect(db.bind.mock.calls[0]![0]).toBe('signup:key');
    expect(db.bind.mock.calls[0]![3]).toBe(5);
  });

  it('falls back to the in-memory limiter when D1 fails', async () => {
    const db = {
      prepare: vi.fn(() => {
        throw new Error('d1 unavailable');
      }),
    };
    // In-memory fallback still enforces the limit within this process.
    expect(await checkRateLimitDurable(db, 'fb-test', 2, 60_000)).toBe(true);
    expect(await checkRateLimitDurable(db, 'fb-test', 2, 60_000)).toBe(true);
    expect(await checkRateLimitDurable(db, 'fb-test', 2, 60_000)).toBe(false);
  });
});

describe('checkRateLimit (in-memory)', () => {
  it('enforces the limit within a window', () => {
    expect(checkRateLimit('mem-test', 2, 60_000)).toBe(true);
    expect(checkRateLimit('mem-test', 2, 60_000)).toBe(true);
    expect(checkRateLimit('mem-test', 2, 60_000)).toBe(false);
  });
});

describe('hashedLimiterKey', () => {
  it('never embeds the raw value (e.g. an IP) in the key', async () => {
    const key = await hashedLimiterKey('login', '203.0.113.10');
    expect(key.startsWith('login:')).toBe(true);
    expect(key).not.toContain('203.0.113.10');
    expect(key.length).toBeLessThan(48);
    // Deterministic so the same caller maps to the same bucket.
    expect(await hashedLimiterKey('login', '203.0.113.10')).toBe(key);
  });
});
