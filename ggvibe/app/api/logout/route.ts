import { NextResponse } from "next/server";
import * as client from "openid-client";
import memoize from "memoizee";
import { headers } from "next/headers";
import { getSession } from "@/lib/session";
import { getBaseUrl } from "@/lib/url/base-url";
import { generateRequestId } from "@/lib/request-id";
import { jsonError } from "@/lib/http/api-response";
import { rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://oidc.example.com"),
      process.env.OIDC_CLIENT_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export async function GET(request: Request) {
  const requestId = generateRequestId();
  const rate = rateLimit(request, {
    limit: 20,
    windowMs: 60_000,
    keyPrefix: "logout",
  });
  const rateHeaders = rateLimitHeaders(rate);
  rateHeaders.set("X-Request-Id", requestId);
  const headersList = await headers();
  const baseUrl = getBaseUrl(request, headersList);

  if (!rate.allowed) {
    return jsonError(
      {
        error: "rate_limited",
        message: "Too many logout attempts. Please try again later.",
        requestId,
      },
      429,
      rateHeaders
    );
  }
  
  try {
    const session = await getSession();
    session.destroy();
    
    const config = await getOidcConfig();
    const logoutUrl = client.buildEndSessionUrl(config, {
      client_id: process.env.OIDC_CLIENT_ID!,
      post_logout_redirect_uri: baseUrl,
    });
    const response = NextResponse.redirect(logoutUrl.href);
    rateHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  } catch (error) {
    console.error("Logout error:", error instanceof Error ? error.message : "Unknown error");
    const response = NextResponse.redirect(baseUrl);
    rateHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  }
}
