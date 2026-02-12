import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    
    if (!db) {
      return NextResponse.json({ tags: [] });
    }
    
    const tags = await db.tag.findMany({
      orderBy: {
        name: 'asc'
      },
      take: limit,
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Tag name is required" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const tag = await db.tag.create({
      data: {
        name,
        slug,
        color: color || null
      }
    });

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating tag:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A tag with this name already exists" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
