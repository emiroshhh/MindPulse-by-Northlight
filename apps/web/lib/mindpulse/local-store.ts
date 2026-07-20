export const GUEST_CHAT_KEY = 'mindpulse-guest-chat-v1';
export const GUEST_FOCUS_KEY = 'mindpulse-today-focus-v1';
export const GUEST_AGENT_KEY = 'mindpulse-guest-agent-plans-v1';
export const LANGUAGE_KEY = 'mindpulse-language-v1';
export const LANGUAGE_CHANGE_EVENT = 'mindpulse-language-change';
export const GUEST_BANNER_KEY = 'mindpulse-guest-banner-dismissed-v1';
export const GUEST_RECOVERY_KEY = 'mindpulse-guest-recovery-v1';
export const GUEST_TOOL_RESULTS_KEY = 'mindpulse-guest-tool-results-v1';
export const NEXT_ACTION_KEY = 'mindpulse-next-action-v1';
export const ONBOARDED_KEY = 'mindpulse-onboarded-v1';

/**
 * Keep the document language attribute in sync with the selected UI language
 * so screen readers announce content correctly (WCAG 3.1.1).
 */
export function applyDocumentLanguage(language: string) {
  if (typeof document !== 'undefined') document.documentElement.lang = language;
}

const SUPPORTED_LANGUAGES = ['en', 'ru', 'kk', 'es'] as const;
export type StoredLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function isStoredLanguage(value: unknown): value is StoredLanguage {
  return (
    typeof value === 'string' &&
    SUPPORTED_LANGUAGES.some((language) => language === value)
  );
}

export function readLanguagePreference(
  fallback: StoredLanguage = 'en',
): StoredLanguage {
  const stored = readJson<unknown>(LANGUAGE_KEY, fallback);
  return isStoredLanguage(stored) ? stored : fallback;
}

export function setLanguagePreference(language: StoredLanguage) {
  writeJson(LANGUAGE_KEY, language);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<StoredLanguage>(LANGUAGE_CHANGE_EVENT, {
        detail: language,
      }),
    );
  }
}

export function subscribeToLanguagePreference(
  listener: (language: StoredLanguage) => void,
) {
  if (typeof window === 'undefined') return () => undefined;
  const onLanguageChange = (event: Event) => {
    const language = (event as CustomEvent<unknown>).detail;
    if (isStoredLanguage(language)) listener(language);
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== LANGUAGE_KEY || !event.newValue) return;
    try {
      const language: unknown = JSON.parse(event.newValue);
      if (isStoredLanguage(language)) {
        listener(language);
      }
    } catch {
      // Ignore malformed values written by older or external clients.
    }
  };
  window.addEventListener(LANGUAGE_CHANGE_EVENT, onLanguageChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, onLanguageChange);
    window.removeEventListener('storage', onStorage);
  };
}

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
