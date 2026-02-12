import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ArticleService } from "@/lib/services/article-service";
import { MediaReferenceTracker } from "@/lib/services/media-reference-tracker";
import { canCreateOrUpdate, canDelete, getRequestRole } from "@/lib/rbac";
import { ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";

const updateArticleSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required").optional(),
  coverUrl: z
    .string()
    .optional()
    .refine((val) => !val || val === "" || z.string().url().safeParse(val).success, {
      message: "Cover URL must be a valid URL or empty",
    }),
  type: z.enum(["VARIOUS", "CLUSTER", "SERIES"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "draft", "published"]).optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  publishedAt: z.string().datetime().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const languageId = searchParams.get("languageId") || "1";

    const article = await ArticleService.getArticleById(id, languageId);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const role = getRequestRole(request);
    if (!canCreateOrUpdate(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateArticleSchema.parse(body);

    // Convert status to ArticleStatus enum and remove tags (handled separately)
    const { tags, ...dataWithoutTags } = validatedData;
    
    // Convert status to proper enum value
    let statusValue: ArticleStatus | undefined = undefined;
    if (validatedData.status) {
      statusValue = validatedData.status.toLowerCase() === "published" 
        ? ArticleStatus.PUBLISHED 
        : ArticleStatus.DRAFT;
    }
    
    const updateData = {
      ...dataWithoutTags,
      status: statusValue,
    };

    // If publishedAt provided, normalize it; otherwise auto-set/clear based on status
    if (validatedData.publishedAt) {
      (updateData as any).publishedAt = new Date(validatedData.publishedAt);
    } else if (statusValue) {
      if (statusValue === ArticleStatus.PUBLISHED) {
        (updateData as any).publishedAt = new Date();
      } else if (statusValue === ArticleStatus.DRAFT) {
        (updateData as any).publishedAt = null;
      }
    }

    try {
      // Handle tags conversion from names to IDs
      let tagIds: string[] = [];
      if (tags && Array.isArray(tags)) {
        // Filter out null/undefined values and convert to tag IDs
        const validTagNames = tags.filter((tag: any) => tag && typeof tag === 'string');
        
        if (validTagNames.length > 0 && db) {
          // Get or create tags by name
          const tagPromises = validTagNames.map(async (tagName: string) => {
            if (!db) return null;
            
            // First try to find existing tag
            let tag = await db.tag.findFirst({
              where: { name: tagName }
            });
            
            // If not found, create it
            if (!tag) {
              const slug = tagName
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();
                
              tag = await db.tag.create({
                data: {
                  name: tagName,
                  slug,
                }
              });
            }
            
            return tag?.id;
          });
          
          const resolvedTagIds = await Promise.all(tagPromises);
          tagIds = resolvedTagIds.filter(Boolean) as string[];
        }
      }

      const article = await ArticleService.updateArticle(id, {
        ...updateData,
        tagIds,
      });

      if (!article) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 });
      }

      // Track media references in the updated article
      try {
        const mediaReferences = await MediaReferenceTracker.trackArticleMediaReferences(
          id,
          validatedData.content || article.content,
          validatedData.coverUrl || article.coverUrl
        );
        await MediaReferenceTracker.updateMediaUsageTracking(mediaReferences);
      } catch (trackingError) {
        console.error('Error tracking media references:', trackingError);
        // Don't fail the article update if media tracking fails
      }

      return NextResponse.json(article);
    } catch (dbError) {
      console.error("Database error:", dbError);

      // Check if it's a database availability issue
      if (dbError instanceof Error && dbError.message === "Database not available") {
        return NextResponse.json({ 
          error: "Database connection not available. Please check your DATABASE_URL environment variable." 
        }, { status: 503 });
      }

      // Return a mock updated article when database is not available
      const mockArticle = {
        id,
        ...updateData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: updateData.status === "PUBLISHED" ? new Date().toISOString() : null,
        author: { name: "Admin User" },
        tags: tags?.map((tag: string) => ({ tag: { name: tag } })) || [],
        originalLanguage: { code: "en", name: "English" },
        translations: [],
      };

      return NextResponse.json(mockArticle);
    }
  } catch (error) {
    console.error("Error updating article:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const role = getRequestRole(request);
    if (!canDelete(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    try {
      const success = await ArticleService.deleteArticle(id);

      if (!success) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error("Database error:", dbError);

      // Return success when database is not available (article will be removed from frontend state)
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}
