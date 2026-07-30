// Typed API client for the LoomMitra backend.
// Automatically attaches the JWT `Authorization: Bearer <token>` header for
// protected calls, and surfaces backend error messages as thrown Errors.

import { getToken } from "./authStorage";
import type {
  Auction,
  AuctionInput,
  AuthResponse,
  BulkOrderRequest,
  BusinessProfile,
  CatalogStatus,
  CustomerOrder,
  CustomerOrderInput,
  CustomerOrderStatus,
  CustomerProfile,
  DiscoverFilters,
  DiscoverProduct,
  MediaAsset,
  Product,
  ProductInput,
  Role,
  ShotDescriptor,
  WeaverProfile,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : null) || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}

/** Upload files via multipart/form-data (no Content-Type header — browser sets boundary). */
async function uploadFiles<T>(path: string, files: File[], fieldName = "images"): Promise<T> {
  const formData = new FormData();
  for (const file of files) {
    formData.append(fieldName, file);
  }

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : null) || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}

export const apiClient = {
  // ── Auth ──
  register(email: string, password: string, role: Role): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: { email, password, role },
    });
  },

  login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  },

  // ── Weaver profile ──
  getWeaverProfile(): Promise<WeaverProfile | null> {
    return request<WeaverProfile | null>("/api/weaver/profile/me", { auth: true });
  },
  saveWeaverProfile(
    input: Pick<WeaverProfile, "name" | "cluster" | "aadhaarNumber" | "handloomId">
  ): Promise<WeaverProfile> {
    return request<WeaverProfile>("/api/weaver/profile", {
      method: "POST",
      body: input,
      auth: true,
    });
  },

  // ── Business profile ──
  getBusinessProfile(): Promise<BusinessProfile | null> {
    return request<BusinessProfile | null>("/api/business/profile/me", { auth: true });
  },
  saveBusinessProfile(
    input: Pick<
      BusinessProfile,
      "businessName" | "contactEmail" | "contactPhone" | "gstNumber"
    >
  ): Promise<BusinessProfile> {
    return request<BusinessProfile>("/api/business/profile", {
      method: "POST",
      body: input,
      auth: true,
    });
  },

  // ── Customer profile ──
  getCustomerProfile(): Promise<CustomerProfile | null> {
    return request<CustomerProfile | null>("/api/customer/profile/me", { auth: true });
  },
  saveCustomerProfile(
    input: Pick<CustomerProfile, "name" | "city">
  ): Promise<CustomerProfile> {
    return request<CustomerProfile>("/api/customer/profile", {
      method: "POST",
      body: input,
      auth: true,
    });
  },

  // ── Products ──
  getProducts(): Promise<Product[]> {
    return request<Product[]>("/api/products", { auth: true });
  },
  getProduct(id: string): Promise<Product> {
    return request<Product>(`/api/products/${id}`, { auth: true });
  },
  createProduct(input: ProductInput): Promise<Product> {
    return request<Product>("/api/products", {
      method: "POST",
      body: input,
      auth: true,
    });
  },
  updateProduct(id: string, input: Partial<ProductInput & { status: string }>): Promise<Product> {
    return request<Product>(`/api/products/${id}`, {
      method: "PUT",
      body: input,
      auth: true,
    });
  },
  deleteProduct(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/products/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
  uploadProductImages(productId: string, files: File[]): Promise<MediaAsset[]> {
    return uploadFiles<MediaAsset[]>(`/api/products/${productId}/raw-images`, files);
  },
  deleteProductImage(productId: string, imageId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/products/${productId}/images/${imageId}`, {
      method: "DELETE",
      auth: true,
    });
  },

  // ── Catalog ──
  generateCatalog(productId: string): Promise<{ catalogStatus: CatalogStatus }> {
    return request<{ catalogStatus: CatalogStatus }>(`/api/products/${productId}/generate-catalog`, {
      method: "POST",
      auth: true,
    });
  },
  getCatalogStatus(productId: string): Promise<{ catalogStatus: CatalogStatus; catalogPlan: ShotDescriptor[] | null }> {
    return request<{ catalogStatus: CatalogStatus; catalogPlan: ShotDescriptor[] | null }>(
      `/api/products/${productId}/catalog-status`,
      { auth: true }
    );
  },

  // ── Discover Marketplace ──
  getDiscoverFilters(): Promise<DiscoverFilters> {
    return request<DiscoverFilters>("/api/discover/filters", { auth: true });
  },
  getDiscoverProducts(filters?: Record<string, string>): Promise<DiscoverProduct[]> {
    const params = new URLSearchParams();
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value) params.append(key, value);
      }
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    return request<DiscoverProduct[]>(`/api/discover${query}`, { auth: true });
  },
  getDiscoverProduct(id: string): Promise<DiscoverProduct> {
    return request<DiscoverProduct>(`/api/discover/${id}`, { auth: true });
  },

  // ── Bulk Orders ──
  createBulkOrder(productId: string, quantity: number): Promise<BulkOrderRequest> {
    return request<BulkOrderRequest>("/api/orders/bulk", {
      method: "POST",
      body: { productId, quantity },
      auth: true,
    });
  },
  getBulkOrders(): Promise<BulkOrderRequest[]> {
    return request<BulkOrderRequest[]>("/api/orders/bulk", { auth: true });
  },
  respondToBulkOrder(id: string, action: "ACCEPT" | "REJECT", quotedPrice?: number): Promise<BulkOrderRequest> {
    return request<BulkOrderRequest>(`/api/orders/bulk/${id}/respond`, {
      method: "POST",
      body: { action, quotedPrice },
      auth: true,
    });
  },
  negotiateBulkOrder(id: string, action: "ACCEPT_QUOTE" | "BARGAIN" | "REJECT" | "ACCEPT_BARGAIN" | "REJECT_BARGAIN", bargainPrice?: number): Promise<BulkOrderRequest> {
    return request<BulkOrderRequest>(`/api/orders/bulk/${id}/negotiate`, {
      method: "POST",
      body: { action, bargainPrice },
      auth: true,
    });
  },

  // ── Customer Orders ──
  createCustomerOrder(input: CustomerOrderInput): Promise<CustomerOrder[]> {
    return request<CustomerOrder[]>("/api/orders/customer", {
      method: "POST",
      body: input,
      auth: true,
    });
  },
  getCustomerOrders(): Promise<CustomerOrder[]> {
    return request<CustomerOrder[]>("/api/orders/customer", { auth: true });
  },
  updateCustomerOrderStatus(id: string, status: CustomerOrderStatus): Promise<CustomerOrder> {
    return request<CustomerOrder>(`/api/orders/customer/${id}/status`, {
      method: "PATCH",
      body: { status },
      auth: true,
    });
  },

  // ── Auction House ──
  createAuction(input: AuctionInput): Promise<Auction> {
    return request<Auction>("/api/auctions", { method: "POST", body: input, auth: true });
  },
  getAuctions(mine = false): Promise<Auction[]> {
    return request<Auction[]>(`/api/auctions${mine ? "?mine=1" : ""}`, { auth: true });
  },
  getAuction(id: string): Promise<Auction> {
    return request<Auction>(`/api/auctions/${id}`, { auth: true });
  },
  placeBid(auctionId: string, amount: number): Promise<Auction> {
    return request<Auction>(`/api/auctions/${auctionId}/bids`, {
      method: "POST",
      body: { amount },
      auth: true,
    });
  },
  cancelAuction(id: string): Promise<Auction> {
    return request<Auction>(`/api/auctions/${id}/cancel`, { method: "POST", auth: true });
  },

  // ── Health ──
  health(): Promise<{ status: string }> {
    return request<{ status: string }>("/api/health");
  },
};
