import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    // Get all Arabic translations
    const arabicTranslations = await prisma.articleTranslation.findMany({
      where: {
        language: { code: "ar" }
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

    // Get the specific article we're looking for
    const originalArticle = await prisma.article.findFirst({
      where: {
        OR: [
          { slug: "the-mysterious-depths-exploring-the-abyssal-zone" },
          { title: { contains: "Mysterious Depths" } }
        ]
      },
      include: {
        translations: {
          include: {
            language: true
          }
        }
      }
    });

    return NextResponse.json({
      arabicTranslations: arabicTranslations.map(t => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        status: t.status,
        language: t.language.code,
        originalArticleTitle: t.article.title,
        originalArticleSlug: t.article.slug,
        contentLength: t.content?.length || 0,
        contentPreview: t.content?.substring(0, 100)
      })),
      originalArticle: originalArticle ? {
        id: originalArticle.id,
        title: originalArticle.title,
        slug: originalArticle.slug,
        translations: originalArticle.translations.map(t => ({
          id: t.id,
          title: t.title,
          slug: t.slug,
          language: t.language.code,
          status: t.status
        }))
      } : null,
      debug: {
        totalArabicTranslations: arabicTranslations.length,
        foundOriginalArticle: !!originalArticle
      }
    });
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json({ error: "Test failed", details: error }, { status: 500 });
  }
}
