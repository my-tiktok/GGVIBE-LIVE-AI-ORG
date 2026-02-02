import { NextResponse } from "next/server";
import { generateRequestId } from "@/lib/http/result";

export async function GET() {
  const requestId = generateRequestId();
  
  const checks = {
    session_secret: !!process.env.SESSION_SECRET || !!process.env.NEXTAUTH_SECRET,
    database_url: !!process.env.DATABASE_URL,
    repl_id: !!process.env.REPL_ID,
  };

  const allHealthy = Object.values(checks).every(Boolean);

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      requestId,
      checks,
      timestamp: new Date().toISOString(),
    },
    { 
      status: allHealthy ? 200 : 503,
      headers: { "X-Request-Id": requestId }
    }
  );
}
