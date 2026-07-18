import Link from "next/link";
import { QrCode, Route } from "lucide-react";

import { DoodleCrosses, DoodleScribble } from "@/components/marketing/doodles";
import AmbientBackground from "@/components/layout/AmbientBackground";
import HandloomGuide from "@/components/guide/HandloomGuide";

/**
 * Shared shell for all walkthrough screens: top bar + faint background
 * doodles + consistent page width. Matches the landing page aesthetic.
 *
 * Every walkthrough page passes `guideMessages` (1–3 step-aware tips),
 * `guidePhase` and `guideProblemCode` so Meena — the narrator — persists
 * across the flow and resets to tip 1 on each route.
 */
export default function AppShell({
  children,
  guideMessages,
  guidePhase,
  guideProblemCode,
}: {
  children: React.ReactNode;
  guideMessages: string[];
  guidePhase: string;
  guideProblemCode: string;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-white text-black">
      <AmbientBackground />
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

      {/* Heads-up strip: sets expectations that screens show the intended
          flow with sample data, in the same sketch/dashed language. */}
      <div className="relative z-40 border-b border-dashed border-amber-300 bg-amber-50/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-6 py-2 text-center text-xs text-amber-800">
          <Route className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span>
            <span className="font-semibold">Guided walkthrough</span> — this
            screen shows the intended flow with sample data, so you can
            experience how LoomMitra works end to end.
          </span>
        </div>
      </div>

      <main className="relative z-10 flex-1 overflow-hidden">
        <DoodleCrosses className="left-[2%] top-24 hidden h-32 w-32 xl:block" />
        <DoodleScribble className="right-[3%] top-40 hidden h-14 w-48 xl:block" />
        <div className="relative mx-auto max-w-6xl px-6 py-10 pb-28 md:pb-10">
          {children}
        </div>
      </main>

      <HandloomGuide
        messages={guideMessages}
        phase={guidePhase}
        problemCode={guideProblemCode}
      />

      <footer className="relative z-10 border-t border-dashed border-neutral-300 bg-white/70 py-6 text-center text-xs text-neutral-500 backdrop-blur-sm">
        LoomMitra · clickable prototype · Indian Handloom Hackathon 2026
      </footer>
    </div>
  );
}
