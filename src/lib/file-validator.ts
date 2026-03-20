/**
 * ENTERPRISE FILE UPLOAD VALIDATOR
 * ─────────────────────────────────────────────────────────────
 * Guards against:
 *   - MIME type spoofing (Content-Type lying)
 *   - Magic bytes mismatch (polyglot file attacks)
 *   - Oversized payloads
 *   - Disallowed file extensions
 */

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_TYPES: Record<string, { mime: string[]; magic: number[][] }> = {
  pdf: {
    mime: ['application/pdf'],
    magic: [[0x25, 0x50, 0x44, 0x46]], // %PDF
  },
  docx: {
    mime: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
    ],
    magic: [[0x50, 0x4B, 0x03, 0x04]], // PK (ZIP header)
  },
  txt: {
    mime: ['text/plain'],
    magic: [], // plain text has no magic bytes; rely on extension + MIME
  },
};

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export async function validateFile(file: File): Promise<ValidationResult> {
  // 1. Size check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File exceeds the ${MAX_FILE_SIZE_MB}MB size limit.` };
  }

  // 2. Extension check
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_TYPES[ext]) {
    return { valid: false, error: `File type ".${ext}" is not permitted. Use PDF, DOCX, or TXT.` };
  }

  // 3. MIME type check
  const allowedMimes = ALLOWED_TYPES[ext].mime;
  if (!allowedMimes.includes(file.type) && file.type !== '') {
    return { valid: false, error: `MIME type "${file.type}" does not match the expected type for .${ext}.` };
  }

  // 4. Magic bytes verification (reads first 4 bytes of file)
  const magicSignatures = ALLOWED_TYPES[ext].magic;
  if (magicSignatures.length > 0) {
    const buffer = await file.slice(0, 4).arrayBuffer();
    const bytes  = new Uint8Array(buffer);
    const matches = magicSignatures.some(sig =>
      sig.every((byte, i) => bytes[i] === byte)
    );
    if (!matches) {
      return { valid: false, error: 'File content does not match its declared type (possible spoofing attempt).' };
    }
  }

  return { valid: true };
}
