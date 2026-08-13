import type { MetadataRoute } from 'next';
import {
  absoluteSiteUrl,
  INDEXABLE_MARKETING_PATHS,
  languageAlternates,
  localizedMarketingPath,
  SUPPORTED_MARKETING_LOCALES,
} from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_MARKETING_PATHS.flatMap((pathname) =>
    SUPPORTED_MARKETING_LOCALES.map((locale) => ({
      url: absoluteSiteUrl(localizedMarketingPath(locale, pathname)),
      alternates: { languages: languageAlternates(pathname) },
    })),
  );
}
