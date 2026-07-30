"use client";

import { useAuth } from "@/lib/AuthContext";
import DashboardShell from "@/components/layout/DashboardShell";

/**
 * Layout for all authenticated /app/* routes.
 *
 * Every role dashboard (Weaver, Business, Customer) is wrapped in the
 * shared DashboardShell: fixed left sidebar on desktop, drawer on mobile,
 * full-width main content area. Individual pages only supply the main
 * content — no per-page header or max-width constraint needed.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { role, isAuthenticated, loading } = useAuth();

  if (loading || !isAuthenticated || !role) return null;

  return <DashboardShell>{children}</DashboardShell>;
}
