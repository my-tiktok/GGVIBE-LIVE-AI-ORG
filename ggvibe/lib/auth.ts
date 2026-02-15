/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from "crypto";
import type { Adapter, AdapterAccount } from "next-auth/adapters";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";

const canonicalUrl = process.env.NEXTAUTH_URL || "https://www.ggvibe-chatgpt-ai.org";

type MemorySession = {
  sessionToken: string;
  userId: string;
  expires: Date;
};

type MemoryVerificationToken = {
  identifier: string;
  token: string;
  expires: Date;
};

const users = new Map<string, any>();
const usersByEmail = new Map<string, string>();
const sessions = new Map<string, MemorySession>();
const accounts = new Map<string, AdapterAccount>();
const verificationTokens = new Map<string, MemoryVerificationToken>();

const accountKey = (provider: string, providerAccountId: string) => `${provider}:${providerAccountId}`;
const verificationKey = (identifier: string, token: string) => `${identifier}:${token}`;

function createMemoryAdapter(): Adapter {
  return {
    async createUser(data: any) {
      const user = { id: data.id ?? randomUUID(), ...data };
      users.set(user.id, user);
      if (user.email) usersByEmail.set(user.email, user.id);
      return user;
    },
    async getUser(id: string) {
      return users.get(id) ?? null;
    },
    async getUserByEmail(email: string) {
      const id = usersByEmail.get(email);
      return id ? users.get(id) ?? null : null;
    },
    async getUserByAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      const acct = accounts.get(accountKey(provider, providerAccountId));
      if (!acct) return null;
      return users.get(acct.userId) ?? null;
    },
    async updateUser(data: any) {
      if (!data.id) throw new Error("User id is required");
      const existing = users.get(data.id);
      if (!existing) throw new Error("User not found");
      const updated = { ...existing, ...data };
      users.set(data.id, updated);
      if (updated.email) usersByEmail.set(updated.email, updated.id);
      return updated;
    },
    async deleteUser(id: string) {
      const user = users.get(id);
      if (!user) return null;
      users.delete(id);
      if (user.email) usersByEmail.delete(user.email);
      return user;
    },
    async linkAccount(account: AdapterAccount) {
      accounts.set(accountKey(account.provider, account.providerAccountId), account);
      return account;
    },
    async unlinkAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      accounts.delete(accountKey(provider, providerAccountId));
    },
    async createSession(session: any) {
      sessions.set(session.sessionToken, session);
      return session;
    },
    async getSessionAndUser(sessionToken: string) {
      const session = sessions.get(sessionToken);
      if (!session) return null;
      const user = users.get(session.userId);
      if (!user) return null;
      return { session, user };
    },
    async updateSession(session: any) {
      sessions.set(session.sessionToken, session);
      return session;
    },
    async deleteSession(sessionToken: string) {
      sessions.delete(sessionToken);
    },
    async createVerificationToken(token: any) {
      verificationTokens.set(verificationKey(token.identifier, token.token), token);
      return token;
    },
    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      const key = verificationKey(identifier, token);
      const existing = verificationTokens.get(key) ?? null;
      verificationTokens.delete(key);
      return existing;
    },
  } as any;
}

export function buildAuthOptions(): NextAuthOptions {
  return {
    secret: process.env.NEXTAUTH_SECRET,
    adapter: createMemoryAdapter(),
    session: { strategy: "database" },
    pages: { signIn: "/login" },
    providers: [
      GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID ?? "", clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "", allowDangerousEmailAccountLinking: true }),
      GitHubProvider({ clientId: process.env.GITHUB_CLIENT_ID ?? "", clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "", allowDangerousEmailAccountLinking: true }),
      EmailProvider({ server: process.env.EMAIL_SERVER, from: process.env.EMAIL_FROM }),
    ],
    callbacks: {
      async redirect({ url, baseUrl }) {
        const safeBaseUrl = canonicalUrl || baseUrl;
        if (url.startsWith("/")) return `${safeBaseUrl}${url}`;
        try {
          const target = new URL(url);
          const allowed = new URL(safeBaseUrl);
          if (target.origin === allowed.origin) return url;
        } catch {
          return safeBaseUrl;
        }
        return safeBaseUrl;
      },
    },
  };
}
