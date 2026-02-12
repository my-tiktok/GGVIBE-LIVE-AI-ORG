import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PayoutsClientPage from "./payouts-client";

export default async function PayoutsPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("ggvibe_firebase_user")?.value;

  if (!userCookie) {
    redirect("/login");
  }

  return <PayoutsClientPage />;
}
