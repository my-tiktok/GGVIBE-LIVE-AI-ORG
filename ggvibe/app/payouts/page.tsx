import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PayoutsPage() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/api/login");
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Payouts</h1>
      <p>Payouts are restricted to authenticated accounts.</p>
    </main>
  );
}
