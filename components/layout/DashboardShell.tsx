"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Search,
  QrCode,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Gavel,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

/* ------------------------------------------------------------------ */
/*  Navigation config per role                                         */
/* ------------------------------------------------------------------ */

interface NavItem {
  /** Translation key inside the "nav" namespace. */
  labelKey: string;
  href: string;
  icon: LucideIcon;
}

const ROLE_NAV: Record<string, NavItem[]> = {
  WEAVER: [
    { labelKey: "dashboard",           href: "/app/weaver/dashboard", icon: LayoutDashboard },
    { labelKey: "products",            href: "/app/weaver/products",  icon: Package },
    { labelKey: "bulkOrders",          href: "/app/weaver/orders",    icon: MessageSquare },
    { labelKey: "customerOrders",      href: "/app/weaver/customer-orders", icon: ShoppingBag },
    { labelKey: "auctionHouse",        href: "/app/weaver/auctions",  icon: Gavel },
    { labelKey: "profileVerification", href: "/app/weaver/profile", icon: User },
  ],
  BUSINESS: [
    { labelKey: "dashboard",           href: "/app/business/dashboard", icon: LayoutDashboard },
    { labelKey: "bulkOrders",          href: "/app/business/orders",    icon: MessageSquare },
    { labelKey: "discoverCatalog",     href: "/app/discover",            icon: Search },
    { labelKey: "verifyProduct",       href: "/app/verify",              icon: QrCode },
    { labelKey: "profileVerification", href: "/app/business/profile", icon: User },
  ],
  CUSTOMER: [
    { labelKey: "dashboard",      href: "/app/customer/dashboard", icon: LayoutDashboard },
    { labelKey: "discover",       href: "/app/discover",           icon: Search },
    { labelKey: "auctionHouse",   href: "/app/auctions",           icon: Gavel },
    { labelKey: "cart",           href: "/app/customer/cart",      icon: ShoppingBag },
    { labelKey: "myOrders",       href: "/app/customer/orders",    icon: Package },
    { labelKey: "verifyProduct",  href: "/app/verify",             icon: QrCode },
    { labelKey: "profile",        href: "/app/customer/profile",   icon: User },
  ],
};

/* ------------------------------------------------------------------ */
/*  DashboardShell                                                     */
/* ------------------------------------------------------------------ */

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { role, loading, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { t } = useTranslation(["nav", "common"]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  if (loading || !role) return null;

  const navItems = ROLE_NAV[role] ?? [];

  const isActive = (href: string) => {
    // Exact match for all links to avoid partial prefix matching (e.g. /dashboard matching /dashboard + analytics)
    if (href === "/app/weaver/dashboard") return pathname === href;
    if (href === "/app/business/dashboard") return pathname === href;
    if (href === "/app/customer/dashboard") return pathname === href;
    // Prefix match for everything else
    return pathname.startsWith(href);
  };

  const roleLabel = t(`common:roles.${role}`);

  function handleLogout() {
    logout();
    window.location.href = "/auth/login";
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-neutral-200 bg-white transition-all duration-200 ease-in-out",
          // On desktop (≥1024): sticky sidebar, toggleable
          "lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 lg:h-screen",
          collapsed ? "lg:w-[68px]" : "lg:w-[252px]",
          sidebarOpen ? "translate-x-0 w-[252px]" : "-translate-x-full",
        )}
      >
        {/* Brand row */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-100 px-5">
          {collapsed ? (
            <Link href="/" className="mx-auto" onClick={closeSidebar}>
              <div className="sketch-box-alt flex h-8 w-8 items-center justify-center border-2 border-black">
                <span className="text-sm font-extrabold">L</span>
              </div>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2.5" onClick={closeSidebar}>
              <div className="sketch-box-alt flex h-8 w-8 items-center justify-center border-2 border-black">
                <span className="text-sm font-extrabold">L</span>
              </div>
              <span className="text-lg font-extrabold tracking-tight">LoomMitra</span>
            </Link>
          )}
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={closeSidebar}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              const label = t(`nav:${item.labelKey}`);
              return (
                <li key={item.labelKey}>
                  <Link
                    href={item.href}
                    onClick={closeSidebar}
                    title={collapsed ? label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      collapsed && "justify-center px-2",
                      active
                        ? "bg-black text-white"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-black",
                    )}
                  >
                    <div className="relative shrink-0">
                      <Icon
                        className="h-[18px] w-[18px]"
                        strokeWidth={active ? 1.75 : 1.5}
                      />
                      {item.labelKey === "cart" && cartCount > 0 && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                          {cartCount > 9 ? "9+" : cartCount}
                        </span>
                      )}
                    </div>
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer: language + collapse toggle + sign out */}
        <div className="border-t border-neutral-100 p-4 space-y-2">
          {/* Language switcher (hidden when collapsed to save space) */}
          {!collapsed && <LanguageSwitcher className="w-full" compact />}
          {/* Desktop collapse toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex w-full justify-start gap-2 text-neutral-500"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                {!collapsed && t("nav:collapse")}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn("w-full gap-2 text-neutral-600", collapsed && "justify-center")}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            {!collapsed && t("nav:signOut")}
          </Button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile/tablet top bar: hamburger + role label */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-dashed border-neutral-200 bg-white/90 backdrop-blur px-4 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            aria-label={t("nav:openMenu")}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm font-bold text-neutral-700 truncate">
            {t("nav:roleDashboard", { role: roleLabel })}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
