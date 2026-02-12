import { NextRequest, NextResponse } from "next/server";
import { ArticleService } from "@/lib/services/article-service";
import { canPublish, getRequestRole } from "@/lib/rbac";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const role = getRequestRole(request);
    if (!canPublish(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Article ID is required" }, { status: 400 });
    }

    // Publish the article and send notifications
    const result = await ArticleService.publishArticle(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Article published successfully",
      article: result.article,
      emailResult: result.emailResult,
    });
  } catch (error) {
    console.error("Error publishing article:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
