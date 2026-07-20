// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
  clearSessionCookie: vi.fn(),
  clearSessionCookieHeaders: vi.fn(() => [
    '__Host-mindpulse_session=; Path=/; Max-Age=0',
    'mindpulse_session=; Path=/; Max-Age=0',
  ]),
  invalidateSessionToken: vi.fn(),
  json: (body: unknown, status = 200) =>
    Response.json(body, {
      status,
      headers: { 'Cache-Control': 'no-store' },
    }),
  readSessionTokenFromCookie: vi.fn(),
  readTokenFromRequest: vi.fn(),
  requireDb: vi.fn(),
}));

vi.mock('@/lib/server/auth', () => authMocks);

import { POST } from './route';

afterEach(() => {
  vi.restoreAllMocks();
  for (const value of Object.values(authMocks)) {
    if (typeof value === 'function' && 'mockReset' in value) value.mockReset();
  }
  authMocks.clearSessionCookieHeaders.mockReturnValue([
    '__Host-mindpulse_session=; Path=/; Max-Age=0',
    'mindpulse_session=; Path=/; Max-Age=0',
  ]);
});

describe('/api/auth/logout POST', () => {
  it('invalidates the session and clears cookies', async () => {
    const db = {};
    authMocks.readTokenFromRequest.mockReturnValue('session-token-1234567890');
    authMocks.requireDb.mockResolvedValue(db);
    authMocks.invalidateSessionToken.mockResolvedValue(undefined);
    authMocks.clearSessionCookie.mockResolvedValue(undefined);

    const response = await POST(
      new Request('https://mindpulse.test/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: 'Bearer session-token-1234567890' },
      }),
    );
    const setCookie = response.headers.get('Set-Cookie');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(authMocks.readTokenFromRequest).toHaveBeenCalledWith(
      expect.any(Request),
    );
    expect(authMocks.invalidateSessionToken).toHaveBeenCalledWith(
      db,
      'session-token-1234567890',
    );
    expect(authMocks.clearSessionCookie).toHaveBeenCalled();
    expect(setCookie).toContain('__Host-mindpulse_session=');
    expect(setCookie).toContain('mindpulse_session=');
    expect(setCookie).toContain('Max-Age=0');
  });
});
