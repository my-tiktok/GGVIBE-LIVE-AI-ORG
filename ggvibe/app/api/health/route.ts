import { NextResponse } from 'next/server';
import { getHealthReport } from '@/lib/env/health';

export async function GET() {
  const report = getHealthReport();

  return NextResponse.json(report, {
    status: report.status === 'ok' ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
