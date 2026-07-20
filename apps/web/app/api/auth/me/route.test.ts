// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
  getCurrentUserFromRequest: vi.fn(),
  publicUser: vi.fn((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.created_at,
  })),
  json: (body: unknown, status = 200) =>
    Response.json(body, {
      status,
      headers: { 'Cache-Control': 'no-store' },
    }),
}));

vi.mock('@/lib/server/auth', () => authMocks);

import { GET } from './route';

const request = () =>
  new Request('https://mindpulse.test/api/auth/me', {
    headers: { cookie: 'mindpulse_session=test-session' },
  });

afterEach(() => {
  vi.restoreAllMocks();
  authMocks.getCurrentUserFromRequest.mockReset();
  authMocks.publicUser.mockClear();
});

describe('/api/auth/me', () => {
  it('returns the authenticated user from the request session', async () => {
    authMocks.getCurrentUserFromRequest.mockResolvedValueOnce({
      id: 'user-1',
      email: 'student@example.com',
      name: 'Student',
      created_at: '2026-01-01T00:00:00.000Z',
    });

    const response = await GET(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      user: {
        id: 'user-1',
        email: 'student@example.com',
        name: 'Student',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    });
    expect(authMocks.getCurrentUserFromRequest).toHaveBeenCalledWith(
      expect.any(Request),
    );
  });

  it('returns 401 when the request has no valid session', async () => {
    authMocks.getCurrentUserFromRequest.mockResolvedValueOnce(null);

    const response = await GET(request());

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ user: null });
  });
});
