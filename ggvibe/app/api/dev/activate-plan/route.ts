import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { updateUserPlan } from "@/lib/user-store";

const schema = z.object({
  uid: z.string().min(1),
  plan: z.enum(["MONTHLY", "ANNUAL", "FREE"]),
  active: z.boolean().default(true),
});

function canManage(email?: string) {
  const admins = (process.env.ADMIN_EMAILS || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  if (!email) return process.env.NODE_ENV !== "production";
  return admins.includes(email.toLowerCase()) || (process.env.NODE_ENV !== "production" && process.env.DEV_MODE === "true");
}

export async function POST(request: Request) {
  const actor = await getCurrentUser();
  if (!canManage(actor?.email)) {
    return NextResponse.json({ error: "forbidden", message: "Admin access required" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { uid, plan, active } = parsed.data;
  const now = new Date();
  const expires = new Date(now);
  if (plan === "MONTHLY") expires.setMonth(expires.getMonth() + 1);
  if (plan === "ANNUAL") expires.setFullYear(expires.getFullYear() + 1);

  const updated = await updateUserPlan(uid, {
    plan,
    planStatus: active && plan !== "FREE" ? "active" : "inactive",
    planStartedAt: plan !== "FREE" ? now.toISOString() : undefined,
    planExpiresAt: plan !== "FREE" ? expires.toISOString() : undefined,
  });

  return NextResponse.json({ ok: true, user: updated });
}
