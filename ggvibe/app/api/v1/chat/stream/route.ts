import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { generateRequestId } from "@/lib/request-id";
import { rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";

const MAX_REQUEST_SIZE = 10 * 1024;

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  const rate = rateLimit(request, {
    limit: 100,
    windowMs: 60_000,
    keyPrefix: "chat-stream",
  });
  const rateHeaders = rateLimitHeaders(rate);
  rateHeaders.set("X-Request-Id", requestId);

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many requests", requestId },
      { status: 429, headers: Object.fromEntries(rateHeaders) }
    );
  }

  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return NextResponse.json(
        { error: "request_too_large", message: "Request exceeds maximum size", requestId },
        { status: 413, headers: { "X-Request-Id": requestId } }
      );
    }

    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: "unauthorized", message: "Not authenticated", requestId },
        { status: 401, headers: { "X-Request-Id": requestId } }
      );
    }

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const encoder = new TextEncoder();
    let sent = 0;

    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          const initialMessage = {
            type: "stream.start",
            timestamp: new Date().toISOString(),
            requestId,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialMessage)}\n\n`));
          sent++;

          for (let i = 0; i < 3; i++) {
            await new Promise((resolve) => setTimeout(resolve, 200));
            const msgChunk = {
              type: "stream.message",
              index: sent,
              text: `Message chunk ${i + 1} `,
              timestamp: new Date().toISOString(),
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(msgChunk)}\n\n`));
            sent++;
          }

          const completeMessage = {
            type: "stream.complete",
            totalChunks: sent,
            timestamp: new Date().toISOString(),
            requestId,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(completeMessage)}\n\n`));
          controller.close();
        } catch (error) {
          console.error(`[${requestId}] Stream error:`, error);
          const errorMessage = {
            type: "stream.error",
            error: error instanceof Error ? error.message : "Unknown error",
            requestId,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
          controller.close();
        }
      },
    });

    return new NextResponse(customReadable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Request-Id": requestId,
      },
    });
  } catch (error) {
    console.error(`[${requestId}] Stream endpoint error:`, error);
    return NextResponse.json(
      { error: "internal_error", message: "Stream setup failed", requestId },
      { status: 500, headers: { "X-Request-Id": requestId } }
    );
  }
}
