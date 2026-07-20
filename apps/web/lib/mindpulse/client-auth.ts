'use client';

export const CLIENT_SESSION_TOKEN_KEY = 'mindpulse_session_token';

export function readClientSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const token = window.localStorage.getItem(CLIENT_SESSION_TOKEN_KEY)?.trim();
    return token && token.length >= 20 ? token : null;
  } catch {
    return null;
  }
}

export function writeClientSessionToken(token: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = token.trim();
  if (trimmed.length < 20) return;
  try {
    window.localStorage.setItem(CLIENT_SESSION_TOKEN_KEY, trimmed);
  } catch {
    // localStorage may be disabled; cookies remain the preferred path.
  }
}

export function clearClientSessionToken(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CLIENT_SESSION_TOKEN_KEY);
  } catch {
    // Nothing else to clear client-side.
  }
}

export function authHeaders(): HeadersInit {
  const token = readClientSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Cookie-first self-healing for the localStorage fallback token.
 *
 * The fallback exists because Set-Cookie was unreliable on Cloudflare Workers
 * during the Phase 3.x incidents, but a token readable by JavaScript weakens
 * HttpOnly. When a cookie-only /api/auth/me succeeds, cookies demonstrably
 * work for this browser, so the fallback token is deleted. It then only
 * persists for users whose cookie path genuinely fails.
 */
export async function healSessionTokenFallback(): Promise<void> {
  if (!readClientSessionToken()) return;
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'same-origin',
      cache: 'no-store',
      // Deliberately no Authorization header: this probes cookies alone.
    });
    if (!response.ok) return;
    const body = (await response.json().catch(() => null)) as {
      user?: unknown;
    } | null;
    if (body?.user) clearClientSessionToken();
  } catch {
    // Network failure: keep the fallback token.
  }
}
