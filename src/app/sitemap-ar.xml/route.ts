import { NextResponse } from 'next/server';
import { SitemapService } from '@/lib/services/sitemap-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🗺️ Generating Arabic sitemap...');
    
    const urls = await SitemapService.generateLanguageSitemap('ar');
    const sitemapXml = SitemapService.generateXmlSitemap(urls);

    console.log(`✅ Generated Arabic sitemap with ${urls.length} URLs`);

    return new NextResponse(sitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
      },
    });
  } catch (error) {
    console.error('Error generating Arabic sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
