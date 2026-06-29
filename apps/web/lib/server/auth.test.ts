// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  authSuccessHtmlResponse,
  clearSessionCookieHeader,
  clearSessionCookieHeaders,
  createSession,
  debugSessionResolution,
  getUserBySessionToken,
  logoutSuccessHtmlResponse,
  readSessionTokenFromRequest,
  readTokenFromRequest,
  sessionCookieHeader,
  sessionCookieHeaders,
  type AuthUser,
  type D1DatabaseLike,
} from './auth';

function makeSessionDb(options: {
  user?: AuthUser;
  expiresAt?: string;
}): D1DatabaseLike {
  const sessions = new Map<
    string,
    { userId: string; sessionHash: string; expiresAt: string }
  >();
  const user = options.user ?? {
    id: 'user-1',
    email: 'student@example.com',
    name: 'Student',
    created_at: '2026-01-01T00:00:00.000Z',
  };
  return {
    prepare(query: string) {
      const statement = {
        values: [] as unknown[],
        bind(...values: unknown[]) {
          this.values = values;
          return this;
        },
        async first<T>() {
          if (query.includes('FROM sessions') && query.includes('JOIN users')) {
            const [sessionHash, nowIso] = this.values as [string, string];
            const session = sessions.get(sessionHash);
            if (
              !session ||
              session.expiresAt <= nowIso ||
              session.userId !== user.id ||
              !options.user
            )
              return null;
            return user as T;
          }
          if (
            query.includes('FROM sessions') &&
            query.includes('WHERE session_hash')
          ) {
            if (query.includes('SELECT 1 AS found')) {
              const [sessionHash] = this.values as [string];
              return sessions.has(sessionHash) ? ({ found: 1 } as T) : null;
            }
            const [nowIso, sessionHash] = this.values as [string, string];
            const session = sessions.get(sessionHash);
            if (!session) return null;
            return {
              user_id: session.userId,
              expires_at: session.expiresAt,
              not_expired: session.expiresAt > nowIso ? 1 : 0,
            } as T;
          }
          if (query.includes('FROM users')) {
            const [userId] = this.values as [string];
            return options.user && userId === user.id ? (user as T) : null;
          }
          return null;
        },
        async all() {
          return { success: true, results: [] };
        },
        async run() {
          if (query.includes('INSERT INTO sessions')) {
            const [, userId, sessionHash, , expiresAt] = this.values as [
              string,
              string,
              string,
              string,
              string,
            ];
            sessions.set(sessionHash, {
              userId,
              sessionHash,
              expiresAt: options.expiresAt ?? expiresAt,
            });
          }
          return { success: true };
        },
      };
      return statement;
    },
  };
}

describe('sessionCookieHeader', () => {
  const token = 'test-token-abc123';
  const expires = new Date('2030-01-01T00:00:00.000Z');
  const header = sessionCookieHeader(token, expires);

  it('includes the encoded token as the cookie value', () => {
    expect(header).toContain(`mindpulse_session=${encodeURIComponent(token)}`);
  });

  it('includes HttpOnly', () => {
    expect(header).toContain('HttpOnly');
  });

  it('includes Secure', () => {
    expect(header).toContain('Secure');
  });

  it('includes SameSite=Lax', () => {
    expect(header).toContain('SameSite=Lax');
  });

  it('includes Path=/', () => {
    expect(header).toContain('Path=/');
  });

  it('includes Expires with a future UTC date', () => {
    expect(header).toContain('Expires=');
    expect(header).toContain('2030');
  });

  it('does not include Max-Age=0', () => {
    expect(header).not.toContain('Max-Age=0');
  });
});

describe('clearSessionCookieHeader', () => {
  const header = clearSessionCookieHeader();

  it('sets the cookie value to empty string', () => {
    expect(header).toMatch(/^mindpulse_session=;|^mindpulse_session=$/m);
  });

  it('includes Max-Age=0', () => {
    expect(header).toContain('Max-Age=0');
  });

  it('includes Expires in 1970', () => {
    expect(header).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  });

  it('includes HttpOnly', () => {
    expect(header).toContain('HttpOnly');
  });

  it('includes Secure', () => {
    expect(header).toContain('Secure');
  });

  it('includes SameSite=Lax', () => {
    expect(header).toContain('SameSite=Lax');
  });

  it('includes Path=/', () => {
    expect(header).toContain('Path=/');
  });
});

describe('sessionCookieHeaders', () => {
  const token = 'test-token-abc123';
  const expires = new Date('2030-01-01T00:00:00.000Z');
  const headers = sessionCookieHeaders(token, expires);

  it('sets both legacy and host-prefixed cookie names', () => {
    expect(headers).toHaveLength(2);
    expect(headers[0]).toContain('__Host-mindpulse_session=');
    expect(headers[1]).toContain('mindpulse_session=');
  });

  it('keeps the __Host cookie host-only compatible', () => {
    expect(headers[0]).toContain('Secure');
    expect(headers[0]).toContain('Path=/');
    expect(headers[0]).not.toContain('Domain=');
  });
});

describe('clearSessionCookieHeaders', () => {
  const headers = clearSessionCookieHeaders();

  it('clears both legacy and host-prefixed cookie names', () => {
    expect(headers).toHaveLength(2);
    expect(headers[0]).toContain('__Host-mindpulse_session=');
    expect(headers[1]).toContain('mindpulse_session=');
    for (const header of headers) expect(header).toContain('Max-Age=0');
  });
});

describe('readTokenFromRequest', () => {
  it('reads a Bearer token', () => {
    const request = new Request('https://mindpulse.test/api/auth/me', {
      headers: { Authorization: 'Bearer bearer-token-1234567890' },
    });

    expect(readSessionTokenFromRequest(request)).toBe(
      'bearer-token-1234567890',
    );
  });

  it('lets a Bearer token win over cookies', () => {
    const request = new Request('https://mindpulse.test/api/auth/me', {
      headers: {
        Authorization: 'Bearer bearer-token-1234567890',
        Cookie: '__Host-mindpulse_session=host-token-1234567890',
      },
    });

    expect(readSessionTokenFromRequest(request)).toBe(
      'bearer-token-1234567890',
    );
  });

  it('ignores invalid short Bearer tokens', () => {
    const request = new Request('https://mindpulse.test/api/auth/me', {
      headers: {
        Authorization: 'Bearer short',
        Cookie: '__Host-mindpulse_session=host-token-1234567890',
      },
    });

    expect(readSessionTokenFromRequest(request)).toBe(
      'host-token-1234567890',
    );
  });

  it('prefers the host-prefixed session cookie', () => {
    const request = new Request('https://mindpulse.test/api/auth/me', {
      headers: {
        Cookie: [
          'mindpulse_session=legacy-token-1234567890',
          '__Host-mindpulse_session=host-token-1234567890',
        ].join('; '),
      },
    });

    expect(readTokenFromRequest(request)).toBe('host-token-1234567890');
  });

  it('falls back to the legacy session cookie', () => {
    const request = new Request('https://mindpulse.test/api/auth/me', {
      headers: { Cookie: 'mindpulse_session=legacy-token-1234567890' },
    });

    expect(readTokenFromRequest(request)).toBe('legacy-token-1234567890');
  });
});

describe('authSuccessHtmlResponse', () => {
  it('returns a 200 HTML response and appends Set-Cookie headers', () => {
    const response = authSuccessHtmlResponse(
      ['__Host-mindpulse_session=abc; Path=/', 'mindpulse_session=abc; Path=/'],
      '/app',
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/html');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Location')).toBeNull();
    const setCookie = response.headers.get('Set-Cookie');
    expect(setCookie).toContain('__Host-mindpulse_session=abc');
    expect(setCookie).toContain('mindpulse_session=abc');
  });

  it('can store the fallback token without putting it in a URL', async () => {
    const response = authSuccessHtmlResponse([], '/app', 'token-1234567890-abc');
    const html = await response.text();

    expect(html).toContain("localStorage.setItem('mindpulse_session_token'");
    expect(html).toContain('token-1234567890-abc');
    expect(html).toContain('window.location.replace("/app")');
    expect(html).not.toContain('/app?');
  });
});

describe('logoutSuccessHtmlResponse', () => {
  it('clears the localStorage fallback token in the HTML response', async () => {
    const response = logoutSuccessHtmlResponse(clearSessionCookieHeaders());
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain(
      "localStorage.removeItem('mindpulse_session_token')",
    );
    expect(html).toContain("window.location.replace('/')");
  });
});

describe('session DB resolution', () => {
  const previousSecret = process.env.SESSION_SECRET;

  it('resolves a Bearer token when D1 has the matching session hash', async () => {
    process.env.SESSION_SECRET = 'x'.repeat(40);
    const db = makeSessionDb({
      user: {
        id: 'user-1',
        email: 'student@example.com',
        name: 'Student',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    });
    const session = await createSession(db, 'user-1');

    await expect(getUserBySessionToken(db, session.token)).resolves.toMatchObject({
      id: 'user-1',
    });

    process.env.SESSION_SECRET = previousSecret;
  });

  it('debug helper reports a valid session row and joined user', async () => {
    process.env.SESSION_SECRET = 'x'.repeat(40);
    const db = makeSessionDb({
      user: {
        id: 'user-1',
        email: 'student@example.com',
        name: 'Student',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    });
    const session = await createSession(db, 'user-1');

    await expect(debugSessionResolution(db, session.token)).resolves.toMatchObject({
      sessionHashComputed: true,
      sessionTableChecked: true,
      sessionRowFound: true,
      sessionNotExpired: true,
      joinedUserFound: true,
      userResolved: true,
    });

    process.env.SESSION_SECRET = previousSecret;
  });

  it('debug helper reports expired sessions without resolving a user', async () => {
    process.env.SESSION_SECRET = 'x'.repeat(40);
    const db = makeSessionDb({
      user: {
        id: 'user-1',
        email: 'student@example.com',
        name: 'Student',
        created_at: '2026-01-01T00:00:00.000Z',
      },
      expiresAt: '2020-01-01T00:00:00.000Z',
    });
    const session = await createSession(db, 'user-1');

    await expect(debugSessionResolution(db, session.token)).resolves.toMatchObject({
      sessionRowFound: true,
      sessionNotExpired: false,
      userResolved: false,
    });

    process.env.SESSION_SECRET = previousSecret;
  });

  it('debug helper reports no row for an invalid token', async () => {
    process.env.SESSION_SECRET = 'x'.repeat(40);
    const db = makeSessionDb({
      user: {
        id: 'user-1',
        email: 'student@example.com',
        name: 'Student',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    });

    await expect(
      debugSessionResolution(db, 'invalid-token-1234567890'),
    ).resolves.toMatchObject({
      sessionHashComputed: true,
      sessionTableChecked: true,
      sessionRowFound: false,
      userResolved: false,
    });

    process.env.SESSION_SECRET = previousSecret;
  });

  it('createSession throws if insert cannot be selected back by session_hash', async () => {
    process.env.SESSION_SECRET = 'x'.repeat(40);
    const db: D1DatabaseLike = {
      prepare(query: string) {
        return {
          bind() {
            return this;
          },
          async first<T>() {
            if (query.includes('SELECT 1 AS found')) return null;
            return null as T | null;
          },
          async all() {
            return { success: true, results: [] };
          },
          async run() {
            return { success: true, meta: { changes: 1 } };
          },
        };
      },
    };

    await expect(createSession(db, 'user-1')).rejects.toThrow(
      'Session insert verification failed',
    );

    process.env.SESSION_SECRET = previousSecret;
  });
});
