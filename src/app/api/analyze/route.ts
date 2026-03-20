import { NextResponse } from 'next/server';
import { generateAdaptivePathway } from '@/lib/adaptive-logic';
import { rateLimit } from '@/lib/rate-limiter';
import { sanitizeText } from '@/lib/sanitize';

export async function POST(request: Request) {
  try {
    // ── 1. RATE LIMITING ─────────────────────────────────────────
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      '0.0.0.0';

    const { allowed, remaining, resetMs } = rateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before submitting again.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetMs / 1000)),
            'Retry-After': String(Math.ceil(resetMs / 1000)),
          },
        }
      );
    }

    // ── 2. PARSE & VALIDATE INPUT ────────────────────────────────
    const formData = await request.formData();
    const resumeFile = formData.get('resume') as File | null;
    const rawJd      = formData.get('jd') as string | null;

    if (!resumeFile || !rawJd) {
      return NextResponse.json(
        { error: 'Missing required fields: resume file and job description.' },
        { status: 400 }
      );
    }

    // ── 3. FILE SIZE & EXTENSION GUARD ───────────────────────────
    const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
    if (resumeFile.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'Resume file exceeds the 5 MB size limit.' },
        { status: 413 }
      );
    }

    const allowedExtensions = ['pdf', 'docx', 'txt'];
    const ext = resumeFile.name.split('.').pop()?.toLowerCase() ?? '';
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: `File type ".${ext}" is not allowed. Use PDF, DOCX, or TXT.` },
        { status: 415 }
      );
    }

    // ── 4. INPUT SANITIZATION ────────────────────────────────────
    const { clean: cleanJd, flagged } = sanitizeText(rawJd);

    if (flagged) {
      console.warn(`[SECURITY] Suspicious input from ${ip}. Content sanitized.`);
    }

    // ── 5. PROCESS (SIMULATED AI ENGINE) ─────────────────────────
    // cleanJd is the sanitized job description used by the parsing engine
    void cleanJd; // consumed by the AI parser (mocked here, used in production LLM call)
    await new Promise(resolve => setTimeout(resolve, 2500));

    const gapAnalysis = {
      candidate_skills: ["React", "JavaScript", "HTML", "CSS", "Git", "REST APIs"],
      required_skills:  ["React", "Next.js", "Docker", "Machine Learning", "Team Leadership", "Cloud Architecture"],
      missing_skills:   ["Next.js", "Docker", "Machine Learning", "Cloud Architecture"],
    };

    const advancedPathwayData = generateAdaptivePathway(gapAnalysis);

    return NextResponse.json(
      {
        success: true,
        data: { analysis: gapAnalysis, ...advancedPathwayData },
        meta: {
          sanitized: flagged,
          rateLimit: { remaining, resetMs },
        },
      },
      {
        headers: {
          'X-RateLimit-Limit':     '20',
          'X-RateLimit-Remaining': String(remaining),
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  } catch (error) {
    console.error('[API ERROR]', error);
    return NextResponse.json(
      { error: 'An internal error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
