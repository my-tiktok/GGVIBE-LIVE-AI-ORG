import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    items: [
      { id: 'starter', name: 'Starter Bundle', price: 0 },
      { id: 'pro', name: 'Pro Bundle', price: 19 },
    ],
  });
}
