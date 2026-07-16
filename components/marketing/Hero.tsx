"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2, QrCode, ShoppingBag, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DoodleCrosses, DoodleScribble, SketchArrow } from "./doodles";

const flow = [
  { icon: User, label: "Weaver" },
  { icon: QrCode, label: "QR Passport" },
  { icon: ShoppingBag, label: "Buyer" },
  { icon: Building2, label: "Cooperative" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: "easeOut" as const },
  }),
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <DoodleCrosses className="left-[4%] top-16 hidden h-40 w-40 lg:block" />
      <DoodleScribble className="right-[6%] top-24 hidden h-16 w-56 lg:block" />

      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-20 pt-20 text-center sm:pt-28">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
          <Badge variant="dashed" className="mb-6">
            Indian Handloom Hackathon 2026 · Clickable Prototype
          </Badge>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.1}
          className="max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl"
        >
          LoomMitra —{" "}
          <span className="underline decoration-neutral-300 decoration-wavy decoration-2 underline-offset-8">
            Trust from Loom to Market
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.22}
          className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg"
        >
          Rural weavers can&apos;t easily reach digital markets, and buyers have
          no way to verify what&apos;s truly &ldquo;handloom&rdquo;. Meanwhile,
          cooperatives still run on paper registers and lose bargaining power.
          LoomMitra gives every woven product a scannable digital identity —
          connecting weaver, buyer, and cooperative on one page.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.34}
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button asChild size="lg">
              <Link href="/dashboard">
                Open Interactive Prototype
                <ArrowRight strokeWidth={2} />
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button asChild variant="outline" size="lg">
              <a href="#solution">How it works</a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Central sketch diagram: Weaver → QR → Buyer → Cooperative */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          className="sketch-box-alt sketch-shadow relative mt-16 w-full max-w-3xl border-2 border-dashed border-black bg-white px-6 py-10 sm:px-10"
        >
          <span className="absolute -top-3 left-8 bg-white px-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
            The flow, at a glance
          </span>

          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-1">
            {flow.map((step, i) => (
              <div
                key={step.label}
                className="flex flex-col items-center gap-2 sm:flex-row sm:gap-1"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.7 + i * 0.18,
                    type: "spring",
                    stiffness: 260,
                    damping: 16,
                  }}
                  className="flex flex-col items-center gap-2"
                >
                  {/* each node breathes on its own beat once revealed */}
                  <motion.span
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 3.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.4 + i * 0.45,
                    }}
                    whileHover={{ scale: 1.12, rotate: i % 2 === 0 ? 3 : -3 }}
                    className={
                      i % 2 === 0
                        ? "sketch-box flex h-16 w-16 items-center justify-center border-2 border-black bg-white"
                        : "sketch-box-alt flex h-16 w-16 items-center justify-center border-2 border-dashed border-black bg-white"
                    }
                  >
                    <step.icon className="h-7 w-7" strokeWidth={1.5} />
                  </motion.span>
                  <span className="text-sm font-semibold">{step.label}</span>
                </motion.div>
                {i < flow.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.85 + i * 0.18, duration: 0.3 }}
                  >
                    <SketchArrow className="hidden h-8 w-14 shrink-0 sm:-mt-6 sm:block" />
                    <SketchArrow
                      direction="down"
                      className="my-1 h-7 w-12 sm:hidden"
                    />
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* a thread being woven under the flow */}
          <svg
            aria-hidden="true"
            viewBox="0 0 600 24"
            fill="none"
            className="mx-auto mt-8 h-5 w-full max-w-lg text-neutral-300"
            preserveAspectRatio="none"
          >
            <path
              d="M4 12c50-14 100 14 150 0s100-14 150 0 100 14 150 0 100-14 142 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="8 10"
              strokeLinecap="round"
              className="animate-dash-flow"
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
