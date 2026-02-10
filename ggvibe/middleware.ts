import { NextRequest, NextResponse } from 'next/server';

export function middleware(_request: NextRequest) {
  // No auth logic here — just pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
      Apply middleware ONLY to app routes.
      Explicitly EXCLUDE:
      - public files
      - Next.js internals
      - MCP
      - robots / sitemap
      - auth & health endpoints
    */
    '/((?!_next/|favicon.ico|robots.txt|sitemap.xml|mcp|api/login|api/callback|api/auth|api/health|api/healthz).*)',
  ],
};
