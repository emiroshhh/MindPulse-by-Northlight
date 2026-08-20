'use client';

import { ArrowLeft, ArrowRight, Brain, Globe2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useLayoutEffect, useMemo } from 'react';
import { brandedMarketingTitle } from '@/lib/marketing-seo';
import { applyDocumentLanguage } from '@/lib/mindpulse/local-store';
import { acquisitionLinksCopyFor } from '@/lib/mindpulse/acquisition-links-i18n';
import {
  publicPageCopyFor,
  type PublicPageId,
} from '@/lib/mindpulse/public-page-i18n';
import { languages, type LanguageCode } from '@/lib/mindpulse/tools';
import { useRouteLanguage } from '@/lib/mindpulse/use-route-language';
import { useLocalizedMetadata } from '@/lib/mindpulse/use-localized-metadata';
import {
  localizedMarketingPath,
  type IndexableMarketingPath,
  type MarketingLocale,
} from '@/lib/seo';
import { FeedbackModal } from './feedback-modal';
import { SiteFooter } from './site-footer';

const SECONDARY_HREF: Record<PublicPageId, IndexableMarketingPath | '/study'> =
  {
    privacy: '/study',
    why: '/case-study',
    beta: '/privacy',
    'case-study': '/beta',
    impact: '/beta',
  };

export function LocalizedPublicPage({
  page,
  initialLanguage,
}: {
  page: PublicPageId;
  initialLanguage?: MarketingLocale;
}) {
  const [language, setLanguage] = useRouteLanguage(initialLanguage);
  const copy = useMemo(
    () => publicPageCopyFor(page, language),
    [page, language],
  );

  useLocalizedMetadata(
    brandedMarketingTitle(copy.metadataTitle),
    copy.metadataDescription,
  );

  const labels: Record<
    LanguageCode,
    { back: string; open: string; language: string }
  > = {
    en: {
      back: 'Back to MindPulse overview',
      open: 'Open the app',
      language: 'Language',
    },
    ru: {
      back: 'Вернуться к обзору MindPulse',
      open: 'Открыть приложение',
      language: 'Язык',
    },
    kk: {
      back: 'MindPulse шолу бетіне оралу',
      open: 'Қолданбаны ашу',
      language: 'Тіл',
    },
    es: {
      back: 'Volver a la descripción de MindPulse',
      open: 'Abrir la aplicación',
      language: 'Idioma',
    },
  };
  const label = labels[language];
  const acquisitionLinks = acquisitionLinksCopyFor(language);
  const documentLanguage = language;
  const homeHref = localizedMarketingPath(language, '/');
  const secondaryPath = SECONDARY_HREF[page];
  const secondaryHref =
    secondaryPath === '/study'
      ? secondaryPath
      : localizedMarketingPath(language, secondaryPath);

  useLayoutEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) applyDocumentLanguage(documentLanguage);
    });
    return () => {
      active = false;
      applyDocumentLanguage(language);
    };
  }, [documentLanguage, language]);

  return (
    <div lang={language} className="ambient min-h-screen overflow-x-hidden">
      <header className="border-b border-ink/5 bg-canvas/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <Link
            href={homeHref}
            className="flex min-h-11 min-w-11 items-center justify-center gap-3 sm:justify-start"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-canvas">
              <Brain size={20} />
            </span>
            <span className="hidden sm:block">
              <b className="block">MindPulse</b>
              <small
                lang="en"
                className="font-semibold uppercase tracking-[.16em] text-muted"
              >
                by Northlight
              </small>
            </span>
          </Link>
          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
            <label className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full bg-surface px-3 text-sm font-semibold shadow-soft">
              <Globe2 size={15} className="shrink-0" />
              <span className="sr-only">{label.language}</span>
              <select
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as LanguageCode)
                }
                aria-label={label.language}
                className="min-h-11 min-w-0 max-w-[8.5rem] bg-transparent font-semibold outline-none"
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
              className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-canvas"
            >
              {label.open}
            </Link>
          </div>
        </nav>
      </header>

      <main
        id="main-content"
        className="mx-auto max-w-5xl min-w-0 px-4 py-10 sm:px-8 sm:py-12"
      >
        <Link
          href={homeHref}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-5 text-sm font-semibold shadow-soft"
        >
          <ArrowLeft size={16} /> {label.back}
        </Link>

        <div>
          <section className="mt-8 min-w-0 rounded-[2rem] bg-surface p-6 shadow-soft sm:p-10">
            <p className="inline-flex max-w-full items-center gap-2 rounded-full bg-sage-soft px-4 py-2 text-xs font-bold uppercase tracking-[.14em] text-sage">
              <Sparkles size={15} className="shrink-0" />{' '}
              <span className="break-words">{copy.eyebrow}</span>
            </p>
            <h1 className="mt-6 break-words text-4xl font-semibold leading-tight tracking-[-.04em] sm:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-9 text-muted">
              {copy.intro}
            </p>
          </section>

          <section className="mt-6 grid min-w-0 gap-4 md:grid-cols-2">
            {copy.sections.map((section) => (
              <article
                key={section.title}
                className="min-w-0 rounded-mp bg-surface p-6 shadow-soft"
              >
                <h2 className="break-words text-2xl font-semibold">
                  {section.title}
                </h2>
                <p className="mt-3 leading-8 text-muted">{section.body}</p>
                {section.items && (
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-muted">
                    {section.items.map((item) => (
                      <li key={item} className="flex min-w-0 gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sage"
                        />
                        <span className="break-words">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </section>

          <section className="mt-6 rounded-[2rem] bg-sage-soft p-6 shadow-soft sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-sage">
              {acquisitionLinks.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              {acquisitionLinks.title}
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Link
                href={localizedMarketingPath(language, '/ai-study-planner')}
                className="rounded-mp bg-surface p-5"
              >
                <b className="text-lg">{acquisitionLinks.plannerTitle}</b>
                <p className="mt-2 leading-7 text-muted">
                  {acquisitionLinks.plannerDescription}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 font-semibold text-sage">
                  {acquisitionLinks.readLabel}{' '}
                  <ArrowRight aria-hidden="true" size={16} />
                </span>
              </Link>
              <Link
                href={localizedMarketingPath(
                  language,
                  '/catch-up-on-schoolwork',
                )}
                className="rounded-mp bg-surface p-5"
              >
                <b className="text-lg">{acquisitionLinks.recoveryTitle}</b>
                <p className="mt-2 leading-7 text-muted">
                  {acquisitionLinks.recoveryDescription}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 font-semibold text-sage">
                  {acquisitionLinks.readLabel}{' '}
                  <ArrowRight aria-hidden="true" size={16} />
                </span>
              </Link>
            </div>
          </section>

          <section className="mt-6 min-w-0 rounded-[2rem] bg-ink p-6 text-canvas shadow-soft sm:p-8">
            <h2 className="break-words text-3xl font-semibold">
              {copy.ctaTitle}
            </h2>
            <p className="mt-3 max-w-3xl leading-8 text-canvas/70">
              {copy.ctaBody}
            </p>
            <div className="mt-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/app"
                className="inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-full bg-sage px-5 text-center font-semibold text-canvas"
              >
                <span className="break-words">{copy.ctaPrimary}</span>{' '}
                <ArrowRight size={16} className="shrink-0" />
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex min-h-12 min-w-0 items-center justify-center rounded-full bg-canvas/10 px-5 text-center font-semibold text-canvas"
              >
                <span className="break-words">{copy.ctaSecondary}</span>
              </Link>
            </div>
          </section>
        </div>

        <div className="mt-6">
          <FeedbackModal language={language} />
        </div>
        <SiteFooter language={language} marketingLocale={language} />
      </main>
    </div>
  );
}
