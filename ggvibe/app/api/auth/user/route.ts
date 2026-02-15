import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { buildAuthOptions } from "@/lib/auth";
import { generateRequestId } from "@/lib/request-id";
import { jsonError } from "@/lib/http/api-response";
import { rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";

const headers = (requestId: string) => ({
  "X-Request-Id": requestId,
  "Cache-Control": "no-cache, no-store, must-revalidate",
});

export async function GET(request: Request) {
  const requestId = generateRequestId();
  const rate = rateLimit(request, {
    limit: 30,
    windowMs: 60_000,
    keyPrefix: "auth-user",
  });
  const rateHeaders = rateLimitHeaders(rate);
  rateHeaders.set("X-Request-Id", requestId);
  const combinedHeaders = { ...headers(requestId), ...Object.fromEntries(rateHeaders) };

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

  try {
    const session = await getServerSession(buildAuthOptions());

    if (!session?.user) {
      return jsonError(
        {
          error: "unauthorized",
          message: "Not authenticated",
          requestId,
        },
        401,
        combinedHeaders
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: session.user,
        requestId,
      },
      { headers: combinedHeaders }
    );
  } catch {
    return jsonError(
      {
        error: "internal_error",
        message: "Failed to fetch user",
        requestId,
      },
      500,
      combinedHeaders
    );
  }
}
