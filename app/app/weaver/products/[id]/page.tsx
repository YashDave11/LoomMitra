"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useRequireRole } from "@/lib/useRequireRole";
import { apiClient, ApiError } from "@/lib/apiClient";
import type { Product, ProductType, MediaAsset, CatalogStatus, ShotDescriptor } from "@/lib/types";
import { CRAFT_CLUSTERS, FABRIC_MATERIALS, PATTERNS } from "@/lib/productOptions";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Loader2,
  Upload,
  X,
  ImageIcon,
  Camera,
  Check,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { ProductQRCard } from "@/components/product/ProductQRCard";

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: "SAREE", label: "Saree" },
  { value: "MUFFLER", label: "Muffler" },
  { value: "DUPATTA", label: "Dupatta" },
  { value: "STOLE", label: "Stole" },
  { value: "FABRIC", label: "Fabric (by the meter)" },
  { value: "OTHER", label: "Other" },
];

const MAX_IMAGES = 5;

export default function EditProductPage() {
  const { ready } = useRequireRole("WEAVER");
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation(["product", "common"]);

  // Product state
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ProductType>("SAREE");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [location, setLocation] = useState("");
  const [designName, setDesignName] = useState("");
  const [material, setMaterial] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Image state
  const [images, setImages] = useState<MediaAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Catalog state
  const [catalogStatus, setCatalogStatus] = useState<CatalogStatus>("NOT_STARTED");
  const [catalogPlan, setCatalogPlan] = useState<ShotDescriptor[] | null>(null);
  const [catalogTriggering, setCatalogTriggering] = useState(false);

  useEffect(() => {
    if (!ready || !productId) return;
    apiClient
      .getProduct(productId)
      .then((p) => {
        setProduct(p);
        setTitle(p.title);
        setType(p.type);
        setDescription(p.description || "");
        setPrice(String(p.price));
        setStock(String(p.stock));
        setLocation(p.location || "");
        setDesignName(p.designName || "");
        setMaterial(p.material || "");
        setImages(p.images);
        setCatalogStatus(p.catalogStatus);
        setCatalogPlan(p.catalogPlan);
      })
      .catch(() => {
        router.push("/app/weaver/products");
      })
      .finally(() => setLoading(false));
  }, [ready, productId, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title.trim()) {
      setError("Product title is required.");
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      setError("Enter a valid price.");
      return;
    }

    setSaving(true);
    try {
      const updated = await apiClient.updateProduct(productId, {
        title: title.trim(),
        type,
        description: description.trim() || undefined,
        price: parseFloat(price),
        stock: parseInt(stock, 10) || 1,
        location: location.trim() || undefined,
        designName: designName.trim() || undefined,
        material: material.trim() || undefined,
      });
      setProduct(updated);
      setImages(updated.images);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to update product"
      );
    } finally {
      setSaving(false);
    }
  }

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const imageFiles = fileArray.filter((f) => f.type.startsWith("image/"));

      if (imageFiles.length === 0) {
        setUploadError("Please select image files only.");
        return;
      }

      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) {
        setUploadError("Maximum 5 images reached. Delete some to upload new ones.");
        return;
      }
      if (imageFiles.length > remaining) {
        setUploadError(
          `Can only upload ${remaining} more image(s). You selected ${imageFiles.length}.`
        );
        return;
      }

      setUploading(true);
      setUploadError(null);
      try {
        const newAssets = await apiClient.uploadProductImages(
          productId,
          imageFiles
        );
        setImages((prev) => [...prev, ...newAssets]);
        // Refresh product to get updated status
        const refreshed = await apiClient.getProduct(productId);
        setProduct(refreshed);
      } catch (err) {
        setUploadError(
          err instanceof ApiError ? err.message : "Upload failed"
        );
      } finally {
        setUploading(false);
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [images.length, productId]
  );

  async function handleDeleteImage(imageId: string) {
    setDeletingImage(imageId);
    try {
      await apiClient.deleteProductImage(productId, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      // Refresh product to get updated status
      const refreshed = await apiClient.getProduct(productId);
      setProduct(refreshed);
    } catch (err) {
      setUploadError(
        err instanceof ApiError ? err.message : "Failed to delete image"
      );
    } finally {
      setDeletingImage(null);
    }
  }

  // Drag-and-drop handlers
  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  // Poll catalog status while PROCESSING
  useEffect(() => {
    if (catalogStatus !== "PROCESSING" || !productId) return;

    const interval = setInterval(async () => {
      try {
        const data = await apiClient.getCatalogStatus(productId);
        setCatalogStatus(data.catalogStatus);
        setCatalogPlan(data.catalogPlan);
      } catch {
        // silently retry on next tick
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [catalogStatus, productId]);

  async function handleGenerateCatalog() {
    setCatalogTriggering(true);
    try {
      await apiClient.generateCatalog(productId);
      setCatalogStatus("PROCESSING");
      setCatalogPlan(null);
      // Fetch initial plan state
      const data = await apiClient.getCatalogStatus(productId);
      setCatalogPlan(data.catalogPlan);
    } catch (err) {
      setUploadError(
        err instanceof ApiError ? err.message : "Failed to start catalog generation"
      );
    } finally {
      setCatalogTriggering(false);
    }
  }

  if (!ready || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-neutral-500">Loading...</div>
      </div>
    );
  }

  if (!product) return null;

  const imageCount = images.length;
  const remaining = MAX_IMAGES - imageCount;

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => router.push("/app/weaver/products")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Button>

      <div className="mb-2 flex items-center gap-2">
        <Badge variant="dashed">Edit Product</Badge>
        <Badge
          variant={product.status === "READY" ? "default" : "dashed"}
          className="text-xs"
        >
          {product.status === "READY" ? "Ready for catalog" : "Draft"}
        </Badge>
      </div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Edit Product
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Update details and manage photos for this product.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/app/weaver/auctions/new?productId=${product.id}`)}
        >
          {t("auction:form.title")}
        </Button>
      </div>

      <Separator className="my-8" />

      <div className="mx-auto max-w-2xl space-y-8">
        {/* ── Product Details ── */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Update the information about your handloom product.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Chanderi Silk Saree – Gold Border"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Product Type *</Label>
                <Select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as ProductType)}
                >
                  {PRODUCT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description{" "}
                  <span className="font-normal text-neutral-500">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the weave, pattern, material, or story behind this product..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Cluster */}
              <div className="space-y-2">
                <Label htmlFor="location">{t("product:form.cluster.label")}</Label>
                <Select
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="">{t("product:form.select")}</option>
                  {CRAFT_CLUSTERS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Pattern */}
              <div className="space-y-2">
                <Label htmlFor="designName">{t("product:form.pattern.label")}</Label>
                <Select
                  id="designName"
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                >
                  <option value="">{t("product:form.select")}</option>
                  {PATTERNS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Fabric */}
              <div className="space-y-2">
                <Label htmlFor="material">{t("product:form.material.label")}</Label>
                <Select
                  id="material"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                >
                  <option value="">{t("product:form.select")}</option>
                  {FABRIC_MATERIALS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Price + Stock row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="e.g., 2500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="1"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="sketch-box-alt border-2 border-black bg-neutral-50 p-3 text-sm text-black">
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-sm font-medium text-black">
                  <Check className="h-4 w-4" />
                  Product updated successfully.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ── Raw Product Photos ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="sketch-box-alt flex h-10 w-10 items-center justify-center border-2 border-black">
                <Camera className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <CardTitle>Raw Product Photos</CardTitle>
                <CardDescription>
                  Upload up to {MAX_IMAGES} photos. These will be used for catalog
                  generation.
                </CardDescription>
              </div>
              <Badge variant={imageCount >= 3 ? "default" : "dashed"}>
                {imageCount} / {MAX_IMAGES}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress hint */}
            {imageCount < 3 && (
              <div className="sketch-box-alt border-2 border-dashed border-neutral-400 bg-neutral-50 p-3 text-sm text-neutral-600">
                Upload at least <strong>3 photos</strong> to mark this product
                as &quot;Ready for catalog&quot;. Tip: include front, back, and
                a detail/close-up shot.
              </div>
            )}

            {/* Thumbnail grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square overflow-hidden border-2 border-black bg-neutral-50"
                    style={{ borderRadius: "4px 12px 4px 12px" }}
                  >
                    <img
                      src={img.url}
                      alt="Product photo"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      disabled={deletingImage === img.id}
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-black bg-white text-black opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
                      title="Delete image"
                    >
                      {deletingImage === img.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload zone */}
            {remaining > 0 && (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-8 transition-colors ${
                  dragActive
                    ? "border-black bg-neutral-100"
                    : "border-neutral-300 bg-white hover:border-black hover:bg-neutral-50"
                }`}
                style={{ borderRadius: "12px 4px 12px 4px" }}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-black" />
                    <p className="text-sm font-medium">Uploading...</p>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-neutral-400">
                      <Upload className="h-5 w-5 text-neutral-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        {dragActive
                          ? "Drop images here"
                          : "Drag & drop images here"}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        or click to browse · {remaining} slot
                        {remaining !== 1 ? "s" : ""} remaining · JPG, PNG, WebP
                      </p>
                    </div>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleFiles(e.target.files);
                  }}
                  disabled={uploading}
                />
              </div>
            )}

            {/* All slots filled */}
            {remaining <= 0 && (
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <ImageIcon className="h-4 w-4" />
                All {MAX_IMAGES} image slots filled. Delete an image to upload a
                new one.
              </div>
            )}

            {uploadError && (
              <div className="sketch-box-alt border-2 border-black bg-neutral-50 p-3 text-sm text-black">
                {uploadError}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Catalog Images ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="sketch-box-alt flex h-10 w-10 items-center justify-center border-2 border-black">
                <Sparkles className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <CardTitle>Catalog Images</CardTitle>
                <CardDescription>
                  {catalogStatus === "NOT_STARTED"
                    ? "We'll automatically generate 5 professional catalog photos from your uploaded images."
                    : catalogStatus === "PROCESSING"
                    ? "Generating your catalog photos..."
                    : catalogStatus === "DONE"
                    ? "Your catalog photos are ready."
                    : "Some catalog shots could not be generated."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Idle state */}
            {catalogStatus === "NOT_STARTED" && (
              <div className="flex flex-col items-center gap-4 py-4">
                <Button
                  onClick={handleGenerateCatalog}
                  disabled={catalogTriggering || images.filter((i) => i.type === "RAW").length === 0}
                  title={
                    images.filter((i) => i.type === "RAW").length === 0
                      ? "Upload at least one raw product image first"
                      : undefined
                  }
                >
                  {catalogTriggering ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {catalogTriggering ? "Starting..." : "Generate Catalog"}
                </Button>
                {images.filter((i) => i.type === "RAW").length === 0 && (
                  <p className="text-xs text-neutral-500">
                    Upload at least one raw product image first.
                  </p>
                )}
              </div>
            )}

            {/* Generating / Done / Failed — shot list */}
            {catalogStatus !== "NOT_STARTED" && catalogPlan && (
              <>
                {catalogStatus === "PROCESSING" && (
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating catalog:{" "}
                    {catalogPlan.filter((s) => s.status !== "PENDING").length}/5 complete
                  </div>
                )}

                <div className="space-y-2">
                  {catalogPlan.map((shot) => (
                    <div
                      key={shot.kind}
                      className="flex items-center gap-3 border-2 border-dashed border-neutral-200 p-3"
                      style={{ borderRadius: "4px 12px 4px 12px" }}
                    >
                      {/* Status icon */}
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
                        {shot.status === "PENDING" && (
                          <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                        )}
                        {shot.status === "SUCCESS" && (
                          <CheckCircle2 className="h-5 w-5 text-black" />
                        )}
                        {shot.status === "FAILED" && (
                          <XCircle className="h-5 w-5 text-neutral-500" />
                        )}
                      </div>

                      {/* Thumbnail (success only) */}
                      {shot.status === "SUCCESS" && shot.imageUrl && (
                        <div
                          className="h-10 w-10 flex-shrink-0 overflow-hidden border border-neutral-300"
                          style={{ borderRadius: "2px 6px 2px 6px" }}
                        >
                          <img
                            src={shot.imageUrl}
                            alt={shot.description}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {shot.order}/5 – {shot.description}
                        </p>
                      </div>

                      {/* Status badge */}
                      <Badge
                        variant={shot.status === "SUCCESS" ? "default" : "dashed"}
                        className="flex-shrink-0 text-xs"
                      >
                        {shot.status === "PENDING"
                          ? "Waiting…"
                          : shot.status === "SUCCESS"
                          ? "Done"
                          : "Failed"}
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Gallery grid for completed shots */}
                {(catalogStatus === "DONE" || catalogStatus === "FAILED") && (
                  <>
                    {catalogPlan.filter((s) => s.status === "SUCCESS").length > 0 && (
                      <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
                        {catalogPlan
                          .filter((s) => s.status === "SUCCESS" && s.imageUrl)
                          .map((shot) => (
                            <div key={shot.kind} className="space-y-1">
                              <div
                                className="aspect-[3/4] overflow-hidden border-2 border-black bg-neutral-50"
                                style={{ borderRadius: "4px 12px 4px 12px" }}
                              >
                                <img
                                  src={shot.imageUrl}
                                  alt={shot.description}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <p className="text-xs text-neutral-600 truncate">
                                {shot.description}
                              </p>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Failed shot notes */}
                    {catalogPlan.filter((s) => s.status === "FAILED").length > 0 && (
                      <div className="space-y-1 pt-1">
                        {catalogPlan
                          .filter((s) => s.status === "FAILED")
                          .map((shot) => (
                            <p key={shot.kind} className="text-xs text-neutral-500">
                              {shot.description} – failed to generate
                            </p>
                          ))}
                      </div>
                    )}

                    {/* Regenerate button */}
                    <div className="pt-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4" />
                            Regenerate Catalog
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Regenerate catalog?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will replace all existing catalog images with new
                              ones. The generation process will start from scratch.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleGenerateCatalog}>
                              Regenerate
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Authentic QR Code ── */}
        <ProductQRCard product={product} />
      </div>
    </div>
  );
}
