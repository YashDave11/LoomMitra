"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { ArrowRight, ExternalLink, Link2, ShieldCheck } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import StepNav from "@/components/walkthrough/StepNav";
import StepHeader from "@/components/walkthrough/StepHeader";
import InfoCard from "@/components/walkthrough/InfoCard";
import EventTimeline from "@/components/walkthrough/EventTimeline";
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
  eventsForProduct,
  formatINR,
  products,
  weaverById,
} from "@/data/mockData";

const product = products[0];
const weaver = weaverById(product.weaverId)!;
const productEvents = eventsForProduct(product.id);
const passportUrl = "https://www.loommitra.live/productdetails";

export default function ProductPassportPage() {
  return (
    <AppShell
      guideMessages={[
        "Buyers often doubt if my sarees are truly handloom. This passport records each step as a hash-chained event and gives every saree a QR code.",
        "When someone scans the QR, they see my process and the product's history — instead of just trusting a printed tag.",
      ]}
      guidePhase="Phase 2 – Authenticity & Stories"
      guideProblemCode="Problem 2.2"
    >
      <StepNav />
      <StepHeader
        step="Step 3 of 5"
        title="QR & Authenticity"
        lead="This is the system's internal view of a passport: structured product data, a chain of signed events, and the QR code that physically travels with the saree."
      />

      <Reveal>
        <InfoCard title="How authenticity works">
          <p>
            Every action on a product — created, quality-checked, listed — is
            recorded as an <strong>event</strong>. Each event stores a hash of
            the previous one, forming a <strong>hash chain</strong>: change any
            past record and every hash after it stops matching. The QR on the
            physical product points to this tamper-evident history, so a
            &ldquo;handloom&rdquo; claim becomes checkable in one scan.
          </p>
        </InfoCard>
      </Reveal>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Left: product details */}
        <Reveal delay={0.1}>
          <Card className="rotate-[-0.5deg] shadow-[8px_8px_0_0_rgba(0,0,0,0.1)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="dashed" className="text-xs">
                  Passport · {product.id}
                </Badge>
                <ShieldCheck className="h-5 w-5 text-neutral-500" strokeWidth={1.75} />
              </div>
              <CardTitle className="text-xl">{product.title}</CardTitle>
              <p className="text-sm text-neutral-500">
                Woven by {weaver.name} · {weaver.village}
              </p>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                {[
                  ["Category", product.category],
                  ["Fabric", product.fabricType],
                  ["Pattern", product.pattern],
                  ["Loom type", product.loomType],
                  ["Price", formatINR(product.price)],
                  ["Quantity", `${product.quantity} pieces`],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between border-b border-dashed border-neutral-200 pb-1.5"
                  >
                    <dt className="text-neutral-500">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </Reveal>

        {/* Right: QR + timeline */}
        <div className="space-y-8">
          <Reveal delay={0.2}>
            <Card className="sketch-box-alt border-dashed">
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="sketch-box border-2 border-black bg-white p-4">
                  <QRCodeSVG value={passportUrl} size={148} level="M" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-neutral-500">
                    QR code attached to physical product
                  </p>
                  <p className="mt-1 flex items-center justify-center gap-1.5 font-mono text-xs text-neutral-600">
                    <Link2 className="h-3.5 w-3.5" strokeWidth={2} />
                    Scanned link: {passportUrl}
                  </p>
                </div>
                <Button asChild>
                  <a
                    href={passportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit product detail page
                    <ExternalLink strokeWidth={2} />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.3}>
            <div>
              <h2 className="mb-4 text-lg font-extrabold tracking-tight">
                Event timeline (hash-chained)
              </h2>
              <EventTimeline events={productEvents} />
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <Button asChild size="lg">
          <Link href="/buyer/view">
            View as Buyer
            <ArrowRight strokeWidth={2} />
          </Link>
        </Button>
      </div>
    </AppShell>
  );
}
