// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => {
  const counters = new Map<string, number>();
  const prepare = vi.fn((query: string) => ({
    bind: (...values: unknown[]) => ({
      run: vi.fn(async () => {
        if (query.includes('INSERT INTO events')) {
          const key = `${values[0]}:${values[1]}`;
          counters.set(key, (counters.get(key) ?? 0) + 1);
        }
        return { success: true, meta: { changes: 1 } };
      }),
    }),
  }));
  return {
    getAuthDb: vi.fn().mockResolvedValue({ prepare }),
    clientIp: vi.fn().mockResolvedValue('203.0.113.10'),
    json: (body: unknown, status = 200) =>
      Response.json(body, {
        status,
        headers: { 'Cache-Control': 'no-store' },
      }),
    prepare,
    counters,
  };
});

const rateLimitMocks = vi.hoisted(() => ({
  checkRateLimitDurable: vi.fn(async () => true),
  hashedLimiterKey: vi.fn(async (scope: string) => `${scope}:hashed`),
}));

vi.mock('../../../lib/server/auth', () => authMocks);
vi.mock('../../../lib/server/rate-limit', () => rateLimitMocks);

import { GET, POST } from './route';

function request(body: unknown) {
  return new Request('http://localhost/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  authMocks.counters.clear();
  rateLimitMocks.checkRateLimitDurable.mockResolvedValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('/api/events', () => {
  it('increments an allowlisted counter', async () => {
    const response = await POST(request({ name: 'returning_visit' }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    const day = new Date().toISOString().slice(0, 10);
    expect(authMocks.counters.get(`returning_visit:${day}`)).toBe(1);
  });

  it('rejects names outside the allowlist', async () => {
    for (const name of ['page_view', 'DROP TABLE events', '', 42, null]) {
      const response = await POST(request({ name }));
      expect(response.status).toBe(400);
    }
    expect(authMocks.counters.size).toBe(0);
  });

  it('enforces the daily rate limit', async () => {
    rateLimitMocks.checkRateLimitDurable.mockResolvedValue(false);
    const response = await POST(request({ name: 'returning_visit' }));
    expect(response.status).toBe(429);
    expect(authMocks.counters.size).toBe(0);
  });

  it('rejects non-POST methods', () => {
    expect(GET().status).toBe(405);
  });
});
