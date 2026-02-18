import { NextResponse } from 'next/server';
import { getServerViewer } from '@/lib/auth/server-viewer';

const AI_ENV_KEYS = ['OPENAI_API_KEY', 'AI_API_KEY', 'ANTHROPIC_API_KEY'] as const;

function isAiConfigured() {
  return AI_ENV_KEYS.some((key) => Boolean(process.env[key]));
}

export async function POST(request: Request) {
  const viewer = await getServerViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'unauthorized', message: 'Sign in required.' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!message) {
    return NextResponse.json({ error: 'invalid_request', message: 'message is required' }, { status: 400 });
  }

  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        error: 'missing_ai_env',
        code: 'missing_ai_env',
        message: 'AI is not configured yet. Please contact support to enable AI responses.',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  const reply = `Echo: ${message.slice(0, 280)}\n\nThis is an MVP response channel and is ready to be replaced by your model backend.`;

  return NextResponse.json(
    {
      reply,
      user: {
        uid: viewer.uid,
        email: viewer.email,
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
