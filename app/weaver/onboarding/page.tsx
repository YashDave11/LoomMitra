"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BadgeCheck, ShieldCheck } from "lucide-react";

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
import { cooperative, weavers } from "@/data/mockData";

const sampleWeaver = weavers[0]; // Meena Devi

function Field({
  id,
  label,
  helper,
  children,
}: {
  id: string;
  label: string;
  helper: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      <p className="text-xs text-neutral-500">{helper}</p>
    </div>
  );
}

export default function WeaverOnboardingPage() {
  const [verified, setVerified] = useState(false);

  return (
    <AppShell>
      <StepNav />
      <StepHeader
        step="Step 1 of 5"
        title="Weaver Onboarding"
        lead="A weaver joins with nothing more than a phone number and their cluster. The cooperative then vouches for them — that verification is what makes every passport downstream credible."
      />

      <Reveal>
        <InfoCard>
          <p>
            <strong>What:</strong> capture a weaver&apos;s basic identity and
            link them to their cooperative.
          </p>
          <p>
            <strong>Why:</strong> authenticity claims are only as strong as the
            identity behind them — verified weavers are the root of trust.
          </p>
          <p>
            <strong>How:</strong> a KYC-lite flow — cooperative staff or field
            officers confirm the weaver in person, then approve them here.
          </p>
        </InfoCard>
      </Reveal>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Left: pre-filled form */}
        <Reveal delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>Weaver registration</CardTitle>
              <p className="text-sm text-neutral-500">
                Pre-filled with a sample weaver — in the field this takes two
                minutes on a shared smartphone.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <Field
                id="name"
                label="Full name"
                helper="As known in the village — no documents needed at this stage."
              >
                <Input id="name" defaultValue={sampleWeaver.name} />
              </Field>
              <Field
                id="phone"
                label="Phone number"
                helper="The weaver's identity anchor. One-time password verifies ownership."
              >
                <Input id="phone" defaultValue={sampleWeaver.phone} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="village"
                  label="Village"
                  helper="Locates the weaver inside the cluster."
                >
                  <Input id="village" defaultValue={sampleWeaver.village} />
                </Field>
                <Field
                  id="district"
                  label="District"
                  helper="Used for cluster-level reporting."
                >
                  <Input id="district" defaultValue={cooperative.district} />
                </Field>
              </div>
              <Field
                id="state"
                label="State"
                helper="Auto-derived from the cluster in a real deployment."
              >
                <Input id="state" defaultValue={cooperative.state} />
              </Field>
              <Field
                id="coop"
                label="Cooperative"
                helper="The society that will verify this weaver and aggregate their products."
              >
                <Select id="coop" defaultValue={cooperative.id}>
                  <option value={cooperative.id}>{cooperative.name}</option>
                  <option value="other">Independent (no cooperative yet)</option>
                </Select>
              </Field>
            </CardContent>
          </Card>
        </Reveal>

        {/* Right: verification */}
        <Reveal delay={0.2}>
          <Card className="sketch-box-alt border-dashed">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="sketch-box flex h-11 w-11 items-center justify-center border-2 border-black">
                  <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <CardTitle>Verification</CardTitle>
              </div>
              <p className="pt-1 text-sm leading-relaxed text-neutral-600">
                Verification is deliberately human: a cooperative office-bearer
                or field officer confirms the weaver face-to-face (KYC-lite),
                then approves them. From that moment, every product passport
                this weaver issues carries the cooperative&apos;s backing.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ol className="space-y-2 text-sm text-neutral-700">
                {[
                  "Phone number confirmed via OTP",
                  "Field officer meets the weaver at the loom",
                  "Cooperative marks the profile as verified",
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-2">
                    <span className="sketch-box mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-black text-[10px] font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              <Button
                onClick={() => setVerified((v) => !v)}
                variant={verified ? "outline" : "default"}
                className="w-full"
              >
                {verified ? "Undo verification (demo)" : "Mark as Verified"}
              </Button>

              <AnimatePresence>
                {verified && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="sketch-box flex items-center gap-3 border-2 border-black bg-neutral-50 p-4"
                  >
                    <BadgeCheck className="h-8 w-8 shrink-0" strokeWidth={1.75} />
                    <div>
                      <p className="font-extrabold leading-tight">
                        Verified by {cooperative.name}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {sampleWeaver.name} can now issue product passports
                        under the cooperative&apos;s name.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <div className="mt-10 flex justify-end">
        <Button asChild size="lg">
          <Link href="/product/create">
            Next: Create Product Passport
            <ArrowRight strokeWidth={2} />
          </Link>
        </Button>
      </div>
    </AppShell>
  );
}
