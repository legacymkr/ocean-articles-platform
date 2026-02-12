/**
 * Email service for managing notifications and subscriptions
 */

import { sendArticlePublishedEmail } from "@/lib/email";
import { db } from "@/lib/db";

export interface EmailSubscription {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: Date;
  preferences: {
    articlePublished: boolean;
    weeklyDigest: boolean;
    newFeatures: boolean;
  };
}

export class EmailService {
  /**
   * Subscribe an email to notifications
   */
  static async subscribeEmail(
    email: string,
    preferences: {
      articlePublished?: boolean;
      weeklyDigest?: boolean;
      newFeatures?: boolean;
    } = {},
  ) {
    try {
      // In a real app, you'd have an EmailSubscription table
      // For now, we'll just return success
      console.log(`Email subscribed: ${email}`, preferences);
      return { success: true, message: "Email subscribed successfully" };
    } catch (error) {
      console.error("Error subscribing email:", error);
      return { success: false, error: "Failed to subscribe email" };
    }
  }

  /**
   * Unsubscribe an email from notifications
   */
  static async unsubscribeEmail(_email: string) {
    try {
      // In a real app, you'd update the EmailSubscription table
      console.log(`Email unsubscribed: ${_email}`);
      return { success: true, message: "Email unsubscribed successfully" };
    } catch (error) {
      console.error("Error unsubscribing email:", error);
      return { success: false, error: "Failed to unsubscribe email" };
    }
  }

  /**
   * Send article published notification to all subscribers
   */
  static async notifyArticlePublished(articleId: string) {
    if (!db) {
      console.warn("Database not available, skipping email notification");
      return { success: false, error: "Database not available" };
    }

    try {
      // Get article data
      const article = await db.article.findUnique({
        where: { id: articleId },
        include: {
          author: true,
          originalLanguage: true,
        },
      });

      if (!article) {
        throw new Error("Article not found");
      }

      // Prepare email data for newsletter service
      const articleLanguage = article.originalLanguage?.code || 'en';
      const articleData = {
        articleTitle: article.title || "Untitled Article",
        articleUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://ocean.galatide.com"}/${articleLanguage}/articles/${article.slug || "untitled"}`,
        articleExcerpt: article.excerpt || "No excerpt available",
        authorName: article.author.name || "Unknown Author",
        publishedAt: article.publishedAt
          ? new Date(article.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "Unknown Date",
        coverImageUrl: article.coverUrl || undefined,
        language: articleLanguage,
      };

      // Use the newsletter service to send notifications
      const { notifySubscribersOfNewArticle } = await import('./newsletter-service');
      const result = await notifySubscribersOfNewArticle(articleData);

      if (result.success) {
        return {
          success: true,
          message: `Newsletter notifications sent successfully. ${result.successCount || 0} delivered, ${result.failureCount || 0} failed.`,
          totalSubscribers: result.totalSubscribers || 0,
          successCount: result.successCount || 0,
          failureCount: result.failureCount || 0,
        };
      } else {
        return {
          success: false,
          error: 'error' in result ? result.error : "Failed to send newsletter notifications",
        };
      }
    } catch (error) {
      console.error("Error sending article published notifications:", error);
      return { success: false, error: "Failed to send notifications" };
    }
  }

  /**
   * Send welcome email to new admin users
   */
  static async sendWelcomeEmail(email: string, name: string, tempPassword: string) {
    try {
      const { sendWelcomeEmail } = await import("@/lib/email");
      return await sendWelcomeEmail(email, name, tempPassword);
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error: "Failed to send welcome email" };
    }
  }

  /**
   * Get email subscription status
   */
  static async getSubscriptionStatus() {
    try {
      // In a real app, you'd query the EmailSubscription table
      return {
        success: true,
        subscribed: true,
        preferences: {
          articlePublished: true,
          weeklyDigest: false,
          newFeatures: true,
        },
      };
    } catch (error) {
      console.error("Error getting subscription status:", error);
      return { success: false, error: "Failed to get subscription status" };
    }
  }

  /**
   * Update email preferences
   */
  static async updatePreferences(
    email: string,
    preferences: {
      articlePublished?: boolean;
      weeklyDigest?: boolean;
      newFeatures?: boolean;
    },
  ) {
    try {
      // In a real app, you'd update the EmailSubscription table
      console.log(`Updated preferences for ${email}:`, preferences);
      return { success: true, message: "Preferences updated successfully" };
    } catch (error) {
      console.error("Error updating preferences:", error);
      return { success: false, error: "Failed to update preferences" };
    }
  }
}
