// LoomMitra mobile design system.
//
// Single source of truth for spacing, color, typography, radius and shadow.
// Mirrors the web app's high-contrast black/white "sketch" aesthetic, but
// tuned for touch: every interactive size respects Android's 48dp minimum.
// Import `theme` everywhere instead of hardcoding numbers or hex.

export const colors = {
  // Core (matches the web app: bg-white / text-black)
  bg: "#ffffff",
  surface: "#ffffff",
  surfaceMuted: "#f5f5f5", // neutral-100
  ink: "#000000",
  inkOnDark: "#ffffff",

  // Neutral ramp (Tailwind neutral)
  neutral900: "#171717",
  neutral700: "#404040",
  neutral500: "#737373",
  neutral400: "#a3a3a3",
  neutral300: "#d4d4d4",
  neutral200: "#e5e5e5",
  neutral100: "#f5f5f5",

  border: "#d4d4d4",
  borderStrong: "#000000",

  // Status (auctions / orders) — kept accessible on white.
  success: "#16a34a",
  successBg: "#dcfce7",
  warning: "#b45309",
  warningBg: "#fef3c7",
  danger: "#dc2626",
  dangerBg: "#fee2e2",
  info: "#2563eb",
  infoBg: "#dbeafe",
  live: "#dc2626", // live auction pulse
} as const;

// 4pt base scale.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 56,
} as const;

// Type scale — large & readable for low-literacy / outdoor use.
export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: "800" as const },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: "800" as const },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: "700" as const },
  title: { fontSize: 18, lineHeight: 24, fontWeight: "700" as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: "600" as const },
  label: { fontSize: 14, lineHeight: 20, fontWeight: "600" as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "500" as const },
  // Big number/price display.
  amount: { fontSize: 28, lineHeight: 34, fontWeight: "800" as const },
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

// Minimum touch target (Android accessibility guidance).
export const touch = {
  min: 48,
  comfortable: 56,
  large: 64,
} as const;

export const shadow = {
  // Offset "sketch" shadow, matches sketch-shadow-dark on web.
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  raised: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
} as const;

export const theme = { colors, spacing, typography, radius, touch, shadow };
export type Theme = typeof theme;
