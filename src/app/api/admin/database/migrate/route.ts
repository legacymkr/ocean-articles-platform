import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    // Add seoTitle column to media_assets if it doesn't exist
    await db.$executeRawUnsafe(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'media_assets' 
          AND column_name = 'seoTitle'
        ) THEN
          ALTER TABLE "media_assets" ADD COLUMN "seoTitle" TEXT;
        END IF;
      END $$;
    `);

    return NextResponse.json({ 
      success: true,
      message: "Database migration completed successfully. Added seoTitle column to media_assets."
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Migration failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to run database migrations",
    migrations: [
      {
        name: "add_seo_title_to_media_assets",
        description: "Adds seoTitle column to media_assets table"
      }
    ]
  });
}
