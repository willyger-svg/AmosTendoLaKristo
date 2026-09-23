/**
 * Input sanitization & security helpers to prevent XSS, script injection, and payload poisoning
 */

/**
 * Strips dangerous HTML tags, javascript: pseudo-protocols, and malicious script characters
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/onerror\s*=/gi, '')
    .replace(/onload\s*=/gi, '')
    .replace(/onclick\s*=/gi, '')
    .trim();
}

/**
 * Strips all HTML markup to produce plain text
 */
export function stripHtml(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Validates and normalizes document ID path parameter
 */
export function sanitizeId(id: string): string {
  if (!id) return '';
  return id.replace(/[^a-zA-Z0-9_\-\.]/g, '').substring(0, 128);
}
