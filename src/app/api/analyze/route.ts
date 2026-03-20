import { NextResponse } from 'next/server';
import { generateAdaptivePathway } from '@/lib/adaptive-logic';
import { rateLimit } from '@/lib/rate-limiter';
import { sanitizeText } from '@/lib/sanitize';
import Groq from 'groq-sdk';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

// ── HELPERS ───────────────────────────────────────────────────

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'pdf': {
      const parser = new PDFParse({ data: buffer });
      const pdfResult = await parser.getText();
      return pdfResult.text;
    }
    case 'docx': {
      const docxResult = await mammoth.extractRawText({ buffer });
      return docxResult.value;
    }
    case 'txt':
      return buffer.toString('utf-8');
    default:
      return '';
  }
}

// ── MAIN ROUTE ────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '0.0.0.0';
    const { allowed, remaining, resetMs } = rateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // 2. Parse Form Data
    const formData = await request.formData();
    const resumeFile = formData.get('resume') as File | null;
    const rawJd      = formData.get('jd') as string | null;

    if (!resumeFile || !rawJd) {
      return NextResponse.json({ error: 'Missing files' }, { status: 400 });
    }

    // 3. Document Text Extraction
    const resumeText = await extractTextFromFile(resumeFile);
    const { clean: cleanJd } = sanitizeText(rawJd);

    if (!resumeText || !cleanJd) {
      return NextResponse.json({ error: 'Failed to extract text from documents' }, { status: 422 });
    }

    // 4. Groq LLM Orchestration
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn('[SECURITY] Missing GROQ_API_KEY. Falling back to simulation.');
      // Fallback simulation for hackathon safety if key isn't set yet
      return handleSimulationFallback(resumeText, cleanJd, remaining, resetMs);
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert technical HR agent. Analyze the provided Resume and Job Description.
          Extract a list of skills the candidate HAS and a list of skills the role REQUIRES.
          Be precise. If a skill is mentioned in the JD but missing from the resume, it is a GAP.
          
          RESPONSE FORMAT (Strict JSON only):
          {
            "candidate_skills": ["Skill1", "Skill2"],
            "required_skills": ["Skill1", "Skill2", "Skill3"],
            "missing_skills": ["Skill3"]
          }`
        },
        {
          role: 'user',
          content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${cleanJd}`
        }
      ],
      model: 'llama-3.1-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const aiResponse = JSON.parse(completion.choices[0]?.message?.content || '{}');
    
    // Ensure response has valid structure
    const gapAnalysis = {
      candidate_skills: Array.isArray(aiResponse.candidate_skills) ? aiResponse.candidate_skills.slice(0, 8) : [],
      required_skills: Array.isArray(aiResponse.required_skills) ? aiResponse.required_skills.slice(0, 8) : [],
      missing_skills: Array.isArray(aiResponse.missing_skills) ? aiResponse.missing_skills.slice(0, 8) : [],
    };

    // 5. Pathway Generation (Logic Engine)
    const advancedPathwayData = generateAdaptivePathway(gapAnalysis);

    return NextResponse.json({
      success: true,
      data: { analysis: gapAnalysis, ...advancedPathwayData },
      meta: { rateLimit: { remaining, resetMs } }
    });

  } catch (error) {
    console.error('[API ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ── FALLBACK SIMULATION ──────────────────────────────────────

function handleSimulationFallback(resume: string, jd: string, remaining: number, resetMs: number) {
  const gapAnalysis = {
    candidate_skills: ["React", "JavaScript", "HTML", "CSS", "Git"],
    required_skills:  ["React", "Next.js", "Docker", "Go", "AWS"],
    missing_skills:   ["Next.js", "Docker", "Go", "AWS"],
  };
  const advancedPathwayData = generateAdaptivePathway(gapAnalysis);
  return NextResponse.json({
    success: true,
    data: { analysis: gapAnalysis, ...advancedPathwayData },
    meta: { simulated: true, rateLimit: { remaining, resetMs } }
  });
}
