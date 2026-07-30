"use client";

/**
 * AmbientBackground — a full-viewport, hand-drawn "living" backdrop for
 * LoomMitra, now driven by GSAP instead of CSS keyframes. Everything is
 * monochrome inline SVG in the Excalidraw style: a weaving shuttle gliding
 * across the top, flowing warp threads, a spinning charkha, a swaying saree
 * on a clothesline, bobbing spools, a paper-plane QR tag, a working loom and
 * a lazy flock of birds.
 *
 * The motion is orchestrated in three layers:
 *   1. Entrance  — the whole scene fades in as a staggered sequence on mount.
 *   2. Life      — every element runs its own organic, randomized loop
 *                  (drift / bob / sway / spin / glide) so the backdrop never
 *                  reads as a mechanical, perfectly periodic loop.
 *   3. Depth     — three depth layers shift with page scroll (parallax) and
 *                  drift gently toward the cursor, so the background responds
 *                  to the whole document, across every page.
 *
 * Accessibility: all motion is created inside a gsap.matchMedia() block keyed
 * to `(prefers-reduced-motion: no-preference)`, so users who ask for reduced
 * motion get the same artwork perfectly still. The layer is aria-hidden and
 * pointer-events-none. Performance: only transform/opacity are animated, with
 * will-change on the moving wrappers, and gsap.quickTo() for the mouse parallax.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let pluginsRegistered = false;

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
      {/* big wheel — spins via GSAP on the inner group */}
      <g className="ab-charkha-wheel">
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
      <g className="ab-spindle">
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
      {/* hanging saree — sways from the line via GSAP */}
      <g className="ab-saree-sway">
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
          className="ab-warp"
        />
      ))}
      {/* woven cloth building up at the bottom */}
      <path d="M28 118h144M28 128h144M28 138h144" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
      {/* beater bar — bobs via GSAP */}
      <path d="M24 106h152" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="ab-loom-beater" />
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
        className="ab-thread-flow"
      />
      <path
        d="M-20 78c120 34 240-34 360 6s240 34 360-6 240-34 360 6 240 34 400-6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeDasharray="4 10"
        strokeLinecap="round"
        className="ab-thread-flow-fast"
        opacity="0.7"
      />
    </svg>
  );
}

export default function AmbientBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      if (!pluginsRegistered) {
        gsap.registerPlugin(useGSAP, ScrollTrigger);
        pluginsRegistered = true;
      }

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* 1 — Entrance: the scene assembles as a staggered fade-in. */
        gsap.fromTo(
          ".ab-fade",
          { opacity: 0 },
          { opacity: 1, duration: 0.8, stagger: 0.06, ease: "power2.out" }
        );

        /* 2 — Flowing threads + loom warp (stroke-dashoffset "weaving"). */
        gsap.to([".ab-thread-flow", ".ab-warp"], {
          strokeDashoffset: -600,
          duration: 24,
          repeat: -1,
          ease: "none",
        });
        gsap.to(".ab-thread-flow-fast", {
          strokeDashoffset: -400,
          duration: 10,
          repeat: -1,
          ease: "none",
        });

        /* Charkha: wheel + spindle spin on their true SVG origins. */
        gsap.to(".ab-charkha-wheel", { rotation: 360, duration: 40, repeat: -1, ease: "none", svgOrigin: "55 55" });
        gsap.to(".ab-spindle", { rotation: -360, duration: 55, repeat: -1, ease: "none", svgOrigin: "146 55" });

        /* Saree sways on the clothesline; loom beater bobs. */
        gsap.to(".ab-saree-sway", { rotation: 4, duration: 4.5, repeat: -1, yoyo: true, ease: "sine.inOut", svgOrigin: "110 26" });
        gsap.to(".ab-loom-beater", { y: 5, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" });

        /* Organic drift: function-based values + repeatRefresh re-roll each
           cycle, so motion is never perfectly periodic. */
        const drift = (sel: string, maxX: number, maxY: number, maxRot: number) =>
          gsap.to(sel, {
            x: () => gsap.utils.random(-maxX, maxX),
            y: () => gsap.utils.random(-maxY, maxY),
            rotation: () => gsap.utils.random(-maxRot, maxRot),
            duration: () => gsap.utils.random(12, 20),
            repeat: -1,
            yoyo: true,
            repeatRefresh: true,
            ease: "sine.inOut",
          });
        drift(".ab-charkha", 16, 22, 3);
        drift(".ab-saree", 18, 16, 3);
        drift(".ab-loom", 14, 20, 3);
        drift(".ab-kite", 10, 18, 4);

        /* Spools bob on their own beats. */
        gsap.to(".ab-spool-1", { y: -14, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to(".ab-spool-2", { y: -10, duration: 9, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to(".ab-spool-3", { y: -12, duration: 11, repeat: -1, yoyo: true, ease: "sine.inOut" });

        /* Shuttle glides across, turns around, glides back — the signature motion. */
        const shuttle = gsap.timeline({ repeat: -1, defaults: { ease: "power1.inOut" } });
        shuttle
          .set(".ab-shuttle", { x: -220, scaleX: 1 })
          .to(".ab-shuttle", { x: () => window.innerWidth + 220, duration: 24 })
          .to(".ab-shuttle", { scaleX: -1, duration: 0.45, ease: "power2.inOut" }, ">-0.2")
          .to(".ab-shuttle", { x: -220, duration: 24 })
          .to(".ab-shuttle", { scaleX: 1, duration: 0.45, ease: "power2.inOut" }, ">-0.2");

        /* Birds cross the sky, each flock on its own cadence + gentle bob. */
        gsap.set([".ab-birds-1", ".ab-birds-2"], { x: -200 });
        gsap.to(".ab-birds-1", { x: () => window.innerWidth + 220, duration: 38, repeat: -1, repeatDelay: 10, ease: "none" });
        gsap.to(".ab-birds-2", { x: () => window.innerWidth + 220, duration: 44, repeat: -1, repeatDelay: 14, ease: "none" });
        gsap.to(".ab-birds-1", { y: -24, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to(".ab-birds-2", { y: 18, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });

        /* 3 — Scroll parallax: depth layers drift as the page scrolls. */
        gsap.to(".ab-layer-far", { yPercent: -6, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 1.2 } });
        gsap.to(".ab-layer-mid", { yPercent: -12, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 1.2 } });
        gsap.to(".ab-layer-near", { yPercent: -18, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 1.2 } });

        /* Mouse parallax: layers ease toward the cursor (quickTo = one reused tween each). */
        const quick = (sel: string, p: "x" | "y") => gsap.quickTo(sel, p, { duration: 1.1, ease: "power3" });
        const farX = quick(".ab-layer-far", "x"), farY = quick(".ab-layer-far", "y");
        const midX = quick(".ab-layer-mid", "x"), midY = quick(".ab-layer-mid", "y");
        const nearX = quick(".ab-layer-near", "x"), nearY = quick(".ab-layer-near", "y");
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          farX(-nx * 8); farY(-ny * 6);
          midX(-nx * 18); midY(-ny * 14);
          nearX(-nx * 30); nearY(-ny * 22);
        };
        window.addEventListener("pointermove", onMove, { passive: true });

        return () => window.removeEventListener("pointermove", onMove);
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  /* Re-measure scroll-linked parallax whenever the route (and thus page height) changes. */
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (ScrollTrigger.getAll().length) ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden text-neutral-200"
    >
      {/* FAR layer — birds + QR kite (moves least) */}
      <div className="ab-layer-far absolute inset-0 will-change-transform">
        <div className="absolute left-0 top-16 w-full ab-fade">
          <div className="ab-birds-1 will-change-transform">
            <Birds className="h-10 w-32" />
          </div>
        </div>
        <div className="absolute top-40 w-full ab-fade">
          <div className="ab-birds-2 will-change-transform">
            <Birds className="h-8 w-28 opacity-70" />
          </div>
        </div>
        <div className="absolute left-[38%] top-[8%] hidden ab-fade xl:block">
          <div className="ab-kite will-change-transform text-neutral-300">
            <QrKite className="h-28 w-20" />
          </div>
        </div>
      </div>

      {/* MID layer — threads, charkha, saree, shuttle */}
      <div className="ab-layer-mid absolute inset-0 will-change-transform">
        <div className="absolute top-[38%] h-24 w-full ab-fade">
          <FlowingThread className="h-24 w-full" />
        </div>
        <div className="absolute bottom-[8%] h-20 w-full ab-fade opacity-70">
          <FlowingThread className="h-20 w-full" flip />
        </div>
        <div className="absolute -left-6 top-[16%] hidden h-32 w-44 ab-fade md:block">
          <div className="ab-charkha will-change-transform">
            <Charkha className="h-32 w-44" />
          </div>
        </div>
        <div className="absolute -right-8 top-[12%] hidden h-40 w-56 ab-fade md:block">
          <div className="ab-saree will-change-transform">
            <SareeLine className="h-40 w-56" />
          </div>
        </div>
        <div className="absolute left-0 top-24 w-full ab-fade">
          <div className="ab-shuttle will-change-transform">
            <Shuttle className="h-9 w-24 text-neutral-300" />
          </div>
        </div>
      </div>

      {/* NEAR layer — spools + loom (moves most) */}
      <div className="ab-layer-near absolute inset-0 will-change-transform">
        <div className="absolute bottom-[18%] left-[6%] hidden h-20 w-16 ab-fade lg:block">
          <div className="ab-spool-1 will-change-transform">
            <Spool className="h-20 w-16" />
          </div>
        </div>
        <div className="absolute bottom-[10%] right-[4%] hidden h-40 w-52 ab-fade lg:block">
          <div className="ab-loom will-change-transform">
            <LoomFrame className="h-40 w-52" />
          </div>
        </div>
        <div className="absolute right-[30%] top-[55%] hidden h-14 w-11 ab-fade opacity-70 xl:block">
          <div className="ab-spool-2 will-change-transform">
            <Spool className="h-14 w-11" />
          </div>
        </div>
        <div className="absolute left-[24%] top-[70%] hidden h-12 w-10 ab-fade opacity-60 xl:block">
          <div className="ab-spool-3 will-change-transform">
            <Spool className="h-12 w-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
