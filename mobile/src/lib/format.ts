// Small display helpers shared across screens.

/** Format an amount as INR (₹) with grouping, no decimals. */
export function formatPrice(amount: number | null | undefined, currency = "INR"): string {
  if (amount == null) return "—";
  const symbol = currency === "INR" ? "₹" : "";
  return `${symbol}${Math.round(amount).toLocaleString("en-IN")}`;
}

/** Human "time left" until an ISO timestamp. Returns null once elapsed. */
export function timeLeft(iso: string, now: number): string | null {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return null;
  const mins = Math.floor(ms / 60000);
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${m}m`;
  return `${m}m`;
}

/** First image URL of a product, or null. */
export function firstImage(images?: { url: string }[] | null): string | null {
  return images && images.length > 0 ? images[0].url : null;
}
