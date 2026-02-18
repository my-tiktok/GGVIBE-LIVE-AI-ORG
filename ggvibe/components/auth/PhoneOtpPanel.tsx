'use client';

import { useRef, useState } from 'react';
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { getFirebaseClientAuth, hasFirebaseClientConfig } from '@/lib/firebase-client';

export function PhoneOtpPanel() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const getRecaptcha = () => {
    if (recaptchaRef.current) return recaptchaRef.current;
    const auth = getFirebaseClientAuth();
    if (!auth) throw new Error('firebase_config_missing');
    recaptchaRef.current = new RecaptchaVerifier(auth, 'phone-recaptcha', { size: 'invisible' });
    return recaptchaRef.current;
  };

  const send = async () => {
    try {
      const auth = getFirebaseClientAuth();
      if (!auth) {
        setStatus('Phone login unavailable: missing NEXT_PUBLIC_FIREBASE_* configuration.');
        return;
      }
      confirmationRef.current = await signInWithPhoneNumber(auth, phone, getRecaptcha());
      setStatus('OTP sent.');
    } catch {
      setStatus('Unable to send OTP.');
    }
  };

  const verify = async () => {
    if (!confirmationRef.current) return;
    try {
      const credential = await confirmationRef.current.confirm(code);
      const idToken = await credential.user.getIdToken();
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken, email: credential.user.email ?? undefined }),
      });
      if (response.ok) {
        window.location.href = '/';
      } else {
        setStatus('OTP verified but session exchange failed.');
      }
    } catch {
      setStatus('Invalid OTP.');
    }
  };

  if (!hasFirebaseClientConfig()) {
    return <small style={{ color: '#ffb5b5' }}>Phone OTP is unavailable in this environment (missing NEXT_PUBLIC_FIREBASE_*).</small>;
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+15551234567" />
      <button onClick={send}>Send OTP</button>
      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
      <button onClick={verify}>Verify OTP</button>
      <div id="phone-recaptcha" />
      {status && <small style={{ color: '#9fb5de' }}>{status}</small>}
    </div>
  );
}
