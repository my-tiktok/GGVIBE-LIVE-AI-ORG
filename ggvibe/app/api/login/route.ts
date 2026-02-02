import { NextResponse } from "next/server";
import * as client from "openid-client";
import memoize from "memoizee";
import { cookies } from "next/headers";

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
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
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
}
