import { NextRequest, NextResponse } from 'next/server';
import { SitemapService } from '@/lib/services/sitemap-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { language } = await request.json();
    
    if (!language) {
      return NextResponse.json(
        { error: 'Language parameter is required' },
        { status: 400 }
      );
    }

    console.log(`🗺️ Generating sitemap for language: ${language}`);
    
    // Generate sitemap for the specified language
    const urls = await SitemapService.generateLanguageSitemap(language);
    
    console.log(`✅ Generated sitemap for ${language} with ${urls.length} URLs`);
    
    return NextResponse.json({
      success: true,
      language,
      urlCount: urls.length,
      urls: urls.map(url => ({
        url: url.url,
        lastModified: url.lastModified,
        changeFrequency: url.changeFrequency,
        priority: url.priority
      }))
    });
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return NextResponse.json(
      { error: 'Failed to generate sitemap' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('🗺️ Generating sitemaps for all languages...');
    
    // Generate sitemaps for all languages
    const allSitemaps = await SitemapService.generateAllSitemaps();
    
    const result = allSitemaps.map(sitemap => ({
      language: sitemap.language,
      urlCount: sitemap.urls.length,
      urls: sitemap.urls.map(url => ({
        url: url.url,
        lastModified: url.lastModified,
        changeFrequency: url.changeFrequency,
        priority: url.priority
      }))
    }));
    
    console.log(`✅ Generated sitemaps for ${allSitemaps.length} languages`);
    
    return NextResponse.json({
      success: true,
      sitemaps: result
    });
    
  } catch (error) {
    console.error('Error generating all sitemaps:', error);
    return NextResponse.json(
      { error: 'Failed to generate sitemaps' },
      { status: 500 }
    );
  }
}