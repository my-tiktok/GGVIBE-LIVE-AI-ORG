import { NextResponse } from "next/server";
import { generateRequestId } from "@/lib/http/result";
import { jsonError } from "@/lib/http/api-response";
import { rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";

export async function GET(request: Request) {
  const requestId = generateRequestId();
  const rate = rateLimit(request, {
    limit: 30,
    windowMs: 60_000,
    keyPrefix: "auth-health",
  });
  const rateHeaders = rateLimitHeaders(rate);
  rateHeaders.set("X-Request-Id", requestId);
  
  const checks = {
    session_secret: !!process.env.SESSION_SECRET || !!process.env.NEXTAUTH_SECRET,
    database_url: !!process.env.DATABASE_URL,
    oidc_client_id: !!process.env.OIDC_CLIENT_ID,
    issuer_url: !!process.env.ISSUER_URL,
  };

  const allHealthy = Object.values(checks).every(Boolean);

  if (!rate.allowed) {
    return jsonError(
      {
        error: "rate_limited",
        message: "Too many requests. Please try again later.",
        requestId,
      },
      429,
      rateHeaders
    );
  }

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      requestId,
      checks,
      timestamp: new Date().toISOString(),
    },
    { 
      status: allHealthy ? 200 : 503,
      headers: rateHeaders
    }
  );
}
