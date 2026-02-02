import { NextResponse } from "next/server";
import * as client from "openid-client";
import memoize from "memoizee";
import { cookies, headers } from "next/headers";
import { getBaseUrl } from "@/lib/url/base-url";
import { generateRequestId } from "@/lib/request-id";
import { isProduction } from "@/lib/env";

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
  const headersList = await headers();
  const baseUrl = getBaseUrl(request, headersList);

  try {
    const redirectUri = `${baseUrl}/api/callback`;

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
    return response;
  } catch (error) {
    console.error(`[${requestId}] Login error:`, {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    const response = NextResponse.redirect(`${baseUrl}/login?error=login_failed`);
    response.headers.set("X-Request-Id", requestId);
    return response;
  }
}
