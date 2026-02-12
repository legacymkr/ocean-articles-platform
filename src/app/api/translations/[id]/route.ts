import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestRole, canCreateOrUpdate, canDelete } from "@/lib/rbac";
import { db } from "@/lib/db";

const updateTranslationSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "draft", "published"]).optional(),
});

// GET - Fetch translation with original article data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }
    
    const translation = await db.articleTranslation.findUnique({
      where: { id },
      include: {
        language: true,
        article: {
          include: {
            originalLanguage: true,
            tags: {
              include: { tag: true }
            },
            author: true
          }
        },
        translator: true
      }
    });
    
    if (!translation) {
      return NextResponse.json(
        { error: "Translation not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ translation });
  } catch (error) {
    console.error("Error fetching translation:", error);
    return NextResponse.json(
      { error: "Failed to fetch translation" },
      { status: 500 }
    );
  }
}

// PUT - Update translation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = getRequestRole(request);
  if (!canCreateOrUpdate(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('Updating translation:', id, 'with data:', body);
    
    const validatedData = updateTranslationSchema.parse(body);
    
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }
    
    // Normalize status to uppercase
    const status = validatedData.status?.toUpperCase() as "DRAFT" | "PUBLISHED" | undefined;
    
    // Prepare update data
    const updateData: any = {
      ...validatedData,
      status,
    };
    
    // Set publishedAt based on status
    if (status === "PUBLISHED") {
      updateData.publishedAt = new Date();
    } else if (status === "DRAFT") {
      updateData.publishedAt = null;
    }
    
    const updated = await db.articleTranslation.update({
      where: { id },
      data: updateData,
      include: {
        language: true,
        translator: true,
        article: {
          include: {
            originalLanguage: true
          }
        }
      }
    });
    
    console.log('Translation updated successfully:', updated.id);
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating translation:", error);
    
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: error.issues,
          fieldErrors,
          message: `Validation failed: ${fieldErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Failed to update translation",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete translation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = getRequestRole(request);
  if (!canDelete(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  try {
    const { id } = await params;
    
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }
    
    await db.articleTranslation.delete({
      where: { id }
    });
    
    console.log('Translation deleted:', id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting translation:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete translation",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}


