import { NextResponse } from "next/server";

const SIGNIN_PATH = "/api/auth/signin";

function toSignInUrl(request: Request): URL {
  const target = new URL(request.url);
  target.pathname = SIGNIN_PATH;
  target.search = "";

  const callbackUrl = new URL(request.url).searchParams.get("callbackUrl") || "/dashboard";
  target.searchParams.set("callbackUrl", callbackUrl);
  return target;
}

export async function GET(request: Request) {
  return NextResponse.redirect(toSignInUrl(request), 307);
}

export async function POST(request: Request) {
  return NextResponse.redirect(toSignInUrl(request), 307);
}
