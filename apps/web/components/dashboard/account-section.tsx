'use client';

import { Loader2, UserX } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { UiCopy } from '@/lib/mindpulse/i18n';
import {
  authHeaders,
  clearClientSessionToken,
} from '@/lib/mindpulse/client-auth';

/**
 * Account management: shows the signed-in email and a password-confirmed,
 * permanent account + data deletion flow (POST /api/auth/delete-account).
 */
export function AccountSection({
  email,
  copy,
}: {
  email: string;
  copy: UiCopy['account'];
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [state, setState] = useState<'idle' | 'deleting' | 'deleted'>('idle');
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    passwordRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, input, [href]',
      );
      if (!focusable?.length) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  async function deleteAccount(event: FormEvent) {
    event.preventDefault();
    if (state === 'deleting' || !password) return;
    setState('deleting');
    setError('');
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        clearClientSessionToken();
        setState('deleted');
        window.setTimeout(() => {
          window.location.href = '/';
        }, 1500);
        return;
      }
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      setState('idle');
      if (body.error === 'invalid_password') setError(copy.wrongPassword);
      else if (body.error === 'rate_limited') setError(copy.rateLimited);
      else setError(copy.deleteFailed);
    } catch {
      setState('idle');
      setError(copy.deleteFailed);
    }
  }

  return (
    <section className="mt-8 rounded-mp bg-surface p-5 shadow-soft">
      <h2 className="font-semibold">{copy.title}</h2>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {copy.signedInAs} <b className="text-ink">{email}</b>
        </p>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-warm/20 px-4 text-sm font-semibold text-danger hover:bg-warm/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
        >
          <UserX size={15} /> {copy.deleteButton}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-5">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="w-full max-w-md rounded-[2rem] bg-surface p-6 shadow-soft"
          >
            {state === 'deleted' ? (
              <p role="status" className="text-sm leading-7">
                {copy.deleted}
              </p>
            ) : (
              <form onSubmit={deleteAccount}>
                <h3 id="delete-account-title" className="text-xl font-semibold">
                  {copy.deleteTitle}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {copy.deleteWarning}
                </p>
                <label className="mt-4 block">
                  <span className="text-sm font-semibold">
                    {copy.passwordLabel}
                  </span>
                  <input
                    ref={passwordRef}
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    className="mt-1 w-full rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-danger"
                  />
                </label>
                {error && (
                  <p className="mt-3 text-sm text-danger" role="alert">
                    {error}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={!password || state === 'deleting'}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-danger px-5 text-sm font-semibold text-canvas disabled:opacity-50"
                  >
                    {state === 'deleting' && (
                      <Loader2 size={15} className="animate-spin" />
                    )}
                    {state === 'deleting' ? copy.deleting : copy.confirmDelete}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setError('');
                      triggerRef.current?.focus();
                    }}
                    className="min-h-11 rounded-full bg-canvas/70 px-5 text-sm font-semibold text-muted hover:text-ink"
                  >
                    {copy.cancel}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
