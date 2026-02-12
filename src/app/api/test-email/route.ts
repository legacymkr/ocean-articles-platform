import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_GkUYWAfo_3y4Y5NWWt27yukznU9JxvbqL');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Send welcome email
    const result = await resend.emails.send({
      from: 'Galatide <blog@galatide.com>',
      to: email,
      subject: 'Welcome to Galatide Ocean - Test Email!',
      html: generateTestWelcomeHtml(email),
      text: generateTestWelcomeText(email),
    });

    return NextResponse.json({
      success: true,
      messageId: result.data?.id,
      message: `Test welcome email sent to ${email}`,
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateTestWelcomeHtml(email: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Galatide Ocean - Test Email</title>
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
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #3CA8C1;
            margin-bottom: 10px;
          }
          .welcome-title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .content {
            color: #374151;
            line-height: 1.6;
          }
          .highlight {
            background: linear-gradient(135deg, #3CA8C1, #1F5C73);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3CA8C1, #1F5C73);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          .success {
            background: #10B981;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌊 GALATIDE OCEAN</div>
            <h1 class="welcome-title">Email Integration Test Successful!</h1>
          </div>
          
          <div class="success">
            ✅ Resend API is working perfectly!
          </div>
          
          <div class="content">
            <p>Hello there!</p>
            
            <p>This is a test email to confirm that your Galatide Ocean platform's email integration is working correctly.</p>
            
            <div class="highlight">
              <h3>🎉 Email Service Status: ACTIVE</h3>
              <p>Your Resend integration is successfully configured and ready to send:</p>
              <ul style="text-align: left; display: inline-block;">
                <li>📧 Newsletter subscriptions</li>
                <li>🔔 Article notifications</li>
                <li>👋 Welcome emails</li>
                <li>📝 Admin notifications</li>
              </ul>
            </div>
            
            <p><strong>Test Details:</strong></p>
            <ul>
              <li><strong>Recipient:</strong> ${email}</li>
              <li><strong>From:</strong> blog@galatide.com</li>
              <li><strong>Service:</strong> Resend API</li>
              <li><strong>Status:</strong> Successfully delivered</li>
            </ul>
            
            <p>Your Galatide Ocean platform is now ready to engage with your audience through email!</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="cta-button">
                Visit Galatide Ocean
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>This is a test email from your Galatide Ocean platform.</p>
            <p>© 2024 Galatide. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateTestWelcomeText(email: string): string {
  return `
🌊 GALATIDE OCEAN - Email Integration Test Successful!

✅ Resend API is working perfectly!

Hello there!

This is a test email to confirm that your Galatide Ocean platform's email integration is working correctly.

🎉 Email Service Status: ACTIVE

Your Resend integration is successfully configured and ready to send:
• Newsletter subscriptions
• Article notifications  
• Welcome emails
• Admin notifications

Test Details:
• Recipient: ${email}
• From: blog@galatide.com
• Service: Resend API
• Status: Successfully delivered

Your Galatide Ocean platform is now ready to engage with your audience through email!

Visit Galatide Ocean: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}

This is a test email from your Galatide Ocean platform.
© 2024 Galatide. All rights reserved.
  `;
}
