import { NextResponse } from "next/server";
import { getCanonicalUrl } from "@/lib/url/base-url";
import { jsonError } from "@/lib/http/api-response";
import { rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import { buildCorsHeaders } from "@/lib/http/cors";
import { getRequestId } from "@/lib/observability/request-id";
import { logMcpRequest } from "@/lib/observability/mcp-logger";
import { validateRuntimeEnv } from "@/lib/env/validate";

interface McpEndpoint {
  name: string;
  method: "GET" | "POST" | "STREAM";
  path: string;
  description: string;
  authentication?: string;
}

function withHeaders(headers: Headers, extras?: HeadersInit) {
  if (!extras) {
    return headers;
  }
  Object.entries(extras).forEach(([key, value]) => {
    headers.set(key, String(value));
  });
  return headers;
}

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
  const headers = withHeaders(cors.headers);
  return new Response(null, { status: 204, headers });
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
    keyPrefix: "mcp",
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
      path: "/mcp",
      status: 429,
      latencyMs: Date.now() - startedAt,
    });
    return response;
  }

  const baseUrl = getCanonicalUrl();

  const endpoints: McpEndpoint[] = [
    {
      name: "Health Check",
      method: "GET",
      path: "/api/health",
      description: "Verify service health and configuration status",
    },
    {
      name: "Chat Stream",
      method: "STREAM",
      path: "/api/v1/chat/stream",
      description: "Server-Sent Events (SSE) streaming endpoint for real-time chat",
      authentication: "Session cookie",
    },
    {
      name: "User Authentication",
      method: "GET",
      path: "/api/auth/user",
      description: "Get current authenticated user",
      authentication: "Session cookie",
    },
    {
      name: "Login",
      method: "GET",
      path: "/api/login",
      description: "Initiate OAuth login flow",
    },
    {
      name: "MCP Health",
      method: "GET",
      path: "/mcp/health",
      description: "MCP health endpoint",
    },
    {
      name: "MCP Version",
      method: "GET",
      path: "/mcp/version",
      description: "MCP version endpoint",
    },
  ];

  const status = missingEnv.length > 0 ? "degraded" : "healthy";
  const response = NextResponse.json(
    {
      name: "GGVIBE Chatbot",
      version: "1.0.0",
      status,
      description: "AI-powered chatbot application for OpenAI ChatGPT integration",
      baseUrl,
      endpoints,
      timestamp: new Date().toISOString(),
    },
    {
      headers: buildResponseHeaders(cors.headers, rateHeaders),
    }
  );
  logMcpRequest({
    requestId,
    method: request.method,
    path: "/mcp",
    status: 200,
    latencyMs: Date.now() - startedAt,
  });
  return response;
}
