import { NextResponse } from "next/server";
import * as client from "openid-client";
import memoize from "memoizee";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { getSession } from "@/lib/session";
import { getCanonicalUrl, getCallbackUrl } from "@/lib/url/base-url";
import { generateRequestId } from "@/lib/request-id";
import { isProduction } from "@/lib/env";
import { jsonError } from "@/lib/http/api-response";
import { rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

interface ReplitClaims {
  sub: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  exp?: number;
}

function safeRedirect(url: string, requestId: string): NextResponse {
  const response = NextResponse.redirect(url);
  response.headers.set("X-Request-Id", requestId);
  return response;
}

export async function GET(request: Request) {
  const requestId = generateRequestId();
  const canonicalUrl = getCanonicalUrl();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  const rate = rateLimit(request, {
    limit: 20,
    windowMs: 60_000,
    keyPrefix: "callback",
  });
  const rateHeaders = rateLimitHeaders(rate);
  rateHeaders.set("X-Request-Id", requestId);

  const requestHost = url.host;
  const canonicalHost = new URL(canonicalUrl).host;

  if (isProduction() && requestHost !== canonicalHost) {
    console.log(`[${requestId}] Callback on non-canonical host: ${requestHost}. Preserving params and redirecting.`);
    const canonicalCallback = `${canonicalUrl}/api/callback${url.search}`;
    const response = safeRedirect(canonicalCallback, requestId);
    rateHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  if (errorParam) {
    console.error(`[${requestId}] OAuth provider error: ${errorParam}`, {
      description: errorDescription,
    });
    const response = safeRedirect(`${canonicalUrl}/login?error=provider_error`, requestId);
    rateHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

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

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get("code_verifier")?.value;
  const savedState = cookieStore.get("oauth_state")?.value;

  if (!code) {
    console.error(`[${requestId}] Missing authorization code`);
    const response = safeRedirect(`${canonicalUrl}/login?error=invalid_callback`, requestId);
    rateHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  if (!codeVerifier) {
    console.error(`[${requestId}] Missing code_verifier cookie - this usually means cookies were set on a different domain`);
    const response = safeRedirect(`${canonicalUrl}/login?error=invalid_callback`, requestId);
    rateHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  if (!state || state !== savedState) {
    console.error(`[${requestId}] State mismatch - expected: ${savedState?.slice(0,8)}..., got: ${state?.slice(0,8)}...`);
    const response = safeRedirect(`${canonicalUrl}/login?error=invalid_callback`, requestId);
    rateHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  try {
    const config = await getOidcConfig();
    const expectedRedirectUri = getCallbackUrl();

    const callbackUrl = new URL(expectedRedirectUri);
    callbackUrl.search = url.search;

    const tokens = await client.authorizationCodeGrant(config, callbackUrl, {
      pkceCodeVerifier: codeVerifier,
      expectedState: savedState,
    });

    const claims = tokens.claims() as ReplitClaims;

    if (!claims?.sub) {
      console.error(`[${requestId}] Invalid claims: missing sub`);
      const response = safeRedirect(`${canonicalUrl}/login?error=invalid_claims`, requestId);
      rateHeaders.forEach((value, key) => response.headers.set(key, value));
      return response;
    }

    await db
      .insert(users)
      .values({
        id: claims.sub,
        email: claims.email,
        firstName: claims.first_name,
        lastName: claims.last_name,
        profileImageUrl: claims.profile_image_url,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: claims.email,
          firstName: claims.first_name,
          lastName: claims.last_name,
          profileImageUrl: claims.profile_image_url,
          updatedAt: new Date(),
        },
      });

    cookieStore.delete("code_verifier");
    cookieStore.delete("oauth_state");

    const session = await getSession();
    session.userId = claims.sub;
    session.email = claims.email;
    session.firstName = claims.first_name;
    session.lastName = claims.last_name;
    session.profileImageUrl = claims.profile_image_url;
    session.accessToken = tokens.access_token;
    session.expiresAt = claims.exp;
    session.isLoggedIn = true;
    await session.save();

    console.log(`[${requestId}] OAuth success for user: ${claims.sub}`);
    const response = safeRedirect(`${canonicalUrl}/auth/success`, requestId);
    rateHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  } catch (error) {
    const isInvalidGrant =
      error instanceof Error &&
      (error.message.includes("invalid_grant") ||
        error.message.includes("grant") ||
        error.message.includes("expired"));

    if (isInvalidGrant) {
      console.error(`[${requestId}] Invalid grant error`);
      const response = safeRedirect(`${canonicalUrl}/login?error=invalid_callback`, requestId);
      rateHeaders.forEach((value, key) => response.headers.set(key, value));
      return response;
    }

    console.error(`[${requestId}] OAuth callback error:`, {
      type: error instanceof Error ? error.constructor.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    const response = safeRedirect(`${canonicalUrl}/login?error=auth_failed`, requestId);
    rateHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  }
}
