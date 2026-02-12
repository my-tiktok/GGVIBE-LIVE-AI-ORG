import { NextResponse } from "next/server";
import { generateRequestId } from "@/lib/request-id";
import {
  clearFailedLoginAttempts,
  getLoginFailureState,
  recordFailedLoginAttempt,
} from "@/lib/security/login-attempts";

const LIMIT = 10;
const WINDOW_MS = 60_000;

function baseHeaders(requestId: string) {
  return {
    "X-Request-Id": requestId,
    "Cache-Control": "no-store",
  };
}

function rateHeaders(
  requestId: string,
  { remaining, resetAt, retryAfter }: { remaining: number; resetAt: number; retryAfter?: number }
) {
  const headers = new Headers(baseHeaders(requestId));
  headers.set("X-RateLimit-Limit", String(LIMIT));
  headers.set("X-RateLimit-Remaining", String(remaining));
  headers.set("X-RateLimit-Reset", String(resetAt));
  if (retryAfter) {
    headers.set("Retry-After", String(retryAfter));
  }

  return headers;
}

function cookieDomain() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return undefined;
  }

  try {
    const hostname = new URL(appUrl).hostname;
    if (hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return undefined;
    }
    return hostname;
  } catch {
    return undefined;
  }
}

function isInvalidCredentialError(errorCode: string | undefined) {
  return errorCode === "INVALID_PASSWORD" || errorCode === "EMAIL_NOT_FOUND" || errorCode === "INVALID_LOGIN_CREDENTIALS";
}

type FirebaseLoginResponse = {
  localId?: string;
  email?: string;
  displayName?: string;
  idToken?: string;
  error?: {
    message?: string;
  };
};

export async function GET() {
  return NextResponse.json(
    {
      error: "method_not_allowed",
      message: "Use POST /api/login",
    },
    {
      status: 405,
      headers: {
        Allow: "POST",
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  const requestId = generateRequestId();
  const state = await getLoginFailureState(request, { limit: LIMIT, windowMs: WINDOW_MS });

  if (state.count >= LIMIT) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Too many login attempts. Please try again later.",
        requestId,
      },
      {
        status: 429,
        headers: rateHeaders(requestId, {
          remaining: 0,
          resetAt: state.resetAt,
          retryAfter: state.retryAfter,
        }),
      }
    );
  }

  let email = "";
  let password = "";

  try {
    const body = (await request.json()) as { email?: string; password?: string };
    email = body.email?.trim() || "";
    password = body.password || "";
  } catch {
    return NextResponse.json(
      {
        error: "invalid_json",
        message: "Request body must be JSON.",
        requestId,
      },
      {
        status: 400,
        headers: rateHeaders(requestId, {
          remaining: state.remaining,
          resetAt: state.resetAt,
        }),
      }
    );
  }

  if (!email || !password) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: "Email and password are required.",
        requestId,
      },
      {
        status: 400,
        headers: rateHeaders(requestId, {
          remaining: state.remaining,
          resetAt: state.resetAt,
        }),
      }
    );
  }

  const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!firebaseApiKey) {
    return NextResponse.json(
      {
        error: "server_misconfigured",
        message: "NEXT_PUBLIC_FIREBASE_API_KEY is required.",
        requestId,
      },
      {
        status: 500,
        headers: rateHeaders(requestId, {
          remaining: state.remaining,
          resetAt: state.resetAt,
        }),
      }
    );
  }

  const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`;

  try {
    const authResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
      cache: "no-store",
    });

    const payload = (await authResponse.json()) as FirebaseLoginResponse;

    if (!authResponse.ok) {
      const errorCode = payload.error?.message;

      if (isInvalidCredentialError(errorCode)) {
        const failedCount = await recordFailedLoginAttempt(request, { windowMs: WINDOW_MS });
        const remaining = Math.max(LIMIT - failedCount, 0);
        const retryAfter = failedCount >= LIMIT ? Math.ceil(WINDOW_MS / 1000) : undefined;

        return NextResponse.json(
          {
            error: "invalid_credentials",
            message: "Invalid email or password.",
            requestId,
          },
          {
            status: 401,
            headers: rateHeaders(requestId, {
              remaining,
              resetAt: Math.ceil((Date.now() + WINDOW_MS) / 1000),
              retryAfter,
            }),
          }
        );
      }

      console.error(`[${requestId}] Firebase login error`, { errorCode });
      return NextResponse.json(
        {
          error: "auth_provider_error",
          message: "Authentication provider error.",
          requestId,
        },
        {
          status: 502,
          headers: rateHeaders(requestId, {
            remaining: state.remaining,
            resetAt: state.resetAt,
          }),
        }
      );
    }

    await clearFailedLoginAttempts(request);

    const response = NextResponse.json(
      {
        ok: true,
        requestId,
        user: {
          uid: payload.localId,
          email: payload.email,
          displayName: payload.displayName || "",
        },
      },
      {
        status: 200,
        headers: rateHeaders(requestId, {
          remaining: LIMIT,
          resetAt: Math.ceil((Date.now() + WINDOW_MS) / 1000),
        }),
      }
    );

    response.cookies.set("ggvibe_firebase_user", encodeURIComponent(JSON.stringify({
      uid: payload.localId,
      email: payload.email || email,
      displayName: payload.displayName || "",
      photoURL: "",
    })), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      domain: cookieDomain(),
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(`[${requestId}] Login transport error`, error);
    return NextResponse.json(
      {
        error: "internal_error",
        message: "Login request failed.",
        requestId,
      },
      {
        status: 500,
        headers: rateHeaders(requestId, {
          remaining: state.remaining,
          resetAt: state.resetAt,
        }),
      }
    );
  }
}
