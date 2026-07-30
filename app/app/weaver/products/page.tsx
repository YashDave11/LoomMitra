"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useRequireRole } from "@/lib/useRequireRole";
import { apiClient } from "@/lib/apiClient";
import type { Product } from "@/lib/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Plus, Pencil, Trash2, ImageIcon } from "lucide-react";

export default function WeaverProductsPage() {
  const { ready } = useRequireRole("WEAVER");
  const router = useRouter();
  const { t } = useTranslation(["weaver", "common"]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    apiClient
      .getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [ready]);

  async function handleDelete(id: string) {
    if (!confirm(t("products.deleteConfirm"))) return;
    setDeleting(id);
    try {
      await apiClient.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : t("products.deleteFailed"));
    } finally {
      setDeleting(null);
    }
  }

  if (!ready) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2">
            <Badge variant="dashed">{t("products.badge")}</Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t("products.title")}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {t("products.subtitle")}
          </p>
        </div>
        <Button asChild>
          <Link href="/app/weaver/products/new">
            <Plus className="h-4 w-4" />
            {t("products.addProduct")}
          </Link>
        </Button>
      </div>

      <Separator className="my-8" />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-sm text-neutral-500">{t("products.loading")}</div>
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="sketch-box-alt mb-4 flex h-16 w-16 items-center justify-center border-2 border-black">
              <Package className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold">{t("products.emptyTitle")}</h3>
            <p className="mt-1 text-sm text-neutral-500">
              {t("products.emptyDesc")}
            </p>
            <Button className="mt-6" asChild>
              <Link href="/app/weaver/products/new">
                <Plus className="h-4 w-4" />
                {t("products.addFirst")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col">
              {/* Thumbnail preview */}
              <div className="relative aspect-[4/3] w-full overflow-hidden border-b-2 border-black bg-neutral-50">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[0].url}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon
                      className="h-10 w-10 text-neutral-300"
                      strokeWidth={1.5}
                    />
                  </div>
                )}
                <div className="absolute right-2 top-2">
                  <Badge
                    variant={product.status === "READY" ? "default" : "dashed"}
                    className="text-xs"
                  >
                    {product.status === "READY"
                      ? t("products.readyForCatalog")
                      : t("products.draft")}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{product.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <span>{t(`common:productTypes.${product.type}`)}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <ImageIcon className="h-3.5 w-3.5" />
                    {product.images.length}/5
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 pb-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-neutral-500">
                    {t("products.stock", { count: product.stock })}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    router.push(`/app/weaver/products/${product.id}`)
                  }
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t("products.edit")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deleting === product.id}
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
