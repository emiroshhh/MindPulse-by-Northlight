export const GUEST_CHAT_KEY = 'mindpulse-guest-chat-v1';
export const GUEST_FOCUS_KEY = 'mindpulse-today-focus-v1';
export const GUEST_AGENT_KEY = 'mindpulse-guest-agent-plans-v1';
export const LANGUAGE_KEY = 'mindpulse-language-v1';
export const GUEST_BANNER_KEY = 'mindpulse-guest-banner-dismissed-v1';
export const FEEDBACK_KEY = 'mindpulse-feedback-v1';

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function localId(prefix: string) {
  return typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
