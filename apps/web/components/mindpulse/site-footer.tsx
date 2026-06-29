'use client';

import Link from 'next/link';
import { FeedbackModal } from './feedback-modal';

export function SiteFooter({
  note = 'MindPulse is not therapy or emergency help. AI can make mistakes.',
}: {
  note?: string;
}) {
  return (
    <footer className="mt-8 rounded-mp bg-surface p-5 text-sm text-muted shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-4"
        >
          <Link href="/app" className="font-semibold hover:text-ink">
            Dashboard
          </Link>
          <Link href="/why" className="font-semibold hover:text-ink">
            Why I built this
          </Link>
          <Link href="/impact" className="font-semibold hover:text-ink">
            Impact
          </Link>
          <Link href="/privacy" className="font-semibold hover:text-ink">
            Privacy
          </Link>
          <FeedbackModal compact />
        </nav>
        <p className="max-w-xl leading-6">{note}</p>
      </div>
    </footer>
  );
}
