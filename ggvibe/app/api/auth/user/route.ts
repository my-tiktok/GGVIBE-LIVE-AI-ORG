import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { generateRequestId } from "@/lib/request-id";

const headers = (requestId: string) => ({
  "X-Request-Id": requestId,
  "Cache-Control": "no-cache, no-store, must-revalidate",
});

export async function GET() {
  const requestId = generateRequestId();
  
  try {
    const session = await getSession();
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { authenticated: false, error: "unauthorized", requestId },
        { status: 401, headers: headers(requestId) }
      );
    }
    
    const now = Math.floor(Date.now() / 1000);
    if (session.expiresAt && now > session.expiresAt) {
      session.destroy();
      return NextResponse.json(
        { authenticated: false, error: "session_expired", requestId },
        { status: 401, headers: headers(requestId) }
      );
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, session.userId));
    
    if (!user) {
      session.destroy();
      return NextResponse.json(
        { authenticated: false, error: "user_not_found", requestId },
        { status: 401, headers: headers(requestId) }
      );
    }
    
    return NextResponse.json(
      { authenticated: true, user, requestId },
      { headers: headers(requestId) }
    );
  } catch (error) {
    console.error("Error fetching user:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { authenticated: false, error: "internal_error", requestId },
      { status: 500, headers: headers(requestId) }
    );
  }
}
