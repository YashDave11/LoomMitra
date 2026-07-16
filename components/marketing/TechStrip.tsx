import { Layers, Paintbrush, QrCode, WifiOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { StaggerGroup, StaggerItem } from "@/components/walkthrough/motion";
import { DoodleScribble } from "./doodles";

const items = [
  { icon: Layers, label: "Next.js (static prototype)" },
  { icon: Paintbrush, label: "ShadCN UI" },
  { icon: QrCode, label: "QR + event-based timeline" },
  { icon: WifiOff, label: "Designed for offline-first clusters" },
];

export default function TechStrip() {
  return (
    <section className="relative overflow-hidden py-14">
      <DoodleScribble className="left-1/2 top-1/2 h-16 w-[420px] -translate-x-1/2 -translate-y-1/2 opacity-80" />

      <StaggerGroup className="relative mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3 px-6">
        {items.map((item, i) => (
          <StaggerItem key={item.label}>
            <Badge
              variant={i % 2 === 0 ? "default" : "dashed"}
              className="bg-white py-2 transition-transform hover:-translate-y-0.5"
            >
              <item.icon className="h-4 w-4" strokeWidth={1.75} />
              {item.label}
            </Badge>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
