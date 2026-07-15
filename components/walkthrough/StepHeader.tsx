import { cn } from "@/lib/utils";

/**
 * Consistent step heading: step badge + big title + one-line intent.
 */
export default function StepHeader({
  step,
  title,
  lead,
  className,
}: {
  step: string;
  title: string;
  lead: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-8", className)}>
      <span className="inline-block rounded-full border-2 border-black bg-white px-4 py-1 text-xs font-bold uppercase tracking-widest">
        {step}
      </span>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-neutral-600">{lead}</p>
    </div>
  );
}
