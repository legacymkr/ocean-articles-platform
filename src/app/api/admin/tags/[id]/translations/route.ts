import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    const resolvedParams = await params;
    const tagId = resolvedParams.id;
    const { translations } = await request.json();

    // Delete existing translations for this tag
    await prisma.tagTranslation.deleteMany({
      where: { tagId },
    });

    // Create new translations
    if (translations && translations.length > 0) {
      await prisma.tagTranslation.createMany({
        data: translations.map((t: { languageCode: string; name: string }) => ({
          tagId,
          languageCode: t.languageCode,
          name: t.name,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving tag translations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}