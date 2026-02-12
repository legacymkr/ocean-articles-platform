"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Save,
  Eye,
  Languages,
  ArrowLeftRight,
  CheckCircle,
  AlertCircle,
  Globe,
} from "lucide-react";
import { getTextDirection } from "@/lib/rtl";

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  originalLanguage: Language;
}

interface Translation {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  status: "DRAFT" | "PUBLISHED";
  language: Language;
}

interface TranslationEditorProps {
  article: Article;
  translation?: Translation;
  onSave: (translation: Partial<Translation>) => Promise<void>;
  onPreview: (translation: Partial<Translation>) => void;
}

export function TranslationEditor({
  article,
  translation,
  onSave,
  onPreview,
}: TranslationEditorProps) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>(
    translation?.language.id || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: translation?.title || "",
    slug: translation?.slug || "",
    excerpt: translation?.excerpt || "",
    content: translation?.content || "",
    metaTitle: translation?.metaTitle || "",
    metaDescription: translation?.metaDescription || "",
    keywords: translation?.keywords || "",
    status: translation?.status || "DRAFT" as const,
  });

  const selectedLanguage = languages.find(lang => lang.id === selectedLanguageId);
  const textDirection = selectedLanguage ? getTextDirection(selectedLanguage.code) : "ltr";

  // Load languages
  useEffect(() => {
    fetch("/api/languages")
      .then(res => res.json())
      .then(data => {
        const availableLanguages = data.languages.filter(
          (lang: Language) => lang.code !== article.originalLanguage.code
        );
        setLanguages(availableLanguages);
        
        // Auto-select first language if none selected
        if (!selectedLanguageId && availableLanguages.length > 0) {
          setSelectedLanguageId(availableLanguages[0].id);
        }
      })
      .catch(console.error);
  }, [article.originalLanguage.code, selectedLanguageId]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !translation?.slug) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      
      setFormData(prev => ({
        ...prev,
        slug: generatedSlug,
      }));
    }
  }, [formData.title, translation?.slug]);

  const handleSave = async (status: "DRAFT" | "PUBLISHED" = "DRAFT") => {
    if (!selectedLanguage) return;

    setIsSaving(true);
    try {
      const translationData = {
        ...formData,
        status,
        languageId: selectedLanguageId,
      };

      await onSave(translationData);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Failed to save translation:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (!selectedLanguage) return;

    onPreview({
      ...formData,
      language: selectedLanguage,
    });
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const completionPercentage = React.useMemo(() => {
    const fields = [formData.title, formData.excerpt, formData.content];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [formData]);

  if (!selectedLanguage) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Languages className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Select a language to start translating</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Translation Editor
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{article?.originalLanguage?.nativeName || article?.originalLanguage?.name || 'Original'}</Badge>
                <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">{selectedLanguage?.nativeName || selectedLanguage?.name || 'Target'}</Badge>
                {selectedLanguage?.isRTL && (
                  <Badge variant="secondary" className="text-xs">RTL</Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {completionPercentage}%
                </span>
              </div>

              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-48">
                    <Globe className="mr-2 h-4 w-4" />
                    {selectedLanguage?.nativeName || selectedLanguage?.name || "Select Language"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.id}
                      onClick={() => setSelectedLanguageId(lang.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>{lang?.nativeName || lang?.name || lang?.code}</span>
                        <span className="text-muted-foreground">({lang?.name || lang?.code})</span>
                        {lang?.isRTL && <Badge variant="outline" className="text-xs">RTL</Badge>}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Side-by-side Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
              Original ({article?.originalLanguage?.nativeName || article?.originalLanguage?.name || 'Original'})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[600px] overflow-y-auto pr-4">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Title
                  </label>
                  <div className="p-3 bg-muted/30 rounded-md text-sm">
                    {article.title}
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Excerpt
                  </label>
                  <div className="p-3 bg-muted/30 rounded-md text-sm min-h-[80px]">
                    {article.excerpt || <span className="text-muted-foreground italic">No excerpt</span>}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Content
                  </label>
                  <div className="p-3 bg-muted/30 rounded-md text-sm min-h-[300px] prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Translation Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
              Translation ({selectedLanguage?.nativeName || selectedLanguage?.name || 'Target'})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[600px] overflow-y-auto pr-4">
              <div className="space-y-6" dir={textDirection}>
                {/* Title */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder={`Translate: ${article.title}`}
                    dir={textDirection}
                    className={selectedLanguage?.isRTL ? "text-right" : ""}
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    URL Slug
                  </label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => updateField("slug", e.target.value)}
                    placeholder="url-friendly-slug"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Excerpt
                  </label>
                  <Textarea
                    value={formData.excerpt}
                    onChange={(e) => updateField("excerpt", e.target.value)}
                    placeholder={`Translate: ${article.excerpt || "Add an excerpt..."}`}
                    rows={4}
                    dir={textDirection}
                    className={selectedLanguage?.isRTL ? "text-right" : ""}
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Content *
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => updateField("content", e.target.value)}
                    placeholder="Translate the article content..."
                    rows={15}
                    dir={textDirection}
                    className={`font-mono text-sm ${selectedLanguage?.isRTL ? "text-right" : ""}`}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    HTML formatting is supported
                  </p>
                </div>

                <div className="border-t border-border/50 my-6"></div>

                {/* SEO Fields */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">SEO Meta Data</h4>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Meta Title
                    </label>
                    <Input
                      value={formData.metaTitle}
                      onChange={(e) => updateField("metaTitle", e.target.value)}
                      placeholder="SEO title"
                      dir={textDirection}
                      className={selectedLanguage?.isRTL ? "text-right" : ""}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Meta Description
                    </label>
                    <Textarea
                      value={formData.metaDescription}
                      onChange={(e) => updateField("metaDescription", e.target.value)}
                      placeholder="SEO description"
                      rows={3}
                      dir={textDirection}
                      className={selectedLanguage?.isRTL ? "text-right" : ""}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Keywords
                    </label>
                    <Input
                      value={formData.keywords}
                      onChange={(e) => updateField("keywords", e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                      dir={textDirection}
                      className={selectedLanguage?.isRTL ? "text-right" : ""}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {lastSaved && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
              
              {completionPercentage < 100 && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Translation incomplete</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={!formData.title || !formData.content}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleSave("DRAFT")}
                disabled={isSaving || !formData.title}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              
              <Button
                onClick={() => handleSave("PUBLISHED")}
                disabled={isSaving || completionPercentage < 100}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Publish Translation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
