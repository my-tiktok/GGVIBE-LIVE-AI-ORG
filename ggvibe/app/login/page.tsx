"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_callback: "Login session expired or was invalid. Please try again.",
  provider_error: "Authentication provider returned an error. Please try again.",
  invalid_claims: "Could not retrieve your profile information. Please try again.",
  auth_failed: "Authentication failed. Please try again.",
  login_failed: "Could not initiate login. Please try again.",
  unauthorized: "You must be logged in to access that page.",
};

function LoginContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const deepLinkScheme = process.env.NEXT_PUBLIC_MOBILE_DEEP_LINK_SCHEME;

  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] || "An error occurred. Please try again." : null;

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleDeepLinkError = () => {
    if (deepLinkScheme && errorCode) {
      window.location.href = `${deepLinkScheme}/error?code=${errorCode}`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center p-8 bg-slate-800/50 rounded-2xl border border-slate-700 max-w-md mx-4">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-red-300 text-sm">{errorMessage}</p>
          </div>
        )}

        <h1 className="text-2xl font-bold text-white mb-2">
          {errorMessage ? "Login Failed" : "Welcome Back"}
        </h1>
        <p className="text-slate-400 mb-6">
          {errorMessage
            ? "Please try logging in again."
            : "Sign in to continue to GGVIBE LIVE AI"}
        </p>

        <button
          onClick={handleLogin}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mb-3"
        >
          {errorMessage ? "Try Again" : "Sign in with Replit"}
        </button>

        {deepLinkScheme && errorCode && (
          <button
            onClick={handleDeepLinkError}
            className="w-full py-3 px-6 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-lg transition-colors"
          >
            Return to App
          </button>
        )}

        <p className="mt-6 text-xs text-slate-500">
          By signing in, you agree to our{" "}
          <a href="/terms" className="text-blue-400 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-blue-400 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="text-slate-400">Loading...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
