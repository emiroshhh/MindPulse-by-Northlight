'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Heart, Mail } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { Button, Card, Input } from '@/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>(
    'idle',
  );
  const [message, setMessage] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setStatus('error');
      setMessage(
        'Supabase is not configured. You can keep exploring safely in demo mode.',
      );
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else setStatus('sent');
  };
  return (
    <main className="ambient flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
        >
          <ArrowLeft size={17} />
          Back to MindPulse
        </Link>
        <span className="mt-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-soft text-sage">
          <Heart fill="currentColor" size={21} />
        </span>
        <h1 className="mt-5 text-3xl font-semibold">Your private space</h1>
        <p className="mt-2 leading-7 text-muted">
          Sign in with a secure email link. No password to remember.
        </p>
        {status === 'sent' ? (
          <div className="mt-7 rounded-2xl bg-sage-soft p-5">
            <CheckCircle2 className="text-sage" />
            <h2 className="mt-3 font-semibold">Check your inbox</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              We sent a one-time sign-in link to {email}.
            </p>
          </div>
        ) : (
          <form className="mt-7" onSubmit={submit}>
            <label className="text-sm font-semibold" htmlFor="email">
              Email
            </label>
            <div className="relative mt-2">
              <Mail className="absolute left-4 top-3.5 text-muted" size={18} />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="pl-11"
                placeholder="you@example.com"
              />
            </div>
            {message && (
              <p className="mt-3 text-sm text-danger" role="alert">
                {message}
              </p>
            )}
            <Button
              className="mt-5 w-full"
              size="lg"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Sending…' : 'Email me a sign-in link'}
            </Button>
          </form>
        )}
        <div className="mt-6 border-t border-ink/5 pt-5 text-xs leading-5 text-muted">
          <strong className="text-ink">
            Demo mode is private to this browser.
          </strong>{' '}
          Connect Supabase to sync securely across devices.
        </div>
      </Card>
    </main>
  );
}
