import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestRole, canCreateOrUpdate } from "@/lib/rbac";
import { db } from "@/lib/db";

const createTranslationSchema = z.object({
  articleId: z.string().min(1),
  languageId: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "draft", "published"]).default("DRAFT"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");

    if (!db) {
      return NextResponse.json({ 
        translations: [],
        message: "Database not available" 
      });
    }

    let translations;
    if (articleId) {
      translations = await db.articleTranslation.findMany({
        where: { articleId },
        include: {
          language: true,
          translator: true,
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      translations = await db.articleTranslation.findMany({
        include: {
          language: true,
          translator: true,
          article: {
            include: {
              originalLanguage: true,
              author: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error("Error fetching translations:", error);
    return NextResponse.json({ error: "Failed to fetch translations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const role = getRequestRole(request);
  if (!canCreateOrUpdate(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validatedData = createTranslationSchema.parse(body);

    // Convert status to uppercase
    const status = validatedData.status.toUpperCase() as "DRAFT" | "PUBLISHED";

    if (!db) {
      // Return mock response when database is not available
      const mockTranslation = {
        id: Date.now().toString(),
        ...validatedData,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: status === "PUBLISHED" ? new Date().toISOString() : null,
        language: {
          id: validatedData.languageId,
          code: "en",
          name: "English"
        }
      };
      return NextResponse.json(mockTranslation, { status: 201 });
    }

    // Get admin user for translator
    const adminUser = await db.user.findFirst({
      where: { role: "ADMIN" }
    });

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create the translation
    const translation = await db.articleTranslation.create({
      data: {
        articleId: validatedData.articleId,
        languageId: validatedData.languageId,
        title: validatedData.title,
        slug,
        excerpt: validatedData.excerpt,
        content: validatedData.content,
        metaTitle: validatedData.metaTitle,
        metaDescription: validatedData.metaDescription,
        keywords: validatedData.keywords,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        translatorId: adminUser?.id,
      },
      include: {
        language: true,
        translator: true,
      }
    });

    return NextResponse.json(translation, { status: 201 });
  } catch (error) {
    console.error("Error creating translation:", error);
    
    if (error instanceof z.ZodError) {
      // Extract field-specific errors for better debugging
      const fieldErrors = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
        received: (issue as any).received
      }));
      
      console.error("Validation errors:", fieldErrors);
      console.error("Full validation issues:", error.issues);
      
      return NextResponse.json({ 
        error: "Validation failed", 
        details: error.issues,
        fieldErrors, // User-friendly field errors
        message: `Validation failed: ${fieldErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to create translation",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}


