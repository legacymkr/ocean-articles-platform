"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { extractLanguageFromPath } from "@/lib/language";
import { getTextDirection } from "@/lib/rtl";

export function HtmlLangHandler() {
  const pathname = usePathname();

  useEffect(() => {
    const { languageCode } = extractLanguageFromPath(pathname);
    const direction = getTextDirection(languageCode);

    // Update document attributes
    document.documentElement.setAttribute("lang", languageCode);
    document.documentElement.setAttribute("dir", direction);
  }, [pathname]);

  return null;
}
