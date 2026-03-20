import { NextResponse } from 'next/server';
import { generateAdaptivePathway } from '@/lib/adaptive-logic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get('resume') as File;
    const jdText = formData.get('jd') as string;

    if (!resumeFile || !jdText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // SIMULATED AI PARSING ENGINE (Zero-cost demo)
    // Production: Extracted text goes to Llama 3 via Groq for structured JSON
    await new Promise(resolve => setTimeout(resolve, 2500)); 

    // Intelligent Parsing Mock Output
    const gapAnalysis = {
      candidate_skills: ["React", "JavaScript", "HTML", "CSS", "Git"],
      required_skills: ["React", "Next.js", "Docker", "Machine Learning", "Team Leadership"],
      missing_skills: ["Next.js", "Docker", "Machine Learning", "Team Leadership"]
    };

    // Run custom adaptive pathway mapping
    const pathway = generateAdaptivePathway(gapAnalysis);

    return NextResponse.json({
      success: true,
      data: {
        analysis: gapAnalysis,
        pathway: pathway
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process documents' }, { status: 500 });
  }
}
