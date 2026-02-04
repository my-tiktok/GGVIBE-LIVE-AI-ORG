import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "ggvibe",
    version: "1.0.0",
    description: "GGVIBE LIVE AI MCP endpoint",
    endpoints: {
      chat: "/api/v1/chat",
      health: "/api/health",
      auth: "/api/v1/auth/user",
    },
  });
}
