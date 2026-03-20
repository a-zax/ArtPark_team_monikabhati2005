import { createRequire } from 'node:module';

import mammoth from 'mammoth';
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

import { generateAdaptivePathway } from '@/lib/adaptive-logic';
import {
  FALLBACK_ANALYSIS,
  buildAnalysisMeta,
  buildHeuristicAnalysis,
  buildPromptSeed,
  mergeAnalyses,
  normalizeStructuredAnalysis,
} from '@/lib/analysis-engine';
import { GapAnalysis } from '@/lib/analysis-types';
import { validateFile } from '@/lib/file-validator';
import { rateLimit } from '@/lib/rate-limiter';
import { sanitizeText } from '@/lib/sanitize';

export const runtime = 'nodejs';

const require = createRequire(import.meta.url);

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf': {
      const { PDFParse } = require('pdf-parse') as {
        PDFParse: new (params: { data: Buffer }) => {
          getText: () => Promise<{ text: string }>;
          destroy: () => Promise<void>;
        };
      };

      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        return result.text;
      } finally {
        await parser.destroy();
      }
    }
    case 'docx': {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case 'txt':
      return buffer.toString('utf-8');
    default:
      return '';
  }
}

async function requestGroqAnalysis(input: {
  apiKey: string;
  resumeText: string;
  jdText: string;
  seed: ReturnType<typeof buildPromptSeed>;
}): Promise<GapAnalysis> {
  const groq = new Groq({ apiKey: input.apiKey });
  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You extract onboarding skill gaps from a resume and a job description. Return strict JSON only. Use only skills that are directly grounded in the provided texts or seed lists. Prefer the seed labels when they match the same concept. If the candidate mentions a skill at a lower depth than the role requires, keep that skill in both profiles with different levels so the downstream gap engine can detect under-proficiency.',
      },
      {
        role: 'user',
        content: `Return JSON using this exact structure:
{
  "candidate_profile": [
    { "skill": "React", "level": "intermediate", "years": 2, "evidence": "Built dashboard features" }
  ],
  "required_profile": [
    { "skill": "Next.js", "level": "intermediate", "years": 1, "evidence": "Required in JD" }
  ],
  "candidate_skills": ["React"],
  "required_skills": ["React", "Next.js"],
  "missing_skills": ["Next.js"],
  "role_track": "engineering"
}

Allowed role_track values: engineering, analytics, operations, support, sales, finance, general

Seed hints:
${JSON.stringify(input.seed, null, 2)}

Resume:
${input.resumeText}

Job description:
${input.jdText}`,
      },
    ],
  });

  return normalizeStructuredAnalysis(JSON.parse(completion.choices[0]?.message?.content || '{}'));
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '0.0.0.0';
    const { allowed, remaining, resetMs } = rateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const formData = await request.formData();
    const resumeFile = formData.get('resume');
    const resumeTextInput = formData.get('resumeText');
    const rawJd = formData.get('jd');

    const hasResumeFile = resumeFile instanceof File;
    const hasResumeText = typeof resumeTextInput === 'string' && resumeTextInput.trim().length > 0;

    if ((!hasResumeFile && !hasResumeText) || typeof rawJd !== 'string') {
      return NextResponse.json(
        { error: 'Provide either a resume file or pasted resume text, along with the job description.' },
        { status: 400 },
      );
    }

    if (hasResumeFile) {
      const validation = await validateFile(resumeFile);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    const extractedResume = hasResumeFile ? await extractTextFromFile(resumeFile) : '';
    const rawResume = extractedResume || (hasResumeText ? String(resumeTextInput) : '');

    const { clean: cleanResume, flagged: resumeFlagged } = sanitizeText(rawResume);
    const { clean: cleanJd, flagged: jdFlagged } = sanitizeText(rawJd);

    if (!cleanResume || !cleanJd) {
      return NextResponse.json(
        { error: 'Failed to extract readable text from the submitted materials.' },
        { status: 422 },
      );
    }

    const heuristic = buildHeuristicAnalysis(cleanResume, cleanJd);
    const warnings = [...heuristic.warnings];

    let analysis = heuristic.analysis;
    let analysisMode: 'heuristic' | 'hybrid' | 'demo' = 'heuristic';
    let usedLlm = false;
    let simulated = false;

    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      try {
        const structuredAnalysis = await requestGroqAnalysis({
          apiKey,
          resumeText: cleanResume,
          jdText: cleanJd,
          seed: buildPromptSeed(heuristic.analysis),
        });
        analysis = mergeAnalyses(heuristic.analysis, structuredAnalysis);
        analysisMode = 'hybrid';
        usedLlm = true;
      } catch (error) {
        console.error('[GROQ_ANALYSIS_FALLBACK]', error);
        warnings.push('Groq refinement was unavailable, so the deterministic parser handled this request end-to-end.');
      }
    } else {
      warnings.push('No Groq key was configured. The deterministic parser handled this request locally.');
    }

    if (analysis.candidate_profile.length === 0 && analysis.required_profile.length === 0) {
      analysis = FALLBACK_ANALYSIS;
      analysisMode = 'demo';
      simulated = true;
      warnings.push('The submitted text did not contain enough recognizable signals, so a demo-safe fallback profile was used.');
    }

    const pathway = generateAdaptivePathway(analysis);

    return NextResponse.json({
      success: true,
      data: { analysis, ...pathway },
      meta: buildAnalysisMeta({
        analysisMode,
        usedLlm,
        simulated,
        roleTrack: analysis.role_track ?? 'general',
        warnings,
        resumeFlagged,
        jdFlagged,
        remaining,
        resetMs,
      }),
    });
  } catch (error) {
    console.error('[ANALYZE_API_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
