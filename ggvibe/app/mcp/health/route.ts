import { NextResponse } from 'next/server';
import { buildCorsHeaders } from '@/lib/http/cors';
import { getRequestId } from '@/lib/observability/request-id';
import { logMcpRequest } from '@/lib/observability/mcp-logger';
import { getHealthReport } from '@/lib/env/health';

export async function OPTIONS(request: Request) {
  const requestId = getRequestId(request);
  const cors = buildCorsHeaders(request, requestId);
  return new Response(null, { status: 204, headers: cors.headers });
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const requestId = getRequestId(request);
  const cors = buildCorsHeaders(request, requestId);
  const report = getHealthReport();

  const statusCode = report.status === 'ok' ? 200 : 503;

  const response = NextResponse.json(
    {
      ...report,
      requestId,
    },
    {
      status: statusCode,
      headers: {
        ...Object.fromEntries(cors.headers.entries()),
        'Cache-Control': 'no-store',
        'X-Request-Id': requestId,
      },
    }
  );

  logMcpRequest({
    requestId,
    method: request.method,
    path: '/mcp/health',
    status: statusCode,
    latencyMs: Date.now() - startedAt,
  });

  return response;
}
