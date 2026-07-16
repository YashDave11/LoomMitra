import {
  FileBadge,
  History,
  LayoutDashboard,
  QrCode,
  Store,
  UserPlus,
} from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HoverLift,
  ScrollReveal,
  StaggerGroup,
  StaggerItem,
} from "@/components/walkthrough/motion";
import { DoodleCrosses } from "./doodles";

const features = [
  {
    icon: UserPlus,
    title: "Independent weaver onboarding",
    body: "A weaver joins with just a phone number and their cluster — no paperwork, no gatekeepers.",
    dashed: false,
  },
  {
    icon: FileBadge,
    title: "Digital product passport",
    body: "Fabric type, loom details, the weaver's story, and product images — one living record per product.",
    dashed: true,
  },
  {
    icon: QrCode,
    title: "QR-based authenticity check",
    body: "Every passport gets a unique QR. Buyers scan to verify it's real handloom, not a powerloom copy.",
    dashed: false,
  },
  {
    icon: History,
    title: "Event-based traceability timeline",
    body: "Verified events — CREATED, QC_PASSED, LISTED — build an auditable journey from loom to market.",
    dashed: true,
  },
  {
    icon: LayoutDashboard,
    title: "Cooperative dashboard",
    body: "Members, products, and bulk orders in one view, replacing paper ledgers with live visibility.",
    dashed: true,
  },
  {
    icon: Store,
    title: "Marketplace-ready foundation",
    body: "The same passports power future D2C storefronts and B2B bulk-order flows — no rework needed.",
    dashed: false,
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="relative overflow-hidden scroll-mt-20">
      <DoodleCrosses className="right-[3%] top-12 hidden h-36 w-36 lg:block" />

      <div className="mx-auto max-w-6xl px-6 py-20">
        <ScrollReveal>
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            What&apos;s in the box
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-neutral-600">
            Six building blocks, designed to work on cheap phones and patchy
            networks.
          </p>
        </ScrollReveal>

        <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <HoverLift className="h-full">
                <Card
                  className={`h-full transition-shadow hover:shadow-[5px_5px_0_0_rgba(0,0,0,0.12)] ${
                    f.dashed ? "sketch-box-alt border-dashed" : ""
                  }`}
                >
                  <CardHeader>
                    <span className="sketch-box mb-2 flex h-11 w-11 items-center justify-center border-2 border-black">
                      <f.icon className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <CardTitle className="text-base">{f.title}</CardTitle>
                    <CardDescription>{f.body}</CardDescription>
                  </CardHeader>
                </Card>
              </HoverLift>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
