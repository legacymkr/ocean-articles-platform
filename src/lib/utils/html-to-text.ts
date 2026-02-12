/**
 * Convert HTML content to plain text
 * Removes HTML tags and converts common HTML entities
 */
export function htmlToText(html: string): string {
  if (!html) return '';
  
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');
  
  // Convert common HTML entities
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '...',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
  };
  
  // Replace entities
  for (const [entity, replacement] of Object.entries(entities)) {
    text = text.replace(new RegExp(entity, 'g'), replacement);
  }
  
  // Replace multiple whitespace with single space
  text = text.replace(/\s+/g, ' ');
  
  // Trim whitespace
  text = text.trim();
  
  return text;
}

/**
 * Create excerpt from HTML content
 */
export function createExcerpt(html: string, maxLength: number = 150): string {
  const text = htmlToText(html);
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // Find the last complete word within the limit
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}
