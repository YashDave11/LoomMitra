import { useEffect } from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@/lib/AuthContext";
import { ROLE_DASHBOARD_ROUTE } from "@/lib/types";
import { LoadingState } from "@/components/ui";

/** App entry: wait for auth hydration, then route by role. */
export default function Index() {
  const { loading, isAuthenticated, role } = useAuth();

  if (loading) return <LoadingState />;
  if (!isAuthenticated || !role) return <Redirect href="/(auth)/login" />;

  // Weaver + customer have dedicated tab shells; business reuses the weaver
  // shell surface for now (see notes) — route both non-customer roles there.
  const dest = role === "CUSTOMER" ? "/(customer)/browse" : "/(weaver)/dashboard";
  return <Redirect href={dest} />;
}
