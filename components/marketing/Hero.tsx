import Link from "next/link";
import { ArrowRight, Building2, QrCode, ShoppingBag, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DoodleCrosses, DoodleScribble, SketchArrow } from "./doodles";

const flow = [
  { icon: User, label: "Weaver" },
  { icon: QrCode, label: "QR Passport" },
  { icon: ShoppingBag, label: "Buyer" },
  { icon: Building2, label: "Cooperative" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <DoodleCrosses className="left-[4%] top-16 hidden h-40 w-40 lg:block" />
      <DoodleScribble className="right-[6%] top-24 hidden h-16 w-56 lg:block" />

      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-20 pt-20 text-center sm:pt-28">
        <Badge variant="dashed" className="mb-6">
          Indian Handloom Hackathon 2026 · Clickable Prototype
        </Badge>

        <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
          Handloom Passport —{" "}
          <span className="underline decoration-neutral-300 decoration-wavy decoration-2 underline-offset-8">
            Trust from Loom to Market
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
          Rural weavers can&apos;t easily reach digital markets, and buyers have
          no way to verify what&apos;s truly &ldquo;handloom&rdquo;. Meanwhile,
          cooperatives still run on paper registers and lose bargaining power.
          Handloom Passport gives every woven product a scannable digital
          identity — connecting weaver, buyer, and cooperative on one page.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/dashboard">
              Open Interactive Prototype
              <ArrowRight strokeWidth={2} />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="#solution">How it works</a>
          </Button>
        </div>

        {/* Central sketch diagram: Weaver → QR → Buyer → Cooperative */}
        <div className="sketch-box-alt sketch-shadow relative mt-16 w-full max-w-3xl border-2 border-dashed border-black bg-white px-6 py-10 sm:px-10">
          <span className="absolute -top-3 left-8 bg-white px-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
            The flow, at a glance
          </span>

          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-1">
            {flow.map((step, i) => (
              <div
                key={step.label}
                className="flex flex-col items-center gap-2 sm:flex-row sm:gap-1"
              >
                <div className="flex flex-col items-center gap-2">
                  <span
                    className={
                      i % 2 === 0
                        ? "sketch-box flex h-16 w-16 items-center justify-center border-2 border-black bg-white"
                        : "sketch-box-alt flex h-16 w-16 items-center justify-center border-2 border-dashed border-black bg-white"
                    }
                  >
                    <step.icon className="h-7 w-7" strokeWidth={1.5} />
                  </span>
                  <span className="text-sm font-semibold">{step.label}</span>
                </div>
                {i < flow.length - 1 && (
                  <>
                    <SketchArrow className="hidden h-8 w-14 shrink-0 sm:-mt-6 sm:block" />
                    <SketchArrow
                      direction="down"
                      className="my-1 h-7 w-12 sm:hidden"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
