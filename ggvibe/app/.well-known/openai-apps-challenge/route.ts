import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.OPENAI_APPS_CHALLENGE_TOKEN;

  if (!token) {
    return new NextResponse("OPENAI_APPS_CHALLENGE_TOKEN missing", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new NextResponse(token, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
