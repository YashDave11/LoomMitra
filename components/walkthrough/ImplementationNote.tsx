import { Settings2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Tiny backend-readiness note pinned near buttons/forms:
 * which API this UI will eventually call. Unobtrusive by design.
 */
export default function ImplementationNote({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-start gap-1.5 rounded border border-dashed border-neutral-300 bg-neutral-50 px-2.5 py-1.5 text-left font-mono text-[11px] leading-relaxed text-neutral-500",
        className
      )}
    >
      <Settings2 className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={2} />
      <span>{children}</span>
    </p>
  );
}
