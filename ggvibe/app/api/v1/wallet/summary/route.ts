import { NextResponse } from 'next/server';
import { getServerViewer } from '@/lib/auth/server-viewer';

export async function GET() {
  const viewer = await getServerViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    availableBalance: 0,
    pendingBalance: 0,
    currency: 'USD',
    accountLabel: viewer.email ?? viewer.uid,
  });
}
