import { BarChart3, FileBadge, Smartphone } from "lucide-react";

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
import { DoodleBlob, SketchArrow } from "./doodles";

const steps = [
  {
    icon: FileBadge,
    step: "Step 1",
    title: "Weaver creates a digital product passport",
    body: "Each saree or fabric gets its own passport — the weaver's story, photos of the work, fabric and loom details, and a unique QR code printed on the tag.",
  },
  {
    icon: Smartphone,
    step: "Step 2",
    title: "Buyer scans QR to see authenticity + story",
    body: "One scan opens the product's timeline — who wove it, where, and every verified event along the way. Full transparency from loom to market.",
  },
  {
    icon: BarChart3,
    step: "Step 3",
    title: "Cooperative dashboard aggregates the data",
    body: "Member-level production visibility in one place, so cooperatives can pool inventory, respond to bulk orders, and bargain from a position of knowledge.",
  },
];

export default function SolutionSection() {
  return (
    <section id="solution" className="relative overflow-hidden scroll-mt-20">
      <DoodleBlob className="-left-24 top-10 hidden h-72 w-96 lg:block" />

      <div className="mx-auto max-w-6xl px-6 py-20">
        <ScrollReveal>
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            One passport. Three sides of trust.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-neutral-600">
            A simple three-step loop that connects the people who make, buy, and
            organize handloom.
          </p>
        </ScrollReveal>

        <StaggerGroup className="mt-12 flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
          {steps.map((s, i) => (
            <StaggerItem
              key={s.title}
              className="flex flex-1 flex-col items-center gap-4 lg:flex-row"
            >
              <HoverLift className="h-full flex-1">
                <Card className="h-full transition-shadow hover:shadow-[5px_5px_0_0_rgba(0,0,0,0.12)]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <span className="sketch-box flex h-12 w-12 items-center justify-center border-2 border-black">
                        <s.icon className="h-6 w-6" strokeWidth={1.5} />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                        {s.step}
                      </span>
                    </div>
                    <CardTitle>{s.title}</CardTitle>
                    <CardDescription>{s.body}</CardDescription>
                  </CardHeader>
                </Card>
              </HoverLift>
              {i < steps.length - 1 && (
                <>
                  <SketchArrow className="hidden h-8 w-16 shrink-0 lg:block" />
                  <SketchArrow
                    direction="down"
                    className="h-7 w-12 lg:hidden"
                  />
                </>
              )}
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
