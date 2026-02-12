import { NextRequest, NextResponse } from "next/server";
import { sendArticlePublishedEmail } from "@/lib/email";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { articleId, recipientEmails } = await request.json();

    if (!articleId || !recipientEmails || !Array.isArray(recipientEmails)) {
      return NextResponse.json(
        { error: "Missing required fields: articleId and recipientEmails" },
        { status: 400 },
      );
    }

    // Get article data from database
    if (!db) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }

    const article = await db.article.findUnique({
      where: { id: articleId },
      include: {
        author: true,
        originalLanguage: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Prepare email data
    const emailData = {
      articleTitle: article.title || "Untitled Article",
      articleUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/articles/${article.slug || "untitled"}`,
      authorName: article.author.name || "Unknown Author",
      publishedAt: article.publishedAt
        ? new Date(article.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Unknown Date",
      excerpt: article.excerpt || "No excerpt available",
      coverImageUrl: article.coverUrl || undefined,
    };

    // Send emails to all recipients
    const results = await Promise.allSettled(
      recipientEmails.map((email: string) => sendArticlePublishedEmail(emailData, email)),
    );

    const successful = results.filter(
      (result) => result.status === "fulfilled" && result.value.success,
    ).length;

    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      message: `Emails sent successfully. ${successful} delivered, ${failed} failed.`,
      results: results.map((result, index) => ({
        email: recipientEmails[index],
        success: result.status === "fulfilled" && result.value.success,
        error: result.status === "rejected" ? result.reason : result.value.error,
      })),
    });
  } catch (error) {
    console.error("Error sending article published emails:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
