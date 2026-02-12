"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, ChevronDown } from "lucide-react";
import { extractLanguageFromPath, setUserLanguage } from "@/lib/language";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Extract current language from URL
  const { languageCode: currentLang } = extractLanguageFromPath(pathname);

  useEffect(() => {
    fetch("/api/languages")
      .then((r) => r.json())
      .then((data) => {
        setLanguages(data.languages || []);
        setIsLoading(false);
      })
      .catch(() => {
        setLanguages([]);
        setIsLoading(false);
      });
  }, []);

  const switchLanguage = async (code: string) => {
    if (code === currentLang) return;

    // Update localStorage and document attributes
    setUserLanguage(code);

    // Construct new URL with language prefix
    const { pathWithoutLanguage } = extractLanguageFromPath(pathname);
    
    // Check if we're on an article page
    const articleMatch = pathWithoutLanguage.match(/^\/articles\/(.+)$/);
    
    if (articleMatch) {
      const articleSlug = articleMatch[1];
      
      try {
        // Check if the article has a translation in the target language
        const response = await fetch(`/api/articles/by-slug/${articleSlug}?lang=${code}`);
        
        if (response.ok) {
          const data = await response.json();
          
          // If translation exists and is published, redirect to translated article
          if (data.translation && data.translation.status === 'PUBLISHED') {
            const newPath = code === "en" 
              ? `/articles/${data.translation.slug}` 
              : `/${code}/articles/${data.translation.slug}`;
            router.push(newPath);
            return;
          }
        }
      } catch (error) {
        console.error('Error checking article translation:', error);
      }
      
      // If no translation exists or error occurred, redirect to articles page
      const articlesPath = code === "en" ? "/articles" : `/${code}/articles`;
      router.push(articlesPath);
      return;
    }

    // For non-article pages, use normal language switching
    let newPath: string;
    if (code === "en") {
      // English is default, no prefix needed
      newPath = pathWithoutLanguage === "/" ? "/" : pathWithoutLanguage;
    } else {
      // Add language prefix
      newPath = `/${code}${pathWithoutLanguage}`;
    }

    // Navigate to new URL
    router.push(newPath);
  };

  const currentLanguage = languages.find((lang) => lang.code === currentLang);

  if (isLoading || languages.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Globe className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="min-w-[100px]">
          <Globe className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLanguage?.nativeName || currentLanguage?.name || "English"}
          </span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            className={`cursor-pointer ${
              lang.code === currentLang ? "bg-accent" : ""
            } ${lang?.isRTL ? "text-right" : ""}`}
            dir={lang?.isRTL ? "rtl" : "ltr"}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">{lang?.nativeName || lang?.name || lang?.code}</span>
              <span className="text-sm text-muted-foreground ml-2">
                {lang?.name || lang?.code}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


