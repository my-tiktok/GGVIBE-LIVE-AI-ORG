import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // Restrict middleware scope to private payouts routes only.
  // This avoids accidental auth gating of public routes in production.
  matcher: ['/payouts/:path*'],
};
