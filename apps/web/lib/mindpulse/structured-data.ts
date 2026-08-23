import { CANONICAL_ORIGIN, SUPPORTED_MARKETING_LOCALES } from '../seo';

const ORG_ID = `${CANONICAL_ORIGIN}/#organization`;
const WEBSITE_ID = `${CANONICAL_ORIGIN}/#website`;
const SOFTWARE_ID = `${CANONICAL_ORIGIN}/#software`;

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'Northlight',
    url: CANONICAL_ORIGIN,
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: CANONICAL_ORIGIN,
    name: 'MindPulse',
    publisher: { '@id': ORG_ID },
    inLanguage: [...SUPPORTED_MARKETING_LOCALES],
  };
}

export function softwareApplicationSchema() {
  // Note: We do not fabricate aggregateRating or reviews. MindPulse currently lacks
  // legitimate qualifying review data. This schema is strictly for semantic/entity
  // understanding and is not currently eligible for the Google Software App rich result.
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': SOFTWARE_ID,
    name: 'MindPulse',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: { '@id': ORG_ID },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
