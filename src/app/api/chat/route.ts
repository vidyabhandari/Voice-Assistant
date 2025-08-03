import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('🌐 Incoming request to /api/chat');

    const { prompt } = await req.json();

    if (typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt must be a string' }, { status: 400 });
    }

    console.log('✅ Prompt (final):', prompt);

    // FIX: Using Gemini API endpoint and key from environment variables
    const googleApiKey = process.env.GOOGLE_API_KEY;

    if (!googleApiKey) {
      return NextResponse.json({ error: 'Google API key is not set.' }, { status: 500 });
    }

    const gemini = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${googleApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // FIX: The request body is now in the correct Gemini format
        body: JSON.stringify({
          contents: [{
            parts: [{text: prompt}],
          }],
        }),
      }
    );

    const data = await gemini.json();

    console.log('🌟 Gemini API raw response:', data);

    if (!gemini.ok) {
      console.error('🚨 Gemini API error:', data);
      return NextResponse.json({ error: data }, { status: 500 });
    }

    // FIX: The reply is now extracted from the correct Gemini response structure
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
    console.log('✅ Reply from Gemini:', reply);

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('💥 LLM Error (Catch Block):', err);
    return NextResponse.json(
      { error: err?.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}