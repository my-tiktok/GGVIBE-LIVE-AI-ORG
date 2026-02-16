import { NextResponse } from 'next/server';
import { buildCorsHeaders } from '@/lib/http/cors';
import { getRequestId } from '@/lib/observability/request-id';
import { logMcpRequest } from '@/lib/observability/mcp-logger';

const REQUIRED_ENV_NAMES = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

export async function OPTIONS(request: Request) {
  const requestId = getRequestId(request);
  const cors = buildCorsHeaders(request, requestId);
  return new Response(null, { status: 204, headers: cors.headers });
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const requestId = getRequestId(request);
  const cors = buildCorsHeaders(request, requestId);

  const missing = REQUIRED_ENV_NAMES.filter((name) => !process.env[name]);

  const response = NextResponse.json(
    {
      ok: true,
      status: missing.length === 0 ? 'healthy' : 'degraded',
      missing,
      requestId,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
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
    status: 200,
    latencyMs: Date.now() - startedAt,
  });

  return response;
}
