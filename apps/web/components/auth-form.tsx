'use client';

import { Brain, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          ...(mode === 'signup' ? { name } : {}),
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(body.error ?? 'Something went wrong. Please try again.');
        return;
      }
      router.push('/app');
      router.refresh();
    } catch {
      setError('MindPulse could not connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === 'signup';
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
        <form onSubmit={submit} className="mt-6 space-y-4">
          {isSignup && (
            <label className="block text-sm font-semibold">
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                className="mt-2 w-full rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-sage focus:ring-4 focus:ring-sage/10"
                placeholder="Alex"
              />
            </label>
          )}
          <label className="block text-sm font-semibold">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
          <button
            disabled={loading}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-sage px-5 font-semibold text-canvas hover:bg-ink disabled:opacity-50"
          >
            {loading && <Loader2 size={17} className="animate-spin" />}
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
