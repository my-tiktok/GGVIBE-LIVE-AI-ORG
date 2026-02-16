'use client';

import { useRef, useState } from 'react';
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { getFirebaseClientAuth, hasFirebaseClientConfig } from '@/lib/firebase-client';

export function PhoneAuthForm() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const setupRecaptcha = () => {
    if (recaptchaRef.current) return recaptchaRef.current;
    const auth = getFirebaseClientAuth();
    if (!auth) {
      throw new Error('firebase_config_missing');
    }
    recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    return recaptchaRef.current;
  };

  const sendCode = async () => {
    try {
      const auth = getFirebaseClientAuth();
      if (!auth) {
        setStatus('Phone OTP is unavailable in this environment (missing NEXT_PUBLIC_FIREBASE_*).');
        return;
      }
      const verifier = setupRecaptcha();
      confirmationRef.current = await signInWithPhoneNumber(auth, phone, verifier);
      setStatus('Verification code sent.');
    } catch {
      setStatus('Could not send verification code. Check phone format and Firebase setup.');
    }
  };

  const verifyCode = async () => {
    if (!confirmationRef.current) return;
    try {
      const result = await confirmationRef.current.confirm(code);
      const idToken = await result.user.getIdToken();
      const email = result.user.email || undefined;
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken, email }),
      });
      if (response.ok) {
        window.location.href = '/chat';
        return;
      }
      setStatus('Phone verification succeeded but session exchange failed.');
    } catch {
      setStatus('Invalid code. Please try again.');
    }
  };

  if (!hasFirebaseClientConfig()) {
    return <p style={{ color: '#ffb5b5' }}>Phone OTP is unavailable in this environment (missing NEXT_PUBLIC_FIREBASE_*).</p>;
  }

  return (
    <div>
      <h3 style={{ color: '#fff' }}>Phone (OTP)</h3>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+15551234567" style={{ width: '100%', marginBottom: 8 }} />
      <button onClick={sendCode} style={{ width: '100%', marginBottom: 8 }}>Send OTP</button>
      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" style={{ width: '100%', marginBottom: 8 }} />
      <button onClick={verifyCode} style={{ width: '100%' }}>Verify OTP</button>
      <div id="recaptcha-container" />
      {status && <p style={{ color: '#cbd5e1' }}>{status}</p>}
    </div>
  );
}
