import Link from "next/link";
import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/walkthrough/motion";
import { DoodleCrosses } from "./doodles";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      <DoodleCrosses className="left-[10%] bottom-8 hidden h-28 w-28 lg:block" />

      <div className="mx-auto max-w-6xl px-6 py-20">
        <ScrollReveal>
          <div className="sketch-box sketch-shadow relative mx-auto max-w-3xl border-2 border-black bg-white px-8 py-14 text-center transition-shadow hover:shadow-[6px_6px_0_0_rgba(0,0,0,0.15)] sm:px-14">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Try it yourself
          </span>

          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Walk through the full flow
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-neutral-600">
            This is a clickable prototype showing the end-to-end workflow: a
            weaver creating a passport, a buyer scanning the QR, and a
            cooperative watching it all come together on one dashboard.
          </p>

          <Button asChild size="lg" className="mt-8">
            <Link href="/dashboard">
              <Play strokeWidth={2} />
              Start walkthrough
            </Link>
          </Button>

          <p className="mt-6 text-xs text-neutral-500">
            Prototype only – no real orders, built for Indian Handloom
            Hackathon 2026.
          </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
