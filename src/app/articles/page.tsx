"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/scroll-reveal";
import { FocusMode } from "@/components/focus-mode";
import { useNavbar } from "@/components/navbar-provider";
import { useWebsiteArticles, WebsiteArticle } from "@/contexts/website-articles-context";
import { formatDate } from "@/lib/date";
import { Search, Calendar, User, Tag, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { detectLangFromPath, t } from "@/lib/i18n";

export default function ArticlesPage() {
  const { isFocusMode, toggleFocusMode } = useNavbar();
  const { articles, loading, refreshArticles } = useWebsiteArticles();
  const pathname = usePathname();
  const currentLang = detectLangFromPath(pathname);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch articles from API
  useEffect(() => {
    refreshArticles();
  }, [refreshArticles]);

  // Get unique tags for filtering
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    articles.forEach((article) => {
      article.tags.forEach((tag) => {
        if (tag.tag?.name) {
          tagSet.add(tag.tag.name);
        }
      });
    });
    return Array.from(tagSet).sort();
  }, [articles]);

  // Filter and sort articles
  const filteredArticles = useMemo((): WebsiteArticle[] => {
    const filtered = articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTag =
        selectedTag === "all" || article.tags.some((tag) => tag.tag?.name === selectedTag);

      // Placeholder: when API provides locale-filtered lists, this will be inherent
      const matchesLang = true;

      return matchesSearch && matchesTag && matchesLang;
    });

    // Sort articles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case "oldest":
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [articles, searchTerm, selectedTag, sortBy]);

  if (loading) {
    return (
      <FocusMode isActive={isFocusMode} onToggle={toggleFocusMode}>
        <div className="min-h-screen">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          </div>
        </div>
      </FocusMode>
    );
  }

  return (
    <FocusMode isActive={isFocusMode} onToggle={toggleFocusMode}>
      <div className="min-h-screen">
        {/* Header */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <ScrollReveal delay={0}>
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-glow-primary mb-6">
                {t(currentLang, "oceanArticles")}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                {t(currentLang, "oceanSubhead")}
              </p>
            </ScrollReveal>

            {/* Search and Filters */}
            <ScrollReveal delay={200}>
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t(currentLang, "searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant={selectedTag === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTag("all")}
                  >
                    {t(currentLang, "all")}
                  </Button>
                  {allTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>

                <div className="flex justify-center">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="newest">{t(currentLang, "newestFirst")}</option>
                    <option value="oldest">{t(currentLang, "oldestFirst")}</option>
                    <option value="title">{t(currentLang, "titleAZ")}</option>
                  </select>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            {filteredArticles.length === 0 ? (
              <ScrollReveal delay={400}>
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground">
                      {searchTerm || selectedTag !== "all"
                        ? t(currentLang, "noResults")
                        : t(currentLang, "noArticles")}
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((article, index) => (
                  <ScrollReveal key={article.id} delay={400 + index * 100}>
                    <Card className="glass-card hover:border-primary/50 transition-all duration-300 group">
                      <CardHeader className="p-0">
                        {article.coverUrl ? (
                          <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                            <img
                              src={article.coverUrl}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg flex items-center justify-center">
                            <div className="text-4xl opacity-50">🌊</div>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{article.type}</Badge>
                          </div>

                          <CardTitle className="text-xl font-heading text-glow-primary group-hover:text-primary transition-colors">
                            {article.title}
                          </CardTitle>

                          <CardDescription className="line-clamp-3">
                            {article.excerpt}
                          </CardDescription>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {article.author?.name || 'Author'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(article.publishedAt)}
                            </div>
                            {typeof (article as any).readTime === "number" && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {(article as any).readTime} min read
                              </div>
                            )}
                          </div>

                          {article.tags.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-muted-foreground" />
                              <div className="flex flex-wrap gap-1">
                                {article.tags.slice(0, 3).map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="secondary" className="text-xs">
                                    {tag.tag?.name || 'Unknown Tag'}
                                  </Badge>
                                ))}
                                {article.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{article.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          <Link href={`/articles/${article.slug}`}>
                            <Button className="w-full ripple-effect">
                              Read More
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </FocusMode>
  );
}
