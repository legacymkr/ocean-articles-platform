/**
 * Email service using Resend
 */

import { Resend } from "resend";

const getResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY not set, emails will not be sent");
  }
  return new Resend(key || "re_GkUYWAfo_3y4Y5NWWt27yukznU9JxvbqL");
};

export interface EmailTemplate {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface ArticlePublishedEmailData {
  articleTitle: string;
  articleUrl: string;
  authorName: string;
  publishedAt: string;
  excerpt: string;
  coverImageUrl?: string;
}

/**
 * Send article published email
 */
export async function sendArticlePublishedEmail(
  data: ArticlePublishedEmailData,
  recipientEmail: string,
) {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "dummy-key") {
      console.warn("Resend API key not configured. Email sending disabled.");
      return { success: false, error: "Email service not configured" };
    }

    const emailHtml = generateArticlePublishedHtml(data);
    const emailText = generateArticlePublishedText(data);

    const result = await getResend().emails.send({
      from: "Galatide <blog@galatide.com>",
      to: recipientEmail,
      subject: `New Article Published: ${data.articleTitle}`,
      html: emailHtml,
      text: emailText,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("Failed to send article published email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send welcome email to new admin users
 */
export async function sendWelcomeEmail(email: string, name: string, tempPassword: string) {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "dummy-key") {
      console.warn("Resend API key not configured. Email sending disabled.");
      return { success: false, error: "Email service not configured" };
    }

    const emailHtml = generateWelcomeHtml(name, tempPassword);
    const emailText = generateWelcomeText(name, tempPassword);

    const result = await getResend().emails.send({
      from: "Galatide <blog@galatide.com>",
      to: email,
      subject: "Welcome to Galatide Admin Dashboard",
      html: emailHtml,
      text: emailText,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Generate HTML for article published email
 */
function generateArticlePublishedHtml(data: ArticlePublishedEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Article Published</title>
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
            font-size: 28px;
            font-weight: bold;
            color: #3CA8C1;
            margin-bottom: 10px;
          }
          .article-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            margin: 20px 0;
          }
          .article-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            background: linear-gradient(135deg, #3CA8C1, #1F5C73);
          }
          .article-content {
            padding: 20px;
          }
          .article-title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
            line-height: 1.3;
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌊 GALATIDE</div>
            <p>New article published in the ocean of knowledge</p>
          </div>
          
          <div class="article-card">
            ${data.coverImageUrl ? `<img src="${data.coverImageUrl}" alt="${data.articleTitle}" class="article-image">` : ""}
            <div class="article-content">
              <h1 class="article-title">${data.articleTitle}</h1>
              <p class="article-excerpt">${data.excerpt}</p>
              <div class="article-meta">
                <span>By ${data.authorName}</span>
                <span>${data.publishedAt}</span>
              </div>
              <a href="${data.articleUrl}" class="cta-button">Read Article</a>
            </div>
          </div>
          
          <div class="footer">
            <p>This email was sent because you're subscribed to Galatide article notifications.</p>
            <p>© 2024 Galatide. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate text version for article published email
 */
function generateArticlePublishedText(data: ArticlePublishedEmailData): string {
  return `
🌊 GALATIDE - New Article Published

${data.articleTitle}

By ${data.authorName} on ${data.publishedAt}

${data.excerpt}

Read the full article: ${data.articleUrl}

---
This email was sent because you're subscribed to Galatide article notifications.
© 2024 Galatide. All rights reserved.
  `;
}

/**
 * Generate HTML for welcome email
 */
function generateWelcomeHtml(name: string, tempPassword: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Galatide</title>
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
          .credentials {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .credential-item {
            margin-bottom: 10px;
          }
          .credential-label {
            font-weight: 600;
            color: #374151;
          }
          .credential-value {
            font-family: monospace;
            background: #1f2937;
            color: #3CA8C1;
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
            margin-left: 10px;
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌊 GALATIDE</div>
            <h1 class="welcome-title">Welcome to the Admin Dashboard!</h1>
          </div>
          
          <p>Hello ${name},</p>
          
          <p>Welcome to Galatide! You've been granted access to the admin dashboard where you can create, edit, and manage articles for our ocean exploration platform.</p>
          
          <div class="credentials">
            <h3>Your Login Credentials:</h3>
            <div class="credential-item">
              <span class="credential-label">Email:</span>
              <span class="credential-value">admin@galatide.com</span>
            </div>
            <div class="credential-item">
              <span class="credential-label">Temporary Password:</span>
              <span class="credential-value">${tempPassword}</span>
            </div>
          </div>
          
          <p><strong>Important:</strong> Please change your password after your first login for security reasons.</p>
          
          <div style="text-align: center;">
            <a href="http://localhost:3000/admin" class="cta-button">Access Admin Dashboard</a>
          </div>
          
          <div class="footer">
            <p>If you have any questions, please contact the system administrator.</p>
            <p>© 2024 Galatide. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate text version for welcome email
 */
function generateWelcomeText(name: string, tempPassword: string): string {
  return `
🌊 GALATIDE - Welcome to the Admin Dashboard!

Hello ${name},

Welcome to Galatide! You've been granted access to the admin dashboard where you can create, edit, and manage articles for our ocean exploration platform.

Your Login Credentials:
Email: admin@galatide.com
Temporary Password: ${tempPassword}

Important: Please change your password after your first login for security reasons.

Access Admin Dashboard: http://localhost:3000/admin

If you have any questions, please contact the system administrator.

© 2024 Galatide. All rights reserved.
  `;
}
