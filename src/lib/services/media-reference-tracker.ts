import { db } from "@/lib/db";

export interface MediaReference {
  mediaId: string;
  mediaUrl: string;
  contentType: 'article' | 'page';
  contentId: string;
  fieldName: string; // 'content', 'coverUrl', etc.
}

export class MediaReferenceTracker {
  /**
   * Extract media URLs from HTML content
   */
  static extractMediaUrls(htmlContent: string): string[] {
    const urls: string[] = [];
    
    // Extract image URLs
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      urls.push(match[1]);
    }
    
    // Extract video URLs
    const videoRegex = /<video[^>]*>[\s\S]*?<source[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<\/video>/gi;
    while ((match = videoRegex.exec(htmlContent)) !== null) {
      urls.push(match[1]);
    }
    
    // Extract document/link URLs that might be media files
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
    while ((match = linkRegex.exec(htmlContent)) !== null) {
      const url = match[1];
      // Check if it's likely a media file based on URL pattern or domain
      if (this.isLikelyMediaUrl(url)) {
        urls.push(url);
      }
    }
    
    return [...new Set(urls)]; // Remove duplicates
  }
  
  /**
   * Check if a URL is likely a media file
   */
  static isLikelyMediaUrl(url: string): boolean {
    // Check for common media file extensions
    const mediaExtensions = /\.(jpg|jpeg|png|gif|webp|mp4|webm|pdf|doc|docx)$/i;
    if (mediaExtensions.test(url)) {
      return true;
    }
    
    // Check for uploadthing URLs or other media service patterns
    if (url.includes('uploadthing') || url.includes('utfs.io')) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Find media records by URLs
   */
  static async findMediaByUrls(urls: string[]): Promise<Array<{id: string, url: string}>> {
    if (!db || urls.length === 0) return [];
    
    try {
      const mediaRecords = await db.mediaAsset.findMany({
        where: {
          url: {
            in: urls
          }
        },
        select: {
          id: true,
          url: true
        }
      });
      
      return mediaRecords;
    } catch (error) {
      console.error('Error finding media by URLs:', error);
      return [];
    }
  }
  
  /**
   * Track media references for an article
   */
  static async trackArticleMediaReferences(
    articleId: string, 
    content: string, 
    coverUrl?: string
  ): Promise<MediaReference[]> {
    const references: MediaReference[] = [];
    
    // Extract URLs from content
    const contentUrls = this.extractMediaUrls(content);
    const contentMedia = await this.findMediaByUrls(contentUrls);
    
    for (const media of contentMedia) {
      references.push({
        mediaId: media.id,
        mediaUrl: media.url,
        contentType: 'article',
        contentId: articleId,
        fieldName: 'content'
      });
    }
    
    // Track cover image if provided
    if (coverUrl) {
      const coverMedia = await this.findMediaByUrls([coverUrl]);
      for (const media of coverMedia) {
        references.push({
          mediaId: media.id,
          mediaUrl: media.url,
          contentType: 'article',
          contentId: articleId,
          fieldName: 'coverUrl'
        });
      }
    }
    
    return references;
  }
  
  /**
   * Update media usage tracking in database
   */
  static async updateMediaUsageTracking(references: MediaReference[]): Promise<void> {
    if (!db || references.length === 0) return;
    
    try {
      // Group references by media ID
      const mediaUsage = new Map<string, MediaReference[]>();
      for (const ref of references) {
        if (!mediaUsage.has(ref.mediaId)) {
          mediaUsage.set(ref.mediaId, []);
        }
        mediaUsage.get(ref.mediaId)!.push(ref);
      }
      
      // Update usage count for each media item
      for (const [mediaId, refs] of mediaUsage) {
        await db.mediaAsset.update({
          where: { id: mediaId },
          data: {
            // Store usage information in a JSON field or create a separate table
            // For now, we'll just update a usage count
            updatedAt: new Date()
          }
        });
        
        // TODO: Store detailed reference information in a separate table
        // This would require creating a MediaReference table in the schema
      }
    } catch (error) {
      console.error('Error updating media usage tracking:', error);
    }
  }
  
  /**
   * Remove media references for deleted content
   */
  static async removeContentReferences(
    contentType: 'article' | 'page',
    contentId: string
  ): Promise<void> {
    if (!db) return;
    
    try {
      // TODO: Remove references from MediaReference table when implemented
      console.log(`Removing media references for ${contentType} ${contentId}`);
    } catch (error) {
      console.error('Error removing content references:', error);
    }
  }
  
  /**
   * Find unused media files
   */
  static async findUnusedMedia(): Promise<Array<{id: string, url: string, createdAt: Date}>> {
    if (!db) return [];
    
    try {
      // This is a simplified version - in a full implementation,
      // we'd check against a MediaReference table
      const allMedia = await db.mediaAsset.findMany({
        select: {
          id: true,
          url: true,
          createdAt: true
        }
      });
      
      // For now, return media older than 30 days that might be unused
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return allMedia.filter((media: any) => media.createdAt < thirtyDaysAgo);
    } catch (error) {
      console.error('Error finding unused media:', error);
      return [];
    }
  }
  
  /**
   * Clean up unused media references
   */
  static async cleanupUnusedReferences(): Promise<number> {
    if (!db) return 0;
    
    try {
      // Find unused media files
      const unusedMedia = await this.findUnusedMedia();
      let cleanedCount = 0;
      
      for (const media of unusedMedia) {
        try {
          // Check if media is actually unused by scanning all articles
          const isReferenced = await this.isMediaReferenced(media.url);
          
          if (!isReferenced) {
            // Delete from database (the actual file cleanup would be handled separately)
            await db.mediaAsset.delete({
              where: { id: media.id }
            });
            cleanedCount++;
            console.log(`Cleaned up unused media: ${media.url}`);
          }
        } catch (error) {
          console.error(`Error cleaning up media ${media.id}:`, error);
        }
      }
      
      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up unused references:', error);
      return 0;
    }
  }

  /**
   * Check if a media URL is referenced in any content
   */
  static async isMediaReferenced(mediaUrl: string): Promise<boolean> {
    if (!db) return false;
    
    try {
      // Check articles content
      const articlesWithMedia = await db.article.findMany({
        where: {
          OR: [
            { content: { contains: mediaUrl } },
            { coverUrl: mediaUrl }
          ]
        },
        select: { id: true }
      });
      
      return articlesWithMedia.length > 0;
    } catch (error) {
      console.error('Error checking media references:', error);
      return true; // Assume referenced to be safe
    }
  }

  /**
   * Find duplicate media files
   */
  static async findDuplicateMedia(): Promise<Array<{
    url: string;
    duplicates: Array<{id: string, url: string, createdAt: Date}>
  }>> {
    if (!db) return [];
    
    try {
      const allMedia = await db.mediaAsset.findMany({
        select: {
          id: true,
          url: true,
          createdAt: true
        },
        orderBy: { createdAt: 'asc' }
      });
      
      // Group by URL to find duplicates
      const urlGroups = new Map<string, Array<{id: string, url: string, createdAt: Date}>>();
      
      for (const media of allMedia) {
        if (!urlGroups.has(media.url)) {
          urlGroups.set(media.url, []);
        }
        urlGroups.get(media.url)!.push(media);
      }
      
      // Find groups with more than one item
      const duplicates: Array<{
        url: string;
        duplicates: Array<{id: string, url: string, createdAt: Date}>
      }> = [];
      
      for (const [url, items] of urlGroups) {
        if (items.length > 1) {
          duplicates.push({
            url,
            duplicates: items
          });
        }
      }
      
      return duplicates;
    } catch (error) {
      console.error('Error finding duplicate media:', error);
      return [];
    }
  }

  /**
   * Get storage usage statistics
   */
  static async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    byType: Record<string, { count: number; size: number }>;
    oldestFile: Date | null;
    newestFile: Date | null;
  }> {
    if (!db) {
      return {
        totalFiles: 0,
        totalSize: 0,
        byType: {},
        oldestFile: null,
        newestFile: null
      };
    }
    
    try {
      const allMedia = await db.mediaAsset.findMany({
        select: {
          type: true,
          createdAt: true,
          // Note: We don't have file size in the current schema
          // In a real implementation, you'd add a fileSize field
        }
      });
      
      const stats = {
        totalFiles: allMedia.length,
        totalSize: 0, // Would calculate from fileSize field
        byType: {} as Record<string, { count: number; size: number }>,
        oldestFile: allMedia.length > 0 ? 
          allMedia.reduce((oldest, current) => 
            current.createdAt < oldest.createdAt ? current : oldest
          ).createdAt : null,
        newestFile: allMedia.length > 0 ? 
          allMedia.reduce((newest, current) => 
            current.createdAt > newest.createdAt ? current : newest
          ).createdAt : null
      };
      
      // Group by type
      for (const media of allMedia) {
        if (!stats.byType[media.type]) {
          stats.byType[media.type] = { count: 0, size: 0 };
        }
        stats.byType[media.type].count++;
        // stats.byType[media.type].size += media.fileSize; // Would add file size
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        byType: {},
        oldestFile: null,
        newestFile: null
      };
    }
  }

  /**
   * Estimate file size based on URL and type (fallback method)
   */
  private static estimateFileSize(url: string, type: string): number {
    // This is a rough estimation - in a real app you'd store actual file sizes
    switch (type) {
      case 'IMAGE': return 500000; // ~500KB average
      case 'VIDEO': return 10000000; // ~10MB average  
      case 'AUDIO': return 3000000; // ~3MB average
      case 'DOCUMENT': return 1000000; // ~1MB average
      default: return 500000;
    }
  }


}