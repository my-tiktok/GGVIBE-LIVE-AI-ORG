import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Bypass middleware for health check, MCP, and OAuth challenge routes
    '/((?!\\.well-known|mcp|api/health|api/healthz|public|_next|static).*)',
  ],
};
