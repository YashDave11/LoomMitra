// Shared domain types for LoomMitra.
// These mirror the Prisma models in /server/prisma/schema.prisma and are kept
// consistent with the frontend copy in /lib/types.ts.

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
