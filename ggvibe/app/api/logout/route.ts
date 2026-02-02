import { NextResponse } from "next/server";
import * as client from "openid-client";
import memoize from "memoizee";
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  
  try {
    const session = await getSession();
    session.destroy();
    
    const config = await getOidcConfig();
    const logoutUrl = client.buildEndSessionUrl(config, {
      client_id: process.env.REPL_ID!,
      post_logout_redirect_uri: baseUrl,
    });
    return NextResponse.redirect(logoutUrl.href);
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.redirect(baseUrl);
  }
}
