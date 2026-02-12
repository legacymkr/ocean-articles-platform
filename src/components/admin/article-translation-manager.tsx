"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Languages,
  Plus,
  Edit,
  Globe,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
} from "lucide-react";

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

interface Translation {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  language: Language;
  createdAt: string;
  updatedAt: string;
  translator?: {
    id: string;
    name: string;
    email: string;
  };
}

interface ArticleTranslationManagerProps {
  articleId: string;
  articleTitle: string;
  originalLanguage: Language;
  onCreateTranslation: (articleId: string, languageId: string) => void;
  onEditTranslation: (translationId: string) => void;
  onDeleteTranslation?: (translationId: string) => void;
}

export function ArticleTranslationManager({
  articleId,
  articleTitle,
  originalLanguage,
  onCreateTranslation,
  onEditTranslation,
  onDeleteTranslation,
}: ArticleTranslationManagerProps) {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch translations data
  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/articles/${articleId}/translations`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch translations");
        }

        const data = await response.json();
        setTranslations(data.translations || []);
        setAvailableLanguages(data.availableLanguages || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load translations");
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [articleId]);

  const handleDeleteTranslation = async (translationId: string, translationTitle: string) => {
    if (!confirm(`Are you sure you want to delete the translation "${translationTitle}"?\n\nThis action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/translations/${translationId}`, {
        method: 'DELETE',
        headers: { 'x-role': 'admin' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete translation');
      }
      
      // Remove from local state
      setTranslations(prev => prev.filter(t => t.id !== translationId));
      
      // Call parent callback if provided
      if (onDeleteTranslation) {
        onDeleteTranslation(translationId);
      }
    } catch (error) {
      console.error('Error deleting translation:', error);
      alert('Failed to delete translation. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "DRAFT":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800 border-green-200";
      case "DRAFT":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Translations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading translations...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Translations
          </CardTitle>
          
          {availableLanguages.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Translation
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {availableLanguages.map((language) => (
                  <DropdownMenuItem
                    key={language.id}
                    onClick={() => onCreateTranslation(articleId, language.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>{language?.nativeName || language?.name || language?.code}</span>
                      <span className="text-muted-foreground">({language?.name || language?.code})</span>
                      {language?.isRTL && (
                        <Badge variant="outline" className="text-xs">RTL</Badge>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Original Language */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border-2 border-primary/20">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{originalLanguage?.nativeName || originalLanguage?.name || 'Original'}</span>
                <span className="text-sm text-muted-foreground">({originalLanguage?.name || 'Original'})</span>
                <Badge variant="outline" className="text-xs">Original</Badge>
                {originalLanguage?.isRTL && (
                  <Badge variant="outline" className="text-xs">RTL</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate max-w-md">
                {articleTitle}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/30">
              Published
            </Badge>
          </div>
        </div>

        {/* Existing Translations */}
        {translations.length > 0 ? (
          <div className="space-y-3">
            {translations.map((translation) => (
              <div
                key={translation.id}
                className="flex items-center justify-between p-4 bg-card rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{translation.language?.nativeName || translation.language?.name || 'Translation'}</span>
                      <span className="text-sm text-muted-foreground">
                        ({translation.language?.name || 'Translation'})
                      </span>
                      {translation.language?.isRTL && (
                        <Badge variant="outline" className="text-xs">RTL</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate max-w-md">
                      {translation.title}
                    </p>
                    {translation.translator && (
                      <p className="text-xs text-muted-foreground">
                        By {translation.translator.name}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(translation.status)}
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusColor(translation.status)}`}
                    >
                      {translation.status}
                    </Badge>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditTranslation(translation.id)}
                    className="gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteTranslation(translation.id, translation.title)}
                    className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Languages className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No translations yet</p>
            <p className="text-sm">Add translations to make this article available in multiple languages</p>
          </div>
        )}

        {/* Summary */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50 text-sm text-muted-foreground">
          <div>
            Total: {translations.length + 1} language{translations.length !== 0 ? 's' : ''}
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              {translations.filter(t => t.status === 'PUBLISHED').length + 1} published
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" />
              {translations.filter(t => t.status === 'DRAFT').length} drafts
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
