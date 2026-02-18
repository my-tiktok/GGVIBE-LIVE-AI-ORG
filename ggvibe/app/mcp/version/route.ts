import { NextResponse } from "next/server";
import packageJson from "@/package.json";

export async function GET() {
  return NextResponse.json(
    {
      name: packageJson.name,
      version: packageJson.version,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
