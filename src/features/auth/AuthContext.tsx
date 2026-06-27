import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiFetch, bootstrapSession, stopProactiveSessionRefresh } from "../../lib/apiClient";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/v1/auth/me")
      .then(async (res) => {
        if (res.ok) {
          await bootstrapSession();
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setLoading(false));

    return () => stopProactiveSessionRefresh();
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/v1/auth/logout", { method: "POST" });
    } catch { /* ignore */ }
    stopProactiveSessionRefresh();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}