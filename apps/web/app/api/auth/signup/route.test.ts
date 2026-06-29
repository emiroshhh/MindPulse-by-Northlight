// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
  authSuccessHtmlResponse: vi.fn(),
  clientIp: vi.fn(),
  createSession: vi.fn(),
  getAuthDb: vi.fn(),
  getUserBySessionToken: vi.fn(),
  hashPassword: vi.fn(),
  json: (body: unknown, status = 200) =>
    Response.json(body, {
      status,
      headers: { 'Cache-Control': 'no-store' },
    }),
  normalizeEmail: vi.fn((email: string) => email.trim().toLowerCase()),
  publicUser: vi.fn((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.created_at,
  })),
  secureId: vi.fn(() => 'user-1'),
  sessionCookieHeaders: vi.fn(() => [
    '__Host-mindpulse_session=test; Path=/',
    'mindpulse_session=test; Path=/',
  ]),
  setSessionCookie: vi.fn(),
  validateEmail: vi.fn(() => true),
  validatePassword: vi.fn(() => true),
}));

const rateLimitMocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(() => true),
}));

vi.mock('@/lib/server/auth', () => authMocks);
vi.mock('@/lib/server/rate-limit', () => rateLimitMocks);

import { POST } from './route';

function signupRequest() {
  return new Request('https://mindpulse.test/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student@example.com',
      password: 'password1234',
      name: 'Student',
    }),
  });
}

function mockSignupDb() {
  return {
    prepare: vi.fn((query: string) => ({
      bind: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue(
        query.includes('SELECT id FROM users') ? null : undefined,
      ),
      run: vi.fn().mockResolvedValue({ success: true }),
    })),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  for (const value of Object.values(authMocks)) {
    if (typeof value === 'function' && 'mockReset' in value) value.mockReset();
  }
  rateLimitMocks.checkRateLimit.mockReset();
  authMocks.clientIp.mockResolvedValue('127.0.0.1');
  authMocks.hashPassword.mockResolvedValue('password-hash');
  authMocks.normalizeEmail.mockImplementation((email: string) =>
    email.trim().toLowerCase(),
  );
  authMocks.publicUser.mockImplementation((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.created_at,
  }));
  authMocks.secureId.mockReturnValue('user-1');
  authMocks.sessionCookieHeaders.mockReturnValue([
    '__Host-mindpulse_session=test; Path=/',
    'mindpulse_session=test; Path=/',
  ]);
  authMocks.validateEmail.mockReturnValue(true);
  authMocks.validatePassword.mockReturnValue(true);
  rateLimitMocks.checkRateLimit.mockReturnValue(true);
});

describe('/api/auth/signup', () => {
  it('returns 503 without sessionToken if immediate session resolution fails', async () => {
    authMocks.clientIp.mockResolvedValue('127.0.0.1');
    authMocks.getAuthDb.mockResolvedValue(mockSignupDb());
    authMocks.hashPassword.mockResolvedValue('password-hash');
    authMocks.createSession.mockResolvedValue({
      token: 'session-token-1234567890',
      expires: new Date('2030-01-01T00:00:00.000Z'),
    });
    authMocks.getUserBySessionToken.mockResolvedValue(null);

    const response = await POST(signupRequest());
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({ error: 'auth_unavailable' });
    expect(JSON.stringify(body)).not.toContain('session-token');
  });

  it('successful path returns user and sessionToken', async () => {
    authMocks.clientIp.mockResolvedValue('127.0.0.1');
    authMocks.getAuthDb.mockResolvedValue(mockSignupDb());
    authMocks.hashPassword.mockResolvedValue('password-hash');
    authMocks.createSession.mockResolvedValue({
      token: 'session-token-1234567890',
      expires: new Date('2030-01-01T00:00:00.000Z'),
    });
    authMocks.getUserBySessionToken.mockResolvedValue({ id: 'user-1' });
    authMocks.setSessionCookie.mockResolvedValue(undefined);

    const response = await POST(signupRequest());
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      user: {
        id: 'user-1',
        email: 'student@example.com',
        name: 'Student',
      },
      sessionToken: 'session-token-1234567890',
    });
  });
});
