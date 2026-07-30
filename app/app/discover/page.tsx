"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import type { DiscoverProduct, DiscoverFilters } from "@/lib/types";
import { optionLabel } from "@/lib/productOptions";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Sparkles, Filter, SlidersHorizontal, X, ShoppingBag, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";

/** Priority order for product card preview image:
 *  1. First catalog image (type starts with "CATALOG_")
 *  2. First raw image
 *  3. Placeholder
 */
function getPreviewImage(product: DiscoverProduct): string {
  if (product.images?.length) {
    const catalog = product.images.find((img) => img.type.startsWith("CATALOG_"));
    if (catalog) return catalog.url;
  }
  // Fall back to raw uploads via the discover API's images
  const any = product.images?.[0]?.url;
  if (any) return any;
  // Final fallback — catalog output on local backend
  if (product.catalogStatus === "DONE") {
    return "http://localhost:4000/CatalogOutput/shot_0.jpg";
  }
  return "/placeholder.svg";
}

export default function DiscoverPage() {
  const { isAuthenticated, loading: authLoading, role } = useAuth();
  const { addItem } = useCart();
  const { t } = useTranslation("product");

  const [products, setProducts] = useState<DiscoverProduct[]>([]);
  const [filterOptions, setFilterOptions] = useState<DiscoverFilters>({
    locations: [],
    designNames: [],
    materials: [],
    types: [],
  });

  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedDesign, setSelectedDesign] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    apiClient.getDiscoverFilters().then(setFilterOptions).catch(console.error);
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getDiscoverProducts({
        search,
        location: selectedLocation,
        type: selectedType,
        designName: selectedDesign,
        material: selectedMaterial,
      });
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    const timer = setTimeout(() => fetchProducts(), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedLocation, selectedType, selectedDesign, selectedMaterial]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="dashed" className="mb-2">Marketplace</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight">Discover Authentic Handloom</h1>
          <p className="mt-2 max-w-2xl text-lg text-neutral-600">
            Source directly from verified weavers across India. Explore unique weaves, distinct designs, and rich heritage.
          </p>
        </div>
      </div>

      {/* Filter Toggle Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="gap-2"
        >
          {filtersOpen ? (
            <>
              <X className="h-4 w-4" />
              Hide Filters
            </>
          ) : (
            <>
              <SlidersHorizontal className="h-4 w-4" />
              Show Filters
            </>
          )}
        </Button>
      </div>

      <div className={`grid grid-cols-1 gap-8 ${filtersOpen ? "lg:grid-cols-4" : "lg:grid-cols-1"}`}>
        {/* Sidebar Filters */}
        {filtersOpen && (
          <div className="space-y-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm lg:col-span-1">
            <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <h2 className="text-lg font-bold">Filters</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiltersOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Search sarees, motifs..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Category</label>
              <select
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">All Categories</option>
                {filterOptions.types.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Cluster / Location</label>
              <select
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                {filterOptions.locations.map((l) => (
                  <option key={l} value={l}>{optionLabel(t, "cluster", l)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Design / Motif</label>
              <select
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2"
                value={selectedDesign}
                onChange={(e) => setSelectedDesign(e.target.value)}
              >
                <option value="">All Designs</option>
                {filterOptions.designNames.map((d) => (
                  <option key={d} value={d}>{optionLabel(t, "pattern", d)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Material</label>
              <select
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2"
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
              >
                <option value="">All Materials</option>
                {filterOptions.materials.map((m) => (
                  <option key={m} value={m}>{optionLabel(t, "material", m)}</option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSearch("");
                setSelectedLocation("");
                setSelectedType("");
                setSelectedDesign("");
                setSelectedMaterial("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Product Grid */}
        <div className={filtersOpen ? "lg:col-span-3" : "lg:col-span-1"}>
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-neutral-300" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center">
              <Sparkles className="mb-4 h-12 w-12 text-neutral-300" />
              <h3 className="text-xl font-bold">No products found</h3>
              <p className="mt-2 text-neutral-500">
                Try adjusting your filters to find what you&apos;re looking for.
              </p>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setSelectedLocation("");
                  setSelectedType("");
                  setSelectedDesign("");
                  setSelectedMaterial("");
                }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => {
                const previewImage = getPreviewImage(product);
                const weaverName = product.user?.weaverProfile?.name || "Unknown Weaver";
                const cluster = product.user?.weaverProfile?.cluster || "Unknown Cluster";

                return (
                  <Card key={product.id} className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-neutral-200/50 border-neutral-200/60 flex flex-col">
                    <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewImage}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {product.type && (
                        <div className="absolute left-3 top-3">
                          <Badge className="bg-white/90 text-black backdrop-blur-sm hover:bg-white border-none shadow-sm">
                            {product.type}
                          </Badge>
                        </div>
                      )}
                      {/* Catalog badge when catalog images are available */}
                      {product.images?.some((img) => img.type.startsWith("CATALOG_")) && (
                        <div className="absolute right-3 top-3">
                          <Badge className="bg-black/80 text-white backdrop-blur-sm border-none text-[10px]">
                            Catalog
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardHeader className="p-4 pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-1 text-lg font-bold group-hover:text-blue-600 transition-colors">
                          {product.title}
                        </CardTitle>
                        <span className="shrink-0 font-bold text-neutral-900">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="line-clamp-1">
                          {optionLabel(t, "cluster", product.location || cluster)}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 pt-3 grow">
                      <div className="flex flex-wrap gap-2">
                        {product.material && (
                          <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                            {optionLabel(t, "material", product.material)}
                          </span>
                        )}
                        {product.designName && (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                            {optionLabel(t, "pattern", product.designName)}
                          </span>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="border-t border-neutral-100 p-4 mt-auto">
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
                            {weaverName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-neutral-700">{weaverName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {role === "CUSTOMER" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full px-3"
                              onClick={() =>
                                addItem({
                                  productId: product.id,
                                  title: product.title,
                                  price: product.price,
                                  image: previewImage,
                                  weaverName,
                                  stock: product.stock,
                                })
                              }
                            >
                              <ShoppingBag className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" asChild className="opacity-0 transition-opacity group-hover:opacity-100 bg-neutral-900 text-white hover:bg-neutral-800 rounded-full px-4">
                            <Link href={`/app/product/${product.id}`}>
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
