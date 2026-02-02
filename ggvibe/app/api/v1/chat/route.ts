import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { generateRequestId } from "@/lib/request-id";

const headers = (requestId: string) => ({
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "X-Request-Id": requestId,
});

export async function GET() {
  const requestId = generateRequestId();

  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return NextResponse.json(
        { error: "unauthorized", message: "Not authenticated", requestId },
        { status: 401, headers: headers(requestId) }
      );
    }

    return NextResponse.json(
      {
        chats: [],
        message: "Chat list endpoint - not yet implemented",
        requestId,
      },
      { headers: headers(requestId) }
    );
  } catch (error) {
    console.error(`[${requestId}] Error fetching chats:`, error);
    return NextResponse.json(
      { error: "internal_error", message: "Failed to fetch chats", requestId },
      { status: 500, headers: headers(requestId) }
    );
  }
}

export async function POST(request: Request) {
  const requestId = generateRequestId();

  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return NextResponse.json(
        { error: "unauthorized", message: "Not authenticated", requestId },
        { status: 401, headers: headers(requestId) }
      );
    }

    const body = await request.json().catch(() => ({}));

    return NextResponse.json(
      {
        chat: {
          id: `chat_${Date.now()}`,
          title: body.title || "New Chat",
          createdAt: new Date().toISOString(),
        },
        message: "Chat create endpoint - not yet implemented",
        requestId,
      },
      { status: 201, headers: headers(requestId) }
    );
  } catch (error) {
    console.error(`[${requestId}] Error creating chat:`, error);
    return NextResponse.json(
      { error: "internal_error", message: "Failed to create chat", requestId },
      { status: 500, headers: headers(requestId) }
    );
  }
}
