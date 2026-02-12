"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArticleCard } from "@/components/article-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Globe } from "lucide-react";
import { getTextDirection } from "@/lib/rtl";
import { formatDateForLanguage } from "@/lib/language";
import { t } from "@/lib/i18n";

interface ArticleWithTranslation {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
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
    content?: string;
  };
}

// Removed article types - now using tags for filtering

export default function LocalizedArticlesPage() {
  const params = useParams();
  const lang = params.lang as string;
  
  const [articles, setArticles] = useState<ArticleWithTranslation[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticleWithTranslation[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("ALL");
  const [error, setError] = useState<string | null>(null);

  const textDirection = getTextDirection(lang);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch articles and tags in parallel
        const [articlesResponse, tagsResponse] = await Promise.all([
          fetch(`/api/articles?lang=${lang}&status=published`),
          fetch(`/api/tags/translate?lang=${lang}`)
        ]);
        
        if (!articlesResponse.ok) {
          throw new Error("Failed to fetch articles");
        }

        const articlesData = await articlesResponse.json();
        setArticles(articlesData.articles || []);
        setFilteredArticles(articlesData.articles || []);

        // Tags are optional - don't fail if they don't load
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          setAvailableTags(tagsData.tags || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load articles");
      } finally {
        setIsLoading(false);
      }
    };

    if (lang) {
      fetchData();
    }
  }, [lang]);

  // Filter articles based on search and tag
  useEffect(() => {
    let filtered = articles;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((article) => {
        const title = article.translation?.title || article.title;
        const excerpt = article.translation?.excerpt || article.excerpt;
        return (
          title.toLowerCase().includes(query) ||
          excerpt.toLowerCase().includes(query) ||
          article.tags.some(tag => tag.name.toLowerCase().includes(query))
        );
      });
    }

    // Tag filter
    if (selectedTag !== "ALL") {
      // Find the original tag name from the translated tag
      const selectedTagData = availableTags.find(tag => tag.name === selectedTag);
      const originalTagName = selectedTagData?.originalName || selectedTag;
      
      filtered = filtered.filter(article => 
        article.tags.some(tag => tag.name === originalTagName || tag.name === selectedTag)
      );
    }

    setFilteredArticles(filtered);
  }, [articles, searchQuery, selectedTag]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4" dir={textDirection}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24" dir={textDirection}>
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <ScrollReveal>
          <header className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Globe className="h-6 w-6 text-primary" />
              <Badge variant="outline" className="text-sm">
                {lang.toUpperCase()}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading text-glow-primary mb-6">
              {t(lang as any, "oceanArticles")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t(lang as any, "oceanSubhead")}
            </p>
          </header>
        </ScrollReveal>

        {/* Search and Filter */}
        <ScrollReveal delay={200}>
          <div className="mb-12 bg-card/30 backdrop-blur-sm rounded-lg border border-border/50 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t(lang as any, "searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tag Filter */}
              <div className="flex gap-2">
                <Filter className="h-5 w-5 text-muted-foreground mt-2" />
                <div className="flex flex-wrap gap-2">
                  <Button
                    key="ALL"
                    variant={selectedTag === "ALL" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTag("ALL")}
                  >
                    {t(lang as any, "all")}
                  </Button>
                  {availableTags.map((tag: any) => (
                    <Button
                      key={tag.id}
                      variant={selectedTag === tag.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag(tag.name)}
                    >
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-muted-foreground">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </ScrollReveal>

        {/* Error state */}
        {error && (
          <ScrollReveal delay={300}>
            <div className="text-center py-16">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </ScrollReveal>
        )}

        {/* No articles found */}
        {!error && !isLoading && filteredArticles.length === 0 && (
          <ScrollReveal delay={300}>
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedTag !== "ALL"
                  ? "Try adjusting your search or filter criteria."
                  : "There are no published articles available in this language yet."}
              </p>
              {(searchQuery || selectedTag !== "ALL") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTag("ALL");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Articles Grid */}
        {!error && !isLoading && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => (
              <ScrollReveal key={article.id} delay={400 + index * 100}>
                <ArticleCard
                  title={article.translation?.title || article.title}
                  excerpt={article.translation?.excerpt || article.excerpt}
                  content={article.translation?.content || article.content}
                  coverUrl={article.coverUrl}
                  slug={article.translation?.slug || article.slug}
                  publishedAt={formatDateForLanguage(new Date(article.publishedAt), lang)}
                  tags={article.tags}
                  href={`/${lang}/articles/${article.translation?.slug || article.slug}`}
                  isTranslated={!!article.translation}
                />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
