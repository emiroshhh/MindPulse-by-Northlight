import {
  crisisRepliesFor,
  resourcesForRegion,
  toSafetyLocale,
} from '@mindpulse/shared';

/**
 * Deterministic crisis response payload shared by every route that screens
 * user text. Localized (kk always paired with ru until native review) and
 * region-aware via cf-ipcountry — never assumes a country.
 */
export function crisisPayload(language: string, request: Request) {
  const locale = toSafetyLocale(language);
  const region = request.headers.get('cf-ipcountry') ?? 'UNKNOWN';
  return {
    crisis: true as const,
    reply: crisisRepliesFor(locale).join('\n\n'),
    resources: resourcesForRegion(region).map((resource) => ({
      id: resource.id,
      name: resource.name[locale],
      description: resource.description[locale],
      url: resource.url,
      availability: resource.availability[locale],
    })),
  };
}
