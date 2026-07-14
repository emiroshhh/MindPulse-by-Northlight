// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const deletedStatements: string[] = [];
  const prepare = vi.fn((query: string) => ({
    bind: (..._values: unknown[]) => ({
      run: vi.fn(async () => {
        if (query.startsWith('DELETE')) deletedStatements.push(query);
        return { success: true, meta: { changes: 1 } };
      }),
      first: vi.fn(async () => {
        if (query.includes('SELECT password_hash')) {
          return { password_hash: 'stored-hash' };
        }
        return null;
      }),
      all: vi.fn(async () => ({ success: true, results: [] })),
    }),
  }));
  return {
    getCurrentUserFromRequest: vi.fn(),
    getAuthDb: vi.fn().mockResolvedValue({ prepare }),
    verifyPassword: vi.fn(),
    clearSessionCookieHeaders: () => [
      'mindpulse_session=; Max-Age=0; Path=/',
      '__Host-mindpulse_session=; Max-Age=0; Path=/; Secure',
    ],
    json: (body: unknown, status = 200) =>
      Response.json(body, {
        status,
        headers: { 'Cache-Control': 'no-store' },
      }),
    prepare,
    deletedStatements,
  };
});

vi.mock('@/lib/server/auth', () => mocks);
vi.mock('@/lib/server/rate-limit', () => ({
  checkRateLimitDurable: vi.fn().mockResolvedValue(true),
  hashedLimiterKey: vi.fn().mockResolvedValue('delete-account:abc'),
}));

import { GET, POST } from './route';
import { checkRateLimitDurable } from '@/lib/server/rate-limit';

const request = (body: unknown) =>
  new Request('http://localhost/api/auth/delete-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  mocks.getCurrentUserFromRequest.mockResolvedValue({
    id: 'user-1',
    email: 'student@example.com',
    name: 'Student',
    created_at: '2026-01-01T00:00:00.000Z',
  });
  mocks.getAuthDb.mockResolvedValue({ prepare: mocks.prepare });
  mocks.verifyPassword.mockResolvedValue(true);
  vi.mocked(checkRateLimitDurable).mockResolvedValue(true);
  mocks.deletedStatements.length = 0;
});

afterEach(() => {
  mocks.getCurrentUserFromRequest.mockReset();
  mocks.verifyPassword.mockReset();
});

describe('/api/auth/delete-account', () => {
  it('requires authentication', async () => {
    mocks.getCurrentUserFromRequest.mockResolvedValue(null);
    const response = await POST(request({ password: 'correct-password' }));
    expect(response.status).toBe(401);
    expect(mocks.deletedStatements).toHaveLength(0);
  });

  it('rejects a wrong password without deleting anything', async () => {
    mocks.verifyPassword.mockResolvedValue(false);
    const response = await POST(request({ password: 'wrong' }));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'invalid_password' });
    expect(mocks.deletedStatements).toHaveLength(0);
  });

  it('deletes every user-owned table and clears both cookies', async () => {
    const response = await POST(request({ password: 'correct-password' }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(mocks.deletedStatements).toEqual([
      'DELETE FROM chat_messages WHERE user_id = ?',
      'DELETE FROM agent_tasks WHERE user_id = ?',
      'DELETE FROM user_preferences WHERE user_id = ?',
      'DELETE FROM daily_usage WHERE user_id = ?',
      'DELETE FROM sessions WHERE user_id = ?',
      'DELETE FROM users WHERE id = ?',
    ]);
    const cookies = response.headers.getSetCookie?.() ?? [];
    expect(cookies.join(';')).toContain('mindpulse_session=');
    expect(cookies.join(';')).toContain('__Host-mindpulse_session=');
  });

  it('rejects other methods', () => {
    expect(GET().status).toBe(405);
  });
});
