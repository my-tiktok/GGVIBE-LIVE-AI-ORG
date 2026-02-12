import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { generateRequestId } from "@/lib/request-id";
import { jsonError } from "@/lib/http/api-response";
import { rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import { authCookieName, decodeAuthCookie } from "@/lib/security/session-cookie";


function parseServerAuthCookie(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|; )${authCookieName()}=([^;]+)`));
  if (!match) {
    return null;
  }

  const parsed = decodeAuthCookie(match[1]);
  if (!parsed) {
    return null;
  }

  return {
    id: parsed.uid,
    email: parsed.email,
    firstName: parsed.displayName || null,
    profileImageUrl: null,
  };
}

export async function GET(request: Request) {
  const requestId = generateRequestId();
  const rate = rateLimit(request, {
    limit: 30,
    windowMs: 60_000,
    keyPrefix: "v1-auth-user",
  });
  const rateHeaders = rateLimitHeaders(rate);
  rateHeaders.set("X-Request-Id", requestId);

  const headers = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "X-Request-Id": requestId,
  };
  const combinedHeaders = { ...headers, ...Object.fromEntries(rateHeaders) };

  try {
    if (!rate.allowed) {
      return jsonError(
        {
          error: "rate_limited",
          message: "Too many requests. Please try again later.",
          requestId,
        },
        429,
        combinedHeaders
      );
    }

    const session = await getSession();

    if (!session.isLoggedIn) {
      const firebaseUser = parseServerAuthCookie(request);
      if (firebaseUser) {
        return NextResponse.json(
          {
            authenticated: true,
            user: firebaseUser,
            requestId,
          },
          { headers: combinedHeaders }
        );
      }

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
        user: {
          id: session.userId,
          email: session.email,
          firstName: session.firstName,
          lastName: session.lastName,
          profileImageUrl: session.profileImageUrl,
        },
        requestId,
      },
      { headers: combinedHeaders }
    );
  } catch (error) {
    console.error(`[${requestId}] Error fetching user:`, error);
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
