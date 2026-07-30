"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import type { DiscoverProduct } from "@/lib/types";
import { optionLabel } from "@/lib/productOptions";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ShieldCheck,
  MapPin,
  QrCode,
  ScanLine,
  Package,
} from "lucide-react";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const { t } = useTranslation("product");
  const [product, setProduct] = useState<DiscoverProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    apiClient
      .getDiscoverProduct(productId)
      .then(setProduct)
      .catch(() => setError("Could not find this product. It may have been removed or the link is invalid."))
      .finally(() => setLoading(false));
  }, [productId]);

  /* ── Idle state (no QR scanned) ── */
  if (!productId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <div className="sketch-box-alt mx-auto mb-6 flex h-20 w-20 items-center justify-center border-2 border-black">
            <QrCode className="h-10 w-10" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-black">
            Verify Product Authenticity
          </h1>
          <p className="mt-3 text-neutral-500">
            Scan the LoomMitra QR code on your product to view its complete
            provenance — from loom to market.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-neutral-400">
            <ScanLine className="h-4 w-4" />
            <span>Point your camera at a LoomMitra QR code</span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  /* ── Error ── */
  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
          <h1 className="text-xl font-extrabold text-black">Product Not Found</h1>
          <p className="mt-2 text-neutral-500">{error || "The product could not be loaded."}</p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    );
  }

  /* ── Verified product display ── */
  const weaverProfile = product.user?.weaverProfile;
  const isVerified = Boolean(weaverProfile?.aadhaarNumber && weaverProfile?.handloomId);
  const mainImage = product.images?.[0]?.url || "/placeholder.svg";

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Verified badge */}
        <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <ShieldCheck className="h-5 w-5 text-green-700" />
          <span className="text-sm font-bold text-green-800">
            Verified Authentic Product
          </span>
        </div>

        {/* Product info */}
        <Card className="border-neutral-200 shadow-none">
          <div className="flex flex-col gap-6 p-6 sm:flex-row">
            {/* Image */}
            <div className="aspect-[4/5] w-full shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:w-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mainImage}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="dashed">{product.type}</Badge>
                  {product.status === "READY" && (
                    <Badge className="bg-green-100 text-green-800 border-none">Ready</Badge>
                  )}
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-black">
                  {product.title}
                </h1>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {product.material && (
                  <div>
                    <p className="text-xs text-neutral-500">Material</p>
                    <p className="text-sm font-medium text-black">
                      {optionLabel(t, "material", product.material)}
                    </p>
                  </div>
                )}
                {product.designName && (
                  <div>
                    <p className="text-xs text-neutral-500">Design</p>
                    <p className="text-sm font-medium text-black">
                      {optionLabel(t, "pattern", product.designName)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-neutral-500">Price</p>
                  <p className="text-sm font-bold text-black">₹{product.price.toLocaleString("en-IN")}</p>
                </div>
                {product.location && (
                  <div className="flex items-start gap-1">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                    <p className="text-sm font-medium text-black">
                      {optionLabel(t, "cluster", product.location)}
                    </p>
                  </div>
                )}
              </div>

              {product.description && (
                <div>
                  <p className="text-xs text-neutral-500 mb-1">About this product</p>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Weaver verification */}
        {weaverProfile && (
          <Card className="mt-4 border-neutral-200 shadow-none">
            <CardHeader className="border-b border-neutral-100 pb-3">
              <CardTitle className="text-sm">Artisan Details</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white font-bold text-lg">
                {weaverProfile.name?.charAt(0) || "W"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-black">{weaverProfile.name}</p>
                <p className="text-sm text-neutral-500">{weaverProfile.cluster} Cluster</p>
              </div>
              {isVerified && (
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 shrink-0">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Gov. Verified
                </Badge>
              )}
            </CardContent>
          </Card>
        )}

        {/* Back to marketplace */}
        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link href="/app/discover">Browse More Products</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
