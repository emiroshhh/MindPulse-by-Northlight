'use client';

import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Globe2,
  LifeBuoy,
  LockKeyhole,
  MessageSquareText,
  Repeat2,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { FeedbackModal } from '@/components/mindpulse/feedback-modal';
import { SiteFooter } from '@/components/mindpulse/site-footer';
import { LANDING_TITLES } from '@/lib/marketing-seo';
import { acquisitionLinksCopyFor } from '@/lib/mindpulse/acquisition-links-i18n';
import { landingCopyFor } from '@/lib/mindpulse/marketing-i18n';
import { useRouteLanguage } from '@/lib/mindpulse/use-route-language';
import { useLocalizedMetadata } from '@/lib/mindpulse/use-localized-metadata';
import { localizedMarketingPath, type MarketingLocale } from '@/lib/seo';
import {
  languages,
  languageLabelFor,
  type LanguageCode,
} from '@/lib/mindpulse/tools';

const FEATURE_ICONS = [
  BookOpen,
  CalendarDays,
  Zap,
  Repeat2,
  Target,
  Sparkles,
  LifeBuoy,
  MessageSquareText,
] as const;

export function LandingPage({
  initialLanguage,
}: {
  initialLanguage?: MarketingLocale;
} = {}) {
  const [language, setLanguage] = useRouteLanguage(initialLanguage);
  const copy = useMemo(() => landingCopyFor(language), [language]);
  const acquisitionLinks = useMemo(
    () => acquisitionLinksCopyFor(language),
    [language],
  );

  useLocalizedMetadata(LANDING_TITLES[language], copy.heroSubtitle);

  return (
    <div className="ambient min-h-screen overflow-hidden">
      <header className="sticky top-0 z-40 border-b border-ink/5 bg-canvas/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <Link
            href={localizedMarketingPath(language, '/')}
            className="flex items-center gap-3"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-canvas">
              <Brain size={20} />
            </span>
            <span>
              <b className="block text-sm">MindPulse</b>
              <small className="font-semibold uppercase tracking-[.18em] text-muted">
                by Northlight
              </small>
            </span>
          </Link>
          <div className="hidden gap-7 text-sm font-semibold text-muted md:flex">
            <a
              href="#features"
              className="inline-flex min-h-11 min-w-11 items-center justify-center hover:text-ink"
            >
              {copy.navFeatures}
            </a>
            <a
              href="#how"
              className="inline-flex min-h-11 items-center hover:text-ink"
            >
              {copy.navHow}
            </a>
            <Link
              href={localizedMarketingPath(language, '/beta')}
              className="inline-flex min-h-11 items-center hover:text-ink"
            >
              {copy.navBeta}
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-11 min-w-11 items-center justify-center hover:text-ink"
            >
              {copy.navLogin}
            </Link>
          </div>
          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
            <label className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full bg-surface px-3 text-sm font-semibold text-muted shadow-soft">
              <Globe2 size={15} />
              <span className="sr-only">{languageLabelFor[language]}</span>
              <select
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as LanguageCode)
                }
                aria-label={languageLabelFor[language]}
                className="min-h-11 min-w-0 max-w-[8.5rem] bg-transparent font-semibold text-ink outline-none"
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
              className="inline-flex min-h-11 min-w-0 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-canvas hover:bg-sage"
            >
              {copy.navTry} <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      </header>

      <main id="main-content">
        <section className="px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-sage/20 bg-surface px-4 py-2 text-xs font-semibold text-sage">
                <Sparkles size={15} /> {copy.badge}
              </span>
              <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-.045em] sm:text-6xl lg:text-7xl">
                {copy.heroTitleLead}{' '}
                <span className="text-sage">{copy.heroTitleAccent}</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
                {copy.heroSubtitle}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/app"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-sage px-7 font-semibold text-canvas shadow-soft hover:-translate-y-1 hover:bg-ink"
                >
                  {copy.ctaPrimary} <ArrowRight size={18} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex min-h-14 items-center justify-center rounded-full border border-ink/10 bg-surface px-7 font-semibold hover:bg-sage-soft"
                >
                  {copy.ctaLogin}
                </Link>
              </div>
              <p className="mt-4 text-sm text-muted">{copy.guestNote}</p>
            </div>
            <div className="rounded-[2rem] border border-white/60 bg-surface/90 p-6 shadow-soft sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-muted">
                {copy.exampleLabel}
              </p>
              <div className="mt-3 rounded-[1.5rem] bg-ink p-5 text-canvas">
                <p className="text-sm text-canvas/65">{copy.exampleInput}</p>
                <h2 className="mt-2 text-xl font-semibold leading-8">
                  {copy.exampleOutput}
                </h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {copy.exampleHighlights.map((text) => (
                  <div key={text} className="rounded-2xl bg-sage-soft/70 p-4">
                    <CheckCircle2 className="text-sage" size={18} />
                    <p className="mt-3 text-sm font-semibold">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="how"
          className="scroll-mt-24 bg-ink px-5 py-20 text-canvas sm:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-sage-soft">
              {copy.howLabel}
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {copy.howSteps.map(([title, body], index) => (
                <div
                  key={title}
                  className="rounded-mp border border-white/10 bg-white/5 p-6"
                >
                  <b className="text-sage-soft">0{index + 1}</b>
                  <h2 className="mt-8 text-xl font-semibold">{title}</h2>
                  <p className="mt-3 text-canvas/65">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-sage">
              {copy.featuresLabel}
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl font-semibold sm:text-5xl">
              {copy.featuresTitle}
            </h2>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {copy.featureNames.map((title, index) => {
                const Icon = FEATURE_ICONS[index] ?? Sparkles;
                return (
                  <div
                    key={title}
                    className="rounded-mp bg-surface p-5 shadow-soft"
                  >
                    <Icon className="text-sage" size={21} />
                    <h3 className="mt-5 font-semibold">{title}</h3>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-sage">
              {acquisitionLinks.eyebrow}
            </p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold sm:text-5xl">
              {acquisitionLinks.title}
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Link
                href={localizedMarketingPath(language, '/ai-study-planner')}
                className="rounded-mp bg-surface p-6 shadow-soft"
              >
                <CalendarDays className="text-sage" aria-hidden="true" />
                <h3 className="mt-5 text-2xl font-semibold">
                  {acquisitionLinks.plannerTitle}
                </h3>
                <p className="mt-3 leading-8 text-muted">
                  {acquisitionLinks.plannerDescription}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-semibold text-sage">
                  {acquisitionLinks.readLabel}{' '}
                  <ArrowRight aria-hidden="true" size={16} />
                </span>
              </Link>
              <Link
                href={localizedMarketingPath(
                  language,
                  '/catch-up-on-schoolwork',
                )}
                className="rounded-mp bg-surface p-6 shadow-soft"
              >
                <LifeBuoy className="text-sage" aria-hidden="true" />
                <h3 className="mt-5 text-2xl font-semibold">
                  {acquisitionLinks.recoveryTitle}
                </h3>
                <p className="mt-3 leading-8 text-muted">
                  {acquisitionLinks.recoveryDescription}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-semibold text-sage">
                  {acquisitionLinks.readLabel}{' '}
                  <ArrowRight aria-hidden="true" size={16} />
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-sage">
                {copy.whyLabel}
              </p>
              <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">
                {copy.whyTitle}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {copy.whyItems.map((item) => (
                <div
                  key={item}
                  className="rounded-mp bg-surface p-5 shadow-soft"
                >
                  <CheckCircle2 className="text-sage" />
                  <p className="mt-4 font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 rounded-[2rem] bg-sage-soft p-8 shadow-soft lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <LockKeyhole className="text-sage" />
              <h2 className="mt-4 text-2xl font-semibold">
                {copy.privacyTitle}
              </h2>
              <p className="mt-2 max-w-2xl leading-7 text-ink">
                {copy.privacyCopy}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-6 font-semibold text-canvas"
              >
                {copy.privacySignup}
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-surface px-6 font-semibold"
              >
                {copy.privacyLogin}
              </Link>
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 rounded-[2rem] bg-ink p-8 text-canvas shadow-soft lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-sage-soft">
                {copy.betaLabel}
              </p>
              <h2 className="mt-3 text-3xl font-semibold">{copy.betaTitle}</h2>
              <p className="mt-3 max-w-3xl leading-7 text-canvas/70">
                {copy.betaCopy}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href={localizedMarketingPath(language, '/beta')}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-sage px-6 font-semibold text-canvas"
              >
                {copy.betaCta}
              </Link>
              <FeedbackModal
                label={copy.betaFeedback}
                language={language}
                flow="landing"
              />
            </div>
          </div>
        </section>

        <div className="px-5 pb-10 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <SiteFooter language={language} marketingLocale={language} />
          </div>
        </div>
      </main>
    </div>
  );
}
