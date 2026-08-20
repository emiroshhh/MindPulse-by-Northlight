import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  CircleAlert,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { acquisitionLinksCopyFor } from '@/lib/mindpulse/acquisition-links-i18n';
import {
  acquisitionPageCopyFor,
  type AcquisitionPageId,
} from '@/lib/mindpulse/acquisition-page-i18n';
import {
  localizedMarketingPath,
  SUPPORTED_MARKETING_LOCALES,
  type MarketingLocale,
} from '@/lib/seo';

const UI = {
  en: {
    language: 'Language',
    home: 'MindPulse overview',
    app: 'Open the app',
    related: 'Related MindPulse guides',
    why: 'Why MindPulse was built',
    beta: 'How to test the student beta',
    privacy: 'How MindPulse handles student data',
    footer: 'Public information',
  },
  ru: {
    language: 'Язык',
    home: 'Обзор MindPulse',
    app: 'Открыть приложение',
    related: 'Другие материалы MindPulse',
    why: 'Зачем создан MindPulse',
    beta: 'Как протестировать студенческую бету',
    privacy: 'Как MindPulse работает с данными студентов',
    footer: 'Публичная информация',
  },
  kk: {
    language: 'Тіл',
    home: 'MindPulse шолуы',
    app: 'Қолданбаны ашу',
    related: 'MindPulse туралы қосымша нұсқаулықтар',
    why: 'MindPulse не үшін жасалды',
    beta: 'Студенттік бета-нұсқаны қалай сынауға болады',
    privacy: 'MindPulse студент деректерін қалай өңдейді',
    footer: 'Ашық ақпарат',
  },
  es: {
    language: 'Idioma',
    home: 'Descripción de MindPulse',
    app: 'Abrir la aplicación',
    related: 'Guías relacionadas de MindPulse',
    why: 'Por qué se creó MindPulse',
    beta: 'Cómo probar la beta para estudiantes',
    privacy: 'Cómo trata MindPulse los datos estudiantiles',
    footer: 'Información pública',
  },
} satisfies Record<MarketingLocale, Record<string, string>>;

const LANGUAGE_LABELS: Record<MarketingLocale, string> = {
  en: 'English',
  ru: 'Русский',
  kk: 'Қазақша (beta)',
  es: 'Español',
};

const PATHS: Record<
  AcquisitionPageId,
  '/ai-study-planner' | '/catch-up-on-schoolwork'
> = {
  'ai-study-planner': '/ai-study-planner',
  'catch-up-on-schoolwork': '/catch-up-on-schoolwork',
};

const APP_PATHS: Record<AcquisitionPageId, '/planner' | '/recovery'> = {
  'ai-study-planner': '/planner',
  'catch-up-on-schoolwork': '/recovery',
};

export function LocalizedAcquisitionPage({
  page,
  locale,
}: {
  page: AcquisitionPageId;
  locale: MarketingLocale;
}) {
  const copy = acquisitionPageCopyFor(page, locale);
  const links = acquisitionLinksCopyFor(locale);
  const ui = UI[locale];
  const alternatePage: AcquisitionPageId =
    page === 'ai-study-planner' ? 'catch-up-on-schoolwork' : 'ai-study-planner';
  const alternateTitle =
    alternatePage === 'ai-study-planner'
      ? links.plannerTitle
      : links.recoveryTitle;
  const alternateDescription =
    alternatePage === 'ai-study-planner'
      ? links.plannerDescription
      : links.recoveryDescription;

  return (
    <div lang={locale} className="ambient min-h-screen overflow-x-hidden">
      <header className="border-b border-ink/5 bg-canvas/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4 sm:px-8">
          <Link
            href={localizedMarketingPath(locale, '/')}
            className="flex min-h-11 items-center gap-3"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-canvas">
              <Brain aria-hidden="true" size={20} />
            </span>
            <span>
              <b className="block text-sm">MindPulse</b>
              <small
                lang="en"
                className="font-semibold uppercase tracking-[.16em] text-muted"
              >
                by Northlight
              </small>
            </span>
          </Link>
          <nav
            aria-label={ui.language}
            className="ml-auto flex flex-wrap items-center justify-end gap-1 text-sm"
          >
            {SUPPORTED_MARKETING_LOCALES.map((language) => (
              <Link
                key={language}
                href={localizedMarketingPath(language, PATHS[page])}
                hrefLang={language}
                aria-current={language === locale ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center rounded-full px-3 font-semibold ${
                  language === locale
                    ? 'bg-ink text-canvas'
                    : 'bg-surface text-muted hover:text-ink'
                }`}
              >
                {LANGUAGE_LABELS[language]}
              </Link>
            ))}
          </nav>
          <Link
            href="/app"
            className="inline-flex min-h-11 items-center rounded-full bg-sage px-4 text-sm font-semibold text-canvas"
          >
            {ui.app}
          </Link>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        <Link
          href={localizedMarketingPath(locale, '/')}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-5 text-sm font-semibold shadow-soft"
        >
          <ArrowLeft aria-hidden="true" size={16} /> {ui.home}
        </Link>

        <article>
          <header className="mt-8 rounded-[2rem] bg-surface p-6 shadow-soft sm:p-10">
            <p className="inline-flex items-center gap-2 rounded-full bg-sage-soft px-4 py-2 text-xs font-bold uppercase tracking-[.14em] text-ink">
              <Sparkles aria-hidden="true" size={15} /> {copy.eyebrow}
            </p>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-[-.04em] sm:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-4xl text-lg leading-9 text-muted">
              {copy.intro}
            </p>
          </header>

          <section className="mt-6 rounded-[2rem] bg-ink p-6 text-canvas shadow-soft sm:p-8">
            <h2 className="text-3xl font-semibold">{copy.answerTitle}</h2>
            <p className="mt-4 max-w-4xl leading-8 text-canvas/75">
              {copy.answerBody}
            </p>
          </section>

          <section className="mt-6 rounded-[2rem] bg-surface p-6 shadow-soft sm:p-8">
            <h2 className="text-3xl font-semibold">{copy.fitTitle}</h2>
            <ul className="mt-5 grid gap-3 md:grid-cols-2">
              {copy.fitItems.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-2xl bg-sage-soft/60 p-4 leading-7"
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-sage"
                    size={18}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-3xl font-semibold">{copy.stepsTitle}</h2>
            <p className="mt-3 max-w-4xl leading-8 text-muted">
              {copy.stepsIntro}
            </p>
            <ol className="mt-6 grid gap-4">
              {copy.steps.map((step, index) => (
                <li
                  key={step.title}
                  className="grid gap-4 rounded-mp bg-surface p-6 shadow-soft sm:grid-cols-[3rem_1fr]"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-sage font-bold text-canvas">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2 leading-8 text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-8 rounded-[2rem] bg-sage-soft p-6 shadow-soft sm:p-8">
            <h2 className="text-3xl font-semibold">{copy.exampleTitle}</h2>
            <p className="mt-3 max-w-4xl leading-8 text-ink">
              {copy.exampleContext}
            </p>
            <ul className="mt-5 space-y-3">
              {copy.exampleItems.map((item) => (
                <li key={item} className="flex gap-3 leading-8">
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-sage"
                    size={19}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-[2rem] border border-ink/10 bg-surface p-6 shadow-soft sm:p-8">
            <h2 className="flex items-center gap-3 text-3xl font-semibold">
              <CircleAlert aria-hidden="true" className="text-sage" />
              {copy.limitsTitle}
            </h2>
            <p className="mt-3 max-w-4xl leading-8 text-muted">
              {copy.limitsIntro}
            </p>
            <ul className="mt-5 space-y-3 text-muted">
              {copy.limits.map((item) => (
                <li key={item} className="flex gap-3 leading-8">
                  <span
                    aria-hidden="true"
                    className="mt-3 h-2 w-2 shrink-0 rounded-full bg-sage"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-3xl font-semibold">{copy.faqTitle}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {copy.faqs.map((faq) => (
                <article
                  key={faq.question}
                  className="rounded-mp bg-surface p-6 shadow-soft"
                >
                  <h3 className="text-xl font-semibold">{faq.question}</h3>
                  <p className="mt-3 leading-8 text-muted">{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>

          <aside className="mt-8 rounded-[2rem] bg-surface p-6 shadow-soft sm:p-8">
            <h2 className="text-2xl font-semibold">{ui.related}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Link
                href={localizedMarketingPath(locale, PATHS[alternatePage])}
                className="rounded-mp bg-sage-soft p-5"
              >
                <b className="text-lg">{alternateTitle}</b>
                <p className="mt-2 leading-7 text-ink">
                  {alternateDescription}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 font-semibold text-ink">
                  {links.readLabel} <ArrowRight aria-hidden="true" size={16} />
                </span>
              </Link>
              <div className="grid gap-2">
                <Link
                  href={localizedMarketingPath(locale, '/why')}
                  className="rounded-2xl bg-canvas p-4 font-semibold"
                >
                  {ui.why}
                </Link>
                <Link
                  href={localizedMarketingPath(locale, '/beta')}
                  className="rounded-2xl bg-canvas p-4 font-semibold"
                >
                  {ui.beta}
                </Link>
                <Link
                  href={localizedMarketingPath(locale, '/privacy')}
                  className="rounded-2xl bg-canvas p-4 font-semibold"
                >
                  {ui.privacy}
                </Link>
              </div>
            </div>
          </aside>

          <section className="mt-8 rounded-[2rem] bg-ink p-6 text-canvas shadow-soft sm:p-8">
            <h2 className="text-3xl font-semibold">{copy.ctaTitle}</h2>
            <p className="mt-3 max-w-4xl leading-8 text-canvas/70">
              {copy.ctaBody}
            </p>
            <Link
              href={APP_PATHS[page]}
              className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-sage px-6 font-semibold text-canvas"
            >
              {copy.ctaLabel} <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </section>
        </article>

        <footer className="mt-8 rounded-mp bg-surface p-5 text-sm text-muted shadow-soft">
          <nav aria-label={ui.footer} className="flex flex-wrap gap-4">
            <Link
              className="inline-flex min-h-11 items-center font-semibold hover:text-ink"
              href={localizedMarketingPath(locale, '/')}
            >
              {ui.home}
            </Link>
            <Link
              className="inline-flex min-h-11 items-center font-semibold hover:text-ink"
              href={localizedMarketingPath(locale, '/why')}
            >
              {ui.why}
            </Link>
            <Link
              className="inline-flex min-h-11 items-center font-semibold hover:text-ink"
              href={localizedMarketingPath(locale, '/privacy')}
            >
              {ui.privacy}
            </Link>
          </nav>
        </footer>
      </main>
    </div>
  );
}
