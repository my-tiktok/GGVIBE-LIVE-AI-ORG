import { NextResponse } from 'next/server';
import { buildCorsHeaders } from '@/lib/http/cors';
import { getRequestId } from '@/lib/observability/request-id';
import { logMcpRequest } from '@/lib/observability/mcp-logger';

export async function OPTIONS(request: Request) {
  const requestId = getRequestId(request);
  const cors = buildCorsHeaders(request, requestId);
  return new Response(null, { status: 204, headers: cors.headers });
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const requestId = getRequestId(request);
  const cors = buildCorsHeaders(request, requestId);

  const response = NextResponse.json(
    {
      name: 'GGVIBE MCP',
      status: 'ok',
      auth: 'none',
      tools: [
        {
          name: 'health',
          path: '/mcp/health',
          method: 'GET',
          description: 'MCP health and environment readiness summary',
          auth: 'none',
        },
        {
          name: 'chat_stream',
          path: '/api/v1/chat/stream',
          method: 'POST',
          description: 'Chat stream endpoint',
          auth: 'session_or_token',
        },
      ],
      timestamp: new Date().toISOString(),
      requestId,
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
    path: '/mcp',
    status: 200,
    latencyMs: Date.now() - startedAt,
  });

  return response;
}
