import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { CartProvider } from "@/lib/CartContext";
import I18nProvider from "@/lib/i18n/I18nProvider";
import AmbientBackground from "@/components/layout/AmbientBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LoomMitra — Trust from Loom to Market",
  description:
    "A digital trust layer for Indian handloom: QR-based product passports connecting weavers, buyers, and cooperatives.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        {/* Global hand-drawn backdrop — fixed, behind all page content (z-0).
            Mounted once at the root so the living loom scene is present on
            every route. Page content sits above it via relative z-10. */}
        <AmbientBackground />
        <I18nProvider>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
