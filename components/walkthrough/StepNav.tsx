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

const steps = [
  { n: 1, label: "Weaver Onboarding", href: "/weaver/onboarding", icon: UserPlus },
  { n: 2, label: "Create Product Passport", href: "/product/create", icon: FileBadge },
  { n: 3, label: "QR & Authenticity", href: "/product/passport", icon: QrCode },
  { n: 4, label: "Buyer View", href: "/buyer/view", icon: ShoppingBag },
  { n: 5, label: "Cooperative Dashboard", href: "/cooperative/dashboard", icon: Building2 },
];

export default function StepNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Walkthrough steps"
      className="mb-10 overflow-x-auto pb-2"
    >
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
                  className="h-px w-5 border-t-2 border-dashed border-neutral-300"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
