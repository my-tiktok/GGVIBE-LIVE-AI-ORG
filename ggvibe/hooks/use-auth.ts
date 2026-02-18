"use client";

import { useState, useEffect, useCallback } from "react";
import type { User } from "@/lib/schema";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/user", {
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
      });

      if (response.status === 401) {
        setUser(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(data);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(() => {
    window.location.href = "/api/auth/signin";
  }, []);

  const logout = useCallback(() => {
    window.location.href = "/api/auth/signout";
  }, []);

  return {
    user,
    isLoading,
    loading: isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refetch: fetchUser,
  };
}

export default useAuth;
