import { NextResponse } from 'next/server';
import mammoth from 'mammoth';
import Groq from 'groq-sdk';
import { createRequire } from 'node:module';

import { generateAdaptivePathway } from '@/lib/adaptive-logic';
import { GapAnalysis, SkillLevel, SkillProfile, normalizeSkillName } from '@/lib/analysis-types';
import { validateFile } from '@/lib/file-validator';
import { rateLimit } from '@/lib/rate-limiter';
import { buildSkillVocabularyPrompt, canonicalizeSkillName } from '@/lib/skill-taxonomy';
import { sanitizeText } from '@/lib/sanitize';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);

const FALLBACK_ANALYSIS: GapAnalysis = {
  candidate_profile: [
    { skill: 'React', level: 'intermediate', years: 2, evidence: 'Resume project work', confidence: 0.84, last_used_year: 2024, decay_score: 0.84, is_stale: false },
    { skill: 'JavaScript', level: 'intermediate', years: 3, evidence: 'Hands-on development experience', confidence: 0.91, last_used_year: 2024, decay_score: 0.91, is_stale: false },
    { skill: 'Git', level: 'intermediate', years: 2, evidence: 'Version control usage', confidence: 0.74, last_used_year: 2022, decay_score: 0.44, is_stale: true },
  ],
  required_profile: [
    { skill: 'React', level: 'intermediate', years: 2, confidence: 1 },
    { skill: 'Next.js', level: 'intermediate', years: 1, confidence: 1 },
    { skill: 'Docker', level: 'beginner', years: 1, confidence: 1 },
    { skill: 'AWS', level: 'beginner', years: 1, confidence: 1 },
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getRecencyFactor(lastUsedYear?: number) {
  if (!lastUsedYear) return 1;

  const currentYear = new Date().getFullYear();
  const yearsSinceLastUse = currentYear - lastUsedYear;

  if (yearsSinceLastUse <= 1) return 1;
  if (yearsSinceLastUse === 2) return 0.8;
  if (yearsSinceLastUse === 3) return 0.6;
  if (yearsSinceLastUse === 4) return 0.45;
  return 0.3;
}

function getDecayScore(confidence?: number, lastUsedYear?: number) {
  return Number((clamp(typeof confidence === 'number' ? confidence : 0.7, 0, 1) * getRecencyFactor(lastUsedYear)).toFixed(2));
}

function normalizeProfile(profile: unknown, domainType: string): SkillProfile[] {
  if (!Array.isArray(profile)) return [];

  return dedupeSkills(
    profile
      .map((item) => {
        if (!(typeof item === 'object' && item && 'skill' in item)) return '';
        return canonicalizeSkillName(String(item.skill).trim(), domainType) ?? '';
      })
      .filter(Boolean),
  ).map((skill) => {
    const raw = profile.find(
      (item) =>
        typeof item === 'object' &&
        item &&
        'skill' in item &&
        canonicalizeSkillName(String(item.skill), domainType) === skill,
    ) as Record<string, unknown> | undefined;

    return {
      skill,
      level: safeLevel(raw?.level),
      years: typeof raw?.years === 'number' ? raw.years : undefined,
      evidence: typeof raw?.evidence === 'string' ? raw.evidence : undefined,
      confidence: typeof raw?.confidence === 'number' ? raw.confidence : undefined,
      last_used_year: typeof raw?.last_used_year === 'number' ? raw.last_used_year : undefined,
      decay_score: getDecayScore(
        typeof raw?.confidence === 'number' ? raw.confidence : undefined,
        typeof raw?.last_used_year === 'number' ? raw.last_used_year : undefined,
      ),
      is_stale: getDecayScore(
        typeof raw?.confidence === 'number' ? raw.confidence : undefined,
        typeof raw?.last_used_year === 'number' ? raw.last_used_year : undefined,
      ) < 0.5,
    };
  });
}

function deriveMissingSkills(
  candidateSkills: string[],
  requiredSkills: string[],
  candidateProfile: SkillProfile[],
) {
  const candidateSet = new Set(candidateSkills.map(normalizeSkillName));
  return requiredSkills.filter((skill) => {
    const normalized = normalizeSkillName(skill);
    const candidateMatch = candidateProfile.find((item) => normalizeSkillName(item.skill) === normalized);

    if (!candidateSet.has(normalized)) {
      return true;
    }

    if (!candidateMatch) {
      return false;
    }

    const confidence = typeof candidateMatch.confidence === 'number' ? candidateMatch.confidence : 0.7;
    const decayScore = typeof candidateMatch.decay_score === 'number'
      ? candidateMatch.decay_score
      : getDecayScore(candidateMatch.confidence, candidateMatch.last_used_year);

    return confidence < 0.5 || decayScore < 0.5;
  });
}

function normalizeAnalysis(payload: unknown, domainType: string): GapAnalysis {
  const data = typeof payload === 'object' && payload ? (payload as Record<string, unknown>) : {};
  const candidateProfile = normalizeProfile(data.candidate_profile, domainType);
  const requiredProfile = normalizeProfile(data.required_profile, domainType);

  const candidateSkills = dedupeSkills([
    ...candidateProfile.map((item) => item.skill),
    ...(Array.isArray(data.candidate_skills)
      ? data.candidate_skills
          .filter((item): item is string => typeof item === 'string')
          .map((item) => canonicalizeSkillName(item, domainType) ?? '')
          .filter(Boolean)
      : []),
  ]).slice(0, 16);

  const requiredSkills = dedupeSkills([
    ...requiredProfile.map((item) => item.skill),
    ...(Array.isArray(data.required_skills)
      ? data.required_skills
          .filter((item): item is string => typeof item === 'string')
          .map((item) => canonicalizeSkillName(item, domainType) ?? '')
          .filter(Boolean)
      : []),
  ]).slice(0, 16);

  const modelMissingSkills = dedupeSkills(
    Array.isArray(data.missing_skills)
      ? data.missing_skills
          .filter((item): item is string => typeof item === 'string')
          .map((item) => canonicalizeSkillName(item, domainType) ?? '')
          .filter(Boolean)
      : [],
  );
  const derivedMissingSkills = deriveMissingSkills(candidateSkills, requiredSkills, candidateProfile);

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
    missing_skills: dedupeSkills([...modelMissingSkills, ...derivedMissingSkills]),
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
    const allowedSkillsPrompt = buildSkillVocabularyPrompt(domainType);
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            `You are an HR onboarding analyst. Extract a structured candidate skill profile and a structured required skill profile from the resume and job description. Output strict JSON only. Use only skills from this approved vocabulary: ${allowedSkillsPrompt}. Do not invent new skills, do not include vague or loosely related terms, and do not inflate generic cross-functional skills unless they are explicitly central to the role. Prefer role-defining technical or operational skills over broad terms. For each skill, include level as beginner/intermediate/advanced, optional years as a number when inferable, a short evidence string, confidence as a float between 0.0 and 1.0, and last_used_year as a 4-digit integer if inferable from resume dates. Confidence must be lower when a skill is only mentioned once or weakly implied, and higher when repeated with concrete evidence such as projects, tools, or years of use. Include candidate_skills, required_skills, and missing_skills arrays too.`,
        },
        {
          role: 'user',
          content: `Return JSON using this exact shape:
{
  "candidate_profile": [
    { "skill": "Python", "level": "advanced", "years": 2, "evidence": "Used in 3 projects and automation work", "confidence": 0.91, "last_used_year": 2024 },
    { "skill": "Docker", "level": "beginner", "years": 0.5, "evidence": "Mentioned once in passing", "confidence": 0.28, "last_used_year": 2021 }
  ],
  "required_profile": [
    { "skill": "Next.js", "level": "intermediate", "years": 1, "evidence": "Required in JD", "confidence": 1.0 }
  ],
  "candidate_skills": ["Python", "Docker"],
  "required_skills": ["Python", "Docker", "Next.js"],
  "missing_skills": ["Docker", "Next.js"]
}

Only include skills grounded in the provided texts.
Only choose skills from this approved vocabulary:
${allowedSkillsPrompt}

RESUME:
${cleanResume}

JOB DESCRIPTION:
${cleanJd}`,
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    const analysis = normalizeAnalysis(parsed, domainType);
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
