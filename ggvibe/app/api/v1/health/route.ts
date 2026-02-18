import { NextResponse } from 'next/server';
import { generateRequestId } from '@/lib/request-id';
import { getHealthReport } from '@/lib/env/health';

export async function GET() {
  const requestId = generateRequestId();
  const report = getHealthReport();

  return NextResponse.json(
    {
      ...report,
      requestId,
    },
    {
      status: report.status === 'ok' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
        'X-Request-Id': requestId,
      },
    }
  );
}
