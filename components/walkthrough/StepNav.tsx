"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  FileBadge,
  QrCode,
  ShoppingBag,
  UserPlus,
} from "lucide-react";

import { cn } from "@/lib/utils";

/** Each step carries its phase so the stepper doubles as a roadmap. */
const steps = [
  { n: 1, label: "Weaver Onboarding", href: "/weaver/onboarding", icon: UserPlus, phase: "P1" },
  { n: 2, label: "Create Product Passport", href: "/product/create", icon: FileBadge, phase: "P1" },
  { n: 3, label: "QR & Authenticity", href: "/product/passport", icon: QrCode, phase: "P2" },
  { n: 4, label: "Buyer View", href: "/buyer/view", icon: ShoppingBag, phase: "P2" },
  { n: 5, label: "Cooperative Dashboard", href: "/cooperative/dashboard", icon: Building2, phase: "P3" },
];

const phaseTitle: Record<string, string> = {
  P1: "Phase 1 · Digital Market (2.1)",
  P2: "Phase 2 · Authenticity & Stories (2.2)",
  P3: "Phase 3 · Cooperative Digitisation (4.3)",
};

export default function StepNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Walkthrough steps" className="mb-10 overflow-x-auto pb-2">
      <ol className="flex min-w-max items-center gap-2">
        {steps.map((step, i) => {
          const active = pathname === step.href;
          return (
            <li key={step.href} className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="relative"
              >
                <Link
                  href={step.href}
                  aria-current={active ? "step" : undefined}
                  title={phaseTitle[step.phase]}
                  className={cn(
                    "sketch-box-alt relative flex items-center gap-2 border-2 px-4 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "border-black bg-black text-white"
                      : "border-dashed border-neutral-400 bg-white text-neutral-600 hover:border-black hover:text-black"
                  )}
                >
                  <step.icon className="h-4 w-4" strokeWidth={1.75} />
                  <span className="hidden md:inline">
                    {step.n}. {step.label}
                  </span>
                  <span className="md:hidden">{step.n}</span>
                  <span
                    className={cn(
                      "rounded-sm border px-1 text-[9px] font-bold leading-tight",
                      active
                        ? "border-neutral-500 text-neutral-300"
                        : "border-neutral-300 text-neutral-400"
                    )}
                  >
                    {step.phase}
                  </span>
                </Link>
                {active && (
                  <motion.span
                    layoutId="step-underline"
                    className="absolute -bottom-2 left-3 right-3 h-[3px] rounded-full bg-black"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.div>
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px w-5 border-t-2 border-neutral-300",
                    // solid connector inside a phase, dashed across phase boundaries
                    steps[i + 1].phase === step.phase
                      ? "border-solid"
                      : "border-dashed"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
