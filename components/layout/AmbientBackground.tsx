/**
 * AmbientBackground — a full-viewport, hand-drawn "living" backdrop for
 * LoomMitra. Everything is monochrome inline SVG in the Excalidraw style:
 * a weaving shuttle gliding across the top, flowing warp threads, drifting
 * charkha (spinning wheel), swaying saree on a clothesline, bobbing spools,
 * paper-plane QR tags and a lazy flock of birds.
 *
 * Pure CSS keyframe animation (see globals.css) — zero JS, aria-hidden,
 * pointer-events-none, and fully disabled under prefers-reduced-motion.
 */

function Shuttle({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 40" fill="none" className={className}>
      {/* shuttle body */}
      <path
        d="M8 20c14-9 40-14 52-14s38 5 52 14c-14 9-40 14-52 14S22 29 8 20Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* bobbin window + thread */}
      <ellipse cx="60" cy="20" rx="16" ry="6" stroke="currentColor" strokeWidth="2" />
      <path d="M44 20h32" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" />
      {/* trailing thread */}
      <path
        d="M8 20c-10 2-18 8-26 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Charkha({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 160 120" fill="none" className={className}>
      {/* big wheel — spins slowly via CSS on the inner group */}
      <g className="animate-spin-slower" style={{ transformOrigin: "55px 55px" }}>
        <circle cx="55" cy="55" r="42" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="55" cy="55" r="30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 7" />
        {[0, 30, 60, 90, 120, 150].map((deg) => (
          <line
            key={deg}
            x1="55"
            y1="13"
            x2="55"
            y2="97"
            stroke="currentColor"
            strokeWidth="1.5"
            transform={`rotate(${deg} 55 55)`}
          />
        ))}
      </g>
      {/* stand */}
      <path d="M30 110 55 62l25 48" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      {/* drive band to spindle */}
      <path
        d="M92 38c22-6 40-4 52 8M96 74c20 4 36 0 48-12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        strokeLinecap="round"
      />
      {/* spindle */}
      <g className="animate-spin-slower-reverse" style={{ transformOrigin: "146px 55px" }}>
        <circle cx="146" cy="55" r="9" stroke="currentColor" strokeWidth="2" />
        <line x1="146" y1="42" x2="146" y2="68" stroke="currentColor" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function SareeLine({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 220 150" fill="none" className={className}>
      {/* clothesline */}
      <path
        d="M4 22c40 10 140 12 212-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* hanging saree — sways from the line */}
      <g className="animate-sway" style={{ transformOrigin: "110px 26px" }}>
        <path
          d="M62 26c-4 40-6 74 4 104 30 8 62 8 92-2 8-32 6-66 2-102"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* drape folds */}
        <path d="M88 30c-2 34-3 64 2 96M112 32c0 34 0 62 2 94M138 30c2 32 3 62-2 94" stroke="currentColor" strokeWidth="1.3" strokeDasharray="6 7" />
        {/* zari border */}
        <path d="M64 108c30 10 64 10 94 0" stroke="currentColor" strokeWidth="1.8" strokeDasharray="2 4" />
        {/* clips */}
        <path d="M62 20v12M160 18v12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Spool({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 70 80" fill="none" className={className}>
      <path d="M14 10h42M14 70h42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 12v56M50 12v56" stroke="currentColor" strokeWidth="2" />
      {/* wound thread */}
      <path
        d="M22 22c9 3 18 3 26 0M22 32c9 3 18 3 26 0M22 42c9 3 18 3 26 0M22 52c9 3 18 3 26 0"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* loose thread end */}
      <path d="M48 58c10 6 14 14 10 20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" />
    </svg>
  );
}

function QrKite({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 90 130" fill="none" className={className}>
      {/* QR tag as a kite */}
      <rect x="20" y="8" width="50" height="50" rx="8" stroke="currentColor" strokeWidth="2.5" transform="rotate(8 45 33)" />
      {[
        [30, 20], [46, 18], [58, 26], [32, 36], [48, 40], [60, 44],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="7" height="7" rx="1.5" fill="currentColor" opacity="0.7" transform="rotate(8 45 33)" />
      ))}
      {/* kite string with bows */}
      <path d="M42 62c-6 20 4 34-4 56" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" strokeLinecap="round" />
      <path d="M36 86l10-4M34 106l10-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Birds({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 160 60" fill="none" className={className}>
      <path d="M10 30c6-8 12-8 16 0 4-8 10-8 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M70 16c5-7 10-7 13 0 3-7 8-7 13 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M120 40c4-6 8-6 11 0 3-6 7-6 11 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LoomFrame({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 160" fill="none" className={className}>
      {/* frame posts */}
      <path d="M20 10v140M180 10v140M12 150h176M20 20h160" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* warp threads — dashes flow downward like weaving in progress */}
      {[45, 70, 95, 120, 145].map((x) => (
        <path
          key={x}
          d={`M${x} 24v120`}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="7 9"
          className="animate-dash-flow"
        />
      ))}
      {/* woven cloth building up at the bottom */}
      <path d="M28 118h144M28 128h144M28 138h144" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
      {/* beater bar */}
      <path d="M24 106h152" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="animate-bob" />
    </svg>
  );
}

/** Long horizontal weaving thread that "flows" across the whole page. */
function FlowingThread({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 120"
      fill="none"
      preserveAspectRatio="none"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        d="M-20 60c120-40 240 40 360 0s240-40 360 0 240 40 360 0 240-40 400 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="10 14"
        strokeLinecap="round"
        className="animate-dash-flow"
      />
      <path
        d="M-20 78c120 34 240-34 360 6s240 34 360-6 240-34 360 6 240 34 400-6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeDasharray="4 10"
        strokeLinecap="round"
        className="animate-dash-flow-fast"
        opacity="0.7"
      />
    </svg>
  );
}

export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden text-neutral-200"
    >
      {/* gliding shuttle near the top */}
      <div className="absolute left-0 top-24 w-full">
        <Shuttle className="animate-shuttle h-9 w-24 text-neutral-300" />
      </div>

      {/* flowing threads across the middle and bottom */}
      <FlowingThread className="absolute top-[38%] h-24 w-full" />
      <FlowingThread className="absolute bottom-[8%] h-20 w-full opacity-70" flip />

      {/* left rail: charkha + spool */}
      <Charkha className="animate-drift-slow absolute -left-6 top-[16%] hidden h-32 w-44 md:block" />
      <Spool className="animate-bob-slow absolute left-[6%] bottom-[18%] hidden h-20 w-16 lg:block" />

      {/* right rail: saree on the line + loom + kite */}
      <SareeLine className="animate-drift absolute -right-8 top-[12%] hidden h-40 w-56 md:block" />
      <LoomFrame className="animate-drift-reverse absolute right-[4%] bottom-[10%] hidden h-40 w-52 lg:block" />
      <QrKite className="animate-wobble absolute left-[38%] top-[8%] hidden h-28 w-20 xl:block text-neutral-300" />

      {/* birds crossing the sky at two offsets */}
      <div className="absolute top-16 w-full">
        <Birds className="animate-fly h-10 w-32" />
      </div>
      <div className="absolute top-40 w-full">
        <Birds className="animate-fly-late h-8 w-28 opacity-70" />
      </div>

      {/* a couple of extra bobbing spools for depth */}
      <Spool className="animate-bob absolute right-[30%] top-[55%] hidden h-14 w-11 opacity-70 xl:block" />
      <Spool className="animate-bob-slow absolute left-[24%] top-[70%] hidden h-12 w-10 opacity-60 xl:block" />
    </div>
  );
}
