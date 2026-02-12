import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    // Get all translations
    const translations = await prisma.articleTranslation.findMany({
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

    // Get all articles
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
      }
    });

    // Get all languages
    const languages = await prisma.language.findMany();

    return NextResponse.json({
      translations: translations.map(t => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        status: t.status,
        language: t.language.code,
        originalArticle: t.article.title,
        originalSlug: t.article.slug
      })),
      articles,
      languages: languages.map(l => ({ code: l.code, name: l.name })),
      counts: {
        translations: translations.length,
        articles: articles.length,
        languages: languages.length
      }
    });
  } catch (error) {
    console.error("Error fetching translations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
