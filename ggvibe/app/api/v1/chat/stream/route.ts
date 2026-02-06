import { NextRequest, NextResponse } from "next/server";
import { generateRequestId } from "@/lib/request-id";

const MAX_REQUEST_SIZE = 10 * 1024; // 10KB
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;

// Simple in-memory rate limiting (use Redis in production)
const requestTracker = new Map<string, number[]>();

function isRateLimited(clientId: string): boolean {
  const now = Date.now();
  const times = requestTracker.get(clientId) || [];

  // Remove old requests outside the window
  const recentRequests = times.filter(t => now - t < RATE_LIMIT_WINDOW);

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  recentRequests.push(now);
  requestTracker.set(clientId, recentRequests);
  return false;
}

async function verifyFirebaseToken(authHeader: string | null | undefined): Promise<{ valid: boolean; uid?: string }> {
  // In production, verify Firebase token using Firebase Admin SDK
  // For now, check for Authorization header presence
  if (!authHeader) {
    return { valid: false };
  }

  // Format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return { valid: false };
  }

  const token = parts[1];
  if (!token || token.length === 0) {
    return { valid: false };
  }

  // TODO: Verify token signature with Firebase Admin SDK
  // For demo, accept any non-empty token
  return { valid: true, uid: `user_${token.substring(0, 20)}` };
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const clientIp = request.headers.get('x-forwarded-for') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown';
  const clientId = clientIp;

  try {
    // Check rate limiting
    if (isRateLimited(clientId)) {
      return NextResponse.json(
        { error: 'rate_limited', message: 'Too many requests', requestId },
        {
          status: 429,
          headers: {
            'X-Request-Id': requestId,
            'Retry-After': '60',
          }
        }
      );
    }

    // Check request size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return NextResponse.json(
        { error: 'request_too_large', message: 'Request exceeds maximum size', requestId },
        {
          status: 413,
          headers: { 'X-Request-Id': requestId }
        }
      );
    }

    // Verify Firebase token
    const authHeader = request.headers.get('authorization');
    const tokenVerification = await verifyFirebaseToken(authHeader);
    if (!tokenVerification.valid) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Invalid or missing Firebase token', requestId },
        {
          status: 401,
          headers: { 'X-Request-Id': requestId }
        }
      );
    }

    // Parse request body
    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // Create SSE stream
    const encoder = new TextEncoder();
    let sent = 0;

    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          // Send initial message
          const initialMessage = {
            type: 'stream.start',
            timestamp: new Date().toISOString(),
            requestId,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialMessage)}\n\n`));
          sent++;

          // Simulate a 3-message stream (in production, this would be actual LLM output)
          for (let i = 0; i < 3; i++) {
            await new Promise(resolve => setTimeout(resolve, 200));

            const msgChunk = {
              type: 'stream.message',
              index: sent,
              text: `Message chunk ${i + 1} `,
              timestamp: new Date().toISOString(),
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(msgChunk)}\n\n`));
            sent++;
          }

          // Send completion message
          const completeMessage = {
            type: 'stream.complete',
            totalChunks: sent,
            timestamp: new Date().toISOString(),
            requestId,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(completeMessage)}\n\n`));

          controller.close();
        } catch (error) {
          console.error(`[${requestId}] Stream error:`, error);
          const errorMessage = {
            type: 'stream.error',
            error: error instanceof Error ? error.message : 'Unknown error',
            requestId,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
          controller.close();
        }
      },
    });

    return new NextResponse(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Request-Id': requestId,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error(`[${requestId}] Stream endpoint error:`, error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Stream setup failed', requestId },
      {
        status: 500,
        headers: { 'X-Request-Id': requestId }
      }
    );
  }
}
