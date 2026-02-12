"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { htmlToText } from "@/lib/utils/html-to-text";

interface ArticleContentProps {
  content: string;
  language?: string;
  textDirection?: "ltr" | "rtl";
  className?: string;
}

export function ArticleContent({
  content,
  language = "en",
  textDirection = "ltr",
  className,
}: ArticleContentProps) {
  // Parse the HTML content and apply language-specific styles
  const processedContent = React.useMemo(() => {
    // Basic HTML sanitization and processing
    // In a production app, you'd want to use a proper HTML sanitizer like DOMPurify
    return content;
  }, [content]);

  const containerClasses = cn(
    "article-content",
    // Base typography
    "prose prose-lg max-w-none",
    // Dark theme
    "prose-invert",
    // Language-specific styling
    {
      "prose-rtl": textDirection === "rtl",
      "prose-arabic": language === "ar",
      "prose-chinese": language === "zh",
      "prose-russian": language === "ru",
      "prose-german": language === "de",
      "prose-french": language === "fr",
      "prose-hindi": language === "hi",
    },
    // Ocean theme styling
    "prose-headings:text-glow-primary",
    "prose-a:text-primary prose-a:hover:text-primary/80",
    "prose-blockquote:border-l-primary prose-blockquote:bg-card/30",
    "prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded",
    "prose-pre:bg-card/50 prose-pre:border prose-pre:border-border/50",
    // RTL-specific adjustments
    textDirection === "rtl" && [
      "prose-blockquote:border-l-0 prose-blockquote:border-r-primary",
      "prose-ul:mr-6 prose-ul:ml-0",
      "prose-ol:mr-6 prose-ol:ml-0",
    ],
    className
  );

  return (
    <div 
      className={containerClasses}
      dir={textDirection}
      lang={language}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
