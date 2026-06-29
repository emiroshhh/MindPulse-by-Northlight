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
