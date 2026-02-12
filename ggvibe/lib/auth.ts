import * as client from "openid-client";
import memoize from "memoizee";
import { db } from "./db";
import { users, type UpsertUser } from "./schema";
import { eq } from "drizzle-orm";

const getOidcConfig = memoize(
  async () => {
    const issuer = process.env.ISSUER_URL ?? "https://oidc.example.com";
    const clientId = process.env.OIDC_CLIENT_ID;

    if (!clientId) {
      throw new Error("OIDC_CLIENT_ID is required for login/logout flows.");
    }

    return await client.discovery(new URL(issuer), clientId);
  },
  { maxAge: 3600 * 1000 }
);

export async function getAuthorizationUrl(redirectUri: string) {
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

  return { url: authUrl.href, codeVerifier, state };
}

export async function exchangeCodeForTokens(code: string, redirectUri: string, codeVerifier: string) {
  const config = await getOidcConfig();
  const tokens = await client.authorizationCodeGrant(config, new URL(`${redirectUri}?code=${code}`), {
    pkceCodeVerifier: codeVerifier,
  });
  return tokens;
}

export async function getLogoutUrl(postLogoutRedirectUri: string) {
  const config = await getOidcConfig();
  const clientId = process.env.OIDC_CLIENT_ID;

  if (!clientId) {
    throw new Error("OIDC_CLIENT_ID is required for login/logout flows.");
  }

  return client.buildEndSessionUrl(config, {
    client_id: clientId,
    post_logout_redirect_uri: postLogoutRedirectUri,
  }).href;
}

export async function upsertUser(userData: UpsertUser) {
  const [user] = await db
    .insert(users)
    .values(userData)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: new Date(),
      },
    })
    .returning();
  return user;
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}
