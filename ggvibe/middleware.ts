import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATH_PREFIXES = ['/chat', '/wallet', '/transactions', '/seller', '/admin', '/dashboard', '/settings', '/marketplace', '/plans', '/payouts'];
function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function hasAuthCookie(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get('__session')?.value ||
      request.cookies.get('__Secure-authjs.session-token')?.value ||
      request.cookies.get('authjs.session-token')?.value ||
      request.cookies.get('next-auth.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

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
