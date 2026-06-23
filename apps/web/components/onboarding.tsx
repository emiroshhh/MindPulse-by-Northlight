'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { Locale } from '@mindpulse/shared';
import { Button, Card, Input } from './ui';

const GOALS = {
  en: [
    'Manage stress',
    'Sleep better',
    'Understand my moods',
    'Feel less overwhelmed',
  ],
  ru: [
    'Справляться со стрессом',
    'Лучше спать',
    'Понимать своё настроение',
    'Меньше перегружаться',
  ],
};

export function Onboarding({
  locale,
  onLocale,
  onComplete,
}: {
  locale: Locale;
  onLocale: (locale: Locale) => void;
  onComplete: (name: string, goals: string[]) => void;
}) {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [goals, setGoals] = useState<string[]>([]);
  const ageNumber = Number(age);
  const eligible = ageNumber >= 13 && ageNumber <= 18;
  const copy =
    locale === 'en'
      ? {
          next: 'Continue',
          back: 'Back',
          welcome: 'A calmer place to land',
          welcomeBody:
            'MindPulse helps you notice patterns, write things out, and talk through everyday stress—without judgment.',
          begin: 'Let’s begin',
          ageTitle: 'First, how old are you?',
          ageBody:
            'MindPulse is designed for ages 13–18. We only use this answer to check eligibility; we do not store your birth date.',
          agePlaceholder: 'Your age',
          ageError:
            'MindPulse is currently only available for teens ages 13–18.',
          privacyTitle: 'Your space stays yours',
          privacyBody:
            'Your journal and mood entries are private to your account. We collect as little as possible, and you can export or delete your data anytime.',
          disclaimer:
            'MindPulse is a wellbeing tool, not a therapist, doctor, or crisis service. If you are in immediate danger, contact local emergency services or a trusted adult nearby.',
          agree: 'I understand and want to continue',
          goalsTitle: 'What would you like support with?',
          goalsBody: 'Choose any that fit. You can change this later.',
          nameLabel: 'What should we call you? (optional)',
          finish: 'Enter MindPulse',
        }
      : {
          next: 'Продолжить',
          back: 'Назад',
          welcome: 'Спокойное место для тебя',
          welcomeBody:
            'MindPulse помогает замечать закономерности, записывать мысли и обсуждать повседневный стресс — без осуждения.',
          begin: 'Начнём',
          ageTitle: 'Сколько тебе лет?',
          ageBody:
            'MindPulse создан для подростков 13–18 лет. Ответ нужен только для проверки возраста; дату рождения мы не сохраняем.',
          agePlaceholder: 'Твой возраст',
          ageError: 'Сейчас MindPulse доступен только подросткам 13–18 лет.',
          privacyTitle: 'Твоё пространство остаётся твоим',
          privacyBody:
            'Записи дневника и настроение доступны только в твоём аккаунте. Мы собираем минимум данных, а ты можешь скачать или удалить их в любое время.',
          disclaimer:
            'MindPulse — инструмент для поддержки благополучия, а не терапевт, врач или экстренная служба. При непосредственной опасности свяжись с местной экстренной службой или взрослым, которому доверяешь.',
          agree: 'Я понимаю и хочу продолжить',
          goalsTitle: 'В чём тебе нужна поддержка?',
          goalsBody: 'Выбери всё подходящее. Это можно изменить позже.',
          nameLabel: 'Как к тебе обращаться? (необязательно)',
          finish: 'Войти в MindPulse',
        };

  return (
    <main className="ambient flex min-h-screen items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-2xl overflow-hidden border-white/60 bg-surface/90 p-6 backdrop-blur-xl sm:p-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-soft text-sage">
              <Heart size={18} fill="currentColor" aria-hidden />
            </span>
            MindPulse
          </div>
          <div
            className="flex rounded-full bg-canvas p-1"
            aria-label="Language"
          >
            {(['en', 'ru'] as const).map((item) => (
              <button
                key={item}
                onClick={() => onLocale(item)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${locale === item ? 'bg-surface text-ink shadow-sm' : 'text-muted'}`}
                aria-pressed={locale === item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-8 flex gap-2" aria-label={`Step ${step + 1} of 4`}>
          {[0, 1, 2, 3].map((item) => (
            <span
              key={item}
              className={`h-1.5 flex-1 rounded-full ${item <= step ? 'bg-sage' : 'bg-ink/10'}`}
            />
          ))}
        </div>

        {step === 0 && (
          <section className="animate-rise py-4 text-center">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sage-soft to-lavender text-sage">
              <Sparkles size={32} aria-hidden />
            </span>
            <h1 className="mt-7 text-3xl font-semibold tracking-tight sm:text-4xl">
              {copy.welcome}
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted">
              {copy.welcomeBody}
            </p>
            <Button size="lg" className="mt-8" onClick={() => setStep(1)}>
              {copy.begin}
              <ArrowRight size={18} aria-hidden />
            </Button>
          </section>
        )}

        {step === 1 && (
          <section className="animate-rise py-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mist text-sage">
              <ShieldCheck aria-hidden />
            </span>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight">
              {copy.ageTitle}
            </h1>
            <p className="mt-3 max-w-lg leading-7 text-muted">{copy.ageBody}</p>
            <Input
              className="mt-6 max-w-xs text-lg"
              type="number"
              min={1}
              max={99}
              inputMode="numeric"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              placeholder={copy.agePlaceholder}
              aria-describedby={age && !eligible ? 'age-error' : undefined}
            />
            {age && !eligible ? (
              <p
                id="age-error"
                className="mt-3 text-sm font-medium text-danger"
              >
                {copy.ageError}
              </p>
            ) : null}
            <div className="mt-8 flex justify-between">
              <Button variant="quiet" onClick={() => setStep(0)}>
                <ArrowLeft size={18} />
                {copy.back}
              </Button>
              <Button disabled={!eligible} onClick={() => setStep(2)}>
                {copy.next}
                <ArrowRight size={18} />
              </Button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="animate-rise py-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-soft text-sage">
              <LockKeyhole aria-hidden />
            </span>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight">
              {copy.privacyTitle}
            </h1>
            <p className="mt-3 leading-7 text-muted">{copy.privacyBody}</p>
            <div className="mt-5 rounded-2xl bg-canvas p-4 text-sm leading-6 text-ink">
              <strong className="mb-1 block">
                {locale === 'en' ? 'Important to know' : 'Важно знать'}
              </strong>
              {copy.disclaimer}
            </div>
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-ink/10 p-4">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[#56776f]"
              />
              <span className="font-medium">{copy.agree}</span>
            </label>
            <div className="mt-8 flex justify-between">
              <Button variant="quiet" onClick={() => setStep(1)}>
                <ArrowLeft size={18} />
                {copy.back}
              </Button>
              <Button disabled={!consent} onClick={() => setStep(3)}>
                {copy.next}
                <ArrowRight size={18} />
              </Button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="animate-rise py-4">
            <h1 className="text-3xl font-semibold tracking-tight">
              {copy.goalsTitle}
            </h1>
            <p className="mt-3 text-muted">{copy.goalsBody}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {GOALS[locale].map((goal) => {
                const selected = goals.includes(goal);
                return (
                  <button
                    key={goal}
                    onClick={() =>
                      setGoals((items) =>
                        selected
                          ? items.filter((item) => item !== goal)
                          : [...items, goal],
                      )
                    }
                    className={`flex items-center justify-between rounded-2xl border p-4 text-left font-medium transition focus-visible:ring-2 focus-visible:ring-sage ${selected ? 'border-sage bg-sage-soft' : 'border-ink/10 hover:bg-canvas'}`}
                    aria-pressed={selected}
                  >
                    {goal}
                    {selected && <Check size={18} />}
                  </button>
                );
              })}
            </div>
            <label className="mt-6 block text-sm font-semibold">
              {copy.nameLabel}
              <Input
                className="mt-2"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={50}
              />
            </label>
            <div className="mt-8 flex justify-between">
              <Button variant="quiet" onClick={() => setStep(2)}>
                <ArrowLeft size={18} />
                {copy.back}
              </Button>
              <Button onClick={() => onComplete(name.trim(), goals)}>
                {copy.finish}
                <ArrowRight size={18} />
              </Button>
            </div>
          </section>
        )}
      </Card>
    </main>
  );
}
