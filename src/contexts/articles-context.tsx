"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content?: string;
  coverUrl: string | null;
  type: "VARIOUS" | "CLUSTER" | "SERIES";
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt?: string;
  author: {
    name: string;
  };
  tags: Array<{
    tag: {
      name: string;
    };
  }>;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  readTime?: number;
}

interface ArticlesContextType {
  articles: Article[];
  setArticles: (articles: Article[]) => void;
  addArticle: (article: Article) => void;
  updateArticle: (id: string, article: Partial<Article>) => void;
  removeArticle: (id: string) => void;
  refreshArticles: () => Promise<void>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const ArticlesContext = createContext<ArticlesContextType | undefined>(undefined);

export function ArticlesProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  const addArticle = useCallback((article: Article) => {
    setArticles((prev) => [article, ...prev]);
  }, []);

  const updateArticle = useCallback((id: string, updatedArticle: Partial<Article>) => {
    setArticles((prev) =>
      prev.map((article) => (article.id === id ? { ...article, ...updatedArticle } : article)),
    );
  }, []);

  const removeArticle = useCallback((id: string) => {
    setArticles((prev) => prev.filter((article) => article.id !== id));
  }, []);

  const refreshArticles = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching admin articles from API...");
      // Use admin-specific parameters to get all articles (drafts + published)
      const response = await fetch("/api/articles?admin=true&limit=100");
      console.log("Admin response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch articles: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Fetched admin articles:", data.articles?.length || 0);
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Error fetching admin articles:", error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ArticlesContext.Provider
      value={{
        articles,
        setArticles,
        addArticle,
        updateArticle,
        removeArticle,
        refreshArticles,
        loading,
        setLoading,
      }}
    >
      {children}
    </ArticlesContext.Provider>
  );
}

export function useArticles() {
  const context = useContext(ArticlesContext);
  if (context === undefined) {
    throw new Error("useArticles must be used within an ArticlesProvider");
  }
  return context;
}
