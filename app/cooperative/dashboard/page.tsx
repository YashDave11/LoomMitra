"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  CircleDashed,
  IndianRupee,
  Package,
  ShoppingCart,
} from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  bulkOrders,
  formatINR,
  productCountByWeaver,
  products,
  totalInventoryValue,
  totalQuantity,
  weavers,
} from "@/data/mockData";

const statusVariant: Record<string, "default" | "dashed" | "subtle"> = {
  Confirmed: "default",
  "In Discussion": "dashed",
  New: "subtle",
};

export default function CooperativeDashboardPage() {
  return (
    <AppShell
      guideMessages={[
        "Our cooperative used to work with notebooks and guesses — nobody knew our full inventory or who could fulfil a big order.",
        "This dashboard shows all weavers, their products, and bulk orders in one place, so we can negotiate better prices together.",
      ]}
      guidePhase="Phase 3 – Cooperative Digitisation"
      guideProblemCode="Problem 4.3"
    >
      <StepNav />
      <StepHeader
        step="Step 5 of 5"
        title="Cooperative Dashboard"
        lead="The cooperative's paper registers, digitized: who is weaving what, how much inventory exists across all members, and which bulk buyers are knocking."
      />

      <Reveal>
        <InfoCard title="Why cooperatives need this">
          <p>
            <strong>See member activity</strong> — production per weaver,
            verified status, specialties.{" "}
            <strong>Aggregate supply</strong> — one pooled inventory instead of
            scattered stock nobody can count.{" "}
            <strong>Bargain better</strong> — answering a 40-piece export
            enquiry in minutes, with proof of authenticity attached, is
            negotiating power no paper ledger provides.
          </p>
        </InfoCard>
      </Reveal>

      {/* Inventory summary */}
      <Reveal delay={0.1} className="mt-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Package,
              label: "Total products",
              value: `${products.length}`,
              sub: "distinct passports issued",
            },
            {
              icon: ShoppingCart,
              label: "Total quantity",
              value: `${totalQuantity()} pcs`,
              sub: "across all members",
            },
            {
              icon: IndianRupee,
              label: "Inventory value",
              value: formatINR(totalInventoryValue()),
              sub: "sum of price × quantity",
            },
          ].map((s, i) => (
            <Card
              key={s.label}
              className={i === 1 ? "sketch-box-alt border-dashed" : ""}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <span className="sketch-box flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black">
                    <s.icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="text-2xl font-extrabold leading-tight">
                      {s.value}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      {s.label}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-neutral-500">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Reveal>

      {/* Weaver table */}
      <Reveal delay={0.2} className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <p className="text-sm text-neutral-500">
              Every registered weaver, their verification status, and live
              product counts.
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="text-center">Products</TableHead>
                  <TableHead>Specialty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weavers.map((w, i) => (
                  <motion.tr
                    key={w.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.25 + i * 0.09 }}
                    className="border-b border-dashed border-neutral-300 transition-colors hover:bg-neutral-50"
                  >
                    <TableCell className="font-semibold">{w.name}</TableCell>
                    <TableCell className="text-neutral-600">
                      {w.village}
                    </TableCell>
                    <TableCell>
                      {w.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold">
                          <BadgeCheck className="h-4 w-4" strokeWidth={2} />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-neutral-500">
                          <CircleDashed className="h-4 w-4" strokeWidth={2} />
                          Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {productCountByWeaver(w.id)}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {w.specialty}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Reveal>

      {/* Bulk orders */}
      <Reveal delay={0.3} className="mt-10">
        <h2 className="mb-4 text-lg font-extrabold tracking-tight">
          Incoming bulk orders
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {bulkOrders.map((o, i) => (
            <motion.div
              key={o.id}
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
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">
                      {o.buyerName}
                    </CardTitle>
                    <Badge
                      variant={statusVariant[o.status] ?? "subtle"}
                      className={`shrink-0 text-xs ${
                        o.status === "Confirmed" ? "bg-black text-white" : ""
                      }`}
                    >
                      {o.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    {o.buyerType}
                  </p>
                  <p className="pt-2 text-sm font-semibold">
                    {o.quantity} × {o.productCategory}
                  </p>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    {o.notes}
                  </p>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </Reveal>

      <div className="mt-10 flex justify-start">
        <Button asChild variant="outline" size="lg">
          <Link href="/dashboard">
            <ArrowLeft strokeWidth={2} />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </AppShell>
  );
}
