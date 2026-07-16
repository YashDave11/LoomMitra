"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import HandloomAvatar from "./HandloomAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Meena — Chanderi weaver and narrator of the LoomMitra story.
 * A persistent, monochrome guide that follows the user through every
 * walkthrough screen with a phase-aware speech bubble. Her portrait is
 * pure in-code SVG (see HandloomAvatar) — no external assets.
 *
 * Each route provides a sequence of 1–3 tips; the user steps through them
 * with Prev/Next controls. Navigating to a new route resets to tip 1 and
 * re-opens the bubble.
 *
 * Desktop: docked bottom-right. Mobile: docked bottom-center.
 * Closing the bubble keeps the avatar; clicking the avatar reopens it.
 */

export default function HandloomGuide({
  messages,
  phase,
  problemCode,
  className,
}: {
  messages: string[];
  phase: string;
  problemCode: string;
  className?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // New route → start from the first tip and re-show the bubble.
  useEffect(() => {
    setCurrentIndex(0);
    setOpen(true);
  }, [pathname]);

  const total = messages.length;
  const isLast = currentIndex >= total - 1;
  const isFirst = currentIndex <= 0;

  return (
    <div
      className={cn(
        // mobile: bottom-center dock · desktop: bottom-right dock
        "pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4",
        "md:inset-x-auto md:bottom-5 md:right-5 md:justify-end md:px-0",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 240, damping: 22 }}
        className="pointer-events-auto flex flex-row-reverse items-end gap-3"
      >
        {/* Avatar — always visible; reopens the bubble when it's closed */}
        <motion.button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Meena, your guide" : "Reopen Meena's tips"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="sketch-box relative h-20 w-20 shrink-0 cursor-pointer rounded-xl border-2 border-black bg-white p-1.5 shadow-[4px_4px_0_0_rgba(0,0,0,0.15)] outline-offset-2 transition-shadow hover:shadow-[6px_6px_0_0_rgba(0,0,0,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-full"
          >
            <HandloomAvatar className="h-full w-full" />
          </motion.div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-1 text-[9px] font-bold uppercase tracking-widest">
            Meena
          </span>
        </motion.button>

        {/* Speech bubble */}
        <AnimatePresence>
          {open && total > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              whileHover={{
                y: -3,
                boxShadow: "7px 7px 0 0 rgba(0,0,0,0.2)",
              }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="sketch-box-alt relative mb-2 w-[270px] border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_rgba(0,0,0,0.12)] sm:w-[320px]"
            >
              {/* bubble tail pointing at the avatar (right side) */}
              <svg
                aria-hidden="true"
                viewBox="0 0 20 16"
                className="absolute -right-[14px] bottom-4 h-4 w-5 scale-x-[-1] text-black"
                fill="none"
              >
                <path
                  d="M19 2C10 4 5 8 1 14c7-1 13-1 18-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="white"
                  strokeLinejoin="round"
                />
              </svg>

              <button
                onClick={() => setOpen(false)}
                aria-label="Dismiss guide tips"
                className="absolute right-1.5 top-1.5 rounded p-0.5 text-neutral-400 hover:text-black"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>

              {/* phase + problem statement row */}
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5 pr-5">
                <span className="inline-block rounded-full border border-dashed border-neutral-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  {phase}
                </span>
                <span className="inline-block rounded-full border border-black bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                  {problemCode}
                </span>
              </div>

              {/* Tip text — crossfades when the index changes */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="min-h-[60px] text-sm font-medium leading-relaxed"
                >
                  {messages[currentIndex]}
                </motion.p>
              </AnimatePresence>

              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                — Meena, Chanderi weaver
              </p>

              {/* Tip controls */}
              {total > 1 && (
                <div className="mt-3 flex items-center justify-between border-t border-dashed border-neutral-300 pt-2.5">
                  {/* dot progress indicator */}
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    {messages.map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full border border-black transition-colors",
                          i === currentIndex ? "bg-black" : "bg-white"
                        )}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="mr-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      Tip {currentIndex + 1}/{total}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 px-2 text-xs"
                      disabled={isFirst}
                      onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                      aria-label="Previous tip"
                    >
                      <ChevronLeft className="!size-3.5" strokeWidth={2.5} />
                      Prev
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 gap-1 px-2 text-xs"
                      disabled={isLast}
                      onClick={() =>
                        setCurrentIndex((i) => Math.min(total - 1, i + 1))
                      }
                      aria-label="Next tip"
                    >
                      Next tip
                      <ChevronRight className="!size-3.5" strokeWidth={2.5} />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
