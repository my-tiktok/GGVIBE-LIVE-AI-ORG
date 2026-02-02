import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { generateRequestId } from "@/lib/request-id";

export async function GET() {
  const requestId = generateRequestId();

  const headers = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "X-Request-Id": requestId,
  };

  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return NextResponse.json(
        {
          error: "unauthorized",
          message: "Not authenticated",
          requestId,
        },
        { status: 401, headers }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: session.userId,
          email: session.email,
          firstName: session.firstName,
          lastName: session.lastName,
          profileImageUrl: session.profileImageUrl,
        },
        requestId,
      },
      { headers }
    );
  } catch (error) {
    console.error(`[${requestId}] Error fetching user:`, error);
    return NextResponse.json(
      {
        error: "internal_error",
        message: "Failed to fetch user",
        requestId,
      },
      { status: 500, headers }
    );
  }
}
