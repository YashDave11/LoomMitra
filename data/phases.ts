/**
 * Single source of truth for the three-phase implementation plan.
 * Each phase maps to a hackathon problem statement and owns a set of screens.
 */

export type PhaseId = "phase-1" | "phase-2" | "phase-3";

export interface PhaseScreen {
  href: string;
  label: string;
}

export interface Phase {
  id: PhaseId;
  phase: "Phase 1" | "Phase 2" | "Phase 3";
  problemCode: string;
  label: string;
  description: string;
  screens: PhaseScreen[];
}

export const phases: Phase[] = [
  {
    id: "phase-1",
    phase: "Phase 1",
    problemCode: "Problem 2.1",
    label: "Digital Market",
    description:
      "Connect rural weavers to digital markets: phone-based onboarding, verified profiles, and product listings created at the loom — no middlemen required.",
    screens: [
      { href: "/dashboard", label: "Walkthrough hub" },
      { href: "/weaver/onboarding", label: "Weaver Onboarding" },
      { href: "/product/create", label: "Create Product Passport" },
    ],
  },
  {
    id: "phase-2",
    phase: "Phase 2",
    problemCode: "Problem 2.2",
    label: "Authenticity & Stories",
    description:
      "Make authenticity checkable: hash-chained product events, QR codes on physical products, and weaver stories buyers can scan and trust.",
    screens: [
      { href: "/product/passport", label: "QR & Authenticity" },
      { href: "/buyer/view", label: "Buyer View" },
    ],
  },
  {
    id: "phase-3",
    phase: "Phase 3",
    problemCode: "Problem 4.3",
    label: "Cooperative Digitisation",
    description:
      "Digitise cooperative operations: member registries, pooled inventory, and bulk-order visibility that turns scattered stock into collective bargaining power.",
    screens: [
      { href: "/cooperative/dashboard", label: "Cooperative Dashboard" },
    ],
  },
];

export function phaseByHref(href: string): Phase | undefined {
  return phases.find((p) => p.screens.some((s) => s.href === href));
}
