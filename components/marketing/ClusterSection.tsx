import { MapPin, Award } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DoodleFrame, DoodleScribble } from "./doodles";

const clusters = [
  {
    name: "Chanderi, Madhya Pradesh",
    subtitle: "Handwoven lightweight sarees",
    tags: ["Silk × cotton blend", "Sheer texture", "Pilot-ready"],
    body: "Chanderi is famous for feather-light sarees woven from a fine silk and cotton blend, prized for their sheer, glossy texture. Handloom Passport can be piloted with a Chanderi cooperative: each saree leaves the loom with a QR-based passport, so its origin travels with it to any market.",
  },
  {
    name: "Pochampally, Telangana",
    subtitle: "Ikat patterns, GI-tagged",
    tags: ["Ikat tie-dye weave", "GI-tagged", "Export focus"],
    body: "Pochampally's ikat tradition — patterns dyed into the yarn before weaving — carries a Geographical Indication tag. QR-linked product passports let export buyers verify that GI authenticity instantly, turning a legal protection into visible, scannable trust.",
  },
];

export default function ClusterSection() {
  return (
    <section className="relative overflow-hidden">
      <DoodleScribble className="left-[8%] top-10 hidden h-14 w-48 lg:block" />

      <div className="relative mx-auto max-w-6xl px-6 py-20">
        <DoodleFrame className="inset-x-0 top-24 -z-10 mx-auto hidden h-[calc(100%-8rem)] w-[103%] max-w-none lg:block" />

        <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          Grounded in real clusters
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-600">
          Not a generic platform — designed around two of India&apos;s most
          storied weaving regions.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {clusters.map((c, i) => (
            <Card key={c.name} className={i === 1 ? "sketch-box-alt" : ""}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="sketch-box-alt flex h-12 w-12 shrink-0 items-center justify-center border-2 border-black">
                    {i === 0 ? (
                      <MapPin className="h-6 w-6" strokeWidth={1.5} />
                    ) : (
                      <Award className="h-6 w-6" strokeWidth={1.5} />
                    )}
                  </span>
                  <div>
                    <CardTitle className="text-xl">{c.name}</CardTitle>
                    <p className="text-sm font-medium text-neutral-500">
                      {c.subtitle}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-[15px]">
                  {c.body}
                </CardDescription>
                <div className="flex flex-wrap gap-2">
                  {c.tags.map((t) => (
                    <Badge key={t} variant="subtle" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
