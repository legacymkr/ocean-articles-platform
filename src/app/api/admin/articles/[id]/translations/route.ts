import { NextRequest, NextResponse } from "next/server";
import { ArticleService } from "@/lib/services/article-service";
import { getRequestRole } from "@/lib/rbac";
import { z } from "zod";

const createTranslationSchema = z.object({
  languageId: z.string().min(1, "Language ID is required"),
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  translatorId: z.string().optional(),
});

// Get all translations for an article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = getRequestRole(request);
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { db } = await import("@/lib/db");
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    const resolvedParams = await params;
    // Get article with all translations
    const article = await db.article.findUnique({
      where: { id: resolvedParams.id },
      include: {
        originalLanguage: true,
        translations: {
          include: {
            language: true,
            translator: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Get all available languages
    const allLanguages = await db.language.findMany({
      orderBy: { name: "asc" },
    });

    // Find languages that don't have translations yet
    const translatedLanguageIds = [
      article.originalLanguageId,
      ...article.translations.map((t) => t.languageId),
    ];

    const availableLanguages = allLanguages.filter(
      (lang) => !translatedLanguageIds.includes(lang.id)
    );

    return NextResponse.json({
      article: {
        id: article.id,
        title: article.title,
        originalLanguage: article.originalLanguage,
      },
      translations: article.translations,
      availableLanguages,
    });
  } catch (error) {
    console.error("Error fetching translations:", error);
    return NextResponse.json(
      { error: "Failed to fetch translations" },
      { status: 500 }
    );
  }
}

// Create a new translation for an article
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = getRequestRole(request);
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createTranslationSchema.parse(body);

    const { db } = await import("@/lib/db");
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    const resolvedParams = await params;
    // Check if article exists
    const article = await db.article.findUnique({
      where: { id: resolvedParams.id },
      include: { originalLanguage: true },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Check if translation already exists for this language
    const existingTranslation = await db.articleTranslation.findFirst({
      where: {
        articleId: resolvedParams.id,
        languageId: validatedData.languageId,
      },
    });

    if (existingTranslation) {
      return NextResponse.json(
        { error: "Translation already exists for this language" },
        { status: 409 }
      );
    }

    // Create translation
    const translation = await ArticleService.createTranslation({
      articleId: resolvedParams.id,
      ...validatedData,
    });

    return NextResponse.json(translation, { status: 201 });
  } catch (error) {
    console.error("Error creating translation:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create translation" },
      { status: 500 }
    );
  }
}
