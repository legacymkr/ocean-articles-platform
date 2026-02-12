/**
 * Language detection and management utilities
 */

import { getTextDirection } from "./rtl";

export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
  isActive: boolean;
}

/**
 * Detect user's preferred language from browser
 */
export function detectUserLanguage(): string {
  if (typeof window === "undefined") {
    return "en"; // Default to English on server
  }

  // Check localStorage first
  const storedLanguage = localStorage.getItem("galatide-language");
  if (storedLanguage) {
    return storedLanguage;
  }

  // Fallback to browser language
  const browserLanguage = navigator.language.split("-")[0];
  return browserLanguage || "en";
}

/**
 * Set user's preferred language
 */
export function setUserLanguage(languageCode: string): void {
  if (typeof window === "undefined") return;

  localStorage.setItem("galatide-language", languageCode);

  // Update document direction
  const direction = getTextDirection(languageCode);
  document.documentElement.setAttribute("dir", direction);
  document.documentElement.setAttribute("lang", languageCode);
}

/**
 * Get language-specific URL path
 */
export function getLanguagePath(path: string, languageCode: string): string {
  if (languageCode === "en") {
    return path; // English is the default, no prefix
  }

  return `/${languageCode}${path}`;
}

/**
 * Extract language code from URL path
 */
export function extractLanguageFromPath(path: string): {
  languageCode: string;
  pathWithoutLanguage: string;
} {
  const segments = path.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { languageCode: "en", pathWithoutLanguage: "/" };
  }

  const firstSegment = segments[0];
  const supportedLanguages = ["en", "ar", "zh", "ru", "de", "fr", "hi"];

  if (supportedLanguages.includes(firstSegment)) {
    return {
      languageCode: firstSegment,
      pathWithoutLanguage: "/" + segments.slice(1).join("/"),
    };
  }

  return { languageCode: "en", pathWithoutLanguage: path };
}

/**
 * Format date according to language locale
 */
export function formatDateForLanguage(date: Date, languageCode: string): string {
  const locale = getLocaleFromLanguageCode(languageCode);

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Format number according to language locale
 */
export function formatNumberForLanguage(number: number, languageCode: string): string {
  const locale = getLocaleFromLanguageCode(languageCode);

  return new Intl.NumberFormat(locale).format(number);
}

/**
 * Get locale string from language code
 */
function getLocaleFromLanguageCode(languageCode: string): string {
  const localeMap: Record<string, string> = {
    en: "en-US",
    ar: "ar-SA",
    zh: "zh-CN",
    ru: "ru-RU",
    de: "de-DE",
    fr: "fr-FR",
    hi: "hi-IN",
  };

  return localeMap[languageCode] || "en-US";
}

/**
 * Get language display name
 */
export function getLanguageDisplayName(languageCode: string, languages: Language[]): string {
  const language = languages.find((lang) => lang.code === languageCode);
  return language?.nativeName || languageCode;
}

/**
 * Check if language is supported
 */
export function isLanguageSupported(languageCode: string, languages: Language[]): boolean {
  return languages.some((lang) => lang.code === languageCode && lang.isActive);
}
