import { createHmac, timingSafeEqual } from "node:crypto";

type AuthCookiePayload = {
  uid: string;
  email: string;
  displayName: string;
};

const COOKIE_NAME = "ggvibe_auth";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    return null;
  }
  return secret;
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function authCookieName() {
  return COOKIE_NAME;
}

export function encodeAuthCookie(payload: AuthCookiePayload): string | null {
  const secret = getSecret();
  if (!secret) {
    return null;
  }

  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = sign(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export function decodeAuthCookie(value: string | undefined): AuthCookiePayload | null {
  if (!value) {
    return null;
  }

  const secret = getSecret();
  if (!secret) {
    return null;
  }

  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expected = sign(encodedPayload, secret);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as AuthCookiePayload;
    if (!parsed.uid || !parsed.email) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
