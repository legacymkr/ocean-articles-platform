"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface WebsiteArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl: string | null;
  type: "VARIOUS" | "CLUSTER" | "SERIES";
  publishedAt: string;
  author: {
    name: string;
  };
  tags: Array<{
    tag: {
      name: string;
    };
  }>;
  readTime?: number;
}

interface WebsiteArticlesContextType {
  articles: WebsiteArticle[];
  setArticles: (articles: WebsiteArticle[]) => void;
  addArticle: (article: WebsiteArticle) => void;
  updateArticle: (id: string, article: Partial<WebsiteArticle>) => void;
  removeArticle: (id: string) => void;
  refreshArticles: () => Promise<void>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const WebsiteArticlesContext = createContext<WebsiteArticlesContextType | undefined>(undefined);

export function WebsiteArticlesProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<WebsiteArticle[]>([]);
  const [loading, setLoading] = useState(false);

  const addArticle = useCallback((article: WebsiteArticle) => {
    setArticles((prev) => [article, ...prev]);
  }, []);

  const updateArticle = useCallback((id: string, updatedArticle: Partial<WebsiteArticle>) => {
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
      console.log("Fetching articles from API...");
      
      // Get current language from URL or default to English
      const currentPath = window.location.pathname;
      const langMatch = currentPath.match(/^\/([a-z]{2})\//);
      const currentLang = langMatch ? langMatch[1] : 'en';
      
      const response = await fetch(`/api/articles?status=published&lang=${currentLang}`);
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch articles: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Fetched articles:", data.articles?.length || 0);
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <WebsiteArticlesContext.Provider
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
    </WebsiteArticlesContext.Provider>
  );
}

export function useWebsiteArticles() {
  const context = useContext(WebsiteArticlesContext);
  if (context === undefined) {
    throw new Error("useWebsiteArticles must be used within a WebsiteArticlesProvider");
  }
  return context;
}
