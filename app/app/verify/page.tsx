"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/lib/AuthContext";
import type { DiscoverProduct } from "@/lib/types";
import { optionLabel } from "@/lib/productOptions";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  MapPin,
  ShieldCheck,
  QrCode,
  Package,
  CheckCircle,
  Search,
  AlertCircle,
} from "lucide-react";

const TYPE_LABEL: Record<string, string> = {
  SAREE: "Saree", MUFFLER: "Muffler", DUPATTA: "Dupatta",
  STOLE: "Stole", FABRIC: "Fabric", OTHER: "Other",
};

export default function VerifyPage() {
  const { loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const { t } = useTranslation("product");
  const [productId, setProductId] = useState("");
  const [searching, setSearching] = useState(false);
  const [product, setProduct] = useState<DiscoverProduct | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function lookup(id: string) {
    setError(null);
    setSearching(true);
    setProduct(null);
    try {
      const p = await apiClient.getDiscoverProduct(id.trim());
      setProduct(p);
    } catch {
      setError("Product not found. Please check the ID and try again.");
    } finally {
      setSearching(false);
    }
  }

  // Auto-lookup when the QR code's ?p=<id> query param is present.
  useEffect(() => {
    const p = searchParams.get("p");
    if (p) {
      setProductId(p);
      lookup(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!productId.trim()) return;
    lookup(productId);
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-black">
          Verify Product Authenticity
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Scan or enter a product&apos;s LoomMitra QR code to verify its origin and authenticity.
        </p>
      </div>

      {/* Lookup form */}
      <Card className="border-neutral-200 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <QrCode className="h-5 w-5" />
            Look Up Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLookup} className="flex gap-3">
            <Input
              placeholder="Enter Product ID from QR code..."
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="flex-1 font-mono text-sm"
            />
            <Button type="submit" disabled={searching || !productId.trim()}>
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Look Up
            </Button>
          </form>
          {error && (
            <div className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product verification result */}
      {product && (
        <Card className="border-2 border-green-200 shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-700" />
              <span className="text-sm font-bold text-green-700">Product Found — Verified</span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Product image */}
              <div className="aspect-[4/5] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0].url}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-12 w-12 text-neutral-300" />
                  </div>
                )}
              </div>

              {/* Product details */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <Badge variant="dashed" className="mb-2">{TYPE_LABEL[product.type] || product.type}</Badge>
                  <h2 className="text-2xl font-extrabold">{product.title}</h2>
                  {product.location && (
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-neutral-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {optionLabel(t, "cluster", product.location)}
                    </div>
                  )}
                </div>

                {product.description && (
                  <p className="text-sm text-neutral-600">{product.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {product.material && (
                    <div className="rounded border border-neutral-200 p-3">
                      <span className="text-neutral-500">Material</span>
                      <p className="font-medium">{optionLabel(t, "material", product.material)}</p>
                    </div>
                  )}
                  {product.designName && (
                    <div className="rounded border border-neutral-200 p-3">
                      <span className="text-neutral-500">Design</span>
                      <p className="font-medium">{optionLabel(t, "pattern", product.designName)}</p>
                    </div>
                  )}
                  <div className="rounded border border-neutral-200 p-3">
                    <span className="text-neutral-500">Price</span>
                    <p className="font-medium">₹{product.price.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="rounded border border-neutral-200 p-3">
                    <span className="text-neutral-500">Stock</span>
                    <p className="font-medium">{product.stock} units</p>
                  </div>
                </div>

                {/* Weaver info */}
                {product.user?.weaverProfile && (
                  <div className="flex items-center gap-4 rounded-lg bg-neutral-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white font-bold">
                      {product.user.weaverProfile.name?.charAt(0) || "W"}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{product.user.weaverProfile.name}</p>
                      <p className="text-xs text-neutral-500">
                        {product.user.weaverProfile.cluster} Cluster
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Government Verified
                    </div>
                  </div>
                )}

                {/* Verification metadata */}
                <div className="border-t border-dashed border-neutral-200 pt-3 text-xs text-neutral-400 space-y-1">
                  <p>Product ID: {product.id}</p>
                  <p>Listed: {new Date(product.createdAt).toLocaleDateString("en-IN")}</p>
                  <p>Catalog Status: {product.catalogStatus}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
