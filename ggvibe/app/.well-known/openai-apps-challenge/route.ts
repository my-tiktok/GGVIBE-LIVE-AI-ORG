// ggvibe/app/.well-known/openai-apps-challenge/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Token must be the ONLY content returned (no JSON, no whitespace, no newline).
  const token = "neoIMNB3-IRXIZZijFujbAlUlaB33p6M29EfuBhfqow";

  return new NextResponse(token, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
