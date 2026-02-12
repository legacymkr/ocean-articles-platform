import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";

const getResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY not set, emails will not be sent");
  }
  return new Resend(key);
};

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { articleId, articleTitle, articleSlug, articleExcerpt, language } = await request.json();

    if (!articleId || !articleTitle || !articleSlug) {
      return NextResponse.json(
        { error: "Article ID, title, and slug are required" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    // Get all active subscribers
    const subscribers = await db.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true }
    });

    if (subscribers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No active subscribers",
        sent: 0,
        total: 0
      });
    }

    // Prepare article URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://galatide.com';
    const lang = language || 'en';
    const articleUrl = lang === 'en' 
      ? `${baseUrl}/articles/${articleSlug}`
      : `${baseUrl}/${lang}/articles/${articleSlug}`;

    // Send emails to all subscribers
    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        const subscriberName = 'Ocean Explorer';
        const resend = getResend();
        
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'Galatide Ocean <ocean@galatide.com>',
          to: subscriber.email,
          subject: `🌊 New Article: ${articleTitle}`,
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Article from Galatide</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A1A2A;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A1A2A; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
                      
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #0A1A2A 0%, #0A385C 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
                          <h1 style="color: #00FFFF; margin: 0; font-size: 36px; font-weight: 700; text-shadow: 0 0 20px rgba(0, 255, 255, 0.6);">
                            🌊 Galatide
                          </h1>
                          <p style="color: #FFFFFF; margin: 12px 0 0 0; font-size: 16px; opacity: 0.9;">
                            Ocean Mysteries Await
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Greeting -->
                      <tr>
                        <td style="background: #FFFFFF; padding: 30px 30px 20px 30px;">
                          <p style="color: #0A1A2A; font-size: 16px; margin: 0 0 20px 0;">
                            Hello <strong>${subscriberName}</strong>,
                          </p>
                          <p style="color: #666; font-size: 16px; margin: 0 0 30px 0; line-height: 1.6;">
                            We've just published a new article that we think you'll find fascinating!
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Article Content -->
                      <tr>
                        <td style="background: #FFFFFF; padding: 0 30px 30px 30px;">
                          <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(0, 201, 167, 0.05) 100%); border: 2px solid #00FFFF; border-radius: 12px; overflow: hidden;">
                            <tr>
                              <td style="padding: 30px;">
                                <h2 style="color: #0A385C; margin: 0 0 20px 0; font-size: 24px; font-weight: 700; line-height: 1.3;">
                                  ${articleTitle}
                                </h2>
                                
                                ${articleExcerpt ? `
                                  <p style="color: #666; margin: 0 0 25px 0; font-size: 15px; line-height: 1.7;">
                                    ${articleExcerpt}
                                  </p>
                                ` : ''}
                                
                                <table cellpadding="0" cellspacing="0" style="margin: 0;">
                                  <tr>
                                    <td align="center" style="background: linear-gradient(135deg, #00FFFF 0%, #00C9A7 100%); border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 255, 255, 0.3);">
                                      <a href="${articleUrl}" style="display: inline-block; padding: 14px 35px; color: #0A1A2A; text-decoration: none; font-weight: 700; font-size: 16px;">
                                        Read Full Article →
                                      </a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background: #F8FAFC; padding: 30px; border-radius: 0 0 12px 12px; text-align: center;">
                          <p style="color: #64748B; font-size: 14px; margin: 0 0 15px 0; line-height: 1.6;">
                            You're receiving this because you subscribed to Galatide's newsletter.<br>
                            We share the latest ocean discoveries, research, and mysteries.
                          </p>
                          <p style="color: #94A3B8; font-size: 12px; margin: 0;">
                            <a href="${baseUrl}/unsubscribe" style="color: #0A385C; text-decoration: underline;">Unsubscribe</a> | 
                            <a href="${baseUrl}" style="color: #0A385C; text-decoration: underline;">Visit Galatide</a>
                          </p>
                        </td>
                      </tr>
                      
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        });
        return { success: true, email: subscriber.email };
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
        return { success: false, email: subscriber.email, error };
      }
    });

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;

    return NextResponse.json({
      success: true,
      message: `Sent ${successful} of ${subscribers.length} newsletter emails`,
      sent: successful,
      total: subscribers.length,
    });

  } catch (error) {
    console.error("Newsletter notification error:", error);
    return NextResponse.json(
      { 
        error: "Failed to send newsletter",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
