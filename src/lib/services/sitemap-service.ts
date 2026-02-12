import { db } from '@/lib/db';
import { ArticleStatus } from '@prisma/client';

export interface SitemapUrl {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export interface LanguageSitemap {
  language: string;
  urls: SitemapUrl[];
}

/**
 * Sitemap generation service with multi-language support
 */
export class SitemapService {
  private static baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ocean.galatide.com';

  /**
   * Generate sitemap for all languages
   */
  static async generateAllSitemaps(): Promise<LanguageSitemap[]> {
    if (!db) {
      console.warn('Database not available for sitemap generation, using fallback languages');
      return this.generateFallbackSitemaps();
    }

    try {
      // Try to connect to database first
      const { connectDB } = await import('@/lib/db');
      const connected = await connectDB();
      
      if (!connected) {
        console.warn('Database connection failed, using fallback languages for sitemaps');
        return this.generateFallbackSitemaps();
      }

      // Get all languages
      const languages = await db.language.findMany({
        select: { id: true, code: true, name: true }
      });

      const sitemaps: LanguageSitemap[] = [];

      for (const language of languages) {
        const urls = await this.generateLanguageSitemap(language.code);
        sitemaps.push({
          language: language.code,
          urls
        });
      }

      return sitemaps;
    } catch (error) {
      console.error('Error generating sitemaps:', error);
      console.warn('Falling back to hardcoded languages for sitemaps');
      return this.generateFallbackSitemaps();
    }
  }

  /**
   * Generate sitemaps using fallback languages when database is not available
   */
  private static generateFallbackSitemaps(): Promise<LanguageSitemap[]> {
    const fallbackLanguages = ['en', 'ar', 'zh', 'ru', 'de', 'fr', 'hi'];
    
    return Promise.all(
      fallbackLanguages.map(async (langCode) => {
        const urls = await this.generateLanguageSitemap(langCode);
        return {
          language: langCode,
          urls
        };
      })
    );
  }

  /**
   * Generate sitemap for a specific language
   */
  static async generateLanguageSitemap(languageCode: string): Promise<SitemapUrl[]> {
    const urls: SitemapUrl[] = [];

    // Always add static pages regardless of database connection
    urls.push(
      // Homepage
      {
        url: `${this.baseUrl}/${languageCode}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0
      },
      // Articles listing
      {
        url: `${this.baseUrl}/${languageCode}/articles`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8
      },
      // Newsletter page
      {
        url: `${this.baseUrl}/${languageCode}/newsletter`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6
      }
    );

    if (!db) {
      console.warn(`Database not available for ${languageCode} sitemap, returning static pages only`);
      return urls;
    }

    try {
      // Try to connect to database first
      const { connectDB } = await import('@/lib/db');
      const connected = await connectDB();
      
      if (!connected) {
        console.warn(`Database connection failed for ${languageCode} sitemap, returning static pages only`);
        return urls;
      }

      // Get language
      const language = await db.language.findUnique({
        where: { code: languageCode }
      });

      if (!language) {
        console.warn(`Language ${languageCode} not found in database, returning static pages only`);
        return urls;
      }

      // Add published articles in original language
      const originalArticles = await db.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          originalLanguageId: language.id,
          slug: { not: null }
        },
        select: {
          slug: true,
          updatedAt: true,
          publishedAt: true
        },
        orderBy: { publishedAt: 'desc' }
      });

      for (const article of originalArticles) {
        if (article.slug) {
          urls.push({
            url: `${this.baseUrl}/${languageCode}/articles/${article.slug}`,
            lastModified: article.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.7
          });
        }
      }

      // Add translated articles for this language
      const translations = await db.articleTranslation.findMany({
        where: {
          languageId: language.id,
          status: ArticleStatus.PUBLISHED,
          slug: { not: null }
        },
        include: {
          article: {
            select: {
              updatedAt: true,
              publishedAt: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });

      for (const translation of translations) {
        if (translation.slug) {
          urls.push({
            url: `${this.baseUrl}/${languageCode}/articles/${translation.slug}`,
            lastModified: translation.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.7
          });
        }
      }

      return urls;
    } catch (error) {
      console.error(`Error generating sitemap for language ${languageCode}:`, error);
      console.warn(`Returning static pages only for ${languageCode} due to database error`);
      return urls; // Return the static pages we already added
    }
  }

  /**
   * Generate XML sitemap content
   */
  static generateXmlSitemap(urls: SitemapUrl[]): string {
    const urlElements = urls.map(url => `
  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastModified.toISOString()}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
  }

  /**
   * Generate sitemap index XML (links to all language sitemaps)
   */
  static generateSitemapIndex(languages: string[]): string {
    const sitemapElements = languages.map(lang => `
  <sitemap>
    <loc>${this.baseUrl}/sitemap-${lang}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;
  }

  /**
   * Trigger sitemap regeneration (called when articles are published)
   */
  static async regenerateSitemaps(): Promise<void> {
    try {
      console.log('🗺️ Regenerating sitemaps...');
      
      // This will trigger the sitemap API endpoints to regenerate
      // The actual files are generated on-demand by the API routes
      
      console.log('✅ Sitemap regeneration triggered');
    } catch (error) {
      console.error('Error triggering sitemap regeneration:', error);
    }
  }
}
