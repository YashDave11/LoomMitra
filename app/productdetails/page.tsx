"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Fingerprint,
  MapPin,
  QrCode,
  Route,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import AmbientBackground from "@/components/layout/AmbientBackground";
import EventTimeline from "@/components/walkthrough/EventTimeline";
import DemoToast, { useDemoToast } from "@/components/walkthrough/DemoToast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ProductEvent } from "@/data/mockData";

/* ---------- hardcoded demo data (swap for real data later) ---------- */

const demoProduct = {
  id: "chanderi-001",
  title: "Chanderi Silk-Cotton Saree – Ashrafi Border",
  category: "Saree",
  fabricType: "Silk × Cotton (Sico)",
  pattern: "Gold zari border, ashrafi butti",
  loomType: "Pit loom",
  cluster: "Chanderi, Madhya Pradesh",
  size: "6.3 m × 1.15 m (with blouse piece)",
  price: "₹4,800",
  story:
    "This Chanderi saree is woven on a pit loom that has been in Meena Devi's family for two generations. The warp is fine silk and the weft is unbleached cotton, giving the fabric its signature featherweight drape. The ashrafi (coin) buttis are woven in by hand, one motif at a time — around nine days of work from warp to finish.",
};

const demoWeaver = {
  name: "Meena Devi",
  village: "Chanderi",
  cluster: "Chanderi Handloom Cluster",
  state: "Madhya Pradesh",
  yearsOfExperience: 12,
  specialty: "Chanderi silk-cotton sarees",
};

const demoCooperative = {
  name: "Chanderi Weavers Cooperative Society",
  location: "Chanderi, Ashoknagar, Madhya Pradesh",
};

const demoEvents: ProductEvent[] = [
  {
    id: "pd-ev-001",
    productId: "chanderi-001",
    eventType: "CREATED",
    timestamp: "2026-06-02T10:15:00+05:30",
    actorName: "Meena Devi (Weaver)",
    hashPreview: "9fa3b7c04d…c1",
  },
  {
    id: "pd-ev-002",
    productId: "chanderi-001",
    eventType: "QC_PASSED",
    timestamp: "2026-06-05T14:40:00+05:30",
    actorName: "Chanderi Weavers Cooperative (QC)",
    hashPreview: "4e21d98a7f…8b",
  },
  {
    id: "pd-ev-003",
    productId: "chanderi-001",
    eventType: "LISTED",
    timestamp: "2026-06-06T09:05:00+05:30",
    actorName: "Chanderi Weavers Cooperative",
    hashPreview: "c7f50e13a2…d4",
  },
];

const galleryImages = [
  {
    src: "/product-details/saree-main.png",
    alt: "Chanderi silk-cotton saree with ashrafi border, full view",
    caption: "The saree",
  },
  {
    src: "/product-details/try-on.png",
    alt: "The saree draped, showing its featherweight fall",
    caption: "Draped",
  },
  {
    src: "/product-details/in-hand-feel.png",
    alt: "The fabric held in hand, showing its sheer texture",
    caption: "In-hand feel",
  },
];

const storyImages = [
  {
    src: "/product-details/loom-photo.png",
    alt: "The two-generation-old pit loom in Meena Devi's home",
    caption: "Loom photo",
  },
  {
    src: "/product-details/fabric-closeup.png",
    alt: "Close-up of the silk warp and unbleached cotton weft",
    caption: "Fabric close-up",
  },
  {
    src: "/product-details/border-detail.png",
    alt: "Gold zari border with hand-woven ashrafi buttis",
    caption: "Border detail",
  },
];

const initials = demoWeaver.name
  .split(" ")
  .map((p) => p[0])
  .join("");

/* ---------- page ---------- */

export default function ProductDetailsPage() {
  const [activeImage, setActiveImage] = useState(0);
  const demoToast = useDemoToast();

  return (
    <div className="relative flex min-h-screen flex-col bg-white text-black">
      <AmbientBackground />

      {/* Minimal buyer-facing header (no walkthrough chrome) */}
      <header className="sticky top-0 z-50 border-b border-dashed border-neutral-300 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="sketch-box-alt flex h-9 w-9 items-center justify-center border-2 border-black">
              <QrCode className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="text-lg font-bold tracking-tight">LoomMitra</span>
          </Link>
          <Badge variant="dashed" className="text-xs">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
            Verified Digital Product Passport
          </Badge>
        </div>
      </header>

      {/* Heads-up strip: same expectation-setting note as the walkthrough */}
      <div className="relative z-40 border-b border-dashed border-amber-300 bg-amber-50/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-6 py-2 text-center text-xs text-amber-800">
          <Route className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span>
            <span className="font-semibold">Guided walkthrough</span> — this
            screen shows the intended flow with sample data, so you can
            experience how LoomMitra works end to end.
          </span>
        </div>
      </div>

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-[5fr_6fr]">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="sketch-box relative aspect-[4/5] overflow-hidden border-2 border-black bg-neutral-100 shadow-[8px_8px_0_0_rgba(0,0,0,0.1)]">
              <Image
                key={galleryImages[activeImage].src}
                src={galleryImages[activeImage].src}
                alt={galleryImages[activeImage].alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover"
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {galleryImages.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show ${img.caption}`}
                  className={cn(
                    "sketch-box-alt relative aspect-square overflow-hidden border-2 bg-neutral-100 transition-all",
                    i === activeImage
                      ? "border-black shadow-[4px_4px_0_0_rgba(0,0,0,0.6)]"
                      : "border-dashed border-neutral-300 opacity-70 hover:opacity-100"
                  )}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product info */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="flex flex-col justify-center"
          >
            <Badge variant="dashed" className="w-fit text-xs">
              Passport · {demoProduct.id}
            </Badge>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {demoProduct.title}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Handwoven by {demoWeaver.name} · {demoProduct.cluster}
            </p>

            <dl className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["Fabric", demoProduct.fabricType],
                ["Cluster", demoProduct.cluster],
                ["Size", demoProduct.size],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="sketch-box border border-neutral-300 bg-white p-3"
                >
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    {k}
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold leading-snug">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-wrap items-center gap-4 border-t-2 border-dashed border-neutral-300 pt-6">
              <p className="text-3xl font-extrabold">{demoProduct.price}</p>
              <Badge className="text-xs">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                {demoProduct.loomType} · {demoProduct.pattern}
              </Badge>
            </div>

            <div className="mt-6">
              <Button size="lg" onClick={demoToast.show}>
                <ShoppingBag strokeWidth={1.75} />
                Buy now (demo)
              </Button>
            </div>
          </motion.div>
        </div>

        <Separator className="my-12 border-dashed" />

        {/* ── Story ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                The story behind this piece
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="max-w-3xl text-sm leading-relaxed text-neutral-700">
                {demoProduct.story}
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
                {storyImages.map((img) => (
                  <figure key={img.caption}>
                    <div className="sketch-box-alt relative aspect-square overflow-hidden border-2 border-dashed border-neutral-300 bg-neutral-100">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        sizes="(max-width: 640px) 30vw, 300px"
                        className="object-cover grayscale-[15%] transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <figcaption className="mt-1.5 text-center text-xs text-neutral-500">
                      {img.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Timeline + weaver ────────────────────────────────── */}
        <div className="mt-12 grid gap-10 lg:grid-cols-[3fr_2fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-extrabold tracking-tight">
                Authenticity & journey
              </h2>
              <Badge variant="dashed" className="text-xs">
                <Fingerprint className="h-3.5 w-3.5" strokeWidth={2} />
                Digital product passport · hash-chained
              </Badge>
            </div>
            <p className="mb-5 max-w-xl text-sm text-neutral-600">
              Every step below was recorded as a signed event in this
              product&apos;s passport. Each event stores a hash of the
              previous one — tampering with any record breaks the chain.
            </p>
            <EventTimeline events={demoEvents} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="space-y-6"
          >
            <h2 className="text-xl font-extrabold tracking-tight">
              Meet the weaver
            </h2>
            <Card className="shadow-[6px_6px_0_0_rgba(0,0,0,0.1)]">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <span className="sketch-box flex h-16 w-16 shrink-0 items-center justify-center border-2 border-black bg-neutral-50 text-xl font-extrabold">
                    {initials}
                  </span>
                  <div>
                    <CardTitle className="text-lg">{demoWeaver.name}</CardTitle>
                    <p className="flex items-center gap-1 text-sm text-neutral-500">
                      <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                      {demoWeaver.village}, {demoWeaver.state}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-3">
                  <Badge className="text-xs">
                    <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} />
                    Verified Weaver
                  </Badge>
                  <Badge variant="dashed" className="text-xs">
                    {demoWeaver.cluster}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-neutral-600">
                <p>
                  {demoWeaver.yearsOfExperience} years of weaving ·{" "}
                  {demoWeaver.specialty}
                </p>
              </CardContent>
            </Card>

            <Card className="sketch-box-alt border-dashed">
              <CardContent className="flex items-start gap-3 p-5">
                <span className="sketch-box flex h-11 w-11 shrink-0 items-center justify-center border-2 border-black bg-white">
                  <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="text-sm">
                  <p className="font-bold">{demoCooperative.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {demoCooperative.location}
                  </p>
                  <p className="mt-2 rounded border border-dashed border-neutral-300 bg-neutral-50 p-2.5 text-xs leading-relaxed text-neutral-600">
                    This passport and QR were issued by LoomMitra in
                    partnership with {demoCooperative.name}.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-dashed border-neutral-300 bg-white/70 py-6 text-center text-xs text-neutral-500 backdrop-blur-sm">
        LoomMitra · digital product passport · Chanderi Handloom Cluster
      </footer>

      <DemoToast open={demoToast.open} />
    </div>
  );
}
