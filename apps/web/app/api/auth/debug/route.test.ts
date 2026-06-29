// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
  debugSessionResolution: vi.fn(),
  getCurrentUserFromRequest: vi.fn(),
  getAuthDb: vi.fn(),
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
  authMocks.debugSessionResolution.mockReset();
  authMocks.getCurrentUserFromRequest.mockReset();
  authMocks.getAuthDb.mockReset();
  authMocks.readSessionTokenWithSourceFromRequest.mockReset();
});

describe('/api/auth/debug', () => {
  it('returns safe booleans and never exposes token values', async () => {
    authMocks.readSessionTokenWithSourceFromRequest.mockReturnValueOnce({
      token: 'secret-session-token-1234567890',
      source: 'authorization',
    });
    authMocks.getAuthDb.mockResolvedValueOnce({});
    authMocks.debugSessionResolution.mockResolvedValueOnce({
      dbAvailable: true,
      sessionHashComputed: true,
      sessionTableChecked: true,
      sessionRowFound: true,
      sessionCountForDebugToken: true,
      sessionNotExpired: true,
      joinedUserFound: true,
      userResolved: true,
      nowIso: '2026-06-29T00:00:00.000Z',
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
      dbAvailable: true,
      sessionHashComputed: true,
      sessionRowFound: true,
      sessionNotExpired: true,
      joinedUserFound: true,
      sessionTableChecked: true,
      sessionCountForDebugToken: true,
      nowIso: '2026-06-29T00:00:00.000Z',
    });
    expect(serialized).not.toContain('secret-session-token');
    expect(serialized).not.toContain('legacy-token');
    expect(serialized).not.toContain('host-token');
    expect(serialized).not.toContain('student@example.com');
  });
});
