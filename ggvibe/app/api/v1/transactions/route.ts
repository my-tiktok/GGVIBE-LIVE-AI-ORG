import { NextResponse } from 'next/server';
import { getServerViewer } from '@/lib/auth/server-viewer';

export async function GET() {
  const viewer = await getServerViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    transactions: [],
    message: 'No transactions yet.',
  });
}
