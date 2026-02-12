"use client";

import { useEffect, useState } from "react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Tag } from "lucide-react";
import { formatDateForLanguage } from "@/lib/language";
import Link from "next/link";

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl?: string;
  publishedAt: string;
  author: {
    name: string;
  };
  tags: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
  translation?: {
    title: string;
    slug: string;
    excerpt: string;
  };
}

interface RelatedArticlesProps {
  currentArticleId: string;
  currentArticleTags: Array<{ id: string; name: string; color?: string }>;
  language: string;
}

export function RelatedArticles({ currentArticleId, currentArticleTags, language }: RelatedArticlesProps) {
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        setIsLoading(true);
        
        // Get all articles in the current language
        const response = await fetch(`/api/articles?lang=${language}&status=published&limit=20`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }

        const data = await response.json();
        const allArticles = data.articles || [];
        
        // Filter out the current article
        const otherArticles = allArticles.filter((article: RelatedArticle) => article.id !== currentArticleId);
        
        // Find articles with matching tags
        const currentTagNames = currentArticleTags.map(tag => tag?.name).filter(Boolean);
        const articlesWithMatchingTags = otherArticles.filter((article: RelatedArticle) => {
          const articleTagNames = article.tags?.map(tag => tag?.name).filter(Boolean) || [];
          return articleTagNames.some(tagName => currentTagNames.includes(tagName));
        });
        
        // Sort by number of matching tags (descending) and then by published date
        const sortedArticles = articlesWithMatchingTags.sort((a: RelatedArticle, b: RelatedArticle) => {
          const aMatchingTags = a.tags?.filter(tag => tag?.name && currentTagNames.includes(tag.name)).length || 0;
          const bMatchingTags = b.tags?.filter(tag => tag?.name && currentTagNames.includes(tag.name)).length || 0;
          
          if (aMatchingTags !== bMatchingTags) {
            return bMatchingTags - aMatchingTags; // More matching tags first
          }
          
          // If same number of matching tags, sort by date
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        });
        
        // Take the top 3 articles
        setRelatedArticles(sortedArticles.slice(0, 3));
      } catch (error) {
        console.error("Error fetching related articles:", error);
        setRelatedArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentArticleTags.length > 0) {
      fetchRelatedArticles();
    } else {
      setIsLoading(false);
    }
  }, [currentArticleId, currentArticleTags, language]);

  if (isLoading) {
    return (
      <ScrollReveal delay={400}>
        <div className="mt-16 p-6 bg-card/30 backdrop-blur-sm rounded-lg border border-border/50">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded mb-4 w-48"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>
    );
  }

  if (relatedArticles.length === 0) {
    return null; // Don't show the section if no related articles
  }

  return (
    <ScrollReveal delay={400}>
      <div className="mt-16 p-6 bg-card/30 backdrop-blur-sm rounded-lg border border-border/50">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Related Articles
        </h3>
        <div className="space-y-4">
          {relatedArticles.map((article) => {
            const displayTitle = article.translation?.title || article.title;
            const displayExcerpt = article.translation?.excerpt || article.excerpt;
            const displaySlug = article.translation?.slug || article.slug;
            
            return (
              <Link
                key={article.id}
                href={`/${language}/articles/${displaySlug}`}
                className="block group"
              >
                <div className="p-4 rounded-lg bg-background/30 hover:bg-background/50 border border-border/30 hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    {/* Cover Image */}
                    {article.coverUrl && (
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                        <img
                          src={article.coverUrl}
                          alt={displayTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {displayTitle}
                      </h4>
                      
                      {displayExcerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {displayExcerpt}
                        </p>
                      )}
                      
                      {/* Meta info */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {article.author?.name || 'Unknown Author'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateForLanguage(new Date(article.publishedAt), language)}
                        </div>
                      </div>
                      
                      {/* Matching tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {article.tags
                          .filter(tag => currentArticleTags.some(currentTag => currentTag.name === tag.name))
                          .slice(0, 2)
                          .map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </ScrollReveal>
  );
}
