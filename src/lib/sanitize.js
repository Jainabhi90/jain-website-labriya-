/**
 * Secure HTML Sanitizer for Rich Text
 * Allows only a strict whitelist of formatting tags for XSS prevention.
 */
export function sanitizeHTML(dirty) {
  if (!dirty) return "";
  
  // Replace script tags and dangerous event handlers
  let clean = dirty
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/g, "")
    .replace(/javascript:[^"]*/g, "");

  // Safe HTML element tags whitelist
  const allowedTags = ["h3", "h4", "p", "span", "strong", "b", "em", "i", "u", "a", "ol", "ul", "li", "blockquote", "br"];
  
  // Extract all tag structures and filter out disallowed ones
  const tagRegex = /<\/?([a-z1-6]+)(\s[^>]*)?>/gi;
  clean = clean.replace(tagRegex, (match, tagName) => {
    const isAllowed = allowedTags.includes(tagName.toLowerCase());
    return isAllowed ? match : "";
  });

  return clean;
}
