"use client";

import { motion } from "framer-motion";
import { Flag } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Monochrome ribbon-style badge tying a screen to its phase and
 * hackathon problem statement, e.g. "Phase 2 · Problem 2.2 — Authenticity & Stories".
 */
export default function PhaseBadge({
  phase,
  problemCode,
  label,
  className,
}: {
  phase: "Phase 1" | "Phase 2" | "Phase 3";
  problemCode: string;
  label: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
      className={cn(
        "inline-flex items-center gap-2 border-2 border-black bg-black py-1 pl-3 pr-1 text-xs font-bold text-white",
        // flag / ribbon silhouette via clip on the right edge
        "[clip-path:polygon(0_0,100%_0,calc(100%-10px)_50%,100%_100%,0_100%)]",
        className
      )}
    >
      <Flag className="h-3.5 w-3.5" strokeWidth={2} />
      <span className="uppercase tracking-widest">{phase}</span>
      <span className="border-l border-dashed border-neutral-500 py-0.5 pl-2 pr-3 font-semibold normal-case tracking-normal text-neutral-300">
        {problemCode} — {label}
      </span>
    </motion.div>
  );
}
