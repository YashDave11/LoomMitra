import { HelpCircle, Info, Wrench } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Three-part explainer: what this screen does in the prototype,
 * why it matters, and how it will work in the real implementation.
 */
export default function ExplainPanel({
  title = "How this will work in production",
  what,
  why,
  how,
  className,
}: {
  title?: string;
  what: React.ReactNode;
  why: React.ReactNode;
  how: React.ReactNode;
  className?: string;
}) {
  const rows = [
    { icon: Info, label: "What (in this prototype)", body: what },
    { icon: HelpCircle, label: "Why it matters", body: why },
    { icon: Wrench, label: "How (real implementation)", body: how },
  ];

  return (
    <Card className={cn("sketch-box-alt border-dashed", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm uppercase tracking-widest text-neutral-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-3">
            <span className="sketch-box flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black">
              <r.icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                {r.label}
              </p>
              <div className="mt-1 text-sm leading-relaxed text-neutral-700">
                {r.body}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
