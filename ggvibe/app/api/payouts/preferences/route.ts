import { GET as sellerGet, POST as sellerPost } from '@/app/api/seller/payouts/route';

export const runtime = 'nodejs';

export async function GET() {
  return sellerGet();
}

export async function POST(request: Request) {
  return sellerPost(request);
}
