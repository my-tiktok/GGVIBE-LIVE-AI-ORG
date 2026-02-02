import { isProduction } from "@/lib/env";

export function getBaseUrl(request?: Request, headersList?: Headers): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (process.env.REPLIT_DEPLOYMENT_URL) {
    const url = process.env.REPLIT_DEPLOYMENT_URL;
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    return normalized.replace(/\/$/, "");
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

  const port = process.env.PORT || "5000";
  return `http://localhost:${port}`;
}

export function getCallbackUrl(request?: Request, headersList?: Headers): string {
  return `${getBaseUrl(request, headersList)}/api/callback`;
}

export function getCanonicalUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://ggvibe-chatgpt-ai.org";
}
