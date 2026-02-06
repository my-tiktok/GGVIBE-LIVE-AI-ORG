import { NextResponse } from 'next/server';
import { getCanonicalUrl } from '@/lib/url/base-url';

interface McpEndpoint {
  name: string;
  method: 'GET' | 'POST' | 'STREAM';
  path: string;
  description: string;
  authentication?: string;
}

export async function GET() {
  const baseUrl = getCanonicalUrl();

  const endpoints: McpEndpoint[] = [
    {
      name: 'Health Check',
      method: 'GET',
      path: '/api/health',
      description: 'Verify service health and configuration status',
    },
    {
      name: 'Chat Stream',
      method: 'STREAM',
      path: '/api/v1/chat/stream',
      description: 'Server-Sent Events (SSE) streaming endpoint for real-time chat',
      authentication: 'Firebase ID Token (Authorization header)',
    },
    {
      name: 'User Authentication',
      method: 'GET',
      path: '/api/auth/user',
      description: 'Get current authenticated user',
      authentication: 'Session cookie',
    },
    {
      name: 'Login',
      method: 'GET',
      path: '/api/login',
      description: 'Initiate OAuth login flow',
    },
  ];

  return NextResponse.json({
    name: 'GGVIBE Chatbot',
    version: '1.0.0',
    description: 'AI-powered chatbot application for OpenAI ChatGPT integration',
    baseUrl,
    endpoints,
    timestamp: new Date().toISOString(),
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  });
}
