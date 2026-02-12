import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Main sitemap only includes core pages, not articles
    // Articles are included in language-specific sitemaps (sitemap-en.xml, sitemap-ar.xml, etc.)
    const baseUrl = 'https://ocean.galatide.com'
    const languages = ['en', 'ar', 'zh', 'ru', 'de', 'fr', 'hi']
    
    const sitemapEntries: MetadataRoute.Sitemap = []
    
    // Add main pages for each language (no articles)
    for (const lang of languages) {
      // Homepage
      sitemapEntries.push({
        url: `${baseUrl}/${lang}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      })
      
      // Articles listing page
      sitemapEntries.push({
        url: `${baseUrl}/${lang}/articles`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      })
      
      // Newsletter page
      sitemapEntries.push({
        url: `${baseUrl}/${lang}/newsletter`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }

    return sitemapEntries
  } catch (error) {
    console.error('Error generating main sitemap:', error)
    return []
  }
}
