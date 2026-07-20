"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { PartyPopper } from "lucide-react";

/**
 * Small hook + toast pair for demo-only actions (e.g. "Buy now").
 * Portaled to <body>: rendering it inline puts it inside the page's
 * `main` stacking context, where the footer (later in the DOM, with
 * backdrop-blur) paints over it and blurs the text.
 */
export function useDemoToast(duration = 2800) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), duration);
    return () => clearTimeout(t);
  }, [open, duration]);

  return { open, show: () => setOpen(true) };
}

export default function DemoToast({ open }: { open: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        // Centering lives on this wrapper, not the toast: framer-motion owns
        // the toast's inline `transform`, so a -translate-x-1/2 there gets
        // overwritten and the toast drifts right / off-screen on phones.
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex justify-center px-4">
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="sketch-box pointer-events-auto flex max-w-full items-center gap-2.5 border-2 border-black bg-black px-5 py-3 text-sm font-semibold text-white shadow-[5px_5px_0_0_rgba(0,0,0,0.25)]"
          >
            <PartyPopper className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            Thanks for trying LoomMitra! This is a demo — no real order was
            placed.
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
