import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { buildAuthOptions } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/wallet", label: "Wallet" },
  { href: "/seller", label: "Seller" },
  { href: "/payouts", label: "Payouts" },
  { href: "/plans", label: "Plans" },
  { href: "/chat", label: "Chat" },
];

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXTAUTH_SECRET) {
    redirect("/login?callbackUrl=/dashboard");
  }

  try {
    const session = await getServerSession(buildAuthOptions());
    if (!session?.user) {
      redirect("/login?callbackUrl=/dashboard");
    }
  } catch {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" }}>
      <header style={{ borderBottom: "1px solid #1e293b", padding: "16px 24px" }}>
        <nav style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} style={{ color: "#38bdf8", textDecoration: "none", fontWeight: 600 }}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <section style={{ padding: 24 }}>{children}</section>
    </main>
  );
}
