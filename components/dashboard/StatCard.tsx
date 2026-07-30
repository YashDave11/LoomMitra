import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { direction: "up" | "down"; value: string };
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3",
        className,
      )}
    >
      {Icon && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50">
          <Icon className="h-4 w-4 text-neutral-600" strokeWidth={1.5} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-neutral-500">{label}</p>
        <p className="text-lg font-bold leading-tight text-black">{value}</p>
        {trend && (
          <p
            className={cn(
              "text-[11px] font-medium",
              trend.direction === "up" ? "text-neutral-700" : "text-neutral-500",
            )}
          >
            {trend.direction === "up" ? "↑" : "↓"} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
