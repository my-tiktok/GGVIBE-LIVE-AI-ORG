import { NextResponse } from "next/server";
import { getRuntimeHealth } from "@/lib/env/validate";

export async function GET() {
  const { missingEnv } = getRuntimeHealth();

  if (missingEnv.length > 0) {
    return NextResponse.json(
      {
        status: "unhealthy",
        code: "missing_env",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  return NextResponse.json(
    {
      status: "ok",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
