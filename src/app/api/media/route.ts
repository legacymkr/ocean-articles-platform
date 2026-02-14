import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MediaType } from "@prisma/client";

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100 items
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type') as MediaType | null;
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minSize = searchParams.get('minSize') ? parseInt(searchParams.get('minSize')!) : null;
    const maxSize = searchParams.get('maxSize') ? parseInt(searchParams.get('maxSize')!) : null;
    
    // Try database first, fallback to empty array
    let mediaAssets: any[] = [];
    let totalCount = 0;
    
    try {
      if (!db) {
        console.warn("Database not available, returning empty media list");
        return NextResponse.json({ 
          mediaAssets: [], 
          pagination: { total: 0, limit, offset, hasMore: false }
        });
      }
      
      // Build where clause for filtering
      const whereClause: any = {};
      
      // Filter by media type
      if (type && Object.values(MediaType).includes(type)) {
        whereClause.type = type;
      }
      
      // Search functionality (filename and alt text)
      if (search.trim()) {
        whereClause.OR = [
          {
            url: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            altText: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ];
      }
      
      // Date range filtering
      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) {
          whereClause.createdAt.gte = new Date(dateFrom);
        }
        if (dateTo) {
          whereClause.createdAt.lte = new Date(dateTo);
        }
      }
      
      // Validate sort field
      const validSortFields = ['createdAt', 'updatedAt', 'altText', 'type'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const sortDirection = sortOrder === 'asc' ? 'asc' : 'desc';
      
      try {
        // Get total count for pagination
        totalCount = await db.mediaAsset.count({ where: whereClause });
        
        // Get media assets with advanced filtering
        mediaAssets = await db.mediaAsset.findMany({
          where: whereClause,
          orderBy: {
            [sortField]: sortDirection
          },
          skip: offset,
          take: limit,
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
        
        // Post-process for size filtering (if needed)
        if (minSize !== null || maxSize !== null) {
          mediaAssets = mediaAssets.filter((asset: any) => {
            // For now, we don't have file size in the database
            // This would need to be added to the schema later
            return true;
          });
        }
        
      } catch (columnError: any) {
        // Fallback for missing columns (like seoTitle)
        if (columnError?.code === 'P2022' || columnError?.message?.includes('seoTitle')) {
          console.warn("Using fallback query due to missing columns");
          
          // Build raw SQL query with proper filtering
          let sqlWhere = 'WHERE 1=1';
          const sqlParams: any[] = [];
          let paramIndex = 1;
          
          if (type) {
            sqlWhere += ` AND m.type = $${paramIndex}`;
            sqlParams.push(type);
            paramIndex++;
          }
          
          if (search.trim()) {
            sqlWhere += ` AND (m.url ILIKE $${paramIndex} OR m."altText" ILIKE $${paramIndex})`;
            sqlParams.push(`%${search}%`);
            paramIndex++;
          }
          
          if (dateFrom) {
            sqlWhere += ` AND m."createdAt" >= $${paramIndex}`;
            sqlParams.push(new Date(dateFrom));
            paramIndex++;
          }
          
          if (dateTo) {
            sqlWhere += ` AND m."createdAt" <= $${paramIndex}`;
            sqlParams.push(new Date(dateTo));
            paramIndex++;
          }
          
          // Get total count
          const countQuery = `
            SELECT COUNT(*) as count
            FROM media_assets m
            ${sqlWhere}
          `;
          
          const countResult = await db.$queryRawUnsafe(countQuery, ...sqlParams) as any[];
          totalCount = parseInt(countResult[0]?.count || '0');
          
          // Get media assets
          const dataQuery = `
            SELECT 
              m.id, m.url, m.type, m.width, m.height, 
              m.blurhash, m."altText", m."seoTitle", m."createdAt", m."updatedAt", 
              m."createdById",
              u.id as "user_id", u.name as "user_name", u.email as "user_email"
            FROM media_assets m
            LEFT JOIN users u ON m."createdById" = u.id
            ${sqlWhere}
            ORDER BY m."${sortField}" ${sortDirection.toUpperCase()}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
          `;
          
          sqlParams.push(limit, offset);
          
          const rawMedia = await db.$queryRawUnsafe(dataQuery, ...sqlParams) as any[];
          
          // Transform to expected format
          mediaAssets = rawMedia.map((m: any) => ({
            id: m.id,
            url: m.url,
            type: m.type,
            width: m.width,
            height: m.height,
            blurhash: m.blurhash,
            altText: m.altText,
            seoTitle: m.seoTitle,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
            createdById: m.createdById,
            createdBy: {
              id: m.user_id,
              name: m.user_name,
              email: m.user_email
            }
          }));
        } else {
          throw columnError;
        }
      }
    } catch (dbError) {
      console.warn("Database not available, returning empty media list:", dbError);
      mediaAssets = [];
      totalCount = 0;
    }

    // Calculate pagination info
    const hasMore = offset + limit < totalCount;
    const pagination = {
      total: totalCount,
      limit,
      offset,
      hasMore,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(totalCount / limit)
    };

    return NextResponse.json({ 
      success: true,
      mediaAssets,
      pagination,
      filters: {
        type,
        search,
        sortBy,
        sortOrder,
        dateFrom,
        dateTo
      }
    });
  } catch (error) {
    console.error("Error fetching media assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch media assets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      url, 
      type, 
      width, 
      height, 
      blurhash, 
      altText, 
      seoTitle, 
      createdById,
      filename,
      mimeType,
      fileSize
    } = body;

    // Enhanced validation
    if (!url || !type || !createdById) {
      return NextResponse.json(
        { 
          error: "Missing required fields",
          details: "URL, type, and createdById are required",
          code: "MISSING_REQUIRED_FIELDS"
        },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { 
          error: "Database not available",
          code: "DATABASE_UNAVAILABLE"
        },
        { status: 503 }
      );
    }

    // Validate MediaType
    if (!Object.values(MediaType).includes(type)) {
      return NextResponse.json(
        { 
          error: "Invalid media type",
          details: `Type must be one of: ${Object.values(MediaType).join(', ')}`,
          code: "INVALID_MEDIA_TYPE"
        },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { 
          error: "Invalid URL format",
          details: "The provided URL is not valid",
          code: "INVALID_URL"
        },
        { status: 400 }
      );
    }

    // Validate user exists
    try {
      const user = await db.user.findUnique({
        where: { id: createdById },
        select: { id: true, role: true }
      });

      if (!user) {
        return NextResponse.json(
          { 
            error: "Invalid user",
            details: "The specified user does not exist",
            code: "USER_NOT_FOUND"
          },
          { status: 400 }
        );
      }

      if (user.role !== 'ADMIN') {
        return NextResponse.json(
          { 
            error: "Unauthorized",
            details: "Only admin users can create media assets",
            code: "INSUFFICIENT_PERMISSIONS"
          },
          { status: 403 }
        );
      }
    } catch (userError) {
      console.error("Error validating user:", userError);
      return NextResponse.json(
        { 
          error: "User validation failed",
          code: "USER_VALIDATION_ERROR"
        },
        { status: 500 }
      );
    }

    // Check for duplicate URLs
    try {
      const existingMedia = await db.mediaAsset.findFirst({
        where: { url },
        select: { id: true, url: true, altText: true, createdAt: true }
      });

      if (existingMedia) {
        return NextResponse.json(
          { 
            error: "Duplicate media",
            details: "A media asset with this URL already exists",
            code: "DUPLICATE_URL",
            existingMedia: {
              id: existingMedia.id,
              url: existingMedia.url,
              altText: existingMedia.altText,
              createdAt: existingMedia.createdAt
            }
          },
          { status: 409 }
        );
      }
    } catch (duplicateError) {
      console.warn("Could not check for duplicates:", duplicateError);
      // Continue with creation if duplicate check fails
    }

    // Validate dimensions for images
    if (type === MediaType.IMAGE) {
      if (width && (width < 1 || width > 10000)) {
        return NextResponse.json(
          { 
            error: "Invalid image dimensions",
            details: "Image width must be between 1 and 10000 pixels",
            code: "INVALID_DIMENSIONS"
          },
          { status: 400 }
        );
      }
      
      if (height && (height < 1 || height > 10000)) {
        return NextResponse.json(
          { 
            error: "Invalid image dimensions",
            details: "Image height must be between 1 and 10000 pixels",
            code: "INVALID_DIMENSIONS"
          },
          { status: 400 }
        );
      }
    }

    // Validate file size if provided
    if (fileSize && fileSize > 0) {
      const maxSizes = {
        [MediaType.IMAGE]: 8 * 1024 * 1024, // 8MB
        [MediaType.VIDEO]: 32 * 1024 * 1024, // 32MB
        [MediaType.AUDIO]: 8 * 1024 * 1024, // 8MB
        [MediaType.DOCUMENT]: 4 * 1024 * 1024, // 4MB
      };

      if (fileSize > maxSizes[type as MediaType]) {
        const maxSizeMB = maxSizes[type as MediaType] / (1024 * 1024);
        return NextResponse.json(
          { 
            error: "File too large",
            details: `${type} files must be smaller than ${maxSizeMB}MB`,
            code: "FILE_TOO_LARGE"
          },
          { status: 400 }
        );
      }
    }

    // Extract filename from URL if not provided
    const finalFilename = filename || url.split('/').pop() || 'unknown';
    
    // Generate default alt text if not provided
    const finalAltText = altText || `${type.toLowerCase()} file: ${finalFilename}`;

    try {
      const mediaAsset = await db.mediaAsset.create({
        data: {
          url,
          type,
          width: width || null,
          height: height || null,
          blurhash: blurhash || null,
          altText: finalAltText,
          seoTitle: seoTitle || null,
          createdById
        },
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
        message: "Media asset created successfully"
      }, { status: 201 });
      
    } catch (createError: any) {
      // Handle missing columns gracefully
      if (createError?.code === 'P2022' || createError?.message?.includes('seoTitle')) {
        console.warn("seoTitle column not found, creating without it");
        
        const mediaAsset = await db.mediaAsset.create({
          data: {
            url,
            type,
            width: width || null,
            height: height || null,
            blurhash: blurhash || null,
            altText: finalAltText,
            createdById
          },
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
          message: "Media asset created successfully"
        }, { status: 201 });
      } else {
        throw createError;
      }
    }
  } catch (error) {
    console.error("Error creating media asset:", error);
    
    // Provide specific error messages based on error type
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          error: "Invalid JSON",
          details: "Request body must be valid JSON",
          code: "INVALID_JSON"
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to create media asset",
        details: "An unexpected error occurred while creating the media asset",
        code: "CREATION_FAILED"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, force = false, deletedById } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        error: "Invalid request",
        details: "IDs must be provided as a non-empty array",
        code: "INVALID_IDS"
      }, { status: 400 });
    }

    if (ids.length > 100) {
      return NextResponse.json({
        error: "Too many items",
        details: "Cannot delete more than 100 items at once",
        code: "TOO_MANY_ITEMS"
      }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({
        error: "Database not available",
        code: "DATABASE_UNAVAILABLE"
      }, { status: 503 });
    }

    // Validate user permissions if deletedById is provided
    if (deletedById) {
      try {
        const user = await db.user.findUnique({
          where: { id: deletedById },
          select: { id: true, role: true }
        });

        if (!user || user.role !== 'ADMIN') {
          return NextResponse.json({
            error: "Unauthorized",
            details: "Only admin users can delete media assets",
            code: "INSUFFICIENT_PERMISSIONS"
          }, { status: 403 });
        }
      } catch (userError) {
        return NextResponse.json({
          error: "User validation failed",
          code: "USER_VALIDATION_ERROR"
        }, { status: 500 });
      }
    }

    // Get all media assets to be deleted
    const mediaAssets = await db.mediaAsset.findMany({
      where: { id: { in: ids } },
      select: { id: true, url: true, altText: true, type: true }
    });

    if (mediaAssets.length === 0) {
      return NextResponse.json({
        error: "No media assets found",
        details: "None of the provided IDs correspond to existing media assets",
        code: "NO_MEDIA_FOUND"
      }, { status: 404 });
    }

    const results = {
      deleted: [] as any[],
      failed: [] as any[],
      inUse: [] as any[]
    };

    // Process each media asset
    for (const media of mediaAssets) {
      try {
        // Check for usage if not forcing
        if (!force) {
          const usageCount = await Promise.all([
            db.article.count({ where: { coverUrl: media.url } }),
            db.article.count({ where: { content: { contains: media.url } } }),
            db.articleTranslation.count({ where: { content: { contains: media.url } } })
          ]);

          const totalUsage = usageCount.reduce((sum, count) => sum + count, 0);
          
          if (totalUsage > 0) {
            results.inUse.push({
              id: media.id,
              url: media.url,
              altText: media.altText,
              usageCount: totalUsage
            });
            continue;
          }
        }

        // Delete the media asset
        await db.mediaAsset.delete({ where: { id: media.id } });
        
        results.deleted.push({
          id: media.id,
          url: media.url,
          altText: media.altText,
          type: media.type
        });

        console.log(`Batch deleted media asset ${media.id} by ${deletedById || 'unknown'}`);

      } catch (deleteError) {
        console.error(`Failed to delete media asset ${media.id}:`, deleteError);
        results.failed.push({
          id: media.id,
          url: media.url,
          altText: media.altText,
          error: "Deletion failed"
        });
      }
    }

    const notFound = ids.filter(id => !mediaAssets.find(m => m.id === id));
    if (notFound.length > 0) {
      notFound.forEach(id => {
        results.failed.push({
          id,
          error: "Media asset not found"
        });
      });
    }

    return NextResponse.json({
      success: true,
      message: `Batch delete completed. ${results.deleted.length} deleted, ${results.failed.length} failed, ${results.inUse.length} in use`,
      results,
      summary: {
        requested: ids.length,
        deleted: results.deleted.length,
        failed: results.failed.length,
        inUse: results.inUse.length,
        notFound: notFound.length
      }
    });

  } catch (error) {
    console.error("Error in batch delete:", error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        error: "Invalid JSON",
        details: "Request body must be valid JSON",
        code: "INVALID_JSON"
      }, { status: 400 });
    }

    return NextResponse.json({
      error: "Batch delete failed",
      details: "An unexpected error occurred during batch deletion",
      code: "BATCH_DELETE_FAILED"
    }, { status: 500 });
  }
}
