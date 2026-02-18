import { AuthCard } from '@/components/auth/AuthCard';
import { NeonBackground } from '@/components/auth/NeonBackground';

function normalizeVariant(value?: string): 'A' | 'B' | 'C' {
  if (value === 'B' || value === 'C') return value;
  return 'A';
}

function getMissingAuthEnvNames(): string[] {
  const required = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
  ];
  return required.filter((name) => !process.env[name]);
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string }>;
}) {
  const params = await searchParams;
  const variant = normalizeVariant(params.variant);
  const missing = getMissingAuthEnvNames();

  return (
    <main style={{ minHeight: '100vh', position: 'relative', padding: '20px' }}>
      <NeonBackground />
      {missing.length > 0 && (
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 780, margin: '0 auto 12px', padding: 12, border: '1px solid rgba(255,120,120,.55)', borderRadius: 10, background: 'rgba(60,15,15,.65)', color: '#ffd5d5' }}>
          Missing required auth environment configuration: {missing.join(', ')}.
        </div>
      )}
      <AuthCard variant={variant} />
    </main>
  );
}
