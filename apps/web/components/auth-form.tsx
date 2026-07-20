'use client';

import { Brain } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { authCopyFor } from '@/lib/mindpulse/auth-i18n';
import { languages, type LanguageCode } from '@/lib/mindpulse/tools';
import { useLanguagePreference } from '@/lib/mindpulse/use-language-preference';
import { useLocalizedMetadata } from '@/lib/mindpulse/use-localized-metadata';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const searchParams = useSearchParams();
  const isSignup = mode === 'signup';
  const [language, setLanguage] = useLanguagePreference();
  const copy = authCopyFor(language);

  useLocalizedMetadata(
    `${isSignup ? copy.signupTitle : copy.loginTitle} · MindPulse`,
    isSignup ? copy.signupIntro : copy.loginIntro,
  );
  const errorCode = searchParams.get('error');
  const error =
    errorCode && isSignup ? copy.signupError : errorCode ? copy.loginError : '';

  return (
    <main className="ambient grid min-h-screen place-items-center px-5 py-10">
      <section className="w-full max-w-md rounded-[2rem] border border-ink/5 bg-surface p-6 shadow-soft sm:p-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-canvas">
            <Brain size={20} />
          </span>
          <span>
            <b className="block">MindPulse</b>
            <small className="font-semibold uppercase tracking-[.16em] text-muted">
              by Northlight
            </small>
          </span>
        </Link>
        <label className="mt-6 block text-sm font-semibold">
          <span className="sr-only">{copy.languageLabel}</span>
          <select
            aria-label={copy.languageLabel}
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value as LanguageCode)
            }
            className="min-h-11 w-full rounded-xl border border-ink/10 bg-canvas px-3"
          >
            {languages.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight">
          {isSignup ? copy.signupTitle : copy.loginTitle}
        </h1>
        <p className="mt-2 leading-7 text-muted">
          {isSignup ? copy.signupIntro : copy.loginIntro}
        </p>
        <form
          method="post"
          action={isSignup ? '/api/auth/signup' : '/api/auth/login'}
          className="mt-6 space-y-4"
        >
          {isSignup && (
            <label className="block text-sm font-semibold">
              {copy.name}
              <input
                name="name"
                autoComplete="name"
                className="mt-2 w-full rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-sage focus:ring-4 focus:ring-sage/10"
                placeholder={copy.namePlaceholder}
              />
            </label>
          )}
          <label className="block text-sm font-semibold">
            {copy.email}
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-sage focus:ring-4 focus:ring-sage/10"
              placeholder={copy.emailPlaceholder}
            />
          </label>
          <label className="block text-sm font-semibold">
            {copy.password}
            <input
              name="password"
              type="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={10}
              required
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-sage focus:ring-4 focus:ring-sage/10"
              placeholder={copy.passwordPlaceholder}
            />
          </label>
          {error && (
            <div
              role="alert"
              className="rounded-2xl bg-warm/15 px-4 py-3 text-sm text-danger"
            >
              {error}
            </div>
          )}
          <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-sage px-5 font-semibold text-canvas hover:bg-ink">
            {isSignup ? copy.signup : copy.login}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          {isSignup ? copy.hasAccount : copy.needsAccount}{' '}
          <Link
            href={isSignup ? '/login' : '/signup'}
            className="inline-flex min-h-11 min-w-11 items-center justify-center font-semibold text-sage hover:text-ink"
          >
            {isSignup ? copy.login : copy.getStarted}
          </Link>
        </p>
      </section>
    </main>
  );
}
