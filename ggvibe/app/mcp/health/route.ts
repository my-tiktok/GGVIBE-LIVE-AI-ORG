import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http/api-response";
import { buildCorsHeaders } from "@/lib/http/cors";
import { rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import { getRequestId } from "@/lib/observability/request-id";
import { logMcpRequest } from "@/lib/observability/mcp-logger";
import { validateRuntimeEnv } from "@/lib/env/validate";

function buildResponseHeaders(
  baseHeaders: Headers,
  rateHeaders: Headers
): Headers {
  const headers = new Headers(baseHeaders);
  rateHeaders.forEach((value, key) => headers.set(key, value));
  headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  return headers;
}

export async function OPTIONS(request: Request) {
  const requestId = getRequestId(request);
  const cors = buildCorsHeaders(request, requestId);
  if (!cors.ok) {
    return cors.response;
  }
  return new Response(null, { status: 204, headers: cors.headers });
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const requestId = getRequestId(request);
  const cors = buildCorsHeaders(request, requestId);
  if (!cors.ok) {
    return cors.response;
  }

  const rate = rateLimit(request, {
    limit: 30,
    windowMs: 60_000,
    keyPrefix: "mcp-health",
  });
  const rateHeaders = rateLimitHeaders(rate);
  const missingEnv = validateRuntimeEnv();

  if (!rate.allowed) {
    const response = jsonError(
      {
        error: "rate_limited",
        message: "Too many requests. Please try again later.",
        requestId,
      },
      429,
      buildResponseHeaders(cors.headers, rateHeaders)
    );
    logMcpRequest({
      requestId,
      method: request.method,
      path: "/mcp/health",
      status: 429,
      latencyMs: Date.now() - startedAt,
    });
    return response;
  }

  const status = missingEnv.length > 0 ? "degraded" : "healthy";
  const response = NextResponse.json(
    {
      status,
      requestId,
      missingEnv,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: buildResponseHeaders(cors.headers, rateHeaders),
    }
  );
  logMcpRequest({
    requestId,
    method: request.method,
    path: "/mcp/health",
    status: 200,
    latencyMs: Date.now() - startedAt,
  });
  return response;
}
