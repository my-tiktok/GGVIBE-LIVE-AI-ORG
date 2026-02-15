import { NextResponse } from "next/server";
import { generateRequestId } from "@/lib/request-id";

export async function GET() {
  const requestId = generateRequestId();

  return NextResponse.json(
    {
      status: "ok",
      version: "v1",
      requestId,
      checks: {
        nextauth_url: Boolean(process.env.NEXTAUTH_URL),
        nextauth_secret: Boolean(process.env.NEXTAUTH_SECRET),
      },
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "X-Request-Id": requestId,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );
}
