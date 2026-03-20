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

    // SIMULATED AI PARSING ENGINE
    await new Promise(resolve => setTimeout(resolve, 2500)); 

    const gapAnalysis = {
      candidate_skills: ["React", "JavaScript", "HTML", "CSS", "Git", "REST APIs"],
      required_skills: ["React", "Next.js", "Docker", "Machine Learning", "Team Leadership", "Cloud Architecture"],
      missing_skills: ["Next.js", "Docker", "Machine Learning", "Cloud Architecture"]
    };

    const advancedPathwayData = generateAdaptivePathway(gapAnalysis);

    return NextResponse.json({
      success: true,
      data: {
        analysis: gapAnalysis,
        ...advancedPathwayData // Splays pathway, roi_metrics, mentorship, sandbox
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process documents' }, { status: 500 });
  }
}
