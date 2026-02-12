import { NextRequest, NextResponse } from "next/server";
import { ArticleService } from "@/lib/services/article-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "en";
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    // Use ArticleService to get article with translated tags
    const article = await ArticleService.getArticleBySlug(slug, lang);

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      article,
      translation: null, // Maintain compatibility with existing frontend
    });
  } catch (error) {
    console.error("Error fetching article by slug:", error);
    
    if (error instanceof Error) {
      if (error.message === "Database not available") {
        return NextResponse.json(
          { error: "Database not available" },
          { status: 503 }
        );
      }
      if (error.message === "Language not found") {
        return NextResponse.json(
          { error: "Language not found" },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
