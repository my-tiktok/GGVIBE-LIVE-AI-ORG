import { NextResponse } from "next/server";
import * as client from "openid-client";
import memoize from "memoizee";
import { cookies, headers } from "next/headers";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

function getBaseUrl(request: Request, headersList: Headers): string {
  const forwardedHost = headersList.get("x-forwarded-host");
  const forwardedProto = headersList.get("x-forwarded-proto") || "https";
  
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const baseUrl = getBaseUrl(request, headersList);
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
    cookieStore.set("code_verifier", codeVerifier, { 
      httpOnly: true, 
      secure: true, 
      sameSite: "lax",
      maxAge: 600
    });
    cookieStore.set("oauth_state", state, { 
      httpOnly: true, 
      secure: true, 
      sameSite: "lax",
      maxAge: 600
    });
    
    return NextResponse.redirect(authUrl.href);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.redirect(new URL("/?error=login_failed", request.url));
  }
}
