import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { getPayoutPreference, isValidBtcAddress, upsertPayoutPreference } from "@/features/payouts/server";

const schema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("BANK_NGN"),
    bank: z.object({
      name: z.string().min(2),
      accountNumber: z.string().min(8).max(20),
      accountName: z.string().min(2),
    }),
  }),
  z.object({
    method: z.literal("CRYPTO_BTC"),
    crypto: z.object({ btcAddress: z.string().min(14) }),
  }),
]);

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const preference = await getPayoutPreference(user.uid);
  return NextResponse.json({ preference });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.method === "CRYPTO_BTC" && !isValidBtcAddress(parsed.data.crypto.btcAddress)) {
    return NextResponse.json(
      { error: "invalid_wallet_address", message: "BTC wallet address format is invalid." },
      { status: 400 }
    );
  }

  const saved = await upsertPayoutPreference(user.uid, parsed.data);
  return NextResponse.json({ ok: true, preference: saved });
}
