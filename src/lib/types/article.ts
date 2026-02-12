import { ArticleStatus } from "@prisma/client";

export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface Article {
  id: string;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  content: string | null;
  coverUrl: string | null;
  status: ArticleStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  authorId: string;
  author: User;
  originalLanguageId: string;
  originalLanguage: Language;
  tags: Tag[];
}

export interface ArticleTranslation {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: ArticleStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  articleId: string;
  languageId: string;
  language: Language;
  translatorId: string | null;
  translator: User | null;
}

export interface ArticleWithTranslations extends Article {
  translations: ArticleTranslation[];
}
