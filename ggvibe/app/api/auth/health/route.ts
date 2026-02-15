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
    nextauth_secret: !!process.env.NEXTAUTH_SECRET,
    nextauth_url: !!process.env.NEXTAUTH_URL,
    google_provider: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
    github_provider: !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET,
    email_provider: !!process.env.EMAIL_SERVER && !!process.env.EMAIL_FROM,
  };

  const allHealthy = checks.nextauth_secret && checks.nextauth_url;

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
      headers: rateHeaders,
    }
  );
}
