import { GET as getUser } from '@/app/api/auth/user/route';

export const runtime = 'nodejs';
export const GET = getUser;
