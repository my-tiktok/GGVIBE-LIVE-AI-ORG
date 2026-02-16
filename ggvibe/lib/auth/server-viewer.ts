import { cookies } from 'next/headers';
import { getAuthSession } from '@/lib/next-auth';
import { FIREBASE_SESSION_COOKIE_NAME, getFirebaseAdminAuth } from '@/lib/firebase-admin';

export type ServerViewer = {
  uid: string;
  email: string | null;
  name?: string | null;
  image?: string | null;
  source: 'nextauth' | 'firebase';
};

export async function getServerViewer(): Promise<ServerViewer | null> {
  const session = await getAuthSession();
  if (session?.user?.email) {
    return {
      uid: session.user.id || session.user.email,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      source: 'nextauth',
    };
  }

  const cookieStore = await cookies();
  const firebaseSession = cookieStore.get(FIREBASE_SESSION_COOKIE_NAME)?.value;
  if (!firebaseSession) {
    return null;
  }

  const auth = getFirebaseAdminAuth();
  const decoded = await auth.verifySessionCookie(firebaseSession, true);
  return {
    uid: decoded.uid,
    email: decoded.email ?? null,
    name: decoded.name ?? null,
    image: decoded.picture ?? null,
    source: 'firebase',
  };
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowlist = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.toLowerCase());
}
