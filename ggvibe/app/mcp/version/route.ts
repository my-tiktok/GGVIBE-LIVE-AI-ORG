import { NextResponse } from 'next/server';
import pkg from '../../../package.json';
import { jsonError } from '@/lib/http/api-response';
import { buildCorsHeaders } from '@/lib/http/cors';
import { rateLimit, rateLimitHeaders } from '@/lib/security/rate-limit';
import { getRequestId } from '@/lib/observability/request-id';
import { logMcpRequest } from '@/lib/observability/mcp-logger';

function buildResponseHeaders(baseHeaders: Headers, rateHeaders: Headers): Headers {
  const headers = new Headers(baseHeaders);
  rateHeaders.forEach((value, key) => headers.set(key, value));
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  return headers;
}

export async function OPTIONS(request: Request) {
  const requestId = getRequestId(request);
  const cors = buildCorsHeaders(request, requestId);
  return new Response(null, { status: 204, headers: cors.headers });
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const requestId = getRequestId(request);
  const cors = buildCorsHeaders(request, requestId);
  let rateHeaders = new Headers();

  try {
    const rate = await rateLimit(request, {
      limit: 60,
      windowMs: 60_000,
      keyPrefix: 'mcp-version',
    });
    rateHeaders = rateLimitHeaders(rate);

    if (!rate.allowed) {
      const response = jsonError(
        {
          error: 'rate_limited',
          message: 'Too many requests. Please try again later.',
          requestId,
        },
        429,
        buildResponseHeaders(cors.headers, rateHeaders)
      );
      logMcpRequest({
        requestId,
        method: request.method,
        path: '/mcp/version',
        status: 429,
        latencyMs: Date.now() - startedAt,
      });
      return response;
    }
  } catch {
    // allow /mcp/version to remain available even if limiter backend is unavailable
  }

  const response = NextResponse.json(
    {
      name: pkg.name,
      version: pkg.version,
      requestId,
      timestamp: new Date().toISOString(),
    },
    { headers: buildResponseHeaders(cors.headers, rateHeaders) }
  );
  logMcpRequest({
    requestId,
    method: request.method,
    path: '/mcp/version',
    status: 200,
    latencyMs: Date.now() - startedAt,
  });
  return response;
}
