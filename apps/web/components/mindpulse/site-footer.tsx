'use client';

import Link from 'next/link';
import { copyFor } from '@/lib/mindpulse/i18n';
import type { LanguageCode } from '@/lib/mindpulse/tools';
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
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-4"
        >
          <Link href="/app" className="font-semibold hover:text-ink">
            {ui.footerDashboard}
          </Link>
          <Link href="/why" className="font-semibold hover:text-ink">
            {ui.footerWhy}
          </Link>
          <Link href="/impact" className="font-semibold hover:text-ink">
            {ui.footerImpact}
          </Link>
          <Link href="/privacy" className="font-semibold hover:text-ink">
            {ui.footerPrivacy}
          </Link>
          <FeedbackModal compact />
        </nav>
        <p className="max-w-xl leading-6">{footerNote}</p>
      </div>
    </footer>
  );
}
