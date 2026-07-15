import Link from "next/link";
import { QrCode } from "lucide-react";

import { DoodleCrosses, DoodleScribble } from "@/components/marketing/doodles";

/**
 * Shared shell for all walkthrough screens: top bar + faint background
 * doodles + consistent page width. Matches the landing page aesthetic.
 */
export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <header className="sticky top-0 z-50 border-b border-dashed border-neutral-300 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="sketch-box-alt flex h-9 w-9 items-center justify-center border-2 border-black">
              <QrCode className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Handloom Passport
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className="text-neutral-600 underline-offset-4 hover:text-black hover:underline"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-neutral-600 underline-offset-4 hover:text-black hover:underline"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <DoodleCrosses className="left-[2%] top-24 hidden h-32 w-32 xl:block" />
        <DoodleScribble className="right-[3%] top-40 hidden h-14 w-48 xl:block" />
        <div className="relative mx-auto max-w-6xl px-6 py-10">{children}</div>
      </main>

      <footer className="border-t border-dashed border-neutral-300 py-6 text-center text-xs text-neutral-500">
        Handloom Passport · clickable prototype · Indian Handloom Hackathon 2026
      </footer>
    </div>
  );
}
