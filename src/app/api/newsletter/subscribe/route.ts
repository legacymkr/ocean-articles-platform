import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { ResendAudienceService } from '@/lib/services/resend-audience-service';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  language: z.string().optional().default('en'),
});

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, language } = subscribeSchema.parse(body);

    console.log(`📧 Newsletter subscription request for: ${email}`);

    // Try to add contact to Resend audience (optional)
    let contactId = 'local-' + crypto.randomUUID();
    
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'dummy-key') {
      try {
        const resendResult = await ResendAudienceService.addContactToNewsletter({
          email,
          firstName,
          lastName,
          unsubscribed: false,
        });

        if (!resendResult.success) {
          if (resendResult.error === 'Email already subscribed') {
            return NextResponse.json(
              { error: 'This email is already subscribed to our newsletter' },
              { status: 400 }
            );
          }
          
          console.warn('Failed to add contact to Resend audience, continuing with local storage:', resendResult.error);
          // Continue with local storage instead of failing
        } else {
          contactId = resendResult.contactId || contactId;
          console.log(`✅ Contact added to Resend audience: ${contactId}`);
        }
      } catch (resendError) {
        console.warn('Resend service error, continuing with local storage:', resendError);
      }
    } else {
      console.log('📧 Resend not configured, using local storage only');
    }

    // Also store in database for backup (optional)
    try {
      const { db } = await import('@/lib/db');
      if (db) {
        // Ensure table exists first with language column
        await db.$executeRaw`
          CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            email TEXT UNIQUE NOT NULL,
            language TEXT DEFAULT 'en' NOT NULL,
            is_active BOOLEAN DEFAULT true NOT NULL,
            subscribed_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
            created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
          );
        `;

        // Upsert subscriber
        await db.$executeRaw`
          INSERT INTO newsletter_subscribers (id, email, language, is_active, subscribed_at, created_at, updated_at)
          VALUES (${crypto.randomUUID()}, ${email}, ${language}, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (email) DO UPDATE SET
            language = EXCLUDED.language,
            is_active = true,
            subscribed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        `;
      }
    } catch (dbError) {
      console.warn('Database backup failed, but Resend subscription succeeded:', dbError);
      // Don't fail the subscription if database backup fails
    }

    // Send welcome email
    if (resend && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'dummy-key') {
      try {
        await resend.emails.send({
          from: 'Galatide Ocean <ocean@galatide.com>',
          to: email,
          subject: '🌊 Welcome to Galatide Ocean Newsletter!',
          html: generateWelcomeNewsletterHtml(email),
          text: generateWelcomeNewsletterText(email),
        });
        console.log(`📬 Welcome email sent to: ${email}`);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the subscription if welcome email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      contactId: contactId,
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

function generateWelcomeNewsletterHtml(email: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Galatide Ocean - Your Ocean Discovery Journey Begins</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif;
            line-height: 1.7;
            color: #2c3e50;
            max-width: 650px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          }
          .container {
            background: #ffffff;
            border-radius: 16px;
            padding: 45px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
          }
          .header {
            text-align: center;
            margin-bottom: 35px;
            padding-bottom: 25px;
            border-bottom: 2px solid #f1f5f9;
          }
          .logo {
            font-size: 36px;
            font-weight: 700;
            color: #0ea5e9;
            margin-bottom: 15px;
            text-shadow: 0 2px 4px rgba(14, 165, 233, 0.1);
          }
          .welcome-title {
            font-size: 26px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 15px;
            line-height: 1.3;
          }
          .subtitle {
            font-size: 16px;
            color: #64748b;
            font-weight: 400;
          }
          .content {
            color: #475569;
            line-height: 1.7;
            font-size: 16px;
          }
          .content p {
            margin: 18px 0;
          }
          .benefits-list {
            background: #f8fafc;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border-left: 4px solid #0ea5e9;
          }
          .benefits-list ul {
            margin: 0;
            padding-left: 0;
            list-style: none;
          }
          .benefits-list li {
            padding: 8px 0;
            position: relative;
            padding-left: 35px;
            color: #334155;
            font-weight: 500;
          }
          .benefits-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #059669;
            font-weight: bold;
            font-size: 18px;
          }
          .cta-section {
            text-align: center;
            margin: 35px 0;
            padding: 25px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 12px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #0ea5e9, #0284c7);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
          }
          .cta-button:hover {
            background: linear-gradient(135deg, #0284c7, #0369a1);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4);
          }
          .personal-note {
            background: #fefce8;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #eab308;
            font-style: italic;
            color: #713f12;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 25px;
            border-top: 2px solid #f1f5f9;
            color: #64748b;
            font-size: 14px;
            line-height: 1.6;
          }
          .footer a {
            color: #0ea5e9;
            text-decoration: none;
          }
          .social-proof {
            text-align: center;
            margin: 25px 0;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
            font-size: 14px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌊 GALATIDE OCEAN</div>
            <h1 class="welcome-title">Welcome to Your Ocean Discovery Journey</h1>
            <p class="subtitle">Thank you for joining our community of ocean enthusiasts</p>
          </div>
          
          <div class="content">
            <p>Dear Ocean Explorer,</p>
            
            <p>Welcome to Galatide Ocean! We're thrilled to have you join our community of curious minds who share a passion for understanding our planet's most mysterious frontier.</p>
            
            <div class="benefits-list">
              <p style="margin-top: 0; font-weight: 600; color: #1e293b;">As a subscriber, you'll receive:</p>
              <ul>
                <li>Weekly ocean discoveries and scientific breakthroughs</li>
                <li>In-depth marine research articles and analysis</li>
                <li>Exclusive interviews with leading oceanographers</li>
                <li>Beautiful underwater photography and documentaries</li>
                <li>Early access to new content and special features</li>
              </ul>
            </div>
            
            <div class="personal-note">
              <p style="margin: 0;">💡 <strong>Did you know?</strong> We've only explored about 5% of our oceans. Every week, we'll share fascinating discoveries that reveal more about the 95% that remains a mystery.</p>
            </div>
            
            <p>Our mission is to make ocean science accessible, engaging, and inspiring for everyone. Whether you're a marine biology student, a diving enthusiast, or simply someone who loves learning about our natural world, you'll find content that sparks your curiosity.</p>
            
            <div class="cta-section">
              <p style="margin-top: 0; font-weight: 600; color: #1e293b;">Ready to dive in?</p>
              <a href="https://ocean.galatide.com" class="cta-button">
                Explore Ocean Articles
              </a>
            </div>
            
            <div class="social-proof">
              <p>Join thousands of ocean enthusiasts who trust Galatide Ocean for their daily dose of marine science and discovery.</p>
            </div>
          </div>
          
          <div class="footer">
            <p>This email was sent to ${email} because you subscribed to our newsletter.</p>
            <p>You can <a href="mailto:ocean@galatide.com?subject=Unsubscribe">unsubscribe</a> at any time or <a href="https://ocean.galatide.com">visit our website</a>.</p>
            <p style="margin-top: 20px;">
              <strong>Galatide Ocean</strong><br>
              Exploring the depths of marine science<br>
              © 2024 Galatide. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateWelcomeNewsletterText(email: string): string {
  return `
🌊 GALATIDE OCEAN - Welcome to Your Ocean Discovery Journey

Dear Ocean Explorer,

Welcome to Galatide Ocean! We're thrilled to have you join our community of curious minds who share a passion for understanding our planet's most mysterious frontier.

As a subscriber, you'll receive:
✓ Weekly ocean discoveries and scientific breakthroughs
✓ In-depth marine research articles and analysis  
✓ Exclusive interviews with leading oceanographers
✓ Beautiful underwater photography and documentaries
✓ Early access to new content and special features

💡 Did you know? We've only explored about 5% of our oceans. Every week, we'll share fascinating discoveries that reveal more about the 95% that remains a mystery.

Our mission is to make ocean science accessible, engaging, and inspiring for everyone. Whether you're a marine biology student, a diving enthusiast, or simply someone who loves learning about our natural world, you'll find content that sparks your curiosity.

Ready to dive in?
🌊 Explore Ocean Articles: https://ocean.galatide.com

Join thousands of ocean enthusiasts who trust Galatide Ocean for their daily dose of marine science and discovery.

---

This email was sent to ${email} because you subscribed to our newsletter.
You can unsubscribe at any time: ocean@galatide.com
Visit our website: https://ocean.galatide.com

GALATIDE OCEAN
Exploring the depths of marine science
© 2024 Galatide. All rights reserved.
  `;
}
