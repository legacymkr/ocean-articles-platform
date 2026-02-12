/**
 * RTL (Right-to-Left) language support utilities
 */

// RTL language codes
export const RTL_LANGUAGES = ["ar", "he", "fa", "ur", "ku", "dv"] as const;

export type RTLLanguageCode = (typeof RTL_LANGUAGES)[number];

/**
 * Check if a language code is RTL
 */
export function isRTLLanguage(languageCode: string): boolean {
  return RTL_LANGUAGES.includes(languageCode as RTLLanguageCode);
}

/**
 * Get the text direction for a language
 */
export function getTextDirection(languageCode: string): "ltr" | "rtl" {
  return isRTLLanguage(languageCode) ? "rtl" : "ltr";
}

/**
 * Get CSS classes for RTL support
 */
export function getRTLCSSClasses(languageCode: string): string {
  const direction = getTextDirection(languageCode);
  return `dir-${direction} ${direction === "rtl" ? "rtl" : "ltr"}`;
}

/**
 * Format text for RTL display
 */
export function formatRTLText(text: string, languageCode: string): string {
  if (!isRTLLanguage(languageCode)) {
    return text;
  }

  // Add RTL-specific formatting if needed
  // This is a basic implementation - you might want to use a library like bidi-js
  return text;
}

/**
 * Get reading progress direction for RTL languages
 */
export function getReadingProgressDirection(languageCode: string): "left" | "right" {
  return isRTLLanguage(languageCode) ? "right" : "left";
}

/**
 * Get scroll direction for RTL languages
 */
export function getScrollDirection(): "horizontal" | "vertical" {
  // Most RTL languages still scroll vertically, but this can be customized
  return "vertical";
}
