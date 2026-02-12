import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "ar";
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    // Get the original article
    const originalArticle = await prisma.article.findFirst({
      where: { slug: slug },
      include: {
        author: true,
        originalLanguage: true,
        tags: { include: { tag: true } },
      }
    });

    // Get all translations for this article
    const translations = await prisma.articleTranslation.findMany({
      where: {
        article: { slug: slug }
      },
      include: {
        language: true,
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
          }
        }
      }
    });

    // Get the specific translation for the requested language
    const specificTranslation = await prisma.articleTranslation.findFirst({
      where: {
        slug: slug,
        language: { code: lang },
      },
      include: {
        language: true,
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
          }
        }
      }
    });

    return NextResponse.json({
      debug: {
        requestedSlug: slug,
        requestedLang: lang,
        originalArticle: originalArticle ? {
          id: originalArticle.id,
          title: originalArticle.title,
          slug: originalArticle.slug,
          contentPreview: originalArticle.content?.substring(0, 200) + "...",
          contentLength: originalArticle.content?.length || 0,
        } : null,
        allTranslations: translations.map(t => ({
          id: t.id,
          title: t.title,
          slug: t.slug,
          language: t.language.code,
          status: t.status,
          contentPreview: t.content?.substring(0, 200) + "...",
          contentLength: t.content?.length || 0,
          originalArticleId: t.article.id,
        })),
        specificTranslation: specificTranslation ? {
          id: specificTranslation.id,
          title: specificTranslation.title,
          slug: specificTranslation.slug,
          language: specificTranslation.language.code,
          status: specificTranslation.status,
          contentPreview: specificTranslation.content?.substring(0, 200) + "...",
          contentLength: specificTranslation.content?.length || 0,
          fullContent: specificTranslation.content, // Full content for debugging
        } : null,
      }
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: "Debug failed", details: error }, { status: 500 });
  }
}
