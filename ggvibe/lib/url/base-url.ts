const CANONICAL_URL = 'https://www.ggvibe-chatgpt-ai.org';

export function getCanonicalUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || CANONICAL_URL;
}

export function getBaseUrl(request?: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }

  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  }

  if (request) {
    const url = new URL(request.url);
    return `${url.protocol}//${url.host}`;
  }

  const port = process.env.PORT || '5000';
  return `http://localhost:${port}`;
}

export function getCallbackUrl(provider: 'google' | 'github' | 'email'): string {
  return `${getCanonicalUrl()}/api/auth/callback/${provider}`;
}

export function isCanonicalHost(request: Request): boolean {
  return new URL(request.url).host === new URL(getCanonicalUrl()).host;
}

export function getCanonicalRedirect(path: string): string {
  return `${getCanonicalUrl()}${path}`;
}
