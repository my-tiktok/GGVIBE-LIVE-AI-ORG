"use client";

import {
  ConfirmationResult,
  GithubAuthProvider,
  GoogleAuthProvider,
  RecaptchaVerifier,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getFirebaseAuth } from "@/lib/firebase/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<ConfirmationResult>;
  verifyPhoneOtp: (code: string) => Promise<void>;
  sendResetEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function cookieDomainFromAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return "";
  }

  try {
    const { hostname } = new URL(appUrl);
    if (hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return "";
    }

    return `; Domain=${hostname}`;
  } catch {
    return "";
  }
}

function syncClientAuthCookie(user: User | null) {
  if (typeof document === "undefined") {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const domain = cookieDomainFromAppUrl();

  if (!user) {
    document.cookie = `ggvibe_firebase_user=; Path=/; Max-Age=0; SameSite=Lax${secure}${domain}`;
    return;
  }

  const payload = encodeURIComponent(
    JSON.stringify({
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
    })
  );

  document.cookie = `ggvibe_firebase_user=${payload}; Path=/; Max-Age=604800; SameSite=Lax${secure}${domain}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      syncClientAuthCookie(nextUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(credential.user);
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch {
      await signInWithRedirect(auth, provider);
    }
  }, []);

  const signInWithGithub = useCallback(async () => {
    const auth = getFirebaseAuth();
    const provider = new GithubAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "auth/account-exists-with-different-credential") {
        throw new Error(
          "An account already exists with this email using a different provider."
        );
      }
      await signInWithRedirect(auth, provider);
    }
  }, []);

  const signInWithPhone = useCallback(async (phoneNumber: string) => {
    const auth = getFirebaseAuth();

    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }

    confirmationResultRef.current = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaRef.current
    );

    return confirmationResultRef.current;
  }, []);

  const verifyPhoneOtp = useCallback(async (code: string) => {
    if (!confirmationResultRef.current) {
      throw new Error("Start phone sign-in before entering an OTP code.");
    }

    await confirmationResultRef.current.confirm(code);
  }, []);

  const sendResetEmail = useCallback(async (email: string) => {
    const auth = getFirebaseAuth();
    await sendPasswordResetEmail(auth, email);
  }, []);

  const logout = useCallback(async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      signInWithGithub,
      signInWithPhone,
      verifyPhoneOtp,
      sendResetEmail,
      logout,
    }),
    [
      loading,
      logout,
      sendResetEmail,
      signInWithEmail,
      signInWithGithub,
      signInWithGoogle,
      signInWithPhone,
      signUpWithEmail,
      user,
      verifyPhoneOtp,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <div id="recaptcha-container" />
    </AuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useFirebaseAuth must be used within an AuthProvider");
  }

  return context;
}
