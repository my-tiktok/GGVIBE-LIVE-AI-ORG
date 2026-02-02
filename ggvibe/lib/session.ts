import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { isProduction } from "@/lib/env";

export interface SessionData {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  accessToken?: string;
  expiresAt?: number;
  isLoggedIn: boolean;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET or NEXTAUTH_SECRET is required");
  }
  if (secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  return secret;
}

function getCookieDomain(): string | undefined {
  const domain = process.env.SESSION_COOKIE_DOMAIN;
  if (domain) {
    console.warn(
      `[SESSION] SESSION_COOKIE_DOMAIN is set to "${domain}". ` +
      `This will scope cookies to that domain. ` +
      `Remove this env var for host-only cookies (recommended).`
    );
    return domain;
  }
  return undefined;
}

export const sessionOptions: SessionOptions = {
  password: getSessionSecret(),
  cookieName: "ggvibe_session",
  cookieOptions: {
    secure: isProduction(),
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    domain: getCookieDomain(),
  },
};

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  
  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
  }
  
  return session;
}
