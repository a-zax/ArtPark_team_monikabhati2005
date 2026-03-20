const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_TYPES: Record<string, { mime: string[]; magic: number[][] }> = {
  pdf: {
    mime: ['application/pdf'],
    magic: [[0x25, 0x50, 0x44, 0x46]],
  },
  docx: {
    mime: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
    ],
    magic: [[0x50, 0x4b, 0x03, 0x04]],
  },
  txt: {
    mime: ['text/plain'],
    magic: [],
  },
};

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export async function validateFile(file: File): Promise<ValidationResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File exceeds the ${MAX_FILE_SIZE_MB} MB size limit.` };
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_TYPES[extension]) {
    return { valid: false, error: `File type ".${extension}" is not supported. Use PDF, DOCX, or TXT.` };
  }

  const allowedMimes = ALLOWED_TYPES[extension].mime;
  if (!allowedMimes.includes(file.type) && file.type !== '') {
    return { valid: false, error: `MIME type "${file.type}" does not match the expected .${extension} format.` };
  }

  const signatures = ALLOWED_TYPES[extension].magic;
  if (signatures.length > 0) {
    const buffer = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const matches = signatures.some((signature) => signature.every((byte, index) => bytes[index] === byte));

    if (!matches) {
      return {
        valid: false,
        error: 'The file signature did not match its declared format. Please re-export the document and try again.',
      };
    }
  }

  return { valid: true };
}
