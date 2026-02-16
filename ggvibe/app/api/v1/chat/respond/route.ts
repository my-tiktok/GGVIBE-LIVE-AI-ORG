import { NextResponse } from 'next/server';
import { getServerViewer } from '@/lib/auth/server-viewer';

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
