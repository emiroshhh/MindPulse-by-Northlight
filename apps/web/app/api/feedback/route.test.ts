// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => {
  const inserted: unknown[][] = [];
  const prepare = vi.fn((query: string) => ({
    bind: (...values: unknown[]) => ({
      run: vi.fn(async () => {
        if (query.includes('INSERT INTO feedback')) inserted.push(values);
        return { success: true, meta: { changes: 1 } };
      }),
      first: vi.fn(async () => null),
    }),
  }));
  return {
    getAuthDb: vi.fn().mockResolvedValue({ prepare }),
    clientIp: vi.fn().mockResolvedValue('203.0.113.10'),
    secureId: vi.fn(() => 'fb-test-id'),
    json: (body: unknown, status = 200) =>
      Response.json(body, {
        status,
        headers: { 'Cache-Control': 'no-store' },
      }),
    prepare,
    inserted,
  };
});

const rateLimitMocks = vi.hoisted(() => ({
  checkRateLimitDurable: vi.fn(async () => true),
  hashedLimiterKey: vi.fn(async (scope: string) => `${scope}:hashed`),
}));

vi.mock('../../../lib/server/auth', () => authMocks);
vi.mock('../../../lib/server/rate-limit', () => rateLimitMocks);

import { GET, POST } from './route';

const validBody = {
  flow: 'planner',
  helped: true,
  confusing: false,
  matchedExpectation: null,
  suggestion: 'Add calendar sync',
  locale: 'en',
  deviceCategory: 'mobile',
  consent: true,
};

function request(body: unknown) {
  return new Request('http://localhost/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  authMocks.inserted.length = 0;
  rateLimitMocks.checkRateLimitDurable.mockResolvedValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('/api/feedback', () => {
  it('stores a valid anonymous submission', async () => {
    const response = await POST(request(validBody));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(authMocks.inserted).toHaveLength(1);
    const row = authMocks.inserted[0]!;
    // id, flow, helped, confusing, matched_expectation, suggestion, locale, device, created_at
    expect(row[1]).toBe('planner');
    expect(row[2]).toBe(1);
    expect(row[3]).toBe(0);
    expect(row[4]).toBeNull();
    expect(row[5]).toBe('Add calendar sync');
    // No user identifier anywhere in the row.
    expect(JSON.stringify(row)).not.toContain('203.0.113.10');
  });

  it('requires consent', async () => {
    const response = await POST(request({ ...validBody, consent: false }));
    expect(response.status).toBe(400);
    expect(authMocks.inserted).toHaveLength(0);
  });

  it('rejects unknown flows, locales, and device categories', async () => {
    for (const patch of [
      { flow: 'everything' },
      { locale: 'fr' },
      { deviceCategory: 'fridge' },
    ]) {
      const response = await POST(request({ ...validBody, ...patch }));
      expect(response.status).toBe(400);
    }
    expect(authMocks.inserted).toHaveLength(0);
  });

  it('caps the suggestion length at 500 characters', async () => {
    const response = await POST(
      request({ ...validBody, suggestion: 'x'.repeat(501) }),
    );
    expect(response.status).toBe(400);
    expect(authMocks.inserted).toHaveLength(0);
  });

  it('routes crisis suggestions to support content without storing them', async () => {
    const response = await POST(
      request({ ...validBody, suggestion: 'Я хочу умереть', locale: 'ru' }),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      crisis: boolean;
      reply: string;
      resources: unknown[];
    };
    expect(body.crisis).toBe(true);
    expect(body.reply).toContain('не экстренная служба');
    expect(body.resources.length).toBeGreaterThan(0);
    expect(authMocks.inserted).toHaveLength(0);
  });

  it('enforces the daily rate limit', async () => {
    rateLimitMocks.checkRateLimitDurable.mockResolvedValue(false);
    const response = await POST(request(validBody));
    expect(response.status).toBe(429);
    expect(authMocks.inserted).toHaveLength(0);
  });

  it('rejects non-POST methods', () => {
    expect(GET().status).toBe(405);
  });
});
