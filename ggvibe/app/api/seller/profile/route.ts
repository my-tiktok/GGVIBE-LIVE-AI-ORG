import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { getSellerProfile, upsertSellerProfile } from "@/features/seller/server";

const schema = z.object({
  displayName: z.string().min(2),
  storeName: z.string().min(2),
  bio: z.string().min(10),
  country: z.string().min(2),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Please sign in" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "validation_error",
        message: "Please check seller profile fields and try again.",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  try {
    const profile = await upsertSellerProfile(user.uid, parsed.data);
    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    return NextResponse.json(
      {
        error: "profile_upsert_failed",
        message: "Unable to save seller profile right now. Please retry.",
        details: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 }
    );
  }
}


export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Please sign in" }, { status: 401 });
  }

  const profile = await getSellerProfile(user.uid);
  return NextResponse.json({ profile });
}
