import { NextResponse } from 'next/server';
import { z } from 'zod';
import { activatePlan } from '@/lib/auth/entitlements';
import { getServerViewer, isAdminEmail } from '@/lib/auth/server-viewer';

export const runtime = 'nodejs';

const bodySchema = z.object({
  uid: z.string().min(3).optional(),
  plan: z.enum(['MONTHLY', 'ANNUAL']).default('MONTHLY'),
  planStatus: z.enum(['active', 'inactive']).default('active'),
});

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const viewer = await getServerViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'unauthorized', requestId }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  const isAllowed = process.env.NODE_ENV !== 'production' || isAdminEmail(viewer.email);
  if (!isAllowed) {
    return NextResponse.json({ error: 'forbidden', requestId }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }

  try {
    const body = bodySchema.parse(await request.json());
    await activatePlan(body.uid || viewer.uid, body.plan, body.planStatus);
    return NextResponse.json({ ok: true, requestId }, { headers: { 'Cache-Control': 'no-store', 'X-Request-Id': requestId } });
  } catch (error) {
    return NextResponse.json(
      { error: 'invalid_request', message: error instanceof Error ? error.message : 'Invalid payload', requestId },
      { status: 400, headers: { 'Cache-Control': 'no-store', 'X-Request-Id': requestId } }
    );
  }
}
