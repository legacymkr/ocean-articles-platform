import { createUploadthing, type FileRouter } from "uploadthing/next";
import { db } from "@/lib/db";
import { MediaType } from "@prisma/client";

const f = createUploadthing();

// Helper function to get current admin user
async function getCurrentAdminUser() {
  if (!db) {
    throw new Error("Database not available");
  }

  let adminUser = await db.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true, name: true, email: true, role: true }
  });

  // Create admin user if none exists
  if (!adminUser) {
    adminUser = await db.user.create({
      data: {
        name: "Admin User",
        email: "admin@galatide.com",
        role: "ADMIN",
      },
      select: { id: true, name: true, email: true, role: true }
    });
  }

  return adminUser;
}

// Helper function to detect media type from file
function detectMediaType(file: { name: string; type: string }): MediaType {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type.toLowerCase();

  // Image types
  if (mimeType.startsWith('image/') || 
      ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(extension || '')) {
    return MediaType.IMAGE;
  }
  
  // Video types
  if (mimeType.startsWith('video/') || 
      ['mp4', 'webm', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(extension || '')) {
    return MediaType.VIDEO;
  }
  
  // Audio types
  if (mimeType.startsWith('audio/') || 
      ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(extension || '')) {
    return MediaType.AUDIO;
  }
  
  // Default to document
  return MediaType.DOCUMENT;
}

// Helper function to extract file metadata
function extractFileMetadata(file: any) {
  return {
    filename: file.name,
    mimeType: file.type,
    fileSize: file.size,
    // Additional metadata can be extracted here
  };
}

// Helper function to save media to database
async function saveMediaToDatabase(file: any, userId: string) {
  if (!db) {
    console.warn("Database not available, skipping media save");
    return null;
  }

  try {
    const mediaType = detectMediaType(file);
    const metadata = extractFileMetadata(file);
    
    const mediaAsset = await db.mediaAsset.create({
      data: {
        url: file.url,
        type: mediaType,
        altText: file.name || `Uploaded ${mediaType.toLowerCase()}`,
        seoTitle: file.name || `Uploaded ${mediaType.toLowerCase()}`,
        createdById: userId,
      }
    });

    console.log(`Media asset saved to database: ${file.url} (${mediaType})`);
    return mediaAsset;
  } catch (error) {
    console.error("Error saving media asset to database:", error);
    throw error;
  }
}

// Middleware for authentication
async function authMiddleware() {
  try {
    // Get current admin user
    const adminUser = await getCurrentAdminUser();
    
    if (!adminUser || adminUser.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    return { userId: adminUser.id, userRole: adminUser.role };
  } catch (error) {
    console.error("Authentication error:", error);
    throw new Error("Authentication failed");
  }
}

// File router for handling uploads
export const ourFileRouter = {
  // Comprehensive media uploader supporting all types
  mediaUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 10 },
    video: { maxFileSize: "32MB", maxFileCount: 5 },
    audio: { maxFileSize: "8MB", maxFileCount: 10 },
    pdf: { maxFileSize: "4MB", maxFileCount: 10 },
    "text/plain": { maxFileSize: "1MB", maxFileCount: 10 },
    "application/msword": { maxFileSize: "4MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "4MB", maxFileCount: 10 },
  })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);

      try {
        const mediaAsset = await saveMediaToDatabase(file, metadata.userId);
        return { 
          uploadedBy: metadata.userId,
          mediaAsset: mediaAsset ? {
            id: mediaAsset.id,
            url: mediaAsset.url,
            type: mediaAsset.type
          } : null
        };
      } catch (error) {
        console.error("Error in upload completion:", error);
        // Don't throw here to avoid breaking the upload, just log the error
        return { 
          uploadedBy: metadata.userId,
          error: "Failed to save to database"
        };
      }
    }),

  // Legacy image uploader for backward compatibility
  imageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Image upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);

      try {
        const mediaAsset = await saveMediaToDatabase(file, metadata.userId);
        return { 
          uploadedBy: metadata.userId,
          mediaAsset: mediaAsset ? {
            id: mediaAsset.id,
            url: mediaAsset.url,
            type: mediaAsset.type
          } : null
        };
      } catch (error) {
        console.error("Error in image upload completion:", error);
        return { 
          uploadedBy: metadata.userId,
          error: "Failed to save to database"
        };
      }
    }),

  // Multiple images uploader
  multipleImagesUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 10 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Multiple images upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);

      try {
        const mediaAsset = await saveMediaToDatabase(file, metadata.userId);
        return { 
          uploadedBy: metadata.userId,
          mediaAsset: mediaAsset ? {
            id: mediaAsset.id,
            url: mediaAsset.url,
            type: mediaAsset.type
          } : null
        };
      } catch (error) {
        console.error("Error in multiple images upload completion:", error);
        return { 
          uploadedBy: metadata.userId,
          error: "Failed to save to database"
        };
      }
    }),

  // Video uploader
  videoUploader: f({ video: { maxFileSize: "32MB", maxFileCount: 1 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Video upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);

      try {
        const mediaAsset = await saveMediaToDatabase(file, metadata.userId);
        return { 
          uploadedBy: metadata.userId,
          mediaAsset: mediaAsset ? {
            id: mediaAsset.id,
            url: mediaAsset.url,
            type: mediaAsset.type
          } : null
        };
      } catch (error) {
        console.error("Error in video upload completion:", error);
        return { 
          uploadedBy: metadata.userId,
          error: "Failed to save to database"
        };
      }
    }),

  // Document uploader
  documentUploader: f({
    pdf: { maxFileSize: "4MB", maxFileCount: 10 },
    "application/pdf": { maxFileSize: "4MB", maxFileCount: 10 },
    "text/plain": { maxFileSize: "1MB", maxFileCount: 10 },
    "application/msword": { maxFileSize: "4MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "4MB", maxFileCount: 10 },
  })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Document upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);

      try {
        const mediaAsset = await saveMediaToDatabase(file, metadata.userId);
        return { 
          uploadedBy: metadata.userId,
          mediaAsset: mediaAsset ? {
            id: mediaAsset.id,
            url: mediaAsset.url,
            type: mediaAsset.type
          } : null
        };
      } catch (error) {
        console.error("Error in document upload completion:", error);
        return { 
          uploadedBy: metadata.userId,
          error: "Failed to save to database"
        };
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
