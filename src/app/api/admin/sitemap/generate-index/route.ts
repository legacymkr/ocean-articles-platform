import { NextResponse } from 'next/server';
import { SitemapService } from '@/lib/services/sitemap-service';

export async function POST() {
  try {
    console.log('🗺️ Admin: Generating main sitemap index...');

    const languages = ['en', 'ar', 'zh', 'ru', 'de', 'fr', 'hi'];
    const sitemapIndexXml = SitemapService.generateSitemapIndex(languages);

    console.log('✅ Admin: Main sitemap index generated successfully');

    return NextResponse.json({
      success: true,
      message: 'Main sitemap index generated',
      languages,
      xml: sitemapIndexXml
    });

  } catch (error) {
    console.error('Error generating sitemap index:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}
