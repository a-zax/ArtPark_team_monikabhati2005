import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limiter';
import Groq from 'groq-sdk';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '0.0.0.0';
    const { allowed } = rateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { skill } = await request.json();

    if (!skill || typeof skill !== 'string') {
      return NextResponse.json({ error: 'Invalid skill' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // Fallback
      return NextResponse.json({
         questions: [
           { 
             question: `What is the primary use case of ${skill}?`, 
             options: [`Building UI`, `Managing State`, `Abstracting API logic`, `All of the above`], 
             answer: 3 
           }
         ]
      });
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Generate exactly 3 multiple choice questions to assess a user's knowledge of the technology requested.
          
          RESPONSE FORMAT (Strict JSON):
          {
            "questions": [
              {
                "question": "What does X do?",
                "options": ["A", "B", "C", "D"],
                "answer": 1 // Index of the correct option (0-3)
              }
            ]
          }`
        },
        {
          role: 'user',
          content: `Technology to assess: ${skill}`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const aiResponse = JSON.parse(completion.choices[0]?.message?.content || '{}');

    return NextResponse.json(aiResponse);

  } catch (error) {
    console.error('[QUIZ API ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
