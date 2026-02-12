"use client";

import { useState } from "react";
import { Article } from "@/lib/types/article";
import { ArticleContent } from "@/components/article-content";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { Calendar, Globe } from "lucide-react";
import { formatDateForLanguage } from "@/lib/language";
import { getTextDirection } from "@/lib/rtl";
import { RelatedArticles } from "@/components/related-articles";

interface ArticleTranslation {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  language: {
    code: string;
    name: string;
    nativeName: string;
    isRTL: boolean;
  };
}

interface ArticleWithTranslations extends Article {
  translations: ArticleTranslation[];
}

interface ArticlePageClientProps {
  initialData: {
    article: any;
    translation: any;
  };
  lang: string;
  slug: string;
}

export function ArticlePageClient({ initialData, lang, slug }: ArticlePageClientProps) {
  const { article, translation } = initialData;

  // Use translation if available, otherwise fall back to original
  const displayContent = translation || {
    title: article.title || "Untitled",
    excerpt: article.excerpt || "",
    content: article.content || "",
    publishedAt: article.publishedAt || new Date().toISOString(),
    language: { code: "en", name: "English", nativeName: "English", isRTL: false }
  };

  const textDirection = getTextDirection(lang);
  const publishedDate = displayContent.publishedAt ? new Date(displayContent.publishedAt) : new Date();

  return (
    <div className="min-h-screen pt-24" dir={textDirection}>
      <article className="max-w-4xl mx-auto px-4 pb-16">
        <ScrollReveal>
          <header className="mb-12">
            {/* Language indicator */}
            {translation && translation.language && (
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {translation.language?.nativeName || translation.language?.name || 'Unknown Language'}
                </span>
                {translation.language?.isRTL && (
                  <Badge variant="outline" className="text-xs">
                    RTL
                  </Badge>
                )}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-heading text-glow-primary mb-6">
              {displayContent.title}
            </h1>

            {/* Excerpt */}
            {displayContent.excerpt && (
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {displayContent.excerpt}
              </p>
            )}

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDateForLanguage(publishedDate, lang)}</span>
              </div>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {article.tags.map((tagItem: any, index: number) => {
                  // Handle the nested tag structure from Prisma
                  const tag = tagItem.tag || tagItem;
                  if (!tag || !tag.name) {
                    return null;
                  }

                  return (
                    <Badge
                      key={tag.id || `tag-${index}`}
                      variant="outline"
                      style={tag.color ? {
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        borderColor: `${tag.color}40`
                      } : {}}
                    >
                      {tag.name}
                    </Badge>
                  );
                }).filter(Boolean)}
              </div>
            )}

          </header>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="prose prose-lg max-w-none prose-invert">
            <ArticleContent
              content={displayContent.content || ""}
              language={lang}
              textDirection={textDirection}
            />
          </div>
        </ScrollReveal>

        {/* Related Articles */}
        <RelatedArticles
          currentArticleId={article.id}
          currentArticleTags={article.tags?.map((tag: any) => ({
            id: tag?.id || '',
            name: tag?.name || 'Tag',
            color: tag?.color || undefined
          })).filter((tag: any) => tag.id) || []}
          language={lang}
        />
      </article>
    </div>
  );
}