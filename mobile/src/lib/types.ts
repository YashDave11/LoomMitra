// Shared domain types for LoomMitra.
// These mirror the Prisma models in /server/prisma/schema.prisma and are kept
// consistent with the backend copy in /server/src/types.ts.

export type Role = "WEAVER" | "BUSINESS" | "CUSTOMER";

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface WeaverProfile {
  id: string;
  userId: string;
  name: string;
  cluster: string;
  aadhaarNumber: string;
  handloomId: string;
  createdAt: string;
}

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  contactEmail: string;
  contactPhone: string;
  gstNumber?: string | null;
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  name: string;
  city?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  role: Role;
}

export type ProductType = "SAREE" | "MUFFLER" | "DUPATTA" | "STOLE" | "FABRIC" | "OTHER";
export type ProductStatus = "DRAFT" | "READY" | "ARCHIVED";
export type StockType = "ready_stock" | "made_to_order";
export type CatalogStatus = "NOT_STARTED" | "PROCESSING" | "DONE" | "FAILED";

export type BulkOrderStatus = 
  | "PENDING"
  | "WEAVER_RESPONDED"
  | "BARGAINING"
  | "ACCEPTED"
  | "REJECTED";

export interface BulkOrderRequest {
  id: string;
  productId: string;
  businessId: string;
  weaverId: string;
  quantity: number;
  quotedPrice: number | null;
  bargainPrice: number | null;
  finalPrice: number | null;
  status: BulkOrderStatus;
  createdAt: string;
  updatedAt: string;
  
  // Relations that we might include in API responses
  product?: Product;
  business?: User & { businessProfile?: BusinessProfile | null };
  weaver?: User & { weaverProfile?: WeaverProfile | null };
}

export type ShotKind =
  | "MODEL_FRONT"
  | "MODEL_SIDE"
  | "HANGER_DISPLAY"
  | "CLOSEUP_TEXTURE"
  | "CLOSEUP_BORDER";

export interface ShotDescriptor {
  kind: ShotKind;
  description: string;
  order: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  imageUrl?: string;
}

export interface MediaAsset {
  id: string;
  productId: string;
  url: string;
  publicId: string;
  type: string;
  createdAt: string;
}

// Fields below store stable CODES from lib/productOptions.ts (e.g. "chanderi",
// "cotton_silk"), never localized strings. Display components translate the
// code via optionLabel(). Legacy rows may hold free text — optionLabel falls
// back to rendering the raw value.
export interface Product {
  id: string;
  userId: string;

  // A) Identification
  title: string;
  description: string | null;
  type: ProductType;
  subcategory: string | null;
  location: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  designName: string | null;
  images: MediaAsset[];

  // B) Dimensions & material
  material: string | null;
  lengthMeters: number | null;
  widthMeters: number | null;
  weightGrams: number | null;

  // C) Pricing & stock
  basePrice: number | null;
  price: number;
  currency: string;
  stock: number;
  minOrderQuantity: number;
  isAvailable: boolean;

  // D) Production & lead time
  stockType: StockType;
  productionLeadTimeDays: number | null;
  maxOrderCapacity: number | null;

  // E) Quality & authenticity
  isHandloom: boolean;
  giTag: string | null;
  certificationDetails: string | null;
  careInstructions: string | null;

  // F) Target buyer / usage
  targetAudience: string | null;
  usageContext: string | null;

  // G) Metadata
  status: ProductStatus;
  catalogStatus: CatalogStatus;
  catalogPlan: ShotDescriptor[] | null;
  createdAt: string;
  updatedAt: string;
}

/** Weaver-submitted payload. Only the Step 1 fields are required. */
export interface ProductInput {
  title: string;
  type: ProductType;
  price: number;
  stock: number;
  location?: string;
  material?: string;
  lengthMeters?: number;

  description?: string;
  subcategory?: string;
  primaryColor?: string;
  secondaryColor?: string;
  designName?: string;
  widthMeters?: number;
  weightGrams?: number;
  basePrice?: number;
  currency?: string;
  minOrderQuantity?: number;
  isAvailable?: boolean;
  stockType?: StockType;
  productionLeadTimeDays?: number;
  maxOrderCapacity?: number;
  isHandloom?: boolean;
  giTag?: string;
  certificationDetails?: string;
  careInstructions?: string;
  targetAudience?: string;
  usageContext?: string;
}

export interface DiscoverFilters {
  locations: string[];
  designNames: string[];
  materials: string[];
  types: string[];
}

export interface DiscoverProduct extends Product {
  user: {
    weaverProfile: WeaverProfile | null;
  };
}

// ── Customer Orders ──

export type CustomerOrderStatus = "PLACED" | "READY" | "SHIPPED" | "DELIVERED";

export const CUSTOMER_ORDER_STATUS_FLOW: CustomerOrderStatus[] = [
  "PLACED",
  "READY",
  "SHIPPED",
  "DELIVERED",
];

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

export interface CustomerOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  product?: Product;
}

export interface CustomerOrder {
  id: string;
  customerId: string;
  weaverId: string;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  totalAmount: number;
  status: CustomerOrderStatus;
  createdAt: string;
  updatedAt: string;
  items: CustomerOrderItem[];

  // Relations that we might include in API responses
  weaver?: User & { weaverProfile?: WeaverProfile | null };
  customer?: User & { customerProfile?: CustomerProfile | null };
}

export interface CustomerOrderInput {
  items: { productId: string; quantity: number }[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

// ── Auction House ──

export type AuctionStatus = "DRAFT" | "UPCOMING" | "LIVE" | "ENDED" | "CANCELLED";
export type AuctionResult = "PENDING" | "WON" | "NO_SALE";

/** Bid as serialized by the API — bidder identity is masked. */
export interface AuctionBid {
  id: string;
  amount: number;
  currency: string;
  createdAt: string;
  isMine: boolean;
  bidderMask: string;
}

export interface Auction {
  id: string;
  productId: string;
  weaverId: string;
  basePrice: number;
  currency: string;
  startTime: string;
  endTime: string;
  status: AuctionStatus;
  minBidIncrement: number | null;
  buyNowPrice: number | null;
  reservedPrice: number | null;
  maxBidsPerUser: number | null;
  result: AuctionResult;
  winningBidId: string | null;
  winningBidderUserId: string | null;
  finalPrice: number | null;
  orderStatus: string | null; // placeholder reservation, e.g. "pending_payment"
  createdAt: string;
  updatedAt: string;

  highestBid: number | null;
  bidCount: number;
  bids: AuctionBid[];
  product: Product & { user?: { weaverProfile: WeaverProfile | null } };
}

export interface AuctionInput {
  productId: string;
  basePrice: number;
  startTime: string;
  endTime: string;
  minBidIncrement?: number;
  buyNowPrice?: number;
  reservedPrice?: number;
  maxBidsPerUser?: number;
}

// Route mapping helper shared across auth + profile pages.
export const ROLE_PROFILE_ROUTE: Record<Role, string> = {
  WEAVER: "/app/weaver/profile",
  BUSINESS: "/app/business/profile",
  CUSTOMER: "/app/customer/profile",
};

// Dashboard routes — the main landing page for each role after login.
export const ROLE_DASHBOARD_ROUTE: Record<Role, string> = {
  WEAVER: "/app/weaver/dashboard",
  BUSINESS: "/app/business/dashboard",
  CUSTOMER: "/app/customer/dashboard",
};
