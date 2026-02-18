'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';

export function MagicLinkButton() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    const result = await signIn('email', { email, redirect: false, callbackUrl: '/chat' });
    setMessage(result?.error ? 'Failed to send magic link.' : 'Magic link sent. Check your inbox.');
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      <button type="submit">Send magic link</button>
      {message && <small style={{ color: '#9fb5de' }}>{message}</small>}
    </form>
  );
}
