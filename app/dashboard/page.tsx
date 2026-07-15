"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  FileBadge,
  IndianRupee,
  MapPin,
  Package,
  QrCode,
  ShoppingBag,
  User,
  UserPlus,
  Users,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SketchArrow } from "@/components/marketing/doodles";
import { Floaty, Reveal } from "@/components/walkthrough/motion";
import {
  cluster,
  cooperative,
  formatINR,
  products,
  totalInventoryValue,
  weavers,
} from "@/data/mockData";

const stepCards = [
  {
    n: 1,
    title: "Weaver Onboarding",
    body: "How a rural weaver joins with just a phone number, and how the cooperative verifies them — the root of all trust downstream.",
    href: "/weaver/onboarding",
    icon: UserPlus,
  },
  {
    n: 2,
    title: "Create Product Passport",
    body: "Each saree gets a digital identity: fabric, loom, price, and the weaver's own story, captured at the loom.",
    href: "/product/create",
    icon: FileBadge,
  },
  {
    n: 3,
    title: "QR & Authenticity",
    body: "The system view: hash-chained events and a QR code that makes each passport tamper-evident.",
    href: "/product/passport",
    icon: QrCode,
  },
  {
    n: 4,
    title: "Buyer View",
    body: "What a buyer sees after scanning — the weaver, the story, and a human-readable journey of the product.",
    href: "/buyer/view",
    icon: ShoppingBag,
  },
  {
    n: 5,
    title: "Cooperative Dashboard",
    body: "Members, inventory, and incoming bulk orders in one place — paper ledgers replaced by live visibility.",
    href: "/cooperative/dashboard",
    icon: Building2,
  },
];

const flow = [
  { icon: User, label: "Weaver" },
  { icon: FileBadge, label: "Passport" },
  { icon: QrCode, label: "QR" },
  { icon: ShoppingBag, label: "Buyer" },
  { icon: Building2, label: "Cooperative" },
];

export default function DashboardPage() {
  return (
    <AppShell>
      {/* Hero card */}
      <Reveal>
        <div className="sketch-box sketch-shadow relative border-2 border-black bg-white px-8 py-10 text-center">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Walkthrough hub
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Interactive Prototype
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-600">
            A static, clickable walkthrough of the full Handloom Passport flow —
            from a weaver&apos;s first onboarding to a cooperative negotiating
            bulk orders. Every screen explains what happens, why it matters,
            and how it works. No backend, all sample data.
          </p>

          {/* System sketch: Weaver → Passport → QR → Buyer → Cooperative */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {flow.map((f, i) => (
              <div key={f.label} className="flex items-center gap-2">
                <Floaty delay={i * 0.35}>
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={
                        i % 2 === 0
                          ? "sketch-box flex h-14 w-14 items-center justify-center border-2 border-black bg-white"
                          : "sketch-box-alt flex h-14 w-14 items-center justify-center border-2 border-dashed border-black bg-white"
                      }
                    >
                      <f.icon className="h-6 w-6" strokeWidth={1.5} />
                    </span>
                    <span className="text-xs font-semibold">{f.label}</span>
                  </div>
                </Floaty>
                {i < flow.length - 1 && (
                  <SketchArrow className="-mt-5 hidden h-6 w-10 shrink-0 sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-[2fr_3fr]">
        {/* Left: cluster + coop stats */}
        <div className="space-y-6">
          <Reveal delay={0.1}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="sketch-box-alt flex h-11 w-11 items-center justify-center border-2 border-black">
                    <MapPin className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <div>
                    <CardTitle>{cluster.name}</CardTitle>
                    <p className="text-sm text-neutral-500">{cluster.state}</p>
                  </div>
                </div>
                <CardDescription className="pt-2">
                  {cluster.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Reveal>

          <Reveal delay={0.2}>
            <Card className="sketch-box-alt border-dashed">
              <CardHeader>
                <CardTitle className="text-base">
                  {cooperative.name}
                </CardTitle>
                <p className="text-sm text-neutral-500">
                  {cooperative.village}, {cooperative.district} ·{" "}
                  {cooperative.contactName}
                </p>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { icon: Users, label: "Weavers", value: `${weavers.length}` },
                    { icon: Package, label: "Products", value: `${products.length}` },
                    {
                      icon: IndianRupee,
                      label: "Inventory",
                      value: formatINR(totalInventoryValue()),
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="sketch-box border-2 border-neutral-300 bg-white p-3"
                    >
                      <s.icon
                        className="mx-auto h-4 w-4 text-neutral-500"
                        strokeWidth={1.75}
                      />
                      <dd className="mt-1 text-lg font-extrabold leading-tight">
                        {s.value}
                      </dd>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        {s.label}
                      </dt>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        {/* Right: step cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {stepCards.map((s, i) => (
            <Reveal key={s.href} delay={0.1 + i * 0.07}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="h-full"
              >
                <Card
                  className={`flex h-full flex-col transition-shadow hover:shadow-lg ${
                    i % 2 === 1 ? "sketch-box-alt border-dashed" : ""
                  }`}
                >
                  <CardHeader className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="sketch-box flex h-10 w-10 items-center justify-center border-2 border-black">
                        <s.icon className="h-5 w-5" strokeWidth={1.5} />
                      </span>
                      <Badge variant="subtle" className="text-xs">
                        Step {s.n}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">
                      {s.n}. {s.title}
                    </CardTitle>
                    <CardDescription>{s.body}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" size="sm">
                      <Link href={s.href}>
                        Go to step
                        <ArrowRight strokeWidth={2} />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
