import { NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "firebase/firestore/lite";

function getDb() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    return null;
  }

  const app = getApps().length
    ? getApp()
    : initializeApp({ apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId });

  return getFirestore(app);
}

export async function GET() {
  const requestId = crypto.randomUUID();

  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json({ requestId, items: [] }, { status: 200 });
    }

    const snapshot = await getDocs(query(collection(db, "listings"), orderBy("createdAt", "desc"), limit(100)));
    const items = snapshot.docs
      .map((entry) => entry.data())
      .filter((entry) => entry.status !== "ARCHIVED");

    return NextResponse.json({ requestId, items }, { status: 200 });
  } catch (error) {
    console.error("market items fetch failed", { requestId, error });
    return NextResponse.json({ requestId, error: "market_fetch_failed", items: [] }, { status: 200 });
  }
}
