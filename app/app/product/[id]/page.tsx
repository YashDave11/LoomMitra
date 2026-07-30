"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import type { DiscoverProduct, MediaAsset } from "@/lib/types";
import { optionLabel } from "@/lib/productOptions";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Loader2, ArrowLeft, MapPin, CheckCircle, ShieldCheck, Box, Image as ImageIcon, ShoppingBag, Zap } from "lucide-react";
import { ProductQRCard } from "@/components/product/ProductQRCard";

/* ------------------------------------------------------------------ */
/*  Lightbox — full-screen overlay for any image                      */
/* ------------------------------------------------------------------ */

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition"
      >
        <X className="h-6 w-6" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Thumbnail gallery                                                  */
/* ------------------------------------------------------------------ */

function ThumbnailRow({ images, onOpen }: { images: MediaAsset[]; onOpen: (url: string) => void }) {
  if (!images.length) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-neutral-400">
        <ImageIcon className="h-5 w-5 mr-2" />
        No images available.
      </div>
    );
  }
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {images.map((img) => (
        <button
          key={img.id}
          onClick={() => onOpen(img.url)}
          className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 hover:border-black transition-colors focus:outline-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt="Gallery thumbnail"
            className="h-full w-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, role, loading: authLoading } = useAuth();
  const { addItem } = useCart();
  const { t } = useTranslation("product");

  const [product, setProduct] = useState<DiscoverProduct | null>(null);
  const [loading, setLoading] = useState(true);

  // Image tabs — "catalog" or "raw"
  const [activeTab, setActiveTab] = useState<"catalog" | "raw">("catalog");
  // Main large image shown
  const [mainSrc, setMainSrc] = useState<string>("");
  // Lightbox
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Bulk Order State
  const [quantity, setQuantity] = useState("10");
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !id) return;
    apiClient
      .getDiscoverProduct(String(id))
      .then(setProduct)
      .catch((err) => {
        console.error(err);
        router.push("/app/discover");
      })
      .finally(() => setLoading(false));
  }, [id, authLoading, isAuthenticated, router]);

  // Derive image sets when product loads
  const rawImages: MediaAsset[] = product?.images?.filter((i) => i.type === "RAW") ?? [];
  const catalogImages: MediaAsset[] = product?.images?.filter((i) => i.type.startsWith("CATALOG_")) ?? [];

  // Set initial main src when product loads
  useEffect(() => {
    if (!product) return;
    const currentSet = activeTab === "catalog" ? catalogImages : rawImages;
    if (currentSet.length) {
      setMainSrc(currentSet[0].url);
    } else if (activeTab === "catalog" && rawImages.length) {
      // No catalog images yet, fall back to raw
      setActiveTab("raw");
      setMainSrc(rawImages[0].url);
    } else {
      setMainSrc("/placeholder.svg");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  // When tab changes, update main image
  useEffect(() => {
    const currentSet = activeTab === "catalog" ? catalogImages : rawImages;
    if (currentSet.length) {
      setMainSrc(currentSet[0].url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Build a flat "all images" list for the lightbox thumbnail strip
  const currentImages = activeTab === "catalog" ? catalogImages : rawImages;

  async function handleRequestBulkOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    setError(null);
    setSuccess(false);

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError("Please enter a valid quantity greater than 0.");
      return;
    }

    setRequesting(true);
    try {
      await apiClient.createBulkOrder(product.id, qty);
      setSuccess(true);
      setQuantity("10");
    } catch (err: any) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setRequesting(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!product) return null;

  const weaverProfile = product.user?.weaverProfile;
  const isVerified = Boolean(weaverProfile?.aadhaarNumber && weaverProfile?.handloomId);
  const hasCatalog = catalogImages.length > 0;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Lightbox */}
      {lightboxSrc && (
        <Lightbox
          src={lightboxSrc}
          alt={product.title}
          onClose={() => setLightboxSrc(null)}
        />
      )}

      <Button
        variant="ghost"
        size="sm"
        className="mb-6"
        onClick={() => router.push("/app/discover")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Marketplace
      </Button>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* ── Image Section ── */}
        <div>
          {/* Main image — click to open lightbox */}
          <button
            onClick={() => setLightboxSrc(mainSrc)}
            className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-sm focus:outline-none hover:ring-2 hover:ring-black transition"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainSrc}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </button>

          {/* Image tab switcher */}
          <div className="mt-4 flex items-center gap-2 border-b border-neutral-200 pb-3">
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "catalog"
                  ? "bg-black text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
              }`}
            >
              Catalog Photos
              {catalogImages.length > 0 && (
                <span className="ml-1.5 text-xs opacity-60">{catalogImages.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("raw")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "raw"
                  ? "bg-black text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
              }`}
            >
              Raw Images
              {rawImages.length > 0 && (
                <span className="ml-1.5 text-xs opacity-60">{rawImages.length}</span>
              )}
            </button>
          </div>

          {/* Thumbnail strip */}
          <div className="mt-3">
            <ThumbnailRow
              images={currentImages}
              onOpen={(url) => setMainSrc(url)}
            />
          </div>

          {/* Note when no catalog images exist yet */}
          {activeTab === "catalog" && !hasCatalog && (
            <div className="mt-3 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center text-sm text-neutral-500">
              <ImageIcon className="mx-auto mb-2 h-6 w-6 text-neutral-300" />
              Catalog photos are still being generated by the weaver.
              <br />
              View the &quot;Raw Images&quot; tab for uploaded photos.
            </div>
          )}
        </div>

        {/* ── Product Details & Actions ── */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="dashed" className="bg-neutral-100">{product.type}</Badge>
              {product.status === "READY" && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Ready to Ship</Badge>
              )}
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-950">{product.title}</h1>

            <div className="mt-4 flex items-center gap-4 text-neutral-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{product.location || weaverProfile?.cluster || "India"}</span>
              </div>
            </div>

            <div className="mt-6 text-3xl font-bold text-neutral-900">
              ₹{product.price.toLocaleString("en-IN")}
              <span className="text-sm font-normal text-neutral-500 ml-2">per unit</span>
            </div>
          </div>

          {product.description && (
            <div>
              <h3 className="font-bold text-lg mb-2">Description</h3>
              <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {product.material && (
              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="text-sm text-neutral-500">Material</p>
                <p className="font-medium text-neutral-900">
                  {optionLabel(t, "material", product.material)}
                </p>
              </div>
            )}
            {product.designName && (
              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="text-sm text-neutral-500">Design / Motif</p>
                <p className="font-medium text-neutral-900">
                  {optionLabel(t, "pattern", product.designName)}
                </p>
              </div>
            )}
            <div className="rounded-xl border border-neutral-200 p-4">
              <p className="text-sm text-neutral-500">Available Stock</p>
              <p className="font-medium text-neutral-900">{product.stock} units</p>
            </div>
          </div>

          <hr className="border-neutral-200" />

          {/* Weaver Profile Summary */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white font-bold text-lg">
              {weaverProfile?.name?.charAt(0) || "W"}
            </div>
            <div>
              <p className="font-bold text-neutral-900">{weaverProfile?.name || "Verified Weaver"}</p>
              <p className="text-sm text-neutral-600">{weaverProfile?.cluster} Cluster</p>
            </div>
            {isVerified && (
              <div className="ml-auto flex items-center gap-1.5 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full text-sm font-medium">
                <ShieldCheck className="h-4 w-4" />
                Gov. Verified
              </div>
            )}
          </div>

          {/* ── Authentic QR Code (visible to all roles for sharing/verification) ── */}
          <ProductQRCard product={product} />

          {/* Business Action: Request Bulk Order */}
          {role === "BUSINESS" && (
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="h-5 w-5" />
                  Request Bulk Order (RFQ)
                </CardTitle>
                <CardDescription>
                  Send a request to negotiate bulk pricing directly with the weaver.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestBulkOrder} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-900">Required Quantity</label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 50"
                      className="text-lg"
                    />
                  </div>

                  {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

                  {success ? (
                    <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-md border border-green-200">
                      <CheckCircle className="h-5 w-5 shrink-0" />
                      <p className="text-sm font-medium">Request sent successfully! Check your dashboard for weaver quotes.</p>
                    </div>
                  ) : (
                    <Button
                      type="submit"
                      className="w-full text-md h-12 bg-black hover:bg-neutral-800"
                      disabled={requesting}
                    >
                      {requesting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                      {requesting ? "Sending Request..." : "Send Request to Weaver"}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          )}

          {/* Customer Action: Add to Cart + Buy Now */}
          {role === "CUSTOMER" && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 text-lg h-14 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]"
                onClick={() => {
                  const previewImage =
                    product.images?.find((img) => img.type.startsWith("CATALOG_"))?.url ||
                    product.images?.[0]?.url ||
                    "/placeholder.svg";
                  addItem({
                    productId: product.id,
                    title: product.title,
                    price: product.price,
                    image: previewImage,
                    weaverName: weaverProfile?.name || "Unknown Weaver",
                    stock: product.stock,
                  });
                }}
              >
                <ShoppingBag className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                asChild
                className="flex-1 text-lg h-14 bg-black hover:bg-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
              >
                <Link
                  href={`/app/customer/checkout?buyNow=${product.id}`}
                  onClick={(e) => {
                    // Add to cart before navigating
                    const previewImage =
                      product.images?.find((img) => img.type.startsWith("CATALOG_"))?.url ||
                      product.images?.[0]?.url ||
                      "/placeholder.svg";
                    // Check if already in cart — if it's already in the cart,
                    // just navigate; otherwise add one unit first.
                    const cartRaw = typeof window !== "undefined" ? localStorage.getItem("loommitra_cart") : null;
                    const cart = cartRaw ? JSON.parse(cartRaw) : [];
                    const existing = cart.find((i: any) => i.productId === product.id);
                    if (!existing || existing.quantity < 1) {
                      addItem({
                        productId: product.id,
                        title: product.title,
                        price: product.price,
                        image: previewImage,
                        weaverName: weaverProfile?.name || "Unknown Weaver",
                        stock: product.stock,
                      });
                    }
                  }}
                >
                  Buy Now <Zap className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
