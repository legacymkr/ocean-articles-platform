import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!db) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }
    
    const mediaAsset = await db.mediaAsset.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!mediaAsset) {
      return NextResponse.json(
        { error: "Media asset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ mediaAsset });
  } catch (error) {
    console.error("Error fetching media asset:", error);
    return NextResponse.json(
      { error: "Failed to fetch media asset" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { altText, width, height, blurhash, seoTitle, description, updatedById } = body;

    if (!db) {
      return NextResponse.json({ 
        error: "Database not available",
        code: "DATABASE_UNAVAILABLE"
      }, { status: 503 });
    }

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        error: "Invalid media ID",
        details: "Media ID must be a valid string",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Check if media asset exists first
    const existingMedia = await db.mediaAsset.findUnique({
      where: { id },
      select: { 
        id: true, 
        altText: true, 
        width: true, 
        height: true, 
        blurhash: true, 
        seoTitle: true,
        type: true,
        createdById: true
      }
    });

    if (!existingMedia) {
      return NextResponse.json({
        error: "Media asset not found",
        details: `No media asset found with ID: ${id}`,
        code: "MEDIA_NOT_FOUND"
      }, { status: 404 });
    }

    // Validate user permissions if updatedById is provided
    if (updatedById) {
      try {
        const user = await db.user.findUnique({
          where: { id: updatedById },
          select: { id: true, role: true }
        });

        if (!user) {
          return NextResponse.json({
            error: "Invalid user",
            details: "The specified user does not exist",
            code: "USER_NOT_FOUND"
          }, { status: 400 });
        }

        if (user.role !== 'ADMIN') {
          return NextResponse.json({
            error: "Unauthorized",
            details: "Only admin users can update media assets",
            code: "INSUFFICIENT_PERMISSIONS"
          }, { status: 403 });
        }
      } catch (userError) {
        console.error("Error validating user:", userError);
        return NextResponse.json({
          error: "User validation failed",
          code: "USER_VALIDATION_ERROR"
        }, { status: 500 });
      }
    }

    // Validate dimensions for images
    if (existingMedia.type === 'IMAGE') {
      if (width !== undefined && width !== null && (width < 1 || width > 10000)) {
        return NextResponse.json({
          error: "Invalid image dimensions",
          details: "Image width must be between 1 and 10000 pixels",
          code: "INVALID_DIMENSIONS"
        }, { status: 400 });
      }
      
      if (height !== undefined && height !== null && (height < 1 || height > 10000)) {
        return NextResponse.json({
          error: "Invalid image dimensions",
          details: "Image height must be between 1 and 10000 pixels",
          code: "INVALID_DIMENSIONS"
        }, { status: 400 });
      }
    }

    // Validate alt text length
    if (altText && altText.length > 500) {
      return NextResponse.json({
        error: "Alt text too long",
        details: "Alt text must be 500 characters or less",
        code: "ALT_TEXT_TOO_LONG"
      }, { status: 400 });
    }

    // Validate SEO title length
    if (seoTitle && seoTitle.length > 200) {
      return NextResponse.json({
        error: "SEO title too long",
        details: "SEO title must be 200 characters or less",
        code: "SEO_TITLE_TOO_LONG"
      }, { status: 400 });
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {};
    
    if (altText !== undefined) updateData.altText = altText || null;
    if (width !== undefined) updateData.width = width || null;
    if (height !== undefined) updateData.height = height || null;
    if (blurhash !== undefined) updateData.blurhash = blurhash || null;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle || null;
    
    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date();

    // Log the changes for audit purposes
    const changes: string[] = [];
    if (altText !== undefined && altText !== existingMedia.altText) {
      changes.push(`altText: "${existingMedia.altText}" → "${altText}"`);
    }
    if (width !== undefined && width !== existingMedia.width) {
      changes.push(`width: ${existingMedia.width} → ${width}`);
    }
    if (height !== undefined && height !== existingMedia.height) {
      changes.push(`height: ${existingMedia.height} → ${height}`);
    }
    if (seoTitle !== undefined && seoTitle !== existingMedia.seoTitle) {
      changes.push(`seoTitle: "${existingMedia.seoTitle}" → "${seoTitle}"`);
    }

    if (changes.length > 0) {
      console.log(`Media asset ${id} updated by ${updatedById || 'unknown'}:`, changes.join(', '));
    }

    try {
      const mediaAsset = await db.mediaAsset.update({
        where: { id },
        data: updateData,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return NextResponse.json({ 
        mediaAsset,
        message: "Media asset updated successfully",
        changes: changes.length > 0 ? changes : ["No changes made"]
      });
      
    } catch (updateError: any) {
      // Handle missing columns gracefully
      if (updateError?.code === 'P2022' || updateError?.message?.includes('seoTitle')) {
        console.warn("seoTitle column not found, updating without it");
        
        // Remove seoTitle from update data and try again
        const { seoTitle: _, ...updateDataWithoutSeoTitle } = updateData;
        
        const mediaAsset = await db.mediaAsset.update({
          where: { id },
          data: updateDataWithoutSeoTitle,
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });

        return NextResponse.json({ 
          mediaAsset,
          message: "Media asset updated successfully (some fields not available)",
          changes: changes.length > 0 ? changes : ["No changes made"]
        });
      } else {
        throw updateError;
      }
    }

  } catch (error: any) {
    console.error("Error updating media asset:", error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        error: "Invalid JSON",
        details: "Request body must be valid JSON",
        code: "INVALID_JSON"
      }, { status: 400 });
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        error: "Media asset not found",
        details: `No media asset found with ID: ${id}`,
        code: "MEDIA_NOT_FOUND"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      error: "Failed to update media asset",
      details: "An unexpected error occurred while updating the media asset",
      code: "UPDATE_FAILED"
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const searchParams = request.nextUrl.searchParams;
    const force = searchParams.get('force') === 'true';
    const deletedById = searchParams.get('deletedById');
    
    if (!db) {
      return NextResponse.json({ 
        error: "Database not available",
        code: "DATABASE_UNAVAILABLE"
      }, { status: 503 });
    }

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        error: "Invalid media ID",
        details: "Media ID must be a valid string",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Check if media asset exists and get its details
    const existingMedia = await db.mediaAsset.findUnique({
      where: { id },
      select: { 
        id: true, 
        url: true,
        altText: true,
        type: true,
        createdById: true,
        createdAt: true
      }
    });

    if (!existingMedia) {
      return NextResponse.json({
        error: "Media asset not found",
        details: `No media asset found with ID: ${id}`,
        code: "MEDIA_NOT_FOUND"
      }, { status: 404 });
    }

    // Validate user permissions if deletedById is provided
    if (deletedById) {
      try {
        const user = await db.user.findUnique({
          where: { id: deletedById },
          select: { id: true, role: true }
        });

        if (!user) {
          return NextResponse.json({
            error: "Invalid user",
            details: "The specified user does not exist",
            code: "USER_NOT_FOUND"
          }, { status: 400 });
        }

        if (user.role !== 'ADMIN') {
          return NextResponse.json({
            error: "Unauthorized",
            details: "Only admin users can delete media assets",
            code: "INSUFFICIENT_PERMISSIONS"
          }, { status: 403 });
        }
      } catch (userError) {
        console.error("Error validating user:", userError);
        return NextResponse.json({
          error: "User validation failed",
          code: "USER_VALIDATION_ERROR"
        }, { status: 500 });
      }
    }

    // Check for usage in articles (cover images and content)
    const usageReferences: any[] = [];
    
    try {
      // Check for cover image usage
      const articlesWithCover = await db.article.findMany({
        where: { coverUrl: existingMedia.url },
        select: { id: true, title: true, slug: true }
      });
      
      if (articlesWithCover.length > 0) {
        usageReferences.push({
          type: 'article_cover',
          count: articlesWithCover.length,
          items: articlesWithCover.map(article => ({
            id: article.id,
            title: article.title,
            slug: article.slug
          }))
        });
      }

      // Check for content usage in articles
      const articlesWithContent = await db.article.findMany({
        where: {
          content: {
            contains: existingMedia.url
          }
        },
        select: { id: true, title: true, slug: true }
      });
      
      if (articlesWithContent.length > 0) {
        usageReferences.push({
          type: 'article_content',
          count: articlesWithContent.length,
          items: articlesWithContent.map(article => ({
            id: article.id,
            title: article.title,
            slug: article.slug
          }))
        });
      }

      // Check for usage in article translations
      const translationsWithContent = await db.articleTranslation.findMany({
        where: {
          content: {
            contains: existingMedia.url
          }
        },
        select: { 
          id: true, 
          title: true, 
          slug: true,
          article: {
            select: { id: true, title: true }
          }
        }
      });
      
      if (translationsWithContent.length > 0) {
        usageReferences.push({
          type: 'translation_content',
          count: translationsWithContent.length,
          items: translationsWithContent.map(translation => ({
            id: translation.id,
            title: translation.title,
            slug: translation.slug,
            originalArticle: translation.article
          }))
        });
      }

    } catch (usageError) {
      console.warn("Could not check media usage:", usageError);
      // Continue with deletion if usage check fails, but warn
    }

    // If media is in use and force is not specified, return usage information
    if (usageReferences.length > 0 && !force) {
      const totalUsages = usageReferences.reduce((sum, ref) => sum + ref.count, 0);
      
      return NextResponse.json({
        error: "Media asset is in use",
        details: `This media asset is referenced in ${totalUsages} location(s). Use force=true to delete anyway.`,
        code: "MEDIA_IN_USE",
        usageReferences,
        forceDeleteUrl: `/api/media/${id}?force=true${deletedById ? `&deletedById=${deletedById}` : ''}`
      }, { status: 409 });
    }

    // Log the deletion for audit purposes
    console.log(`Media asset ${id} (${existingMedia.url}) deleted by ${deletedById || 'unknown'}${force ? ' (forced)' : ''}`);
    if (usageReferences.length > 0) {
      console.warn(`Forced deletion of media asset ${id} that was in use in ${usageReferences.length} location(s)`);
    }

    // Perform the deletion
    await db.mediaAsset.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true,
      message: "Media asset deleted successfully",
      deletedMedia: {
        id: existingMedia.id,
        url: existingMedia.url,
        altText: existingMedia.altText,
        type: existingMedia.type
      },
      wasForced: force,
      hadUsageReferences: usageReferences.length > 0,
      usageReferences: force ? usageReferences : undefined
    });

  } catch (error: any) {
    console.error("Error deleting media asset:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        error: "Media asset not found",
        details: `No media asset found with ID: ${id}`,
        code: "MEDIA_NOT_FOUND"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      error: "Failed to delete media asset",
      details: "An unexpected error occurred while deleting the media asset",
      code: "DELETION_FAILED"
    }, { status: 500 });
  }
}
