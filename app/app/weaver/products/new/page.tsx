"use client";

import { useRequireRole } from "@/lib/useRequireRole";
import ProductListingWizard from "@/components/product/ProductListingWizard";

export default function NewProductPage() {
  const { ready } = useRequireRole("WEAVER");
  if (!ready) return null;
  return <ProductListingWizard />;
}
