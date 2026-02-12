import { NextResponse } from "next/server";
import { validateEnv } from "@/lib/env";
import { generateRequestId } from "@/lib/request-id";

export async function GET() {
  const requestId = generateRequestId();
  const envStatus = validateEnv();

  const response = NextResponse.json(
    {
      status: envStatus.valid ? "healthy" : "degraded",
      version: "v1",
      requestId,
      checks: {
        session_secret: !!process.env.SESSION_SECRET,
        firebase_api_key: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        firebase_auth_domain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        openai_api_key: !!process.env.OPENAI_API_KEY,
      },
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Request-Id": requestId,
      },
    }
  );

  return response;
}
