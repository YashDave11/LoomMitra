"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { SLIDES } from "./slides";

/**
 * Fixed 16:9 presentation stage.
 *
 * Every slide is authored on a 1920×1080 canvas which is scaled
 * uniformly to fit the viewport (letterboxed if needed) — content
 * never reflows, so the deck looks identical on any screen.
 *
 * Navigation: ← → arrow keys, Space, click arrows, or the dots.
 */
export default function PresentationDeck() {
  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const total = SLIDES.length;

  // Scale the 1920×1080 stage to the viewport
  useEffect(() => {
    const fit = () =>
      setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const go = useCallback(
    (dir: number) =>
      setIndex((i) => Math.min(Math.max(i + dir, 0), total - 1)),
    [total]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown")
        go(1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1);
      if (e.key === "Home") setIndex(0);
      if (e.key === "End") setIndex(total - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, total]);

  const Slide = SLIDES[index];

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-neutral-100">
      {/* ── 1920×1080 stage, scaled as a whole ── */}
      <div
        className="relative shrink-0 overflow-hidden bg-white"
        style={{ width: 1920, height: 1080, transform: `scale(${scale})` }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Slide />
          </motion.div>
        </AnimatePresence>

        {/* ── deck chrome: brand + counter ── */}
        <div className="absolute bottom-8 left-12 flex items-center gap-3 text-sm font-semibold tracking-widest text-neutral-400">
          <span className="uppercase">LoomMitra</span>
          <span className="text-neutral-300">·</span>
          <span>
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>
        </div>

        {/* ── dots ── */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 rounded-full border border-black transition-all ${
                i === index ? "w-7 bg-black" : "w-2.5 bg-white hover:bg-neutral-300"
              }`}
            />
          ))}
        </div>

        {/* ── prev / next arrows ── */}
        <div className="absolute bottom-6 right-12 flex items-center gap-3">
          <button
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label="Previous slide"
            className="sketch-box flex h-11 w-11 items-center justify-center border-2 border-black bg-white transition-transform hover:-translate-y-0.5 disabled:opacity-30 disabled:hover:translate-y-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            disabled={index === total - 1}
            aria-label="Next slide"
            className="sketch-box-alt flex h-11 w-11 items-center justify-center border-2 border-black bg-white transition-transform hover:-translate-y-0.5 disabled:opacity-30 disabled:hover:translate-y-0"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
