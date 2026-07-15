"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, FileBadge, QrCode } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import StepNav from "@/components/walkthrough/StepNav";
import StepHeader from "@/components/walkthrough/StepHeader";
import InfoCard from "@/components/walkthrough/InfoCard";
import { Reveal } from "@/components/walkthrough/motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatINR, products, weaverById, weavers } from "@/data/mockData";

const sampleProduct = products[0];
const sampleWeaver = weaverById(sampleProduct.weaverId)!;

export default function ProductCreatePage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <AppShell>
      <StepNav />
      <StepHeader
        step="Step 2 of 5"
        title="Create Product Passport"
        lead="At the loom, the weaver (or a cooperative helper) fills in what was woven, on what loom, and the story behind it. That record becomes the product's permanent digital identity."
      />

      <Reveal>
        <InfoCard title="Why this step?">
          <p>
            Every product gets a <strong>digital identity</strong>: fabric,
            pattern, loom type, price — and crucially, the weaver&apos;s own
            story. The story is what a buyer connects with; the structured
            fields are what the QR verification and cooperative analytics run
            on.
          </p>
        </InfoCard>
      </Reveal>

      <div className="mt-8 grid gap-8 lg:grid-cols-[3fr_2fr]">
        {/* Form */}
        <Reveal delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>New product passport</CardTitle>
              <p className="text-sm text-neutral-500">
                Pre-filled with a real Chanderi example. Nothing is persisted —
                submitting just previews the passport.
              </p>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="weaver">Weaver</Label>
                  <Select id="weaver" defaultValue={sampleWeaver.id}>
                    {weavers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} — {w.specialty}
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-neutral-500">
                    Pre-selected from Step 1. Only verified weavers appear here.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="title">Product title</Label>
                  <Input id="title" defaultValue={sampleProduct.title} />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Category</Label>
                    <Select id="category" defaultValue={sampleProduct.category}>
                      <option>Saree</option>
                      <option>Dupatta</option>
                      <option>Stole</option>
                      <option>Fabric (per metre)</option>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fabric">Fabric type</Label>
                    <Input id="fabric" defaultValue={sampleProduct.fabricType} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pattern">Pattern</Label>
                    <Input id="pattern" defaultValue={sampleProduct.pattern} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="loom">Loom type</Label>
                    <Select id="loom" defaultValue={sampleProduct.loomType}>
                      <option>Pit loom</option>
                      <option>Frame loom</option>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      defaultValue={sampleProduct.price}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="qty">Quantity</Label>
                    <Input
                      id="qty"
                      type="number"
                      defaultValue={sampleProduct.quantity}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="story">Weaver&apos;s story</Label>
                  <Textarea
                    id="story"
                    rows={5}
                    defaultValue={sampleProduct.story}
                  />
                  <p className="text-xs text-neutral-500">
                    Told in the weaver&apos;s words; shown to buyers after they
                    scan the QR.
                  </p>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  <FileBadge strokeWidth={1.75} />
                  Create passport (demo)
                </Button>
              </form>
            </CardContent>
          </Card>
        </Reveal>

        {/* Right: 3D-ish passport preview + confirmation */}
        <div className="space-y-6">
          <Reveal delay={0.2}>
            <motion.div
              whileHover={{ rotate: 0, y: -4 }}
              className="sketch-box relative rotate-1 border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_rgba(0,0,0,0.12)]"
            >
              <span className="absolute -top-3 left-6 bg-white px-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                What a passport looks like
              </span>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-extrabold leading-snug">
                    {sampleProduct.title}
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">
                    {sampleWeaver.name} · {sampleWeaver.village}
                  </p>
                </div>
                <span className="sketch-box-alt flex h-14 w-14 shrink-0 items-center justify-center border-2 border-dashed border-black">
                  <QrCode className="h-7 w-7" strokeWidth={1.25} />
                </span>
              </div>
              <dl className="mt-4 space-y-1.5 text-sm">
                {[
                  ["Fabric", sampleProduct.fabricType],
                  ["Pattern", sampleProduct.pattern],
                  ["Loom", sampleProduct.loomType],
                  ["Price", formatINR(sampleProduct.price)],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between border-b border-dashed border-neutral-200 pb-1"
                  >
                    <dt className="text-neutral-500">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </Reveal>

          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
              >
                <Card className="sketch-box-alt border-2 border-black bg-neutral-50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-8 w-8" strokeWidth={1.75} />
                      <CardTitle>Product created</CardTitle>
                    </div>
                    <p className="text-sm text-neutral-600">
                      <strong>{sampleProduct.title}</strong> ·{" "}
                      {sampleProduct.fabricType} ·{" "}
                      {formatINR(sampleProduct.price)} — woven by{" "}
                      {sampleWeaver.name}. A CREATED event has been added to its
                      timeline (next step shows it).
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <Link href="/product/passport">
                        View Passport &amp; QR
                        <ArrowRight strokeWidth={2} />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!submitted && (
            <p className="text-center text-xs text-neutral-500">
              Submit the form to see the confirmation, or skip ahead below.
            </p>
          )}
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <Button asChild variant="outline" size="lg">
          <Link href="/product/passport">
            Next: QR &amp; Authenticity
            <ArrowRight strokeWidth={2} />
          </Link>
        </Button>
      </div>
    </AppShell>
  );
}
