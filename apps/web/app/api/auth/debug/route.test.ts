// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
  getCurrentUserFromRequest: vi.fn(),
  json: (body: unknown, status = 200) =>
    Response.json(body, {
      status,
      headers: { 'Cache-Control': 'no-store' },
    }),
  readSessionTokenWithSourceFromRequest: vi.fn(),
}));

vi.mock('@/lib/server/auth', () => authMocks);

import { GET } from './route';

afterEach(() => {
  vi.restoreAllMocks();
  authMocks.getCurrentUserFromRequest.mockReset();
  authMocks.readSessionTokenWithSourceFromRequest.mockReset();
});

describe('/api/auth/debug', () => {
  it('returns safe booleans and never exposes token values', async () => {
    authMocks.readSessionTokenWithSourceFromRequest.mockReturnValueOnce({
      token: 'secret-session-token-1234567890',
      source: 'authorization',
    });
    authMocks.getCurrentUserFromRequest.mockResolvedValueOnce({
      id: 'user-1',
      email: 'student@example.com',
    });

    const response = await GET(
      new Request('https://mindpulse.test/api/auth/debug', {
        headers: {
          Authorization: 'Bearer secret-session-token-1234567890',
          Cookie:
            'mindpulse_session=legacy-token-1234567890; __Host-mindpulse_session=host-token-1234567890',
        },
      }),
    );
    const body = await response.json();
    const serialized = JSON.stringify(body);

    expect(response.status).toBe(200);
    expect(body).toEqual({
      hasAuthorizationBearer: true,
      hasCookieHeader: true,
      hasMindpulseSessionCookie: true,
      hasHostMindpulseSessionCookie: true,
      resolvedTokenSource: 'authorization',
      userResolved: true,
    });
    expect(serialized).not.toContain('secret-session-token');
    expect(serialized).not.toContain('legacy-token');
    expect(serialized).not.toContain('host-token');
    expect(serialized).not.toContain('student@example.com');
  });
});
