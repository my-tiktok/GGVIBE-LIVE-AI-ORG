import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const PRIVATE_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "no-store",
};

export async function GET() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "Not authenticated",
      },
      {
        status: 401,
        headers: PRIVATE_HEADERS,
      }
    );
  }

  return NextResponse.json(
    {
      ok: true,
    },
    {
      status: 200,
      headers: PRIVATE_HEADERS,
    }
  );
}
