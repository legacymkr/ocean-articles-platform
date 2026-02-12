import { NextResponse } from 'next/server';
import { notifySubscribersOfNewArticle } from '@/lib/services/newsletter-service';

export async function POST() {
  try {
    console.log('🧪 Testing newsletter functionality...');
    
    // Create test article data
    const testArticleData = {
      articleTitle: "Test Article: Ocean Mysteries Unveiled",
      articleUrl: "https://ocean.galatide.com/en/articles/test-ocean-mysteries",
      articleExcerpt: "Discover the hidden secrets of the deep ocean in this fascinating exploration of marine mysteries. From bioluminescent creatures to underwater volcanoes, the ocean holds countless wonders waiting to be discovered.",
      authorName: "Dr. Marina Explorer",
      publishedAt: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long", 
        day: "numeric",
      }),
      coverImageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop",
      language: "en"
    };

    console.log('📧 Sending test newsletter with data:', testArticleData);

    // Send newsletter notification
    const result = await notifySubscribersOfNewArticle(testArticleData);

    console.log('📊 Newsletter test result:', result);

    return NextResponse.json({
      success: true,
      message: 'Newsletter test completed',
      testData: testArticleData,
      result: result
    });

  } catch (error) {
    console.error('❌ Newsletter test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
