import { isProduction } from "@/lib/env";

const CANONICAL_URL = "https://ggvibe-chatgpt-ai.org";

export function getCanonicalUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || CANONICAL_URL;
}

export function getBaseUrl(request?: Request, headersList?: Headers): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (headersList && isProduction()) {
    const forwardedHost = headersList.get("x-forwarded-host");
    const forwardedProto = headersList.get("x-forwarded-proto") || "https";
    if (forwardedHost && !forwardedHost.includes("localhost")) {
      return `${forwardedProto}://${forwardedHost}`;
    }
  }

  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }

  if (request) {
    const url = new URL(request.url);
    return `${url.protocol}//${url.host}`;
  }

  const port = process.env.PORT || "3000";
  return `http://localhost:${port}`;
}


export function isCanonicalHost(request: Request): boolean {
  const canonical = getCanonicalUrl();
  const canonicalHost = new URL(canonical).host;
  const requestHost = new URL(request.url).host;
  return requestHost === canonicalHost;
}

export function getCanonicalRedirect(path: string): string {
  return `${getCanonicalUrl()}${path}`;
}
