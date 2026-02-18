import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { generateRequestId } from "@/lib/request-id";
import { rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import { getAiConfigStatus } from "@/features/ai/config";

const MAX_REQUEST_SIZE = 10 * 1024;
const MAX_TOKENS = 512;
const MAX_STREAM_CHUNKS = 3;

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  const ipRate = rateLimit(request, {
    limit: 60,
    windowMs: 60_000,
    keyPrefix: "chat-stream-ip",
  });
  const ipRateHeaders = rateLimitHeaders(ipRate);
  ipRateHeaders.set("X-Request-Id", requestId);

  if (!ipRate.allowed) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many requests", requestId },
      { status: 429, headers: Object.fromEntries(ipRateHeaders) }
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

    if (!session.aiEnabled) {
      return NextResponse.json(
        { error: "upgrade_required", message: "AI access is not enabled for this account.", requestId },
        { status: 403, headers: { "X-Request-Id": requestId } }
      );
    }

    const aiConfig = getAiConfigStatus();
    if (!aiConfig.configured) {
      return NextResponse.json(
        { error: "missing_ai_env", message: "AI is not configured yet.", requestId, missingEnv: aiConfig.missingEnv },
        { status: 503, headers: { "X-Request-Id": requestId } }
      );
    }

    const userRate = rateLimit(request, {
      limit: 20,
      windowMs: 60_000,
      keyPrefix: "chat-stream-user",
      keySuffix: session.userId,
    });
    const userRateHeaders = rateLimitHeaders(userRate);
    userRateHeaders.set("X-Request-Id", requestId);

    if (!userRate.allowed) {
      return NextResponse.json(
        { error: "rate_limited", message: "Too many requests", requestId },
        { status: 429, headers: Object.fromEntries(userRateHeaders) }
      );
    }

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const maxTokens = typeof body.maxTokens === "number" ? body.maxTokens : undefined;
    if (maxTokens && maxTokens > MAX_TOKENS) {
      return NextResponse.json(
        {
          error: "max_tokens_exceeded",
          message: `maxTokens must be <= ${MAX_TOKENS}`,
          requestId,
        },
        { status: 400, headers: { "X-Request-Id": requestId } }
      );
    }

    console.info(`[${requestId}] Chat stream start`, {
      userId: session.userId,
      contentLength: request.headers.get("content-length"),
    });

    const encoder = new TextEncoder();
    let sent = 0;
    let aborted = false;

    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          request.signal.addEventListener(
            "abort",
            () => {
              aborted = true;
              controller.close();
            },
            { once: true }
          );

          const initialMessage = {
            type: "stream.start",
            timestamp: new Date().toISOString(),
            requestId,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialMessage)}\n\n`));
          sent++;

          for (let i = 0; i < MAX_STREAM_CHUNKS; i++) {
            if (aborted || request.signal.aborted) {
              return;
            }
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
          console.error(`[${requestId}] Stream error`, error);
          const errorMessage = {
            type: "stream.error",
            error: error instanceof Error ? error.message : "Unknown error",
            requestId,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
          controller.close();
        }
      },
      cancel() {
        aborted = true;
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
    console.error(`[${requestId}] Stream endpoint error`, error);
    return NextResponse.json(
      { error: "internal_error", message: "Stream setup failed", requestId },
      { status: 500, headers: { "X-Request-Id": requestId } }
    );
  }
}
