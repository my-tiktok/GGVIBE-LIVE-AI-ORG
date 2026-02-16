import { NextResponse } from 'next/server';
import { getServerViewer } from '@/lib/auth/server-viewer';

export async function GET() {
  const viewer = await getServerViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    seller: viewer.email ?? viewer.uid,
    products: 0,
    ordersToday: 0,
    revenueToday: 0,
  });
}
