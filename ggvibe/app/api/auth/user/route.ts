import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(null, { status: 401 });
    }
    
    const now = Math.floor(Date.now() / 1000);
    if (session.expiresAt && now > session.expiresAt) {
      session.destroy();
      return NextResponse.json(null, { status: 401 });
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, session.userId));
    
    if (!user) {
      session.destroy();
      return NextResponse.json(null, { status: 401 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
