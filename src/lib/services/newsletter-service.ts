import { Resend } from 'resend';
import { ResendAudienceService } from './resend-audience-service';

const getResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY not set, emails will not be sent");
    return null;
  }
  try {
    return new Resend(key);
  } catch (e) {
    console.warn('Failed to initialize Resend:', e);
    return null;
  }
};

export interface ArticleNotificationData {
  articleTitle: string;
  articleUrl: string;
  articleExcerpt: string;
  authorName: string;
  publishedAt: string;
  coverImageUrl?: string;
  language?: string;
}

/**
 * Send new article notification to all newsletter subscribers
 */
export async function notifySubscribersOfNewArticle(articleData: ArticleNotificationData) {
  // If Resend is not configured, try to get subscribers from database and use a fallback email method
  const resend = getResend();
  if (!resend) {
    console.warn('Resend not configured, trying database subscribers with fallback email...');
    return await sendWithFallbackMethod(articleData);
  }

  try {
    // Bypass audience system and use direct subscriber list for now
    console.log('📧 Using direct subscriber list (bypassing audience system)...');
    let subscribers: string[] = [];
    
    // Use epicchanceweb@gmail.com as the primary test recipient
    // Now that we're using ocean@galatide.com as sender, we can send to any email
    const testEmail = 'epicchanceweb@gmail.com';
    
    // Use test email as primary subscriber
    subscribers = [testEmail];
    console.log(`📧 Direct subscribers (sending to epicchanceweb@gmail.com): ${subscribers.join(', ')}`);

    // Try to get additional subscribers from Resend audience (if it works)
    try {
      const audienceSubscribers = await ResendAudienceService.getActiveSubscribers();
      if (audienceSubscribers.length > 0) {
        // Add unique subscribers from audience
        audienceSubscribers.forEach(email => {
          if (!subscribers.includes(email)) {
            subscribers.push(email);
          }
        });
        console.log(`📧 Added ${audienceSubscribers.length} audience subscribers`);
      }
    } catch (audienceError) {
      console.warn('Audience system not working, using direct subscribers only:', audienceError);
    }

    if (subscribers.length === 0) {
      console.log('No active subscribers found in Resend audience');
      return { 
        success: true, 
        message: 'No subscribers to notify',
        totalSubscribers: 0,
        successCount: 0,
        failureCount: 0
      };
    }

    console.log(`📬 Found ${subscribers.length} active subscribers`);
    console.log('Subscribers:', subscribers);

    // Send emails in batches to avoid rate limits
    const batchSize = 10;
    const results = [];

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      console.log(`📮 Sending batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(subscribers.length / batchSize)} (${batch.length} emails)`);
      
      const batchPromises = batch.map(async (email) => {
        try {
          const result = await resend.emails.send({
            from: 'Galatide Ocean <ocean@galatide.com>',
            to: email,
            subject: `🌊 New Article: ${articleData.articleTitle}`,
            html: generateArticleNotificationHtml(articleData, email),
            text: generateArticleNotificationText(articleData),
          });
          
          console.log(`✅ Email sent to ${email}: ${result.data?.id}`);
          return { email, success: true, messageId: result.data?.id };
        } catch (error) {
          console.error(`❌ Failed to send notification to ${email}:`, error);
          return { email, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches to respect rate limits
      if (i + batchSize < subscribers.length) {
        console.log('⏳ Waiting 1 second before next batch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`📊 Newsletter notifications complete: ${successCount} success, ${failureCount} failed`);

    return {
      success: true,
      totalSubscribers: subscribers.length,
      successCount,
      failureCount,
      results
    };

  } catch (error) {
    console.error('Error sending newsletter notifications:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function generateArticleNotificationHtml(data: ArticleNotificationData, recipientEmail: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Article: ${data.articleTitle}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #0A2C38 0%, #041923 100%);
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            background: linear-gradient(135deg, #3CA8C1, #1F5C73);
            color: white;
            padding: 30px 20px;
            border-radius: 12px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: white;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          .header-subtitle {
            font-size: 18px;
            color: rgba(255,255,255,0.9);
            margin: 0;
          }
          .article-card {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
            margin: 30px 0;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
          }
          .article-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(0,0,0,0.15);
          }
          .article-image {
            width: 100%;
            height: 250px;
            object-fit: cover;
            background: linear-gradient(135deg, #3CA8C1, #1F5C73);
            display: block;
          }
          .article-image-placeholder {
            width: 100%;
            height: 250px;
            background: linear-gradient(135deg, #3CA8C1, #1F5C73);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 64px;
            color: white;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          .article-content {
            padding: 20px;
          }
          .article-title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            line-height: 1.2;
            text-decoration: none;
          }
          .article-title:hover {
            color: #3CA8C1;
          }
          .article-excerpt {
            color: #6b7280;
            margin-bottom: 15px;
            line-height: 1.5;
          }
          .article-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            color: #9ca3af;
            margin-bottom: 20px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3CA8C1, #1F5C73);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            margin: 25px 0;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(60, 168, 193, 0.3);
            transition: all 0.3s ease;
          }
          .cta-button:hover {
            background: linear-gradient(135deg, #1F5C73, #3CA8C1);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(60, 168, 193, 0.4);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          .unsubscribe {
            color: #9ca3af;
            text-decoration: none;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌊 GALATIDE OCEAN</div>
            <p class="header-subtitle">New Article Published!</p>
          </div>
          
          <div class="article-card">
            ${data.coverImageUrl ? `<img src="${data.coverImageUrl}" alt="${data.articleTitle}" class="article-image">` : `<div class="article-image-placeholder">🌊</div>`}
            <div class="article-content">
              <a href="${data.articleUrl}" style="text-decoration: none;">
                <h1 class="article-title">${data.articleTitle}</h1>
              </a>
              <p class="article-excerpt">${data.articleExcerpt}</p>
              <div class="article-meta">
                <span>📝 By ${data.authorName}</span>
                <span>📅 ${data.publishedAt}</span>
              </div>
              <div style="text-align: center;">
                <a href="${data.articleUrl}" class="cta-button">🌊 Read Full Article</a>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>🌊 You're receiving this because you subscribed to <strong>Galatide Ocean</strong> newsletter.</p>
            <p><a href="https://ocean.galatide.com" style="color: #3CA8C1; text-decoration: none;">Visit Galatide Ocean</a> | <a href="https://ocean.galatide.com/newsletter/unsubscribe?email=${encodeURIComponent(recipientEmail)}" class="unsubscribe">Unsubscribe</a></p>
            <p>© 2024 Galatide Ocean. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateArticleNotificationText(data: ArticleNotificationData): string {
  return `
🌊 GALATIDE OCEAN - New Article Published!

📚 ${data.articleTitle}

${data.articleExcerpt}

📝 By ${data.authorName} | 📅 Published ${data.publishedAt}

🌊 Read the full article: ${data.articleUrl}

---
🌊 You're receiving this because you subscribed to Galatide Ocean newsletter.

Visit Galatide Ocean: https://ocean.galatide.com
Unsubscribe: https://ocean.galatide.com/newsletter/unsubscribe

© 2024 Galatide Ocean. All rights reserved.
  `;
}

/**
 * Fallback method when Resend is not configured
 * Uses database subscribers and console logging
 */
async function sendWithFallbackMethod(articleData: ArticleNotificationData) {
  try {
    console.log('📧 Using fallback email method...');
    
    // Try to get subscribers from database
    let subscribers: string[] = [];
    
    try {
      const { db, connectDB } = await import('@/lib/db');
      if (db) {
        // Try to connect first
        const connected = await connectDB();
        if (connected) {
          try {
            const dbSubscribers = await db.$queryRaw<Array<{ email: string }>>`
              SELECT email FROM newsletter_subscribers 
              WHERE is_active = true
            `;
            subscribers = dbSubscribers.map(sub => sub.email);
            console.log(`📧 Found ${subscribers.length} database subscribers`);
          } catch (queryError) {
            console.warn('Database query failed, using fallback subscribers:', queryError);
          }
        } else {
          console.warn('Database connection failed, using fallback subscribers');
        }
      }
    } catch (dbError) {
      console.warn('Could not access database subscribers:', dbError);
    }
    
    // Always add test email
    const testEmail = 'epicchanceweb@gmail.com';
    if (!subscribers.includes(testEmail)) {
      subscribers.push(testEmail);
      console.log(`📧 Added test email: ${testEmail}`);
    }
    
    if (subscribers.length === 0) {
      console.log('No subscribers found for fallback method');
      return {
        success: true,
        message: 'No subscribers to notify (fallback mode)',
        totalSubscribers: 0,
        successCount: 0,
        failureCount: 0
      };
    }
    
    // Log the email content that would be sent
    console.log('📬 NEWSLETTER EMAIL CONTENT (Fallback Mode):');
    console.log('='.repeat(50));
    console.log(`To: ${subscribers.join(', ')}`);
    console.log(`Subject: 🌊 New Article: ${articleData.articleTitle}`);
    console.log('Content:');
    console.log(generateArticleNotificationText(articleData));
    console.log('='.repeat(50));
    
    // Simulate successful sending
    return {
      success: true,
      message: `Newsletter notifications logged (fallback mode). Would send to ${subscribers.length} subscribers.`,
      totalSubscribers: subscribers.length,
      successCount: subscribers.length,
      failureCount: 0,
      results: subscribers.map(email => ({ email, success: true, messageId: 'fallback-' + Date.now() }))
    };
    
  } catch (error) {
    console.error('Error in fallback email method:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error in fallback method' 
    };
  }
}
