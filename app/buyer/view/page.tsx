"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, ShoppingBag } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import StepNav from "@/components/walkthrough/StepNav";
import StepHeader from "@/components/walkthrough/StepHeader";
import InfoCard from "@/components/walkthrough/InfoCard";
import EventTimeline from "@/components/walkthrough/EventTimeline";
import DemoToast, { useDemoToast } from "@/components/walkthrough/DemoToast";
import { Reveal } from "@/components/walkthrough/motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  cooperative,
  eventsForProduct,
  formatINR,
  products,
  weaverById,
} from "@/data/mockData";

const product = products[0];
const weaver = weaverById(product.weaverId)!;
const productEvents = eventsForProduct(product.id);

const initials = weaver.name
  .split(" ")
  .map((p) => p[0])
  .join("");

const storyImages = [
  {
    caption: "Loom photo",
    src: "/product-details/loom-photo.png",
    alt: "Pit loom on which the saree is woven",
  },
  {
    caption: "Fabric close-up",
    src: "/product-details/fabric-closeup.png",
    alt: "Close-up of the silk-cotton Chanderi weave",
  },
  {
    caption: "Border detail",
    src: "/product-details/border-detail.png",
    alt: "Gold zari border with ashrafi buttis",
  },
];

export default function BuyerViewPage() {
  const demoToast = useDemoToast();

  return (
    <AppShell
      guideMessages={[
        "This is exactly what a buyer sees when they scan the QR on my saree — my face, my village, and the journey of the weave.",
        "My story and the timeline help them feel confident paying a fair price for real handloom instead of a machine copy.",
      ]}
      guidePhase="Phase 2 – Authenticity & Stories"
      guideProblemCode="Problem 2.2"
    >
      <StepNav />
      <StepHeader
        step="Step 4 of 5"
        title="Buyer View"
        lead="This is the page a buyer lands on after scanning the QR on the saree's tag — no app install, no login. Just the person, the product, and its verified journey."
      />

      <Reveal>
        <InfoCard title="Why this matters">
          <p>
            Buyers pay a premium for real handloom <em>when they can trust the
            claim</em>. Seeing the verified weaver, their story, and a
            quality-checked timeline turns an anonymous saree into a person
            &apos;s work — and makes the fake &ldquo;handloom&rdquo; tag
            worthless by comparison.
          </p>
        </InfoCard>
      </Reveal>

      {/* Product name + price header */}
      <Reveal delay={0.1}>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-3 border-b-2 border-dashed border-neutral-300 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {product.title}
            </h2>
            <p className="text-sm text-neutral-500">
              {product.category} · {product.fabricType}
            </p>
          </div>
          <p className="text-2xl font-extrabold">{formatINR(product.price)}</p>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_3fr]">
        {/* Left: weaver card */}
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        >
          <Card className="shadow-[6px_6px_0_0_rgba(0,0,0,0.1)]">
            <CardHeader>
              <div className="flex items-center gap-4">
                <span className="sketch-box flex h-16 w-16 shrink-0 items-center justify-center border-2 border-black bg-neutral-50 text-xl font-extrabold">
                  {initials}
                </span>
                <div>
                  <CardTitle className="text-lg">{weaver.name}</CardTitle>
                  <p className="text-sm text-neutral-500">
                    {weaver.village}, {cooperative.state}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-3">
                <Badge className="text-xs">
                  <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} />
                  Verified Weaver
                </Badge>
                <Badge variant="dashed" className="text-xs">
                  {cooperative.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-neutral-600">
              <p>
                {weaver.yearsOfExperience} years of weaving ·{" "}
                {weaver.specialty}
              </p>
              <p className="rounded border border-dashed border-neutral-300 bg-neutral-50 p-3 text-xs leading-relaxed">
                This QR was issued by LoomMitra in partnership with{" "}
                {cooperative.name}.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: details + story + images */}
        <div className="space-y-6">
          <Reveal delay={0.2}>
            <Card className="sketch-box-alt border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Product details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-2 text-sm sm:grid-cols-3">
                  {[
                    ["Fabric", product.fabricType],
                    ["Pattern", product.pattern],
                    ["Loom", product.loomType],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="sketch-box border border-neutral-300 p-3"
                    >
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        {k}
                      </dt>
                      <dd className="mt-0.5 font-semibold leading-snug">{v}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </Reveal>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  The story behind this piece
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-neutral-700">
                  {product.story}
                </p>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {storyImages.map((img) => (
                    <figure key={img.caption}>
                      <div className="sketch-box-alt relative aspect-square overflow-hidden border-2 border-dashed border-neutral-300 bg-neutral-100">
                        <Image
                          src={img.src}
                          alt={img.alt}
                          fill
                          sizes="(max-width: 640px) 30vw, 180px"
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
        </div>
      </div>

      {/* Simplified timeline */}
      <Reveal delay={0.3} className="mt-10">
        <h3 className="mb-4 text-lg font-extrabold tracking-tight">
          This product&apos;s journey
        </h3>
        <div className="max-w-2xl">
          <EventTimeline events={productEvents} friendly showHash={false} />
        </div>
      </Reveal>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <Button size="lg" onClick={demoToast.show}>
          <ShoppingBag strokeWidth={1.75} />
          Buy now (demo)
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/cooperative/dashboard">
            Next: Cooperative Dashboard
            <ArrowRight strokeWidth={2} />
          </Link>
        </Button>
      </div>

      {/* Toast */}
      <DemoToast open={demoToast.open} />
    </AppShell>
  );
}
