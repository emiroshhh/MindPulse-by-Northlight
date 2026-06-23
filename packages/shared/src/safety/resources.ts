import type { Locale } from '../types';

export interface CrisisResource {
  id: string;
  regions: string[];
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  phone: string | null;
  url: string;
  availability: Record<Locale, string>;
  verification: {
    status: 'verified' | 'verification_required';
    source: string;
    checkedAt: string | null;
  };
}

/**
 * Launch gate: entries marked verification_required must be checked by a human
 * against the linked government/helpline source before a phone number is added.
 * A missing number is intentional and safer than publishing stale information.
 */
export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    id: 'kz-government-emergency',
    regions: ['KZ'],
    name: {
      en: 'Kazakhstan emergency help',
      ru: 'Экстренная помощь в Казахстане',
    },
    description: {
      en: 'Open the official government directory to find the current emergency contact for your location.',
      ru: 'Открой официальный государственный справочник, чтобы найти актуальный экстренный контакт для своего региона.',
    },
    phone: null,
    url: 'https://www.gov.kz/memleket/entities/emer?lang=en',
    availability: {
      en: 'Use now if there is immediate danger',
      ru: 'Используй сейчас, если есть непосредственная опасность',
    },
    verification: {
      status: 'verification_required',
      source:
        'Ministry for Emergency Situations of the Republic of Kazakhstan (gov.kz)',
      checkedAt: null,
    },
  },
  {
    id: 'international-find-a-helpline',
    regions: ['*'],
    name: { en: 'Find a Helpline', ru: 'Find a Helpline' },
    description: {
      en: 'Find verified, free and confidential support available in your country.',
      ru: 'Найди проверенную бесплатную и конфиденциальную поддержку в своей стране.',
    },
    phone: null,
    url: 'https://findahelpline.com/',
    availability: {
      en: 'International directory',
      ru: 'Международный справочник',
    },
    verification: {
      status: 'verified',
      source: 'findahelpline.com public directory',
      checkedAt: '2026-06-22',
    },
  },
];

export function resourcesForRegion(region = 'KZ') {
  return CRISIS_RESOURCES.filter(
    (resource) =>
      resource.regions.includes(region) || resource.regions.includes('*'),
  );
}
