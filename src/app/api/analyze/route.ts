import { NextResponse } from 'next/server';
import mammoth from 'mammoth';
import Groq from 'groq-sdk';
import { createRequire } from 'node:module';

import { generateAdaptivePathway } from '@/lib/adaptive-logic';
import { GapAnalysis, SkillLevel, SkillProfile, normalizeSkillName } from '@/lib/analysis-types';
import { validateFile } from '@/lib/file-validator';
import { rateLimit } from '@/lib/rate-limiter';
import { sanitizeText } from '@/lib/sanitize';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);

const FALLBACK_ANALYSIS: GapAnalysis = {
  candidate_profile: [
    { skill: 'React', level: 'intermediate', years: 2, evidence: 'Resume project work' },
    { skill: 'JavaScript', level: 'intermediate', years: 3, evidence: 'Hands-on development experience' },
    { skill: 'Git', level: 'intermediate', years: 2, evidence: 'Version control usage' },
  ],
  required_profile: [
    { skill: 'React', level: 'intermediate', years: 2 },
    { skill: 'Next.js', level: 'intermediate', years: 1 },
    { skill: 'Docker', level: 'beginner', years: 1 },
    { skill: 'AWS', level: 'beginner', years: 1 },
  ],
  candidate_skills: ['React', 'JavaScript', 'Git'],
  required_skills: ['React', 'Next.js', 'Docker', 'AWS'],
  missing_skills: ['Next.js', 'Docker', 'AWS'],
};

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop()?.toLowerCase();

  switch (ext) {
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

function dedupeSkills(skills: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const skill of skills) {
    const normalized = normalizeSkillName(skill);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(skill.trim());
  }

  return result;
}

function safeLevel(input: unknown): SkillLevel {
  if (input === 'advanced' || input === 'intermediate' || input === 'beginner') {
    return input;
  }
  return 'beginner';
}

function normalizeProfile(profile: unknown): SkillProfile[] {
  if (!Array.isArray(profile)) return [];

  return dedupeSkills(
    profile
      .map((item) => (typeof item === 'object' && item && 'skill' in item ? String(item.skill).trim() : ''))
      .filter(Boolean),
  ).map((skill) => {
    const raw = profile.find(
      (item) => typeof item === 'object' && item && 'skill' in item && normalizeSkillName(String(item.skill)) === normalizeSkillName(skill),
    ) as Record<string, unknown> | undefined;

    return {
      skill,
      level: safeLevel(raw?.level),
      years: typeof raw?.years === 'number' ? raw.years : undefined,
      evidence: typeof raw?.evidence === 'string' ? raw.evidence : undefined,
      confidence: typeof raw?.confidence === 'number' ? raw.confidence : undefined,
      last_used_year: typeof raw?.last_used_year === 'number' ? raw.last_used_year : undefined,
    };
  });
}

function deriveMissingSkills(candidateSkills: string[], requiredSkills: string[]) {
  const candidateSet = new Set(candidateSkills.map(normalizeSkillName));
  return requiredSkills.filter((skill) => !candidateSet.has(normalizeSkillName(skill)));
}

function normalizeAnalysis(payload: unknown): GapAnalysis {
  const data = typeof payload === 'object' && payload ? (payload as Record<string, unknown>) : {};
  const candidateProfile = normalizeProfile(data.candidate_profile);
  const requiredProfile = normalizeProfile(data.required_profile);

  const candidateSkills = dedupeSkills([
    ...candidateProfile.map((item) => item.skill),
    ...(Array.isArray(data.candidate_skills) ? data.candidate_skills.filter((item): item is string => typeof item === 'string') : []),
  ]).slice(0, 16);

  const requiredSkills = dedupeSkills([
    ...requiredProfile.map((item) => item.skill),
    ...(Array.isArray(data.required_skills) ? data.required_skills.filter((item): item is string => typeof item === 'string') : []),
  ]).slice(0, 16);

  const missingSkills = dedupeSkills(
    Array.isArray(data.missing_skills) ? data.missing_skills.filter((item): item is string => typeof item === 'string') : [],
  );

  return {
    candidate_profile:
      candidateProfile.length > 0
        ? candidateProfile
        : candidateSkills.map((skill) => ({ skill, level: 'beginner' as SkillLevel })),
    required_profile:
      requiredProfile.length > 0
        ? requiredProfile
        : requiredSkills.map((skill) => ({ skill, level: 'intermediate' as SkillLevel })),
    candidate_skills: candidateSkills,
    required_skills: requiredSkills,
    missing_skills: missingSkills.length > 0 ? missingSkills : deriveMissingSkills(candidateSkills, requiredSkills),
  };
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
    const rawJd = formData.get('jd');
    const domainType = formData.get('domainType') === 'labor' ? 'labor' : 'knowledge';

    if (!(resumeFile instanceof File) || typeof rawJd !== 'string') {
      return NextResponse.json({ error: 'Resume file and job description are required.' }, { status: 400 });
    }

    const validation = await validateFile(resumeFile);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const resumeText = await extractTextFromFile(resumeFile);
    const { clean: cleanResume, flagged: resumeFlagged } = sanitizeText(resumeText);
    const { clean: cleanJd, flagged: jdFlagged } = sanitizeText(rawJd);

    if (!cleanResume || !cleanJd) {
      return NextResponse.json({ error: 'Failed to extract readable text from the submitted documents.' }, { status: 422 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      const pathway = generateAdaptivePathway(FALLBACK_ANALYSIS, domainType);
      return NextResponse.json({
        success: true,
        data: { analysis: FALLBACK_ANALYSIS, ...pathway },
        meta: {
          simulated: true,
          security: { resumeFlagged, jdFlagged },
          rateLimit: { remaining, resetMs },
        },
      });
    }

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are an HR onboarding analyst. Extract a structured candidate skill profile and a structured required skill profile from the resume and job description. Output strict JSON only. For each skill, include level as beginner/intermediate/advanced, optional years as a number when inferable, a short evidence string, confidence as a float between 0.0 and 1.0 (indicating certainty of their proficiency), and last_used_year as a 4-digit integer if inferable from resume dates. Include candidate_skills, required_skills, and missing_skills arrays too.',
        },
        {
          role: 'user',
          content: `Return JSON using this exact shape:
{
  "candidate_profile": [
    { "skill": "React", "level": "intermediate", "years": 2, "evidence": "Built frontend modules", "confidence": 0.91, "last_used_year": 2023 }
  ],
  "required_profile": [
    { "skill": "Next.js", "level": "intermediate", "years": 1, "evidence": "Required in JD", "confidence": 1.0 }
  ],
  "candidate_skills": ["React"],
  "required_skills": ["React", "Next.js"],
  "missing_skills": ["Next.js"]
}

Only include skills grounded in the provided texts.

RESUME:
${cleanResume}

JOB DESCRIPTION:
${cleanJd}`,
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    const analysis = normalizeAnalysis(parsed);
    const pathway = generateAdaptivePathway(analysis, domainType);

    return NextResponse.json({
      success: true,
      data: { analysis, ...pathway },
      meta: {
        security: { resumeFlagged, jdFlagged },
        rateLimit: { remaining, resetMs },
      },
    });
  } catch (error) {
    console.error('[ANALYZE_API_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
