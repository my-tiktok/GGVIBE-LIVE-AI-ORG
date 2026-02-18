import { NextRequest, NextResponse } from "next/server";

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/|favicon.ico|.*\\..*|\\.well-known/|robots.txt|sitemap.xml|mcp|api/login|api/callback|api/auth|api/health|api/healthz).*)",
  ],
};
