import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { generateRequestId } from "@/lib/http/result";

export async function GET() {
  const requestId = generateRequestId();
  
  try {
    const session = await getSession();
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: "unauthorized", requestId },
        { status: 401, headers: { "X-Request-Id": requestId } }
      );
    }
    
    const now = Math.floor(Date.now() / 1000);
    if (session.expiresAt && now > session.expiresAt) {
      session.destroy();
      return NextResponse.json(
        { error: "session_expired", requestId },
        { status: 401, headers: { "X-Request-Id": requestId } }
      );
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, session.userId));
    
    if (!user) {
      session.destroy();
      return NextResponse.json(
        { error: "user_not_found", requestId },
        { status: 401, headers: { "X-Request-Id": requestId } }
      );
    }
    
    return NextResponse.json(user, {
      headers: { "X-Request-Id": requestId }
    });
  } catch (error) {
    console.error("Error fetching user:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "internal_error", requestId },
      { status: 500, headers: { "X-Request-Id": requestId } }
    );
  }
}
