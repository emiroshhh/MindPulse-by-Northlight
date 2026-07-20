'use client';

import Link from 'next/link';
import React from 'react';
import { copyFor } from '../../lib/mindpulse/i18n';
import type { LanguageCode } from '../../lib/mindpulse/tools';
import { FeedbackModal } from './feedback-modal';

export function SiteFooter({
  language,
  note,
}: {
  language?: LanguageCode;
  note?: string;
}) {
  const ui = copyFor(language ?? 'en');
  const footerNote = note ?? ui.footerNote;

  return (
    <footer className="mt-8 rounded-mp bg-surface p-5 text-sm text-muted shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav
          aria-label={
            language === 'es'
              ? 'Navegación del pie de página'
              : 'Footer navigation'
          }
          className="flex flex-wrap items-center gap-4"
        >
          <Link
            href="/app"
            className="inline-flex min-h-11 min-w-11 items-center justify-center font-semibold hover:text-ink"
          >
            {ui.footerDashboard}
          </Link>
          <Link
            href="/why"
            className="inline-flex min-h-11 min-w-11 items-center justify-center font-semibold hover:text-ink"
          >
            {ui.footerWhy}
          </Link>
          <Link
            href="/beta"
            className="inline-flex min-h-11 min-w-11 items-center justify-center font-semibold hover:text-ink"
          >
            {ui.footerBeta}
          </Link>
          <Link
            href="/case-study"
            className="inline-flex min-h-11 min-w-11 items-center justify-center font-semibold hover:text-ink"
          >
            {ui.footerCaseStudy}
          </Link>
          <Link
            href="/impact"
            className="inline-flex min-h-11 min-w-11 items-center justify-center font-semibold hover:text-ink"
          >
            {ui.footerImpact}
          </Link>
          <Link
            href="/privacy"
            className="inline-flex min-h-11 min-w-11 items-center justify-center font-semibold hover:text-ink"
          >
            {ui.footerPrivacy}
          </Link>
          <FeedbackModal compact language={language ?? 'en'} />
        </nav>
        <p className="max-w-xl leading-6">{footerNote}</p>
      </div>
    </footer>
  );
}
