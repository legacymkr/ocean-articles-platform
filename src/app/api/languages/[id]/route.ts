import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!db) {
      // Return mock language data when database is not available
      const mockLanguages = [
        { id: "1", code: "en", name: "English", nativeName: "English", isRTL: false },
        { id: "2", code: "ar", name: "Arabic", nativeName: "العربية", isRTL: true },
        { id: "3", code: "zh", name: "Chinese", nativeName: "中文", isRTL: false },
        { id: "4", code: "ru", name: "Russian", nativeName: "Русский", isRTL: false },
        { id: "5", code: "de", name: "German", nativeName: "Deutsch", isRTL: false },
        { id: "6", code: "fr", name: "French", nativeName: "Français", isRTL: false },
        { id: "7", code: "hi", name: "Hindi", nativeName: "हिन्दी", isRTL: false },
      ];

      const language = mockLanguages.find(lang => lang.id === id);
      if (!language) {
        return NextResponse.json({ error: "Language not found" }, { status: 404 });
      }

      return NextResponse.json(language);
    }

    const language = await db.language.findUnique({
      where: { id },
    });

    if (!language) {
      return NextResponse.json({ error: "Language not found" }, { status: 404 });
    }

    return NextResponse.json(language);
  } catch (error) {
    console.error("Error fetching language:", error);
    return NextResponse.json({ error: "Failed to fetch language" }, { status: 500 });
  }
}
