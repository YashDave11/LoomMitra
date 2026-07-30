import { useEffect } from "react";
import { router } from "expo-router";
import { useAuth } from "./AuthContext";
import type { Role } from "./types";

/**
 * Redirect to login when unauthenticated, or to the correct dashboard when the
 * logged-in role isn't allowed here. Returns `ready` once the check passes so
 * screens can defer data fetches until then.
 */
export function useRequireRole(allowed: Role[]): { ready: boolean } {
  const { loading, isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !role) {
      router.replace("/(auth)/login");
      return;
    }
    if (!allowed.includes(role)) {
      const dest = role === "CUSTOMER" ? "/(customer)/browse" : "/(weaver)/dashboard";
      router.replace(dest);
    }
  }, [loading, isAuthenticated, role, allowed]);

  const ready = !loading && isAuthenticated && !!role && allowed.includes(role);
  return { ready };
}
