const DEFAULT_CANONICAL_URL = "https://www.ggvibe-chatgpt-ai.org";

function normalizeUrl(value: string): string {
  return value.replace(/\/$/, "");
}

export function getCanonicalUrl(request?: Request): string {
  if (process.env.NEXTAUTH_URL) {
    return normalizeUrl(process.env.NEXTAUTH_URL);
  }

  if (request) {
    const url = new URL(request.url);
    return `${url.protocol}//${url.host}`;
  }

  return DEFAULT_CANONICAL_URL;
}

export function getBaseUrl(request?: Request): string {
  return getCanonicalUrl(request);
}

export function isCanonicalHost(request: Request): boolean {
  const canonical = getCanonicalUrl(request);
  return new URL(canonical).host === new URL(request.url).host;
}

export function getCanonicalRedirect(path: string, request?: Request): string {
  return `${getCanonicalUrl(request)}${path}`;
}
