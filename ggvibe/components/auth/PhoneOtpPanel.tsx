"use client";

import { useRef, useState } from "react";
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber, getAuth } from "firebase/auth";
import { getApp, getApps, initializeApp } from "firebase/app";

function getFirebaseAuthClient() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase phone auth is not configured.");
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}

export function PhoneOtpPanel() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  const setupRecaptcha = () => {
    const auth = getFirebaseAuthClient();
    if (!verifierRef.current) {
      verifierRef.current = new RecaptchaVerifier(auth, "phone-recaptcha", {
        size: "normal",
      });
    }
    return { auth, verifier: verifierRef.current };
  };

  const sendCode = async () => {
    setStatus(null);
    try {
      const { auth, verifier } = setupRecaptcha();
      confirmationRef.current = await signInWithPhoneNumber(auth, phone, verifier);
      setStatus("OTP sent. Enter your code.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send OTP.";
      setStatus(message);
    }
  };

  const verifyCode = async () => {
    if (!confirmationRef.current) return setStatus("Send OTP first.");
    try {
      await confirmationRef.current.confirm(otp);
      setStatus("Phone authentication complete.");
    } catch {
      setStatus("Invalid OTP code.");
    }
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <label htmlFor="phone-input" style={{ color: "#d6e6ff" }}>Phone OTP</label>
      <input id="phone-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 555 5555" style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,.2)", background: "rgba(13,11,31,.65)", color: "#fff" }} />
      <div id="phone-recaptcha" />
      <button onClick={sendCode} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.2)", background: "rgba(0,245,255,.12)", color: "#fff" }}>Send OTP</button>
      <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,.2)", background: "rgba(13,11,31,.65)", color: "#fff" }} />
      <button onClick={verifyCode} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,46,159,.12)", color: "#fff" }}>Verify OTP</button>
      {status ? <p aria-live="polite" style={{ margin: 0, color: "#9ee6ff" }}>{status}</p> : null}
    </div>
  );
}
