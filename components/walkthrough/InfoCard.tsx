import { Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The "what / why / how" explainer card used at the top of every step.
 */
export default function InfoCard({
  title = "Why this step matters",
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "sketch-box-alt relative border-2 border-dashed border-black bg-white p-5",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="sketch-box flex h-9 w-9 shrink-0 items-center justify-center border-2 border-black">
          <Lightbulb className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-neutral-500">
            {title}
          </p>
          <div className="mt-1.5 space-y-1.5 text-sm leading-relaxed text-neutral-700">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}
