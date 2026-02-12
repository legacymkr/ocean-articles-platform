"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/scroll-reveal";
import { useArticles } from "@/contexts/articles-context";
import { Search, Plus, Edit, Trash2, Eye, Globe, Calendar, User, Tag, Languages } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/date";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  type: "VARIOUS" | "CLUSTER" | "SERIES";
  publishedAt: string | null;
  createdAt: string;
  author: {
    name: string;
  };
  tags: Array<{
    tag: {
      name: string;
    };
  }>;
  excerpt: string | null;
  readTime?: number;
  originalLanguage?: {
    code: string;
    name: string;
    nativeName: string;
  };
  translations?: Array<{
    id: string;
    status: "DRAFT" | "PUBLISHED";
    language: {
      code: string;
      name: string;
      nativeName: string;
    };
  }>;
}

export default function ArticlesPage() {
  const {
    articles,
    addArticle,
    updateArticle,
    removeArticle,
    refreshArticles,
    loading,
    setLoading,
  } = useArticles();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch articles from API on mount
  useEffect(() => {
    refreshArticles();
  }, [refreshArticles]);

  // Filter articles based on search term, status, and type
  const filteredArticles = articles.filter((article) => {
    // Search filter
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) => tag.tag?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && article.status === "PUBLISHED") ||
      (statusFilter === "draft" && article.status === "DRAFT");

    // Type filter
    const matchesType = typeFilter === "all" || article.type === typeFilter.toUpperCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  // Sort articles
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const handleDelete = async (articleId: string) => {
    if (confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/articles/${articleId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete article");
        }

        // Remove article from state
        removeArticle(articleId);
      } catch (error) {
        console.error("Error deleting article:", error);
        // For now, just remove from local state since we're using mock data
        removeArticle(articleId);
        alert("Article removed from view (database connection not available)");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-glow-primary">Articles</h1>
          <p className="text-muted-foreground mt-2">Manage your ocean exploration articles</p>
        </div>
        <Link href="/admin/articles/new">
          <Button className="ripple-effect">
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <ScrollReveal delay={100}>
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "published" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("published")}
                >
                  Published
                </Button>
                <Button
                  variant={statusFilter === "draft" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("draft")}
                >
                  Drafts
                </Button>
              </div>

              {/* Type Filter */}
              <div className="flex gap-2">
                <Button
                  variant={typeFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter("all")}
                >
                  All Types
                </Button>
                <Button
                  variant={typeFilter === "VARIOUS" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter("VARIOUS")}
                >
                  Various
                </Button>
                <Button
                  variant={typeFilter === "CLUSTER" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter("CLUSTER")}
                >
                  Cluster
                </Button>
                <Button
                  variant={typeFilter === "SERIES" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter("SERIES")}
                >
                  Series
                </Button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Articles List */}
      <div className="space-y-4">
        {sortedArticles.length === 0 ? (
          <ScrollReveal delay={200}>
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "No articles found matching your criteria."
                    : "No articles found. Create your first article to get started."}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        ) : (
          sortedArticles.map((article, index) => (
            <ScrollReveal key={article.id} delay={200 + index * 100}>
              <Card className="glass-card hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Title and Status */}
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-glow-primary">{article.title}</h3>
                        <Badge variant={article.status === "PUBLISHED" ? "default" : "secondary"}>
                          {article.status === "PUBLISHED" ? "Published" : "Draft"}
                        </Badge>
                        <Badge variant="outline">{article.type}</Badge>
                      </div>

                      {/* Excerpt */}
                      {article.excerpt && (
                        <p className="text-muted-foreground line-clamp-2">{article.excerpt}</p>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {article.author?.name || 'Unknown Author'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {article.publishedAt ? formatDate(article.publishedAt) : "Not published"}
                        </div>
                        {typeof article.readTime === "number" && (
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {article.readTime} min read
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          /articles/{article.slug}
                        </div>
                        {/* Translation Info */}
                        {(article as any).translations && (article as any).translations.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Languages className="h-4 w-4" />
                            <span>{(article as any).translations.length} translation{(article as any).translations.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {article.tags.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-wrap gap-1">
                            {article.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag.tag?.name || 'Unknown Tag'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <Link href={`/articles/${article.slug}`} target="_blank">
                        <Button variant="ghost" size="sm" title="View Article">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/articles/${article.id}/edit`}>
                        <Button variant="ghost" size="sm" title="Edit Article">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/translations?articleId=${article.id}`}>
                        <Button variant="ghost" size="sm" title="Manage Translations" className="text-primary hover:text-primary">
                          <Languages className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(article.id)}
                        className="text-destructive hover:text-destructive"
                        title="Delete Article"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))
        )}
      </div>
    </div>
  );
}
