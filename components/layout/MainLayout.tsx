import Link from "next/link";
import { QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-dashed border-neutral-300 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="sketch-box-alt flex h-9 w-9 items-center justify-center border-2 border-black">
            <QrCode className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span className="text-lg font-bold tracking-tight">
            LoomMitra
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <a
            href="#solution"
            className="hidden text-sm font-medium text-neutral-600 underline-offset-4 hover:text-black hover:underline sm:block"
          >
            How it works
          </a>
          <a
            href="#features"
            className="hidden text-sm font-medium text-neutral-600 underline-offset-4 hover:text-black hover:underline sm:block"
          >
            Features
          </a>
          <Button asChild size="sm">
            <Link href="/dashboard">Open Prototype</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-dashed border-neutral-300">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-10 text-center">
        <p className="text-base font-bold tracking-tight">LoomMitra</p>
        <p className="text-sm text-neutral-600">
          Digital trust layer for Indian handloom.
        </p>
        <p className="text-xs text-neutral-500">
          Built for Indian Handloom Hackathon 2026.
        </p>
      </div>
    </footer>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-white text-black">
      <Header />
      <main className="relative z-10 flex-1">{children}</main>
      <div className="relative z-10 bg-white/70 backdrop-blur-sm">
        <Footer />
      </div>
    </div>
  );
}
