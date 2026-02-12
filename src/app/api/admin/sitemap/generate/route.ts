import { NextRequest, NextResponse } from 'next/server';
import { SitemapService } from '@/lib/services/sitemap-service';

export async function POST(request: NextRequest) {
  try {
    const { language } = await request.json();

    if (!language) {
      return NextResponse.json({ error: 'Language is required' }, { status: 400 });
    }

    // Validate language code
    const supportedLanguages = ['en', 'ar', 'zh', 'ru', 'de', 'fr', 'hi'];
    if (!supportedLanguages.includes(language)) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }

    console.log(`🗺️ Admin: Validating sitemap for language: ${language}`);

    // Test generate sitemap for the specific language to validate it works
    const urls = await SitemapService.generateLanguageSitemap(language);
    
    console.log(`✅ Admin: Sitemap validated for ${language} with ${urls.length} URLs`);

    // Note: We don't actually "generate" files - sitemaps are served dynamically
    // This endpoint just validates that the sitemap generation works
    return NextResponse.json({
      success: true,
      language,
      urlCount: urls.length,
      message: `Sitemap generated for ${language}. Access it at /sitemap-${language}.xml`,
      sitemapUrl: `/sitemap-${language}.xml`,
      lastGenerated: new Date().toISOString(),
      urls: urls.slice(0, 5).map(url => ({ // Only return first 5 URLs for preview
        url: url.url,
        lastModified: url.lastModified,
        changeFrequency: url.changeFrequency,
        priority: url.priority
      }))
    });

  } catch (error) {
    console.error('Error validating sitemap:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}
