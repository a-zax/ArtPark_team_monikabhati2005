/**
 * ENTERPRISE INPUT SANITIZATION
 * ─────────────────────────────────────────────────────────────
 * Guards against:
 *   - HTML/script injection (XSS)
 *   - SQL / NoSQL injection patterns
 *   - LLM Prompt injection attacks
 *   - Null-byte injection
 *   - Path traversal attacks
 */

const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,   // Script tags
  /javascript\s*:/gi,                         // JS protocol
  /on\w+\s*=\s*["'][^"']*["']/gi,            // Inline event handlers
  /--|\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b|\bSELECT\b|\bUNION\b/gi, // SQL
  /\{\{.*?\}\}|\$\{.*?\}/g,                  // Template injection
  /\.\.\//g,                                  // Path traversal
  /\x00/g,                                    // Null bytes
  /ignore previous instructions/gi,           // Prompt injection
  /system prompt/gi,                          // Prompt injection
  /you are now/gi,                            // Prompt injection
];

export function sanitizeText(input: string): { clean: string; flagged: boolean } {
  let clean = input.trim();
  let flagged = false;

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(clean)) {
      flagged = true;
      clean = clean.replace(pattern, '[REDACTED]');
    }
  }

  // Max length enforcement — prevent payload flooding
  if (clean.length > 15_000) {
    clean = clean.slice(0, 15_000);
    flagged = true;
  }

  return { clean, flagged };
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._\- ]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 255);
}
