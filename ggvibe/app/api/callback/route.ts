import { NextResponse } from "next/server";
import * as client from "openid-client";
import memoize from "memoizee";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

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
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const baseUrl = `${url.protocol}//${url.host}`;
  
  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get("code_verifier")?.value;
  const savedState = cookieStore.get("oauth_state")?.value;
  
  if (!code || !codeVerifier || !state || state !== savedState) {
    return NextResponse.redirect(`${baseUrl}/?error=invalid_callback`);
  }
  
  try {
    const config = await getOidcConfig();
    const redirectUri = `${baseUrl}/api/callback`;
    
    const tokens = await client.authorizationCodeGrant(config, url, {
      pkceCodeVerifier: codeVerifier,
      expectedState: savedState,
    });
    
    const claims = tokens.claims();
    
    if (claims) {
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
    }
    
    cookieStore.delete("code_verifier");
    cookieStore.delete("oauth_state");
    
    const sessionData = {
      userId: claims?.sub,
      email: claims?.email,
      firstName: (claims as any)?.first_name,
      lastName: (claims as any)?.last_name,
      profileImageUrl: (claims as any)?.profile_image_url,
      accessToken: tokens.access_token,
      expiresAt: claims?.exp,
    };
    
    cookieStore.set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });
    
    return NextResponse.redirect(baseUrl);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(`${baseUrl}/?error=auth_failed`);
  }
}
