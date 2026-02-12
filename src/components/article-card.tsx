"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { calculateReadingTime, formatReadingTime } from "@/lib/reading-time";
import { Clock } from "lucide-react";

interface ArticleCardProps {
  title: string;
  excerpt?: string;
  content?: string;
  coverUrl?: string;
  slug: string;
  publishedAt: string;
  tags: Array<{ id: string; name: string; color?: string }>;
  href: string;
  isTranslated?: boolean;
  className?: string;
}

export function ArticleCard({
  title,
  excerpt,
  content,
  coverUrl,
  slug,
  publishedAt,
  tags,
  href,
  isTranslated = false,
  className,
}: ArticleCardProps) {
  const readingTime = calculateReadingTime(content || excerpt || '');
  return (
    <Link href={href} className="block">
      <article
        className={cn(
          "group relative bg-card/30 backdrop-blur-sm rounded-lg border border-border/50",
          "hover:border-primary/50 transition-all duration-300 ease-in-out",
          "hover:scale-105 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1",
          "motion-safe:hover:scale-105 motion-safe:hover:-translate-y-1",
          "overflow-hidden card-interactive cursor-pointer",
          className
        )}
      >
      {/* Translation indicator */}
      {isTranslated && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full border border-primary/30">
            Translated
          </div>
        </div>
      )}

      {/* Cover Image */}
      {coverUrl && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Meta Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatReadingTime(readingTime)}</span>
          </div>
          <span className="text-xs text-muted-foreground">{publishedAt}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-heading text-glow-primary mb-3 line-clamp-2 hover:brightness-125 transition-all duration-300">
          {title}
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
        )}

        {/* Tags */}
        {tags && Array.isArray(tags) && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {tags.slice(0, 3).map((tag, idx) => {
              // Ensure tag is an object with required properties
              if (!tag || typeof tag !== 'object' || !tag.name) {
                return null;
              }
              
              return (
                <Badge
                  key={tag.id || `tag-${idx}`}
                  variant="secondary"
                  className="text-xs px-2 py-1 rounded-full"
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
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-1 rounded-full">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 rounded-lg ring-2 ring-transparent group-hover:ring-primary/30 transition-all duration-300 pointer-events-none" />
    </article>
    </Link>
  );
}
