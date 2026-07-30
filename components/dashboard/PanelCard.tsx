import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

interface PanelCardProps {
  title: string;
  description?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Remove padding from CardContent for list/table panels */
  noPadding?: boolean;
}

export function PanelCard({
  title,
  description,
  headerRight,
  children,
  className,
  noPadding = false,
}: PanelCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col border-neutral-200 shadow-none",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-100 pb-3 pt-4 px-5">
        <div className="min-w-0 flex-1 space-y-0.5">
          <CardTitle className="text-sm font-bold">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs">{description}</CardDescription>
          )}
        </div>
        {headerRight && (
          <div className="ml-3 shrink-0">{headerRight}</div>
        )}
      </CardHeader>
      <CardContent className={cn("flex-1", noPadding ? "p-0" : "p-5")}>
        {children}
      </CardContent>
    </Card>
  );
}
