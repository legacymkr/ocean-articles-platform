import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { tagId, language, translatedName } = await request.json();

    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    // Create or update tag translation
    const tagTranslation = await prisma.tagTranslation.upsert({
      where: {
        tagId_languageCode: {
          tagId: tagId,
          languageCode: language,
        }
      },
      update: {
        name: translatedName,
      },
      create: {
        tagId: tagId,
        languageCode: language,
        name: translatedName,
      },
    });

    return NextResponse.json({ success: true, tagTranslation });
  } catch (error) {
    console.error("Error creating tag translation:", error);
    return NextResponse.json({ error: "Failed to create tag translation" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "en";

    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    // Get all tags with their translations
    const tags = await prisma.tag.findMany({
      include: {
        translations: {
          where: {
            languageCode: lang,
          }
        }
      }
    });

    const translatedTags = tags.map(tag => ({
      id: tag.id,
      name: tag.translations[0]?.name || tag.name, // Use translation or fallback to original
      originalName: tag.name,
      color: tag.color,
      hasTranslation: tag.translations.length > 0,
    }));

    return NextResponse.json({ tags: translatedTags });
  } catch (error) {
    console.error("Error fetching translated tags:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}
