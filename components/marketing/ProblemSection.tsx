import { Building2, ScanSearch, Scissors } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DoodleFrame } from "./doodles";

const problems = [
  {
    icon: Scissors,
    title: "Weavers stuck behind middlemen",
    body: "In clusters like Chanderi and Pochampally, most weavers sell through layers of intermediaries — each layer taking margin, leaving the weaver with a fraction of the final price and no direct link to buyers.",
  },
  {
    icon: ScanSearch,
    title: "Buyers can't see authenticity",
    body: "Powerloom fakes carry “handloom” tags with no way to check. There's no QR to scan, no story of who wove it, and no traceability from loom to shelf — so genuine handloom loses its premium.",
  },
  {
    icon: Building2,
    title: "Cooperatives lack digital tools",
    body: "Member registers and production records live in paper ledgers. Cooperatives can't see who's producing what in real time — making it impossible to aggregate supply or negotiate better bulk prices.",
  },
];

export default function ProblemSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-6 py-20">
        <DoodleFrame className="inset-x-0 top-24 -z-10 mx-auto hidden h-[calc(100%-8rem)] w-[105%] max-w-none lg:block" />

        <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          Three broken links in the chain
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-600">
          The handloom economy runs on trust — but today that trust has no
          infrastructure.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {problems.map((p, i) => (
            <Card
              key={p.title}
              className={i === 1 ? "border-dashed sketch-box-alt" : ""}
            >
              <CardHeader>
                <span className="sketch-box-alt mb-2 flex h-12 w-12 items-center justify-center border-2 border-black">
                  <p.icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <CardTitle>{p.title}</CardTitle>
                <CardDescription>{p.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
