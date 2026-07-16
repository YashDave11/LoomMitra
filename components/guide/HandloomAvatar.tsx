/**
 * HandloomAvatar — Meena, the Chanderi weaver, drawn as pure inline SVG.
 * Monochrome (black / white / gray) line art matching the Excalidraw-like
 * aesthetic: a faint loom motif behind her, sari pallu over the head, bindi,
 * and a weaving shuttle with a trailing thread in her hand.
 *
 * No external assets. Designed to read well at 64–96px.
 */
export default function HandloomAvatar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      role="img"
      aria-label="Meena, handloom weaver from Chanderi"
      className={className}
    >
      {/* ── loom motif behind Meena: two posts + dashed threads ── */}
      <g className="text-neutral-300" stroke="currentColor">
        <line x1="12" y1="14" x2="12" y2="86" strokeWidth="2" />
        <line x1="84" y1="14" x2="84" y2="86" strokeWidth="2" />
        {[26, 38, 50, 62, 74].map((y) => (
          <line
            key={y}
            x1="12"
            y1={y}
            x2="84"
            y2={y}
            strokeWidth="1.25"
            strokeDasharray="4 5"
          />
        ))}
      </g>

      {/* ── Meena ── */}
      <g className="text-black" stroke="currentColor">
        {/* body / draped sari (drawn first so the head overlaps it) */}
        <path
          d="M29 84c0-15 7.5-25 19-25s19 10 19 25"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="white"
        />
        {/* sari body shading */}
        <path
          d="M35 68c8-3 18-3 26 0"
          className="text-neutral-400"
          strokeWidth="1.5"
          strokeDasharray="3 4"
          strokeLinecap="round"
        />
        {/* pallu stripe falling across the body */}
        <path
          d="M39 61c-3.5 6-5 14-5 23"
          strokeWidth="2"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />

        {/* head */}
        <circle cx="48" cy="34" r="17" strokeWidth="2.5" fill="white" />
        {/* hair under the pallu: parted center */}
        <path
          d="M48 18c-6 0-11 4-13 10 4-3.5 8-5 13-5s9 1.5 13 5c-2-6-7-10-13-10Z"
          strokeWidth="1.75"
          fill="currentColor"
        />
        {/* sari pallu / dupatta over the head */}
        <path
          d="M31 30c1-12 9-19.5 17-19.5S64 18 65 30c-3-7-8-10.5-17-10.5S34 23 31 30Z"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="white"
        />
        {/* pallu falling over the shoulder */}
        <path
          d="M63 42c4 6 6.5 14 6.5 24"
          strokeWidth="2"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />

        {/* face */}
        <circle cx="48" cy="27.5" r="1.6" fill="currentColor" strokeWidth="0" />{/* bindi */}
        <circle cx="42.5" cy="32" r="1.4" fill="currentColor" strokeWidth="0" />
        <circle cx="53.5" cy="32" r="1.4" fill="currentColor" strokeWidth="0" />
        {/* smile */}
        <path
          d="M43.5 39c2 2.5 7 2.5 9 0"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* earrings */}
        <circle cx="33.5" cy="38" r="1.5" strokeWidth="1.5" fill="white" />
        <circle cx="62.5" cy="38" r="1.5" strokeWidth="1.5" fill="white" />

        {/* weaving shuttle in hand */}
        <rect
          x="58"
          y="65"
          width="17"
          height="7.5"
          rx="3.75"
          transform="rotate(-18 58 65)"
          strokeWidth="2"
          fill="white"
        />
        {/* thread wound on the shuttle */}
        <line
          x1="63"
          y1="63.5"
          x2="65"
          y2="69.5"
          className="text-neutral-400"
          strokeWidth="1.5"
        />
        {/* thread trailing off toward the loom */}
        <path
          d="M74 62c6.5 3 8.5 9.5 5 16"
          strokeWidth="1.5"
          strokeDasharray="3 4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
