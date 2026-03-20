import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

import { canonicalizeSkill } from '@/lib/skill-taxonomy';
import { rateLimit } from '@/lib/rate-limiter';

type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
};

function buildFallbackQuestions(skill: string): QuizQuestion[] {
  return [
    {
      question: `Which outcome best proves practical working knowledge of ${skill}?`,
      options: [
        'Memorizing terminology only',
        'Shipping a small task or workflow using it correctly',
        'Watching a demo without applying it',
        'Skipping documentation and trial runs',
      ],
      answer: 1,
    },
    {
      question: `When ramping up on ${skill}, which habit most improves reliability?`,
      options: [
        'Relying on guesswork',
        'Avoiding feedback until the end',
        'Reviewing examples, constraints, and expected outputs before implementation',
        'Ignoring edge cases to move faster',
      ],
      answer: 2,
    },
    {
      question: `What is the best onboarding next step if someone struggles with ${skill}?`,
      options: [
        'Move straight to production ownership',
        'Skip the module and hope the gap disappears',
        'Use guided practice, examples, and mentor review before independent execution',
        'Replace the skill requirement with a different tool',
      ],
      answer: 2,
    },
  ];
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '0.0.0.0';
    const { allowed } = rateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const skill = typeof body.skill === 'string' ? canonicalizeSkill(body.skill.trim()) : '';
    if (!skill) {
      return NextResponse.json({ error: 'Invalid skill' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ questions: buildFallbackQuestions(skill) });
    }

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Generate exactly 3 multiple-choice questions that assess practical onboarding knowledge for the requested skill. Return strict JSON only in the shape { "questions": [{ "question": "...", "options": ["A","B","C","D"], "answer": 0 }] }. The correct answer index must be between 0 and 3.',
        },
        {
          role: 'user',
          content: `Skill to assess: ${skill}`,
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return NextResponse.json({ questions: buildFallbackQuestions(skill) });
    }

    return NextResponse.json({
      questions: parsed.questions.slice(0, 3),
    });
  } catch (error) {
    console.error('[QUIZ_API_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
