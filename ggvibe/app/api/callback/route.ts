import { NextResponse } from "next/server";
import * as client from "openid-client";
import memoize from "memoizee";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { getSession } from "@/lib/session";
import { getBaseUrl } from "@/lib/url/base-url";
import { generateRequestId } from "@/lib/request-id";

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
  const headersList = await headers();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  const baseUrl = getBaseUrl(request, headersList);

  if (errorParam) {
    console.error(`[${requestId}] OAuth provider error: ${errorParam}`, {
      description: errorDescription,
    });
    return safeRedirect(`${baseUrl}/login?error=provider_error`, requestId);
  }

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get("code_verifier")?.value;
  const savedState = cookieStore.get("oauth_state")?.value;

  if (!code) {
    console.error(`[${requestId}] Missing authorization code`);
    return safeRedirect(`${baseUrl}/login?error=invalid_callback`, requestId);
  }

  if (!codeVerifier) {
    console.error(`[${requestId}] Missing code_verifier cookie`);
    return safeRedirect(`${baseUrl}/login?error=invalid_callback`, requestId);
  }

  if (!state || state !== savedState) {
    console.error(`[${requestId}] State mismatch`);
    return safeRedirect(`${baseUrl}/login?error=invalid_callback`, requestId);
  }

  try {
    const config = await getOidcConfig();

    const tokens = await client.authorizationCodeGrant(config, url, {
      pkceCodeVerifier: codeVerifier,
      expectedState: savedState,
    });

    const claims = tokens.claims() as ReplitClaims;

    if (!claims?.sub) {
      console.error(`[${requestId}] Invalid claims: missing sub`);
      return safeRedirect(`${baseUrl}/login?error=invalid_claims`, requestId);
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
    return safeRedirect(`${baseUrl}/auth/success`, requestId);
  } catch (error) {
    const isInvalidGrant =
      error instanceof Error &&
      (error.message.includes("invalid_grant") ||
        error.message.includes("grant") ||
        error.message.includes("expired"));

    if (isInvalidGrant) {
      console.error(`[${requestId}] Invalid grant error`);
      return safeRedirect(`${baseUrl}/login?error=invalid_callback`, requestId);
    }

    console.error(`[${requestId}] OAuth callback error:`, {
      type: error instanceof Error ? error.constructor.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return safeRedirect(`${baseUrl}/login?error=auth_failed`, requestId);
  }
}
