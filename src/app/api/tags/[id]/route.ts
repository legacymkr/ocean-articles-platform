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
    
    const tag = await db.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    if (!tag) {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ tag });
  } catch (error) {
    console.error("Error fetching tag:", error);
    return NextResponse.json(
      { error: "Failed to fetch tag" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Tag name is required" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const tag = await db.tag.update({
      where: { id },
      data: {
        name,
        slug,
        color: color || null
      },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    return NextResponse.json({ tag });
  } catch (error: any) {
    console.error("Error updating tag:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      );
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A tag with this name already exists" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update tag" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!db) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }
    
    // Check if tag is being used by any articles
    const articleCount = await db.articleTag.count({
      where: { tagId: id }
    });

    if (articleCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete tag. It is being used by ${articleCount} article(s).` },
        { status: 400 }
      );
    }

    await db.tag.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting tag:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}
