'use client';

import { signIn } from 'next-auth/react';

export function ProviderButtons() {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <button onClick={() => signIn('google', { callbackUrl: '/chat' })}>Continue with Google</button>
      <button onClick={() => signIn('github', { callbackUrl: '/chat' })}>Continue with GitHub</button>
    </div>
  );
}
