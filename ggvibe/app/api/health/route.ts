import { NextResponse } from "next/server";

export async function GET() {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    nextAuthSecretConfigured: !!process.env.NEXTAUTH_SECRET,
    nextAuthUrlConfigured: !!process.env.NEXTAUTH_URL,
    appUrlConfigured: !!process.env.NEXTAUTH_URL,
  };

  return NextResponse.json(health, { status: 200 });
}
