"use client";

import { useEffect, useState } from "react";

export default function AuthSuccessPage() {
  const [countdown, setCountdown] = useState(2);
  const deepLinkScheme = process.env.NEXT_PUBLIC_MOBILE_DEEP_LINK_SCHEME;

  useEffect(() => {
    if (deepLinkScheme) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = `${deepLinkScheme}/success`;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [deepLinkScheme]);

  const handleReturnToApp = () => {
    if (deepLinkScheme) {
      window.location.href = `${deepLinkScheme}/success`;
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center p-8 bg-slate-800/50 rounded-2xl border border-slate-700 max-w-md mx-4">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Login Successful!</h1>
        <p className="text-slate-400 mb-6">
          You have been authenticated successfully.
          {countdown > 0 && ` Redirecting in ${countdown}...`}
        </p>
        <button
          onClick={handleReturnToApp}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          {deepLinkScheme ? "Return to App" : "Continue to Dashboard"}
        </button>
      </div>
    </div>
  );
}
