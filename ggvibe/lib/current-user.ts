import { getServerSession } from "next-auth";
import { buildAuthOptions } from "@/lib/auth";

export type CurrentUser = {
  uid: string;
  email?: string;
  name?: string | null;
};

function normalizeUid(input?: string | null, email?: string | null) {
  const candidate = input || email || "";
  return candidate.toLowerCase().replace(/[^a-z0-9_.-]/g, "_");
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  let session;
  try {
    session = await getServerSession(buildAuthOptions());
  } catch {
    return null;
  }
  if (!session?.user) return null;

  const user = session.user as { id?: string; email?: string | null; name?: string | null };
  const uid = normalizeUid(user.id, user.email);
  if (!uid) return null;

  return { uid, email: user.email ?? undefined, name: user.name };
}
