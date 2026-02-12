/**
 * Utility functions for slug generation and validation
 */

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if needed
 */
export async function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[],
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  // Check if slug exists for this language
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validate if a slug is properly formatted
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 100;
}

/**
 * Generate SEO-friendly meta title
 */
export function generateMetaTitle(title: string, siteName: string = "Galatide"): string {
  const maxLength = 60;
  if (title.length <= maxLength) {
    return `${title} - ${siteName}`;
  }
  return `${title.substring(0, maxLength - siteName.length - 3)}... - ${siteName}`;
}

/**
 * Generate SEO-friendly meta description
 */
export function generateMetaDescription(content: string, maxLength: number = 160): string {
  // Remove HTML tags and clean up whitespace
  const cleanContent = content
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  // Find the last complete word within the limit
  const truncated = cleanContent.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + "...";
  }

  return truncated + "...";
}
