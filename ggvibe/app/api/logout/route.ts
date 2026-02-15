import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const target = new URL("/api/auth/signout", request.url);
  target.searchParams.set("callbackUrl", "/");
  return NextResponse.redirect(target, 307);
}
