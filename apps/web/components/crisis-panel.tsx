import React from 'react';
import { ExternalLink, HeartHandshake, ShieldAlert } from 'lucide-react';
import { resourcesForRegion, t, type Locale } from '@mindpulse/shared';
import { Card } from './ui';

export function CrisisPanel({
  locale,
  compact = false,
}: {
  locale: Locale;
  compact?: boolean;
}) {
  const resources = resourcesForRegion('KZ');
  return (
    <Card
      className="border-danger/20 bg-crisis p-5"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-danger">
          <ShieldAlert size={20} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-ink">{t(locale, 'crisisTitle')}</h3>
          <p className="mt-1 text-sm leading-6 text-muted">
            {t(locale, 'crisisBody')}
          </p>
          {!compact && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-white/70 p-3 text-sm text-ink dark:bg-white/5">
              <HeartHandshake
                className="mt-0.5 shrink-0"
                size={17}
                aria-hidden
              />
              {locale === 'en'
                ? 'If you can, move near a safe person and tell them clearly: “I need help staying safe right now.”'
                : 'Если можешь, подойди к безопасному человеку и скажи прямо: «Мне сейчас нужна помощь, чтобы оставаться в безопасности».'}
            </p>
          )}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-xl border border-ink/10 bg-white/80 p-3 outline-none transition hover:border-sage focus-visible:ring-2 focus-visible:ring-sage dark:bg-white/5"
              >
                <span className="flex items-center justify-between gap-2 font-semibold text-ink">
                  {resource.name[locale]}
                  <ExternalLink size={15} aria-hidden />
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted">
                  {resource.availability[locale]}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
