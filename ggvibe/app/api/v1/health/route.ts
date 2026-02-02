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
        database_url: !!process.env.DATABASE_URL,
        repl_id: !!process.env.REPL_ID,
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
