"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import type { Role } from "@/lib/types";
import { ROLE_DASHBOARD_ROUTE } from "@/lib/types";

export function useRequireRole(requiredRole: Role) {
  const { role, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }
    if (role && role !== requiredRole) {
      router.replace(ROLE_DASHBOARD_ROUTE[role]);
    }
  }, [loading, isAuthenticated, role, requiredRole, router]);

  return { ready: !loading && isAuthenticated && role === requiredRole };
}
