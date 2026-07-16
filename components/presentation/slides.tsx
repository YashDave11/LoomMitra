"use client";

/**
 * LoomMitra pitch deck — 10 slides authored on a fixed 1920×1080 canvas.
 * Same visual language as the rest of the app: black-and-white,
 * hand-drawn sketch boxes, dashed strokes, lucide icons, framer-motion.
 */

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CircleDollarSign,
  Database,
  FileBadge,
  Globe2,
  Handshake,
  IndianRupee,
  Layers,
  LineChart,
  Lock,
  Megaphone,
  Network,
  QrCode,
  Rocket,
  ScanSearch,
  Scissors,
  Server,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  User,
  Users,
  Workflow,
} from "lucide-react";

import {
  DoodleBlob,
  DoodleCrosses,
  DoodleScribble,
  SketchArrow,
} from "@/components/marketing/doodles";

/* ─────────────────────────── shared bits ─────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay, ease: "easeOut" as const },
  }),
};

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

/** Standard slide frame: padding + kicker badge + title row. */
function Shell({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col px-28 pb-32 pt-20">
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-neutral-500 bg-white px-5 py-1.5 text-base font-semibold uppercase tracking-widest">
          {kicker}
        </span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="mt-5 text-6xl font-extrabold leading-tight tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 max-w-4xl text-2xl leading-relaxed text-neutral-600">
            {subtitle}
          </p>
        )}
      </Reveal>
      <div className="mt-10 flex-1">{children}</div>
    </div>
  );
}

/* ─────────────────────────── 1 · TITLE ─────────────────────────── */

function SlideTitle() {
  const flow = [
    { icon: User, label: "Weaver" },
    { icon: QrCode, label: "QR Passport" },
    { icon: ShoppingBag, label: "Buyer" },
    { icon: Building2, label: "Cooperative" },
  ];
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center px-32 text-center">
      <DoodleCrosses className="left-[6%] top-24 h-56 w-56" />
      <DoodleScribble className="right-[7%] top-32 h-20 w-72" />
      <DoodleBlob className="-left-32 bottom-16 h-96 w-[30rem]" />

      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-neutral-500 bg-white px-6 py-2 text-lg font-semibold uppercase tracking-widest">
          Indian Handloom Hackathon 2026
        </span>
      </Reveal>

      <Reveal delay={0.1}>
        <h1 className="mt-8 max-w-6xl text-8xl font-extrabold leading-[1.05] tracking-tight">
          LoomMitra —{" "}
          <span className="underline decoration-neutral-300 decoration-wavy decoration-4 underline-offset-[16px]">
            Trust & Markets
          </span>{" "}
          for Indian Handloom
        </h1>
      </Reveal>

      <Reveal delay={0.22}>
        <p className="mt-8 max-w-4xl text-3xl leading-relaxed text-neutral-600">
          Connecting weavers, buyers, and cooperatives with digital product
          passports and local stories — so weavers sell directly, prove
          authenticity, and negotiate as a collective.
        </p>
      </Reveal>

      {/* the flow, at a glance */}
      <Reveal delay={0.38} className="mt-14">
        <div className="sketch-box-alt sketch-shadow relative border-2 border-dashed border-black bg-white px-16 py-10">
          <span className="absolute -top-4 left-10 bg-white px-3 text-base font-semibold uppercase tracking-widest text-neutral-500">
            The flow, at a glance
          </span>
          <div className="flex items-center gap-4">
            {flow.map((step, i) => (
              <div key={step.label} className="flex items-center gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.6 + i * 0.15,
                    type: "spring",
                    stiffness: 260,
                    damping: 16,
                  }}
                  className="flex flex-col items-center gap-3"
                >
                  <span
                    className={
                      i % 2 === 0
                        ? "sketch-box flex h-24 w-24 items-center justify-center border-2 border-black bg-white"
                        : "sketch-box-alt flex h-24 w-24 items-center justify-center border-2 border-dashed border-black bg-white"
                    }
                  >
                    <step.icon className="h-11 w-11" strokeWidth={1.5} />
                  </span>
                  <span className="text-xl font-semibold">{step.label}</span>
                </motion.div>
                {i < flow.length - 1 && (
                  <SketchArrow className="-mt-9 h-10 w-20 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/* ─────────────────────────── 2 · PROBLEM ─────────────────────────── */

function SlideProblem() {
  const problems = [
    {
      icon: Scissors,
      stat: "60–70%",
      statLabel: "of final price captured by intermediaries",
      title: "Weavers stuck behind middlemen",
      body: "In clusters like Chanderi and Pochampally, weavers sell through layers of intermediaries — each taking margin, leaving low and unstable incomes with no direct link to buyers.",
    },
    {
      icon: ScanSearch,
      stat: "No way",
      statLabel: "for buyers to verify what's truly handloom",
      title: "Buyers can't verify authenticity",
      body: "Powerloom fakes flood the market wearing “handloom” tags. There's no QR to scan, no story of who wove it, no traceability — so genuine handloom loses its premium.",
    },
    {
      icon: Building2,
      stat: "Paper",
      statLabel: "ledgers still run most cooperatives",
      title: "Cooperatives run on paper",
      body: "Member records, production and bulk orders are tracked manually with no real-time data — making collective bargaining weak and bulk orders slow to fulfil.",
    },
  ];
  return (
    <Shell
      kicker="02 · The Problem"
      title="Three broken links in the chain"
      subtitle="The handloom economy runs on trust — but today that trust has no infrastructure."
    >
      <div className="grid h-full grid-cols-3 gap-10">
        {problems.map((p, i) => (
          <Reveal key={p.title} delay={0.18 + i * 0.12} className="h-full">
            <div
              className={`flex h-full flex-col border-2 border-black bg-white p-10 ${
                i === 1
                  ? "sketch-box-alt border-dashed"
                  : "sketch-box sketch-shadow"
              }`}
            >
              <span className="sketch-box-alt mb-6 flex h-20 w-20 items-center justify-center border-2 border-black">
                <p.icon className="h-9 w-9" strokeWidth={1.5} />
              </span>
              <div className="text-5xl font-extrabold tracking-tight">
                {p.stat}
              </div>
              <div className="mt-1 text-lg font-semibold uppercase tracking-wide text-neutral-500">
                {p.statLabel}
              </div>
              <h3 className="mt-6 text-3xl font-bold leading-snug">
                {p.title}
              </h3>
              <p className="mt-4 text-xl leading-relaxed text-neutral-600">
                {p.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Shell>
  );
}

/* ─────────────────────────── 3 · SOLUTION ─────────────────────────── */

function SlideSolution() {
  const steps = [
    {
      icon: FileBadge,
      title: "Digital product passports",
      body: "Every saree gets a passport — weaver's story, fabric details, and a QR code with a verified event timeline.",
      phase: "Phase 1 · Problem 2.1 — Digital market access",
    },
    {
      icon: Smartphone,
      title: "Buyers scan & trust",
      body: "One scan shows authenticity, the weaver's story, and the product's journey from loom to market.",
      phase: "Phase 2 · Problem 2.2 — Digital authenticity",
    },
    {
      icon: BarChart3,
      title: "Cooperative dashboards",
      body: "Members, inventory and bulk orders in one live view — data-backed collective bargaining.",
      phase: "Phase 3 · Problem 4.3 — Cooperative digitisation",
    },
  ];
  return (
    <Shell
      kicker="03 · The Solution"
      title="One passport. Three sides of trust."
      subtitle="LoomMitra onboards weavers with simple digital identities, gives every product a scannable passport, and gives cooperatives live data."
    >
      <div className="flex h-full items-center gap-6">
        {steps.map((s, i) => (
          <div key={s.title} className="flex flex-1 items-center gap-6">
            <Reveal delay={0.2 + i * 0.14} className="h-full flex-1">
              <div className="sketch-box sketch-shadow flex h-full flex-col border-2 border-black bg-white p-10">
                <div className="flex items-center justify-between">
                  <span className="sketch-box flex h-20 w-20 items-center justify-center border-2 border-black">
                    <s.icon className="h-9 w-9" strokeWidth={1.5} />
                  </span>
                  <span className="text-xl font-bold uppercase tracking-widest text-neutral-400">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="mt-7 text-3xl font-bold leading-snug">
                  {s.title}
                </h3>
                <p className="mt-4 flex-1 text-xl leading-relaxed text-neutral-600">
                  {s.body}
                </p>
                <span className="mt-6 inline-flex self-start rounded-full border-2 border-dashed border-neutral-400 px-4 py-1.5 text-base font-semibold text-neutral-600">
                  {s.phase}
                </span>
              </div>
            </Reveal>
            {i < steps.length - 1 && (
              <SketchArrow className="h-10 w-16 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </Shell>
  );
}

/* ─────────────────────────── 4 · IMPACT ─────────────────────────── */

function SlideImpact() {
  // Pilot scenario: weaver's retained margin per ₹2,000–2,500 saree
  const bars = [
    { label: "Before LoomMitra", value: 1200, pct: 62, dashed: true },
    { label: "With LoomMitra", value: 1450, pct: 82, dashed: false },
  ];
  const grid = [
    {
      icon: IndianRupee,
      title: "Income",
      body: "+15–20% margin per saree → ₹6,000–₹12,000 extra per weaver per month at 3–5 sarees.",
    },
    {
      icon: ShieldCheck,
      title: "Trust",
      body: "GI-tagged clusters like Pochampally protect their brand with verified passports — enabling premium pricing.",
    },
    {
      icon: Handshake,
      title: "Bargaining power",
      body: "A cooperative of 500+ members with live inventory data can negotiate bulk orders of 200–500 sarees.",
    },
    {
      icon: Globe2,
      title: "Export-readiness",
      body: "Traceable, story-rich products meet what boutiques and export houses increasingly demand.",
    },
  ];
  return (
    <Shell
      kicker="04 · Impact"
      title="Real numbers from a pilot cluster"
      subtitle="Chanderi, Madhya Pradesh — ~1,000 active weavers, each producing 3–5 sarees a month."
    >
      <div className="grid h-full grid-cols-[1.05fr_1.3fr] gap-14">
        {/* bar chart: margin retained per saree */}
        <Reveal delay={0.2} className="h-full">
          <div className="sketch-box-alt sketch-shadow relative flex h-full flex-col border-2 border-black bg-white p-10">
            <span className="absolute -top-4 left-8 bg-white px-3 text-base font-semibold uppercase tracking-widest text-neutral-500">
              Margin retained per saree (pilot scenario)
            </span>
            <div className="flex flex-1 items-end justify-center gap-20 pt-8">
              {bars.map((b, i) => (
                <div key={b.label} className="flex flex-col items-center gap-4">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 + i * 0.25 }}
                    className="text-4xl font-extrabold"
                  >
                    ₹{b.value.toLocaleString("en-IN")}
                  </motion.span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${b.pct * 3.2}px` }}
                    transition={{
                      delay: 0.5 + i * 0.25,
                      duration: 0.7,
                      ease: "easeOut",
                    }}
                    className={`w-36 border-2 border-black ${
                      b.dashed
                        ? "border-dashed bg-white"
                        : "sketch-box bg-black"
                    }`}
                  />
                  <span className="text-xl font-semibold">{b.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-lg text-neutral-500">
              On a ₹2,000–₹2,500 saree, direct sales lift weaver-retained
              margin from ~₹1,200 to ₹1,400–₹1,500.
            </p>
          </div>
        </Reveal>

        {/* impact grid */}
        <div className="grid grid-cols-2 gap-8">
          {grid.map((g, i) => (
            <Reveal key={g.title} delay={0.3 + i * 0.1} className="h-full">
              <div
                className={`flex h-full flex-col border-2 border-black bg-white p-8 ${
                  i % 2 === 0 ? "sketch-box" : "sketch-box-alt border-dashed"
                }`}
              >
                <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black">
                  <g.icon className="h-7 w-7" strokeWidth={1.5} />
                </span>
                <h3 className="text-2xl font-bold">{g.title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-neutral-600">
                  {g.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/* ──────────────────── 5 · SCALABILITY & FEASIBILITY ──────────────────── */

function SlideScale() {
  const ladder = [
    { label: "Pilot", detail: "1–2 cooperatives · Chanderi & Pochampally" },
    { label: "State", detail: "Cluster-by-cluster via NGO channels" },
    { label: "Multi-cluster", detail: "Reusable onboarding flows" },
    { label: "National", detail: "Govt handloom bodies as partners" },
  ];
  const cards = [
    {
      icon: QrCode,
      title: "Familiar tech",
      body: "Web apps + QR codes. No exotic hardware — builds on existing QR pilot projects for handloom.",
    },
    {
      icon: Users,
      title: "Adoption via partners",
      body: "Cooperatives and NGOs onboard weavers they already know — trust rides on existing relationships.",
    },
    {
      icon: Lock,
      title: "Data integrity",
      body: "Event logs with hash-chaining make product histories tamper-evident without heavy blockchain costs.",
    },
    {
      icon: Layers,
      title: "Repeatable playbook",
      body: "The same onboarding flows, passports and dashboards deploy to every new cluster unchanged.",
    },
  ];
  return (
    <Shell
      kicker="05 · Scalability & Feasibility"
      title="Realistic to deploy, designed to scale"
      subtitle="Start where trust already exists — then repeat the playbook cluster by cluster."
    >
      <div className="flex h-full flex-col gap-12">
        {/* growth ladder */}
        <Reveal delay={0.2}>
          <div className="flex items-end justify-center gap-6">
            {ladder.map((step, i) => (
              <div key={step.label} className="flex items-end gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.15 }}
                  className={`flex w-[300px] flex-col items-center border-2 border-black bg-white px-8 pb-6 pt-7 text-center ${
                    i % 2 === 0
                      ? "sketch-box sketch-shadow"
                      : "sketch-box-alt border-dashed"
                  }`}
                  style={{ marginBottom: i * 26 }}
                >
                  <span className="text-3xl font-extrabold">{step.label}</span>
                  <span className="mt-2 text-lg text-neutral-600">
                    {step.detail}
                  </span>
                </motion.div>
                {i < ladder.length - 1 && (
                  <SketchArrow
                    className="mb-10 h-10 w-16 shrink-0 -rotate-12"
                  />
                )}
              </div>
            ))}
          </div>
        </Reveal>

        {/* feasibility cards */}
        <div className="grid flex-1 grid-cols-4 gap-8">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={0.5 + i * 0.1} className="h-full">
              <div className="flex h-full flex-col border-2 border-neutral-300 bg-white p-7 sketch-box">
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-black">
                  <c.icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <h3 className="text-2xl font-bold">{c.title}</h3>
                <p className="mt-2 text-lg leading-relaxed text-neutral-600">
                  {c.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/* ──────────────────── 6 · TECH STACK & ARCHITECTURE ──────────────────── */

function SlideTech() {
  const stacks = [
    {
      title: "Frontend",
      icon: Layers,
      items: ["Next.js 14 (App Router)", "ShadCN UI", "Tailwind CSS"],
    },
    {
      title: "Backend",
      icon: Server,
      items: ["Node.js (NestJS)", "PostgreSQL", "Prisma ORM"],
    },
    {
      title: "Auth & Identity",
      icon: ShieldCheck,
      items: ["JWT-based auth", "Cooperative / NGO weaver verification"],
    },
    {
      title: "Trust Layer",
      icon: QrCode,
      items: [
        "QR generation service",
        "Event passports: CREATED → QC_PASSED → LISTED",
        "Hash-chained, tamper-evident logs",
      ],
    },
  ];
  const arch = [
    { icon: Layers, label: "Next.js Frontend" },
    { icon: Network, label: "Node API" },
    { icon: Database, label: "PostgreSQL + Prisma" },
    { icon: QrCode, label: "QR / Events Service" },
  ];
  return (
    <Shell
      kicker="06 · Tech Stack & Architecture"
      title="The final product stack"
      subtitle="Proven, boring-in-a-good-way technology — cloud-hosted (Vercel / Render / Oracle Cloud) with room to scale as adoption grows."
    >
      <div className="flex h-full flex-col gap-12">
        <div className="grid grid-cols-4 gap-8">
          {stacks.map((s, i) => (
            <Reveal key={s.title} delay={0.2 + i * 0.1} className="h-full">
              <div
                className={`flex h-full flex-col border-2 border-black bg-white p-8 ${
                  i % 2 === 0
                    ? "sketch-box sketch-shadow"
                    : "sketch-box-alt border-dashed"
                }`}
              >
                <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black">
                  <s.icon className="h-7 w-7" strokeWidth={1.5} />
                </span>
                <h3 className="text-2xl font-bold">{s.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {s.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-lg leading-snug text-neutral-700"
                    >
                      <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-black" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        {/* architecture flow */}
        <Reveal delay={0.55} className="flex-1">
          <div className="sketch-box-alt sketch-shadow relative flex h-full items-center justify-center gap-8 border-2 border-dashed border-black bg-white px-16">
            <span className="absolute -top-4 left-10 bg-white px-3 text-base font-semibold uppercase tracking-widest text-neutral-500">
              Architecture
            </span>
            {arch.map((a, i) => (
              <div key={a.label} className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-3">
                  <span
                    className={`flex h-24 w-24 items-center justify-center border-2 border-black bg-white ${
                      i % 2 === 0 ? "sketch-box" : "sketch-box-alt border-dashed"
                    }`}
                  >
                    <a.icon className="h-10 w-10" strokeWidth={1.5} />
                  </span>
                  <span className="text-xl font-semibold">{a.label}</span>
                </div>
                {i < arch.length - 1 && (
                  <SketchArrow className="-mt-9 h-10 w-20 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Shell>
  );
}

/* ──────────────────── 7 · MARKET SIZE & BUSINESS ──────────────────── */

function SlideMarket() {
  const funnel = [
    { label: "India's handloom sector", detail: "35 lakh+ weavers & allied workers", width: 1180 },
    { label: "Focus: 10–20 major clusters", detail: "Tens of thousands of potential users", width: 880 },
    { label: "Products with passports", detail: "Every saree becomes traceable inventory", width: 620 },
    { label: "Trade volume on platform", detail: "D2C sales + trusted B2B bulk deals", width: 400 },
  ];
  const revenue = [
    {
      icon: CircleDollarSign,
      title: "Cooperative SaaS",
      body: "Low-fee subscriptions for dashboards & member management.",
    },
    {
      icon: TrendingUp,
      title: "Transaction fees",
      body: "Small percentage on bulk orders negotiated via the platform.",
    },
    {
      icon: Megaphone,
      title: "Premium storytelling",
      body: "Branding & content services for high-end buyers and exporters.",
    },
  ];
  return (
    <Shell
      kicker="07 · Market & Business Impact"
      title="A platform, not just a hackathon project"
      subtitle="Supporting handloom supports rural livelihoods, preserves craft heritage, and rides the sustainable-fashion wave."
    >
      <div className="grid h-full grid-cols-[1.25fr_1fr] gap-14">
        {/* funnel */}
        <Reveal delay={0.2} className="h-full">
          <div className="sketch-box sketch-shadow relative flex h-full flex-col items-center justify-center gap-5 border-2 border-black bg-white p-10">
            <span className="absolute -top-4 left-8 bg-white px-3 text-base font-semibold uppercase tracking-widest text-neutral-500">
              Market funnel
            </span>
            {funnel.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, scaleX: 0.7 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.4 + i * 0.15, duration: 0.4 }}
                style={{ width: f.width * 0.75 }}
                className={`flex flex-col items-center border-2 border-black py-4 text-center ${
                  i % 2 === 0
                    ? "sketch-box bg-white"
                    : "sketch-box-alt border-dashed bg-white"
                }`}
              >
                <span className="text-2xl font-bold">{f.label}</span>
                <span className="text-lg text-neutral-600">{f.detail}</span>
              </motion.div>
            ))}
          </div>
        </Reveal>

        {/* revenue streams */}
        <div className="flex h-full flex-col gap-7">
          {revenue.map((r, i) => (
            <Reveal key={r.title} delay={0.35 + i * 0.12} className="flex-1">
              <div
                className={`flex h-full items-center gap-7 border-2 border-black bg-white px-8 ${
                  i % 2 === 0 ? "sketch-box" : "sketch-box-alt border-dashed"
                }`}
              >
                <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-2 border-black">
                  <r.icon className="h-8 w-8" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="text-2xl font-bold">{r.title}</h3>
                  <p className="mt-1.5 text-lg leading-relaxed text-neutral-600">
                    {r.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/* ─────────────────────────── 8 · LEAN CANVAS ─────────────────────────── */

function SlideCanvas() {
  const boxes: {
    title: string;
    body: string;
    span?: string;
  }[] = [
    {
      title: "Problem",
      body: "Middlemen capture margin · authenticity gaps · paper-run cooperatives",
    },
    {
      title: "Solution",
      body: "Onboarding → QR passports → buyer views → cooperative dashboards",
    },
    {
      title: "Unique Value Proposition",
      body: "One platform that gives every handloom product a digital passport, connects weavers directly to markets, and gives cooperatives the data to bargain better.",
      span: "col-span-2",
    },
    {
      title: "Customer Segments",
      body: "Weavers · Cooperatives · Buyers (retail & bulk)",
    },
    {
      title: "Channels",
      body: "NGOs · existing cooperatives · government handloom agencies",
    },
    {
      title: "Key Metrics",
      body: "Active weavers · passports issued · QR scans · bulk-order volume · margin uplift per weaver",
    },
    {
      title: "Cost Structure",
      body: "Tech development · onboarding & training · field support",
    },
    {
      title: "Revenue Streams",
      body: "SaaS subscriptions · transaction fees · branding & content services",
    },
  ];
  return (
    <Shell
      kicker="08 · Lean Canvas"
      title="The business, on one grid"
    >
      <div className="grid h-full grid-cols-3 grid-rows-3 gap-7">
        {boxes.map((b, i) => (
          <Reveal
            key={b.title}
            delay={0.15 + i * 0.07}
            className={b.span ?? ""}
          >
            <div
              className={`flex h-full flex-col border-2 bg-white p-7 ${
                b.span
                  ? "sketch-box-alt sketch-shadow-dark border-black"
                  : i % 2 === 0
                    ? "sketch-box border-black"
                    : "sketch-box-alt border-dashed border-neutral-500"
              }`}
            >
              <span className="text-base font-bold uppercase tracking-widest text-neutral-400">
                {b.title}
              </span>
              <p
                className={`mt-3 leading-relaxed ${
                  b.span
                    ? "text-2xl font-semibold"
                    : "text-xl text-neutral-700"
                }`}
              >
                {b.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Shell>
  );
}

/* ─────────────────────────── 9 · WORKFLOW ─────────────────────────── */

function SlideWorkflow() {
  const lanes = [
    {
      icon: User,
      title: "Weaver",
      steps: [
        "Sign up & get verified",
        "Create product passport",
        "Attach QR to product",
        "Track orders & status",
      ],
    },
    {
      icon: ShoppingBag,
      title: "Buyer",
      steps: [
        "Discover product",
        "Scan QR code",
        "See story & timeline",
        "Place order (next phase)",
      ],
    },
    {
      icon: Building2,
      title: "Cooperative",
      steps: [
        "Onboard & verify members",
        "Monitor inventory & events",
        "Respond to bulk orders",
        "Bargain with live data",
      ],
    },
    {
      icon: Workflow,
      title: "System",
      steps: [
        "Store profiles & co-op links",
        "Write passport event logs",
        "Serve passport on QR scan",
        "Aggregate cluster data",
      ],
    },
  ];
  return (
    <Shell
      kicker="09 · Workflow"
      title="End-to-end journey"
      subtitle="User actions above, system actions below — every arrow is a moment where LoomMitra adds trust."
    >
      <div className="grid h-full grid-cols-4 gap-8">
        {lanes.map((lane, li) => (
          <Reveal key={lane.title} delay={0.2 + li * 0.12} className="h-full">
            <div
              className={`flex h-full flex-col border-2 bg-white p-8 ${
                li === 3
                  ? "sketch-box-alt border-dashed border-black"
                  : "sketch-box sketch-shadow border-black"
              }`}
            >
              <div className="mb-6 flex items-center gap-4">
                <span className="sketch-box flex h-16 w-16 items-center justify-center border-2 border-black">
                  <lane.icon className="h-7 w-7" strokeWidth={1.5} />
                </span>
                <h3 className="text-2xl font-bold">{lane.title}</h3>
              </div>
              <div className="flex flex-1 flex-col justify-between">
                {lane.steps.map((step, si) => (
                  <div key={step}>
                    <motion.div
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + li * 0.12 + si * 0.1 }}
                      className="flex items-center gap-3.5"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-black text-base font-bold">
                        {si + 1}
                      </span>
                      <span className="text-lg font-medium leading-snug">
                        {step}
                      </span>
                    </motion.div>
                    {si < lane.steps.length - 1 && (
                      <div className="ml-[17px] my-1.5 h-7 border-l-2 border-dashed border-neutral-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Shell>
  );
}

/* ─────────────────────────── 10 · CTA ─────────────────────────── */

function SlideCTA() {
  const recap = [
    { icon: LineChart, text: "Weavers gain visibility and margin" },
    { icon: ShieldCheck, text: "Buyers gain trust and stories" },
    { icon: Handshake, text: "Cooperatives gain data and bargaining power" },
  ];
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center px-32 text-center">
      <DoodleBlob className="-right-24 top-10 h-96 w-[30rem]" />
      <DoodleCrosses className="left-[7%] bottom-28 h-48 w-48" />
      <DoodleScribble className="left-[10%] top-24 h-20 w-72" />

      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-neutral-500 bg-white px-6 py-2 text-lg font-semibold uppercase tracking-widest">
          10 · The Ask
        </span>
      </Reveal>

      <Reveal delay={0.1}>
        <h1 className="mt-8 text-8xl font-extrabold tracking-tight">
          Why LoomMitra,{" "}
          <span className="underline decoration-neutral-300 decoration-wavy decoration-4 underline-offset-[16px]">
            why now?
          </span>
        </h1>
      </Reveal>

      <Reveal delay={0.24} className="mt-14">
        <div className="flex items-center gap-8">
          {recap.map((r, i) => (
            <div
              key={r.text}
              className={`flex items-center gap-4 border-2 border-black bg-white px-8 py-5 ${
                i % 2 === 0 ? "sketch-box sketch-shadow" : "sketch-box-alt border-dashed"
              }`}
            >
              <r.icon className="h-8 w-8 shrink-0" strokeWidth={1.5} />
              <span className="text-2xl font-semibold">{r.text}</span>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.38} className="mt-14">
        <div className="sketch-box-alt sketch-shadow-dark flex max-w-4xl items-center gap-8 border-2 border-black bg-black px-14 py-9 text-left text-white">
          <Rocket className="h-14 w-14 shrink-0" strokeWidth={1.25} />
          <div>
            <div className="text-3xl font-bold">
              Help us pilot LoomMitra in one major cluster.
            </div>
            <div className="mt-2 text-xl text-neutral-300">
              With mentoring, we'll build the full backend and go live —
              full-stack capability, hackathon experience, and grounding in
              local context are already on the team.
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.52} className="mt-12">
        <div className="flex items-center gap-4 text-2xl font-bold">
          <span className="sketch-box flex h-16 w-16 items-center justify-center border-2 border-black">
            <QrCode className="h-8 w-8" strokeWidth={1.5} />
          </span>
          <span>LoomMitra</span>
          <ArrowRight className="h-7 w-7 text-neutral-400" />
          <span className="text-neutral-500">Trust from loom to market.</span>
        </div>
      </Reveal>
    </div>
  );
}

/* ─────────────────────────── export ─────────────────────────── */

export const SLIDES = [
  SlideTitle,
  SlideProblem,
  SlideSolution,
  SlideImpact,
  SlideScale,
  SlideTech,
  SlideMarket,
  SlideCanvas,
  SlideWorkflow,
  SlideCTA,
];
