'use client';

import { Brain } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const searchParams = useSearchParams();
  const isSignup = mode === 'signup';
  const errorCode = searchParams.get('error');
  const error =
    errorCode && isSignup
      ? 'Could not create account. Please check your details.'
      : errorCode
        ? 'Invalid email or password.'
        : '';

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
        <h1 className="mt-8 text-3xl font-semibold tracking-tight">
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 leading-7 text-muted">
          {isSignup
            ? 'Save your study history, AI chats, and Agent plans privately.'
            : 'Log in to continue your dashboard, chat history, and Agent plans.'}
        </p>
        <form
          method="post"
          action={isSignup ? '/api/auth/signup' : '/api/auth/login'}
          className="mt-6 space-y-4"
        >
          {isSignup && (
            <label className="block text-sm font-semibold">
              Name
              <input
                name="name"
                autoComplete="name"
                className="mt-2 w-full rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-sage focus:ring-4 focus:ring-sage/10"
                placeholder="Alex"
              />
            </label>
          )}
          <label className="block text-sm font-semibold">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-sage focus:ring-4 focus:ring-sage/10"
              placeholder="you@example.com"
            />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <input
              name="password"
              type="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={10}
              required
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-sage focus:ring-4 focus:ring-sage/10"
              placeholder="At least 10 characters"
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
            {isSignup ? 'Create your free account' : 'Log in'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          {isSignup ? 'Already have an account?' : 'New to MindPulse?'}{' '}
          <Link
            href={isSignup ? '/login' : '/signup'}
            className="font-semibold text-sage hover:text-ink"
          >
            {isSignup ? 'Log in' : 'Get started'}
          </Link>
        </p>
      </section>
    </main>
  );
}
