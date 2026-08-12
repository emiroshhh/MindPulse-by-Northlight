import type { MetadataRoute } from 'next';
import { absoluteSiteUrl, INDEXABLE_MARKETING_PATHS } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_MARKETING_PATHS.map((pathname) => ({
    url: absoluteSiteUrl(pathname),
  }));
}
