import { NextResponse } from "next/server";
import * as client from "openid-client";
import memoize from "memoizee";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { getSession } from "@/lib/session";

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
  const headersList = await headers();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const baseUrl = getBaseUrl(request, headersList);
  
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
    
    const claims = tokens.claims();
    
    if (!claims || !claims.sub) {
      return NextResponse.redirect(`${baseUrl}/?error=invalid_claims`);
    }
    
    await db
      .insert(users)
      .values({
        id: claims.sub,
        email: claims.email as string | undefined,
        firstName: (claims as any).first_name,
        lastName: (claims as any).last_name,
        profileImageUrl: (claims as any).profile_image_url,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: claims.email as string | undefined,
          firstName: (claims as any).first_name,
          lastName: (claims as any).last_name,
          profileImageUrl: (claims as any).profile_image_url,
          updatedAt: new Date(),
        },
      });
    
    cookieStore.delete("code_verifier");
    cookieStore.delete("oauth_state");
    
    const session = await getSession();
    session.userId = claims.sub;
    session.email = claims.email as string | undefined;
    session.firstName = (claims as any).first_name;
    session.lastName = (claims as any).last_name;
    session.profileImageUrl = (claims as any).profile_image_url;
    session.accessToken = tokens.access_token;
    session.expiresAt = claims.exp;
    session.isLoggedIn = true;
    await session.save();
    
    return NextResponse.redirect(baseUrl);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(`${baseUrl}/?error=auth_failed`);
  }
}
