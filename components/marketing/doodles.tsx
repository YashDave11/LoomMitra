import { cn } from "@/lib/utils";

/**
 * Monochrome SVG doodles used as faint background decoration,
 * echoing Excalidraw's hand-drawn energy. All are aria-hidden
 * and pointer-events-none.
 */

export function DoodleBlob({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 300"
      fill="none"
      className={cn("pointer-events-none absolute text-neutral-200", className)}
    >
      <path
        d="M60 150c-14-52 28-104 88-114s136 6 172 44 24 96-16 132-104 44-160 28S74 202 60 150Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="7 9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoodleScribble({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 300 80"
      fill="none"
      className={cn("pointer-events-none absolute text-neutral-200", className)}
    >
      <path
        d="M8 60C40 20 60 70 92 34s52 34 84-6 50 30 82-10 26 26 26 26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoodleFrame({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 400"
      fill="none"
      preserveAspectRatio="none"
      className={cn("pointer-events-none absolute text-neutral-200", className)}
    >
      <rect
        x="10"
        y="10"
        width="580"
        height="380"
        rx="24"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="14 12"
      />
      <rect
        x="26"
        y="28"
        width="548"
        height="344"
        rx="18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 10"
        opacity="0.7"
      />
    </svg>
  );
}

export function DoodleCrosses({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      fill="none"
      className={cn("pointer-events-none absolute text-neutral-200", className)}
    >
      {[
        [20, 30],
        [90, 15],
        [160, 45],
        [45, 110],
        [130, 95],
        [175, 150],
        [70, 170],
      ].map(([x, y], i) => (
        <g key={i} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d={`M${x - 6} ${y - 6} L${x + 6} ${y + 6}`} />
          <path d={`M${x + 6} ${y - 6} L${x - 6} ${y + 6}`} />
        </g>
      ))}
    </svg>
  );
}

/**
 * Hand-drawn style arrow, drawn with a slight wobble so it doesn't
 * look machine-perfect. Rotates for vertical (mobile) flows.
 */
export function SketchArrow({
  className,
  direction = "right",
}: {
  className?: string;
  direction?: "right" | "down";
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 40"
      fill="none"
      className={cn(
        "text-neutral-700",
        direction === "down" && "rotate-90",
        className
      )}
    >
      <path
        d="M4 22c14-5 30 4 44-2 9-4 16-2 24 1"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M60 12c5 4 9 7 13 9-5 2-9 4-14 8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
