import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATH_PREFIXES = ['/chat', '/wallet', '/transactions', '/seller', '/admin', '/dashboard', '/settings'];
const CANONICAL_HOST = 'www.ggvibe-chatgpt-ai.org';

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function hasAuthCookie(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get('__session')?.value ||
      request.cookies.get('__Secure-authjs.session-token')?.value ||
      request.cookies.get('authjs.session-token')?.value
  );
}

function needsCanonicalRedirect(host: string): boolean {
  return host === 'ggvibe-chatgpt-ai.org' || host.endsWith('.vercel.app');
}

export function middleware(request: NextRequest) {
  const { pathname, search, host } = request.nextUrl;

  if (process.env.NODE_ENV === 'production' && needsCanonicalRedirect(host)) {
    const target = new URL(request.url);
    target.host = CANONICAL_HOST;
    target.protocol = 'https:';
    return NextResponse.redirect(target, 308);
  }

  if (pathname.startsWith('/mcp') || pathname.startsWith('/.well-known')) {
    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (hasAuthCookie(request)) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!api/|mcp/|\.well-known/|_next/|favicon.ico|robots.txt|sitemap.xml|.*\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml|css|js|map)$).*)'],
};
