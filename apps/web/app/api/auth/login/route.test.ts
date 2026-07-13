// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
  authSuccessHtmlResponse: vi.fn(),
  clientIp: vi.fn(),
  createSession: vi.fn(),
  getAuthDb: vi.fn(),
  getUserBySessionToken: vi.fn(),
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
  sessionCookieHeaders: vi.fn(() => [
    '__Host-mindpulse_session=test; Path=/',
    'mindpulse_session=test; Path=/',
  ]),
  setSessionCookie: vi.fn(),
  validateEmail: vi.fn(() => true),
  verifyPassword: vi.fn(),
  hashPassword: vi.fn(async () => 'pbkdf2-sha256$100000$dummysalt$dummyhash'),
}));

const rateLimitMocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(() => true),
  checkRateLimitDurable: vi.fn(async () => true),
  hashedLimiterKey: vi.fn(async (scope: string) => `${scope}:hashed`),
}));

vi.mock('@/lib/server/auth', () => authMocks);
vi.mock('@/lib/server/rate-limit', () => rateLimitMocks);

import { POST } from './route';

function loginRequest() {
  return new Request('https://mindpulse.test/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student@example.com',
      password: 'password1234',
    }),
  });
}

function mockDb() {
  return {
    prepare: vi.fn(() => ({
      bind: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue({
        id: 'user-1',
        email: 'student@example.com',
        password_hash: 'hash',
        name: 'Student',
        created_at: '2026-01-01T00:00:00.000Z',
      }),
    })),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  for (const value of Object.values(authMocks)) {
    if (typeof value === 'function' && 'mockReset' in value) value.mockReset();
  }
  rateLimitMocks.checkRateLimit.mockReset();
  rateLimitMocks.checkRateLimitDurable.mockReset();
  rateLimitMocks.hashedLimiterKey.mockReset();
  rateLimitMocks.checkRateLimitDurable.mockResolvedValue(true);
  rateLimitMocks.hashedLimiterKey.mockImplementation(
    async (scope: string) => `${scope}:hashed`,
  );
  authMocks.hashPassword.mockResolvedValue(
    'pbkdf2-sha256$100000$dummysalt$dummyhash',
  );
  authMocks.clientIp.mockResolvedValue('127.0.0.1');
  authMocks.normalizeEmail.mockImplementation((email: string) =>
    email.trim().toLowerCase(),
  );
  authMocks.publicUser.mockImplementation((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.created_at,
  }));
  authMocks.sessionCookieHeaders.mockReturnValue([
    '__Host-mindpulse_session=test; Path=/',
    'mindpulse_session=test; Path=/',
  ]);
  authMocks.validateEmail.mockReturnValue(true);
  rateLimitMocks.checkRateLimit.mockReturnValue(true);
});

describe('/api/auth/login', () => {
  it('returns 503 without sessionToken if immediate session resolution fails', async () => {
    authMocks.clientIp.mockResolvedValue('127.0.0.1');
    authMocks.getAuthDb.mockResolvedValue(mockDb());
    authMocks.verifyPassword.mockResolvedValue(true);
    authMocks.createSession.mockResolvedValue({
      token: 'session-token-1234567890',
      expires: new Date('2030-01-01T00:00:00.000Z'),
    });
    authMocks.getUserBySessionToken.mockResolvedValue(null);

    const response = await POST(loginRequest());
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({ error: 'auth_unavailable' });
    expect(JSON.stringify(body)).not.toContain('session-token');
  });

  it('successful path returns user and sessionToken', async () => {
    authMocks.clientIp.mockResolvedValue('127.0.0.1');
    authMocks.getAuthDb.mockResolvedValue(mockDb());
    authMocks.verifyPassword.mockResolvedValue(true);
    authMocks.createSession.mockResolvedValue({
      token: 'session-token-1234567890',
      expires: new Date('2030-01-01T00:00:00.000Z'),
    });
    authMocks.getUserBySessionToken.mockResolvedValue({ id: 'user-1' });
    authMocks.setSessionCookie.mockResolvedValue(undefined);

    const response = await POST(loginRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      user: {
        id: 'user-1',
        email: 'student@example.com',
        name: 'Student',
      },
      sessionToken: 'session-token-1234567890',
    });
  });

  it('returns 429 when the durable rate limit is exceeded', async () => {
    authMocks.getAuthDb.mockResolvedValue(mockDb());
    rateLimitMocks.checkRateLimitDurable.mockResolvedValue(false);

    const response = await POST(loginRequest());
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: 'rate_limited' });
    expect(rateLimitMocks.hashedLimiterKey).toHaveBeenCalledWith(
      'login',
      '127.0.0.1',
    );
  });

  it('burns a dummy password verification for unknown emails (timing oracle)', async () => {
    const db = mockDb();
    db.prepare.mockReturnValue({
      bind: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue(null),
    });
    authMocks.getAuthDb.mockResolvedValue(db);
    authMocks.verifyPassword.mockResolvedValue(false);

    const response = await POST(loginRequest());
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: 'Invalid email or password',
    });
    // The dummy hash is still verified even though no user exists.
    expect(authMocks.verifyPassword).toHaveBeenCalledTimes(1);
    expect(authMocks.hashPassword).toHaveBeenCalled();
  });
});
