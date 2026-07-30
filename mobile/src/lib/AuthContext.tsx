import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiClient } from "./apiClient";
import { clearAuth, getRole, getToken, hydrateAuth, setAuth } from "./authStorage";
import type { Role } from "./types";

interface AuthContextValue {
  token: string | null;
  role: Role | null;
  loading: boolean;
  isAuthenticated: boolean;
  register: (email: string, password: string, role: Role) => Promise<Role>;
  login: (email: string, password: string) => Promise<Role>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate the in-memory token mirror before the app reads it.
    hydrateAuth().then(() => {
      setToken(getToken());
      setRole(getRole());
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.login(email, password);
    await setAuth(res.token, res.role);
    setToken(res.token);
    setRole(res.role);
    return res.role;
  }, []);

  const register = useCallback(async (email: string, password: string, r: Role) => {
    const res = await apiClient.register(email, password, r);
    await setAuth(res.token, res.role);
    setToken(res.token);
    setRole(res.role);
    return res.role;
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
    setToken(null);
    setRole(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ token, role, loading, isAuthenticated: Boolean(token), register, login, logout }),
    [token, role, loading, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
