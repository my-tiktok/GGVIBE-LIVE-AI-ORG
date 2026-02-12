"use client";

import { useMemo } from "react";
import { useFirebaseAuth } from "@/components/auth/auth-provider";

export function useAuth() {
  const { user, loading, logout } = useFirebaseAuth();

  return useMemo(
    () => ({
      user: user
        ? {
            email: user.email,
            firstName: user.displayName || undefined,
            profileImageUrl: user.photoURL || undefined,
          }
        : null,
      isLoading: loading,
      loading,
      isAuthenticated: Boolean(user),
      login: () => {
        window.location.href = "/login";
      },
      logout,
      refetch: async () => {},
    }),
    [loading, logout, user]
  );
}

export default useAuth;
