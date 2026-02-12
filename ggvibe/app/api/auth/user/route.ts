import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { generateRequestId } from "@/lib/request-id";
import { jsonError } from "@/lib/http/api-response";
import { rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";


function parseFirebaseUserCookie(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|; )ggvibe_firebase_user=([^;]+)/);
  if (!match) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]));
    if (!parsed?.uid) {
      return null;
    }

    return {
      id: parsed.uid,
      email: parsed.email || null,
      firstName: parsed.displayName || null,
      profileImageUrl: parsed.photoURL || null,
    };
  } catch {
    return null;
  }
}

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
  
  try {
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

    const session = await getSession();
    
    if (!session.isLoggedIn || !session.userId) {
      const firebaseUser = parseFirebaseUserCookie(request);
      if (firebaseUser) {
        return NextResponse.json(
          { authenticated: true, user: firebaseUser, requestId },
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
    
    const now = Math.floor(Date.now() / 1000);
    if (session.expiresAt && now > session.expiresAt) {
      session.destroy();
      return jsonError(
        {
          error: "session_expired",
          message: "Session expired",
          requestId,
        },
        401,
        combinedHeaders
      );
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, session.userId));
    
    if (!user) {
      session.destroy();
      return jsonError(
        {
          error: "user_not_found",
          message: "User not found",
          requestId,
        },
        401,
        combinedHeaders
      );
    }
    
    return NextResponse.json(
      { authenticated: true, user, requestId },
      { headers: combinedHeaders }
    );
  } catch (error) {
    console.error("Error fetching user:", error instanceof Error ? error.message : "Unknown error");
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
