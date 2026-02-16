import { AuthCard } from '@/components/auth/AuthCard';
import { NeonBackground } from '@/components/auth/NeonBackground';

function normalizeVariant(value?: string): 'A' | 'B' | 'C' {
  if (value === 'B' || value === 'C') return value;
  return 'A';
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string }>;
}) {
  const params = await searchParams;
  const variant = normalizeVariant(params.variant);

  return (
    <main style={{ minHeight: '100vh', position: 'relative', padding: '20px' }}>
      <NeonBackground />
      <AuthCard variant={variant} />
    </main>
  );
}
