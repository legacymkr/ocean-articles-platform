import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateSlug, generateUniqueSlug } from "@/lib/slug";

const createTagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(50, "Tag name must be 50 characters or less"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color").optional(),
});

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    const tags = await prisma.tag.findMany({
      include: {
        translations: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error("Invalid JSON in request body:", jsonError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const validatedData = createTagSchema.parse(body);

    // Check if tag with this name already exists
    const existingTag = await prisma.tag.findUnique({
      where: { name: validatedData.name.trim() },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "A tag with this name already exists" },
        { status: 409 }
      );
    }

    // Generate slug from name
    const baseSlug = generateSlug(validatedData.name);

    // Get existing slugs to ensure uniqueness
    const existingSlugs = await prisma.tag.findMany({
      select: { slug: true },
    });

    const uniqueSlug = await generateUniqueSlug(
      baseSlug,
      existingSlugs.map((tag) => tag.slug).filter(Boolean)
    );

    // Create the tag
    const tag = await prisma.tag.create({
      data: {
        name: validatedData.name.trim(),
        slug: uniqueSlug,
        color: validatedData.color || "#6366f1", // Default to indigo color
      },
      include: {
        translations: true,
      },
    });

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    console.error("Error creating tag:", error);

    if (error instanceof z.ZodError) {
      const validationErrors = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }));

      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationErrors,
          message: validationErrors.map(e => `${e.field}: ${e.message}`).join(', ')
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}