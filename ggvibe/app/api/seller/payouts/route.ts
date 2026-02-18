import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getServerViewer } from '@/lib/auth/server-viewer';
import { getSellerProfile, payoutsSchema, savePayouts } from '@/lib/seller/profile';

export const runtime = 'nodejs';

function headers(requestId: string) {
  return { 'Cache-Control': 'no-store', 'X-Request-Id': requestId };
}

export async function GET() {
  const requestId = crypto.randomUUID();
  const viewer = await getServerViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'unauthorized', requestId }, { status: 401, headers: headers(requestId) });
  }

  const data = await getSellerProfile(viewer.uid);
  return NextResponse.json({ payouts: data.payouts, requestId }, { headers: headers(requestId) });
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const viewer = await getServerViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'unauthorized', requestId }, { status: 401, headers: headers(requestId) });
  }

  try {
    const body = await request.json();
    const payload = payoutsSchema.parse(body);
    await savePayouts(viewer.uid, payload);
    return NextResponse.json({ ok: true, requestId }, { headers: headers(requestId) });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Payout settings are invalid.',
          fieldErrors: error.flatten().fieldErrors,
          requestId,
        },
        { status: 400, headers: headers(requestId) }
      );
    }

    return NextResponse.json(
      { error: 'internal_error', message: 'Unable to save payout preferences.', requestId },
      { status: 500, headers: headers(requestId) }
    );
  }
}
