import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const redirect = new URL("/api/auth/signin", request.url);
  redirect.searchParams.set("error", "deprecated_callback_route");
  return NextResponse.redirect(redirect, 307);
}
