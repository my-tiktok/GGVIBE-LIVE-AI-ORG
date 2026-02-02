import { NextResponse } from "next/server";
import * as client from "openid-client";
import memoize from "memoizee";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { getSession } from "@/lib/session";
import { getBaseUrl } from "@/lib/url/base-url";

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

export async function GET(request: Request) {
  const headersList = await headers();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");
  const baseUrl = getBaseUrl(request, headersList);
  
  if (errorParam) {
    console.error("OAuth error from provider:", errorParam);
    return NextResponse.redirect(`${baseUrl}/?error=provider_error`);
  }
  
  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get("code_verifier")?.value;
  const savedState = cookieStore.get("oauth_state")?.value;
  
  if (!code || !codeVerifier || !state || state !== savedState) {
    return NextResponse.redirect(`${baseUrl}/?error=invalid_callback`);
  }
  
  try {
    const config = await getOidcConfig();
    
    const tokens = await client.authorizationCodeGrant(config, url, {
      pkceCodeVerifier: codeVerifier,
      expectedState: savedState,
    });
    
    const claims = tokens.claims() as ReplitClaims;
    
    if (!claims?.sub) {
      return NextResponse.redirect(`${baseUrl}/?error=invalid_claims`);
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
    
    return NextResponse.redirect(baseUrl);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("OAuth callback error:", errorMessage);
    return NextResponse.redirect(`${baseUrl}/?error=auth_failed`);
  }
}
