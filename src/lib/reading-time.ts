/**
 * Calculate estimated reading time for text content
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 0;
  
  // Remove HTML tags and get plain text
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // Count words (split by whitespace and filter empty strings)
  const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
  
  // Average reading speed is 200-250 words per minute
  // Using 225 as a middle ground
  const wordsPerMinute = 225;
  
  // Calculate reading time in minutes, minimum 1 minute
  const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  
  return readingTime;
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
  if (minutes === 1) {
    return '1 min read';
  }
  return `${minutes} min read`;
}
