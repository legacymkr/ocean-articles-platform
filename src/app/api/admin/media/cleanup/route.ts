import { NextRequest, NextResponse } from "next/server";
import { MediaReferenceTracker } from "@/lib/services/media-reference-tracker";

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // This endpoint should be protected - only admins should access it
    // For now, we'll implement basic protection
    
    const { action } = await request.json();
    
    if (action === 'find-unused') {
      // Find unused media files
      const unusedMedia = await MediaReferenceTracker.findUnusedMedia();
      
      return NextResponse.json({
        success: true,
        unusedMedia,
        count: unusedMedia.length
      });
    }
    
    if (action === 'cleanup') {
      // Clean up unused media references
      const cleanedCount = await MediaReferenceTracker.cleanupUnusedReferences();
      
      return NextResponse.json({
        success: true,
        cleanedCount,
        message: `Cleaned up ${cleanedCount} unused media references`
      });
    }

    if (action === 'find-duplicates') {
      // Find duplicate media files
      const duplicates = await MediaReferenceTracker.findDuplicateMedia();
      
      return NextResponse.json({
        success: true,
        duplicates,
        count: duplicates.length
      });
    }

    if (action === 'storage-stats') {
      // Get storage usage statistics
      const stats = await MediaReferenceTracker.getStorageStats();
      
      return NextResponse.json({
        success: true,
        stats
      });
    }
    

    
    return NextResponse.json(
      { error: "Invalid action. Use 'find-unused', 'cleanup', 'find-duplicates', or 'storage-stats'" },
      { status: 400 }
    );
    
  } catch (error) {
    console.error("Error in media cleanup:", error);
    return NextResponse.json(
      { error: "Failed to perform media cleanup" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'stats') {
      // Get storage statistics
      const stats = await MediaReferenceTracker.getStorageStats();
      return NextResponse.json({
        success: true,
        stats
      });
    }
    
    if (action === 'duplicates') {
      // Find duplicate media files
      const duplicates = await MediaReferenceTracker.findDuplicateMedia();
      return NextResponse.json({
        success: true,
        duplicates,
        count: duplicates.length
      });
    }
    
    // Default: Get unused media files
    const unusedMedia = await MediaReferenceTracker.findUnusedMedia();
    
    return NextResponse.json({
      success: true,
      unusedMedia,
      count: unusedMedia.length
    });
    
  } catch (error) {
    console.error("Error in media cleanup GET:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}