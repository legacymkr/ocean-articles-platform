import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST() {
  try {
    console.log('🧪 Testing Resend direct email sending...');
    
    // Check if Resend API key is available
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY not found in environment variables'
      }, { status: 500 });
    }

    console.log('🔑 Resend API Key found:', apiKey.substring(0, 10) + '...');

    // Initialize Resend
    const resend = new Resend(apiKey);

    // Test email data - using ocean@galatide.com as sender
    const testEmailData = {
      from: 'Galatide Ocean <ocean@galatide.com>',
      to: 'epicchanceweb@gmail.com',
      subject: '🌊 Direct Resend Test - Ocean Newsletter',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Resend Test Email</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1e40af, #06b6d4); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌊 Galatide Ocean</h1>
                <p>Direct Resend Test Email</p>
              </div>
              <div class="content">
                <h2>✅ Resend Integration Test</h2>
                <p>This is a direct test of the Resend email service integration.</p>
                <p><strong>Test Details:</strong></p>
                <ul>
                  <li>API Key: Working ✅</li>
                  <li>Email Service: Resend</li>
                  <li>Recipient: epicchanceweb@gmail.com</li>
                  <li>Time: ${new Date().toISOString()}</li>
                </ul>
                <p>If you received this email, the Resend integration is working correctly!</p>
                <a href="https://ocean.galatide.com" class="button">Visit Galatide Ocean</a>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
🌊 GALATIDE OCEAN - Direct Resend Test

✅ Resend Integration Test

This is a direct test of the Resend email service integration.

Test Details:
- API Key: Working ✅
- Email Service: Resend
- Recipient: epicchanceweb@gmail.com
- Time: ${new Date().toISOString()}

If you received this email, the Resend integration is working correctly!

Visit: https://ocean.galatide.com
      `
    };

    console.log('📧 Sending direct test email to epicchanceweb@gmail.com...');
    console.log('Email data:', {
      from: testEmailData.from,
      to: testEmailData.to,
      subject: testEmailData.subject
    });

    // Send the email
    const result = await resend.emails.send(testEmailData);

    console.log('📊 Resend API response:', result);

    if (result.error) {
      console.error('❌ Resend API error:', result.error);
      return NextResponse.json({
        success: false,
        error: 'Resend API error',
        details: result.error
      }, { status: 500 });
    }

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.data?.id);

    return NextResponse.json({
      success: true,
      message: 'Direct Resend test email sent successfully',
      messageId: result.data?.id,
      recipient: 'epicchanceweb@gmail.com',
      timestamp: new Date().toISOString(),
      resendResponse: result.data
    });

  } catch (error) {
    console.error('❌ Direct Resend test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
