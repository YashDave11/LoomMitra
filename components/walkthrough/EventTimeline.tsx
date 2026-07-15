"use client";

import { motion } from "framer-motion";
import { CircleDot, ClipboardCheck, Hammer, Store } from "lucide-react";

import {
  formatEventDate,
  type EventType,
  type ProductEvent,
} from "@/data/mockData";
import { cn } from "@/lib/utils";

const eventMeta: Record<
  EventType,
  { icon: typeof Hammer; friendly: string }
> = {
  CREATED: { icon: Hammer, friendly: "Woven" },
  QC_PASSED: { icon: ClipboardCheck, friendly: "Quality checked" },
  LISTED: { icon: Store, friendly: "Listed for sale" },
};

/**
 * Vertical hash-chained event timeline with a hand-drawn dashed spine.
 * `friendly` swaps system codes (CREATED) for buyer-facing labels (Woven).
 */
export default function EventTimeline({
  events,
  friendly = false,
  showHash = true,
  className,
}: {
  events: ProductEvent[];
  friendly?: boolean;
  showHash?: boolean;
  className?: string;
}) {
  return (
    <ol className={cn("relative space-y-6 pl-1", className)}>
      {/* slightly irregular hand-drawn spine */}
      <svg
        aria-hidden="true"
        className="absolute bottom-4 left-[22px] top-4 w-2 text-neutral-300"
        viewBox="0 0 8 400"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M4 0c2 40-2 70 1 110s-3 80 0 120-2 90 0 170"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="8 7"
          strokeLinecap="round"
        />
      </svg>

      {events.map((ev, i) => {
        const meta = eventMeta[ev.eventType] ?? {
          icon: CircleDot,
          friendly: ev.eventType,
        };
        const Icon = meta.icon;
        return (
          <motion.li
            key={ev.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.12, ease: "easeOut" }}
            className="relative flex items-start gap-4"
          >
            <span className="sketch-box z-10 flex h-12 w-12 shrink-0 items-center justify-center border-2 border-black bg-white">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div className="sketch-box-alt flex-1 border-2 border-neutral-300 bg-white p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-bold">
                  {friendly ? meta.friendly : ev.eventType}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatEventDate(ev.timestamp)}
                </p>
              </div>
              <p className="mt-1 text-sm text-neutral-600">{ev.actorName}</p>
              {showHash && (
                <p className="mt-2 inline-block rounded border border-dashed border-neutral-400 bg-neutral-50 px-2 py-0.5 font-mono text-xs text-neutral-600">
                  hash: {ev.hashPreview}
                </p>
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
