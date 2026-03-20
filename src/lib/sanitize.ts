const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /\{\{.*?\}\}|\$\{.*?\}/g,
  /\.\.\//g,
  /\x00/g,
  /ignore\s+previous\s+instructions/gi,
  /reveal\s+the\s+system\s+prompt/gi,
  /you\s+are\s+now\s+an?\s+/gi,
];

const MAX_INPUT_LENGTH = 15_000;

export function sanitizeText(input: string): { clean: string; flagged: boolean } {
  let clean = input.trim();
  let flagged = false;

  for (const pattern of DANGEROUS_PATTERNS) {
    if (!pattern.test(clean)) {
      continue;
    }

    flagged = true;
    clean = clean.replace(pattern, '[REDACTED]');
  }

  if (clean.length > MAX_INPUT_LENGTH) {
    clean = clean.slice(0, MAX_INPUT_LENGTH);
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
