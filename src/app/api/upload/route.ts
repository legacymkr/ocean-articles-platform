import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@/lib/db";
import { MediaType } from "@prisma/client";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to get current admin user
async function getCurrentAdminUser() {
  if (!db) {
    return { id: "default-admin", role: "ADMIN" };
  }

  try {
    let adminUser = await db.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true, name: true, email: true, role: true }
    });

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
  } catch (error) {
    console.error("Error getting admin user:", error);
    return { id: "fallback-admin", role: "ADMIN" };
  }
}

// Helper function to detect media type
function detectMediaType(resourceType: string, format: string): MediaType {
  if (resourceType === "image") return MediaType.IMAGE;
  if (resourceType === "video") return MediaType.VIDEO;
  if (resourceType === "raw") {
    const audioFormats = ["mp3", "wav", "ogg", "aac", "flac", "m4a"];
    if (audioFormats.includes(format.toLowerCase())) {
      return MediaType.AUDIO;
    }
    return MediaType.DOCUMENT;
  }
  return MediaType.DOCUMENT;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const altText = formData.get("altText") as string | null;
    const seoTitle = formData.get("seoTitle") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: "ocean-articles",
      resource_type: "auto",
    });

    console.log("Cloudinary upload successful:", uploadResponse.secure_url);

    // Get admin user
    const adminUser = await getCurrentAdminUser();

    // Save to database
    let mediaAsset = null;
    if (db) {
      try {
        const mediaType = detectMediaType(
          uploadResponse.resource_type,
          uploadResponse.format
        );

        mediaAsset = await db.mediaAsset.create({
          data: {
            url: uploadResponse.secure_url,
            type: mediaType,
            altText: altText || file.name || `Uploaded ${mediaType.toLowerCase()}`,
            seoTitle: seoTitle || file.name || `Uploaded ${mediaType.toLowerCase()}`,
            createdById: adminUser.id,
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

        console.log("Media asset saved to database:", mediaAsset.id);
      } catch (dbError) {
        console.error("Error saving to database:", dbError);
        // Continue even if database save fails
      }
    }

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      mediaAsset: mediaAsset ? {
        id: mediaAsset.id,
        url: mediaAsset.url,
        type: mediaAsset.type,
        altText: mediaAsset.altText,
        seoTitle: mediaAsset.seoTitle,
        width: mediaAsset.width,
        height: mediaAsset.height,
        createdAt: mediaAsset.createdAt,
        createdBy: mediaAsset.createdBy,
      } : null,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
