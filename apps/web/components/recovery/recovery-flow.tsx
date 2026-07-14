'use client';

import {
  ArrowLeft,
  Brain,
  Globe2,
  LifeBuoy,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { RecoveryPlan } from '@mindpulse/shared';
import { copyFor } from '@/lib/mindpulse/i18n';
import {
  authHeaders,
  healSessionTokenFallback,
} from '@/lib/mindpulse/client-auth';
import { sendBetaEvent } from '@/lib/mindpulse/beta-events';
import {
  GUEST_RECOVERY_KEY,
  LANGUAGE_KEY,
  applyDocumentLanguage,
  readJson,
  writeJson,
} from '@/lib/mindpulse/local-store';
import {
  isLanguageCode,
  languages,
  type LanguageCode,
} from '@/lib/mindpulse/tools';
import { SiteFooter } from '../mindpulse/site-footer';
import { FeedbackModal } from '../mindpulse/feedback-modal';
import { RecoveryPlanView, type StoredRecovery } from './recovery-plan';

type MindPulseUser = { id?: string; email: string; name: string };
type AuthMeBody = { user?: MindPulseUser | null };

type ItemDraft = { title: string; deadline: string; fixedDeadline: boolean };

type CrisisResourceLink = {
  id: string;
  name: string;
  description: string;
  url: string;
  availability: string;
};

type RecoveryApiBody = {
  plan?: RecoveryPlan;
  source?: 'ai' | 'fallback';
  saved?: { id: string } | null;
  error?: string;
  accountRequired?: boolean;
  crisis?: boolean;
  reply?: string;
  resources?: CrisisResourceLink[];
};

const EMPTY_ITEM: ItemDraft = { title: '', deadline: '', fixedDeadline: false };
const TOTAL_STEPS = 3;

export function RecoveryFlow({
  user: initialUser,
}: {
  user: MindPulseUser | null;
}) {
  const [user, setUser] = useState<MindPulseUser | null>(initialUser);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [step, setStep] = useState(1);
  const [missedContext, setMissedContext] = useState('');
  const [items, setItems] = useState<ItemDraft[]>([{ ...EMPTY_ITEM }]);
  const [hours, setHours] = useState('');
  const [energy, setEnergy] = useState<'low' | 'ok'>('ok');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState('');
  const [stored, setStored] = useState<StoredRecovery | null>(null);
  const [crisis, setCrisis] = useState<{
    reply: string;
    resources: CrisisResourceLink[];
  } | null>(null);

  const ui = useMemo(() => copyFor(language), [language]);
  const copy = ui.recovery;

  useEffect(() => {
    const storedLanguage = readJson<LanguageCode | null>(LANGUAGE_KEY, null);
    if (storedLanguage && isLanguageCode(storedLanguage))
      setLanguage(storedLanguage);
    const existing = readJson<StoredRecovery | null>(GUEST_RECOVERY_KEY, null);
    if (existing?.plan) setStored(existing);
  }, []);

  useEffect(() => {
    writeJson(LANGUAGE_KEY, language);
    applyDocumentLanguage(language);
  }, [language]);

  useEffect(() => {
    let active = true;
    async function reconcile() {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'same-origin',
          cache: 'no-store',
          headers: authHeaders(),
        });
        if (!active) return;
        if (response.ok) {
          const body = (await response.json().catch(() => ({}))) as AuthMeBody;
          setUser(body.user ?? null);
        } else if (response.status === 401) {
          setUser(null);
        }
      } catch {
        // Keep the server-rendered state.
      }
    }
    void reconcile().then(() => healSessionTokenFallback());
    return () => {
      active = false;
    };
  }, []);

  function persist(next: StoredRecovery | null) {
    setStored(next);
    writeJson(GUEST_RECOVERY_KEY, next);
  }

  function goNext() {
    setValidation('');
    if (step === 1 && !missedContext.trim()) {
      setValidation(copy.validationContext);
      return;
    }
    if (step === 2 && !items.some((item) => item.title.trim())) {
      setValidation(copy.validationItems);
      return;
    }
    setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  }

  async function generate() {
    setValidation('');
    setError('');
    setCrisis(null);
    const cleanItems = items
      .filter((item) => item.title.trim())
      .map((item) => ({
        title: item.title.trim().slice(0, 120),
        deadline: item.deadline.trim().slice(0, 40),
        fixedDeadline: item.fixedDeadline,
      }));
    if (!cleanItems.length) {
      setValidation(copy.validationItems);
      setStep(2);
      return;
    }
    const parsedHours = Number.parseFloat(hours.replace(',', '.'));
    setLoading(true);
    try {
      const response = await fetch('/api/recovery', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missedContext: missedContext.trim().slice(0, 500),
          items: cleanItems,
          hoursAvailable:
            Number.isFinite(parsedHours) && parsedHours >= 0.5
              ? Math.min(parsedHours, 24)
              : null,
          energy,
          language,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as RecoveryApiBody;
      if (body.crisis && body.reply) {
        setCrisis({ reply: body.reply, resources: body.resources ?? [] });
        return;
      }
      if (response.status === 429) {
        setError(
          body.accountRequired
            ? copy.limitReachedGuest
            : copy.limitReachedAccount,
        );
        return;
      }
      if (!response.ok || !body.plan) {
        setError(copy.errorGeneric);
        return;
      }
      persist({
        plan: body.plan,
        source: body.source ?? 'ai',
        savedId: body.saved?.id ?? null,
        checkedTitles: [],
        completed: false,
        createdAt: new Date().toISOString(),
      });
    } catch {
      setError(copy.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  async function markCompleted(next: StoredRecovery) {
    persist({ ...next, completed: true });
    if (next.savedId && user) {
      try {
        await fetch('/api/agent', {
          method: 'PATCH',
          credentials: 'same-origin',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: next.savedId, status: 'done' }),
        });
        return; // Server records recovery_completed.
      } catch {
        // Fall through to the client event below.
      }
    }
    sendBetaEvent('recovery_completed');
  }

  function startOver() {
    persist(null);
    setStep(1);
    setMissedContext('');
    setItems([{ ...EMPTY_ITEM }]);
    setHours('');
    setEnergy('ok');
    setError('');
    setCrisis(null);
  }

  const inputClass =
    'mt-1 w-full rounded-2xl border border-ink/10 bg-canvas/70 px-4 py-3 outline-none focus:border-sage';

  return (
    <div className="ambient min-h-screen">
      <header className="sticky top-0 z-40 border-b border-ink/5 bg-canvas/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link href="/app" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-canvas">
              <Brain size={20} />
            </span>
            <b>MindPulse</b>
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <label className="inline-flex min-h-10 items-center gap-2 rounded-full bg-surface px-3 text-sm font-semibold text-muted shadow-soft">
              <Globe2 size={15} />
              <span className="sr-only">Language</span>
              <select
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as LanguageCode)
                }
                className="bg-transparent outline-none"
              >
                {languages.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <Link
              href="/app"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-5 text-sm font-semibold text-ink shadow-soft hover:bg-sage-soft"
            >
              <ArrowLeft size={16} /> {ui.toolPageBack}
            </Link>
          </div>
        </nav>
      </header>

      <main
        id="main-content"
        className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14"
      >
        <p className="inline-flex items-center gap-2 rounded-full bg-sage-soft px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-sage">
          <LifeBuoy size={15} /> {copy.eyebrow}
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-.03em] sm:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-4 max-w-2xl leading-8 text-muted">{copy.intro}</p>

        {crisis ? (
          <div
            role="alert"
            className="mt-8 rounded-[2rem] border-2 border-danger/40 bg-surface p-6 shadow-soft"
          >
            {crisis.reply.split('\n\n').map((paragraph, index) => (
              <p key={index} className={`leading-8 ${index > 0 ? 'mt-3' : ''}`}>
                {paragraph}
              </p>
            ))}
            <ul className="mt-4 space-y-3">
              {crisis.resources.map((resource) => (
                <li key={resource.id}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline decoration-danger/50 underline-offset-4"
                  >
                    {resource.name}
                  </a>
                  <p className="text-sm text-muted">{resource.description}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : stored?.plan ? (
          <RecoveryPlanView
            stored={stored}
            copy={copy}
            savedNote={stored.savedId ? copy.savedAccount : copy.savedLocal}
            onToggleItem={(title) => {
              const checked = new Set(stored.checkedTitles);
              if (checked.has(title)) checked.delete(title);
              else checked.add(title);
              persist({ ...stored, checkedTitles: [...checked] });
            }}
            onComplete={() => void markCompleted(stored)}
            onStartOver={startOver}
          />
        ) : (
          <section className="mt-8 rounded-[2rem] bg-surface p-6 shadow-soft sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-sage">
              {copy.stepLabel(step, TOTAL_STEPS)}
            </p>

            {step === 1 && (
              <div className="mt-4">
                <label className="block">
                  <span className="text-xl font-semibold">
                    {copy.step1Title}
                  </span>
                  <textarea
                    value={missedContext}
                    onChange={(event) => setMissedContext(event.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder={copy.step1Placeholder}
                    className={inputClass}
                  />
                </label>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {copy.step1Note}
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="mt-4">
                <h2 className="text-xl font-semibold">{copy.step2Title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {copy.step2Note}
                </p>
                <div className="mt-4 space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="rounded-mp bg-canvas/60 p-4">
                      <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
                        <label className="block">
                          <span className="text-sm font-semibold">
                            {copy.itemTitleLabel}
                          </span>
                          <input
                            value={item.title}
                            onChange={(event) =>
                              setItems((current) =>
                                current.map((entry, i) =>
                                  i === index
                                    ? { ...entry, title: event.target.value }
                                    : entry,
                                ),
                              )
                            }
                            maxLength={120}
                            placeholder={copy.itemTitlePlaceholder}
                            className={inputClass}
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-semibold">
                            {copy.itemDeadlineLabel}
                          </span>
                          <input
                            value={item.deadline}
                            onChange={(event) =>
                              setItems((current) =>
                                current.map((entry, i) =>
                                  i === index
                                    ? { ...entry, deadline: event.target.value }
                                    : entry,
                                ),
                              )
                            }
                            maxLength={40}
                            placeholder={copy.itemDeadlinePlaceholder}
                            className={inputClass}
                          />
                        </label>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <label className="inline-flex items-center gap-2 text-sm font-semibold">
                          <input
                            type="checkbox"
                            checked={item.fixedDeadline}
                            onChange={(event) =>
                              setItems((current) =>
                                current.map((entry, i) =>
                                  i === index
                                    ? {
                                        ...entry,
                                        fixedDeadline: event.target.checked,
                                      }
                                    : entry,
                                ),
                              )
                            }
                            className="h-5 w-5 accent-[#5a7d6c]"
                          />
                          {copy.itemFixedLabel}
                        </label>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setItems((current) =>
                                current.filter((_, i) => i !== index),
                              )
                            }
                            className="inline-flex min-h-10 items-center gap-1 rounded-full bg-surface px-4 text-sm font-semibold text-muted hover:text-danger"
                          >
                            <Trash2 size={14} /> {copy.removeItem}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {items.length < 8 && (
                  <button
                    type="button"
                    onClick={() =>
                      setItems((current) => [...current, { ...EMPTY_ITEM }])
                    }
                    className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-sage-soft px-5 text-sm font-semibold text-ink hover:bg-sage hover:text-canvas"
                  >
                    <Plus size={15} /> {copy.addItem}
                  </button>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="mt-4 space-y-5">
                <h2 className="text-xl font-semibold">{copy.step3Title}</h2>
                <label className="block max-w-xs">
                  <span className="text-sm font-semibold">
                    {copy.hoursLabel}
                  </span>
                  <input
                    value={hours}
                    onChange={(event) => setHours(event.target.value)}
                    inputMode="decimal"
                    maxLength={4}
                    placeholder={copy.hoursPlaceholder}
                    className={inputClass}
                  />
                </label>
                <fieldset>
                  <legend className="text-sm font-semibold">
                    {copy.energyLabel}
                  </legend>
                  <div className="mt-2 flex gap-2">
                    {(
                      [
                        ['low', copy.energyLow],
                        ['ok', copy.energyOk],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={energy === value}
                        onClick={() => setEnergy(value)}
                        className={`min-h-11 rounded-full px-5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage ${
                          energy === value
                            ? 'bg-ink text-canvas'
                            : 'bg-canvas/70 text-muted hover:text-ink'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            {validation && (
              <p
                className="mt-4 rounded-mp bg-warm/15 p-3 text-sm text-danger"
                role="alert"
              >
                {validation}
              </p>
            )}
            {error && (
              <p
                className="mt-4 rounded-mp bg-warm/15 p-3 text-sm text-danger"
                role="alert"
              >
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep((current) => Math.max(current - 1, 1))}
                disabled={step === 1 || loading}
                className="min-h-11 rounded-full bg-canvas/70 px-6 font-semibold text-muted hover:text-ink disabled:opacity-40"
              >
                {copy.back}
              </button>
              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="min-h-11 rounded-full bg-ink px-6 font-semibold text-canvas"
                >
                  {copy.next}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void generate()}
                  disabled={loading}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sage px-6 font-semibold text-canvas disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      {copy.generating}
                    </>
                  ) : (
                    copy.generate
                  )}
                </button>
              )}
            </div>
          </section>
        )}

        <div className="mt-8 flex justify-end">
          <FeedbackModal language={language} flow="recovery" />
        </div>
      </main>

      <SiteFooter language={language} />
    </div>
  );
}
