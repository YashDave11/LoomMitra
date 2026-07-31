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

/** First image URL of a product, or null (Legacy). */
export function firstImage(images?: { url: string }[] | null): string | null {
  return images && images.length > 0 ? images[0].url : null;
}

/** Get the best preview image for a product, prioritizing AI Catalog outputs. */
export function getPreviewImage(product?: { images?: { url: string, type: string }[] | null, catalogStatus?: string } | null): string {
  if (!product) return "https://via.placeholder.com/400x500";
  
  if (product.images && product.images.length > 0) {
    const catalog = product.images.find((img) => img.type.startsWith("CATALOG_"));
    if (catalog) return catalog.url;
  }
  
  const any = product.images?.[0]?.url;
  if (any) return any;
  
  if (product.catalogStatus === "DONE") {
    const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:4000";
    return `${baseUrl}/CatalogOutput/shot_0.jpg`;
  }
  
  return "https://via.placeholder.com/400x500";
}
