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

export const sessionOptions: SessionOptions = {
  password: getSessionSecret(),
  cookieName: "ggvibe_session",
  cookieOptions: {
    secure: isProduction(),
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
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
