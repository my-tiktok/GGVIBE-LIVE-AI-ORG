import { NextResponse } from "next/server";
import * as client from "openid-client";
import memoize from "memoizee";
import { cookies } from "next/headers";
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

export async function GET(request: Request) {
  const requestId = generateRequestId();
  const canonicalUrl = getCanonicalUrl();
  const redirectUri = getCallbackUrl();
  const rate = rateLimit(request, {
    limit: 10,
    windowMs: 60_000,
    keyPrefix: "login",
  });
  const rateHeaders = rateLimitHeaders(rate);
  rateHeaders.set("X-Request-Id", requestId);

  if (!rate.allowed) {
    return jsonError(
      {
        error: "rate_limited",
        message: "Too many login attempts. Please try again later.",
        requestId,
      },
      429,
      rateHeaders
    );
  }

  const requestHost = new URL(request.url).host;
  const forwardedHost = request.headers.get("x-forwarded-host");
  const effectiveHost =
    forwardedHost && forwardedHost !== "0.0.0.0"
      ? forwardedHost.split(",")[0]?.trim()
      : requestHost;
  const canonicalHost = new URL(canonicalUrl).host;

  if (isProduction() && effectiveHost !== canonicalHost) {
    console.log(`[${requestId}] Redirecting to canonical host for login: ${effectiveHost} -> ${canonicalHost}`);
    const response = NextResponse.redirect(`${canonicalUrl}/api/login`);
    response.headers.set("X-Request-Id", requestId);
    rateHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  try {
    const config = await getOidcConfig();
    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const state = client.randomState();

    const authUrl = client.buildAuthorizationUrl(config, {
      redirect_uri: redirectUri,
      scope: "openid email profile",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
    });

    const cookieStore = await cookies();
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction(),
      sameSite: "lax" as const,
      path: "/",
      maxAge: 600,
    };

    cookieStore.set("code_verifier", codeVerifier, cookieOptions);
    cookieStore.set("oauth_state", state, cookieOptions);

    console.log(`[${requestId}] OAuth login initiated, redirect_uri: ${redirectUri}`);

    const response = NextResponse.redirect(authUrl.href);
    response.headers.set("X-Request-Id", requestId);
    rateHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  } catch (error) {
    console.error(`[${requestId}] Login error:`, {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    const response = NextResponse.redirect(`${canonicalUrl}/login?error=login_failed`);
    response.headers.set("X-Request-Id", requestId);
    rateHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  }
}
