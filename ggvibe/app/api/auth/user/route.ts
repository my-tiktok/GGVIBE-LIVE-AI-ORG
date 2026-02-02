import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  
  if (!sessionCookie) {
    return NextResponse.json(null, { status: 401 });
  }
  
  try {
    const session = JSON.parse(sessionCookie);
    
    if (!session.userId) {
      return NextResponse.json(null, { status: 401 });
    }
    
    const now = Math.floor(Date.now() / 1000);
    if (session.expiresAt && now > session.expiresAt) {
      cookieStore.delete("session");
      return NextResponse.json(null, { status: 401 });
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, session.userId));
    
    if (!user) {
      return NextResponse.json(null, { status: 401 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
