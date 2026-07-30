"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface RadioGroupContextValue {
  value: string;
  onChange: (value: string) => void;
  name: string;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  name?: string;
  className?: string;
  children: React.ReactNode;
}

function RadioGroup({ value, onValueChange, name = "radio-group", className, children }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onChange: onValueChange, name }}>
      <div role="radiogroup" className={cn("grid gap-3", className)}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

interface RadioGroupItemProps {
  value: string;
  id: string;
  className?: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ value, id, className }, ref) => {
    const ctx = React.useContext(RadioGroupContext);
    if (!ctx) throw new Error("RadioGroupItem must be used within a RadioGroup");
    const checked = ctx.value === value;

    return (
      <span className="relative inline-flex h-5 w-5 items-center justify-center">
        <input
          ref={ref}
          type="radio"
          id={id}
          name={ctx.name}
          value={value}
          checked={checked}
          onChange={() => ctx.onChange(value)}
          className={cn(
            "peer h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-black bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
            className
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute h-2.5 w-2.5 rounded-full bg-black transition-opacity",
            checked ? "opacity-100" : "opacity-0"
          )}
        />
      </span>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
