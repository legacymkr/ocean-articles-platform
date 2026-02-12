import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Check if database is available
    if (!prisma) {
      throw new Error("Database not available");
    }

    // Fetch languages from database
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        nativeName: true,
        isRTL: true,
        isActive: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ languages });
  } catch (error) {
    console.error("Error fetching languages:", error);
    
    // Fallback to hardcoded languages if database is not available
    const fallbackLanguages = [
      { code: "en", name: "English", nativeName: "English", isRTL: false },
      { code: "ar", name: "Arabic", nativeName: "العربية", isRTL: true },
      { code: "zh", name: "Chinese", nativeName: "中文", isRTL: false },
      { code: "ru", name: "Russian", nativeName: "Русский", isRTL: false },
      { code: "de", name: "German", nativeName: "Deutsch", isRTL: false },
      { code: "fr", name: "French", nativeName: "Français", isRTL: false },
      { code: "hi", name: "Hindi", nativeName: "हिन्दी", isRTL: false },
    ];

    return NextResponse.json({ languages: fallbackLanguages });
  }
}


