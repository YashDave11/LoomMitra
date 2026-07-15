/**
 * All prototype data lives here — typed, hardcoded, no backend.
 */

export interface Cluster {
  name: string;
  state: string;
  description: string;
}

export interface Cooperative {
  id: string;
  name: string;
  village: string;
  district: string;
  state: string;
  contactName: string;
  contactPhone: string;
}

export interface Weaver {
  id: string;
  name: string;
  phone: string;
  village: string;
  isVerified: boolean;
  cooperativeId: string;
  specialty: string;
  yearsOfExperience: number;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  fabricType: string;
  pattern: string;
  loomType: string;
  price: number;
  quantity: number;
  weaverId: string;
  story: string;
}

export type EventType = "CREATED" | "QC_PASSED" | "LISTED";

export interface ProductEvent {
  id: string;
  productId: string;
  eventType: EventType;
  timestamp: string;
  actorName: string;
  hashPreview: string;
}

export interface BulkOrder {
  id: string;
  buyerName: string;
  buyerType: "Boutique" | "Export House" | "Retail Chain";
  productCategory: string;
  quantity: number;
  status: "New" | "In Discussion" | "Confirmed";
  notes: string;
}

export const cluster: Cluster = {
  name: "Chanderi Handloom Cluster",
  state: "Madhya Pradesh",
  description:
    "Chanderi weavers craft famously lightweight sarees from fine silk and cotton blends, a tradition dating back centuries. The sheer, glossy texture and delicate zari borders make Chanderi one of India's most recognizable handloom identities.",
};

export const cooperative: Cooperative = {
  id: "coop-chanderi-01",
  name: "Chanderi Weavers Cooperative Society",
  village: "Chanderi",
  district: "Ashoknagar",
  state: "Madhya Pradesh",
  contactName: "Ramesh Koli",
  contactPhone: "+91 94251 10203",
};

export const weavers: Weaver[] = [
  {
    id: "w-001",
    name: "Meena Devi",
    phone: "+91 98260 41122",
    village: "Chanderi",
    isVerified: true,
    cooperativeId: "coop-chanderi-01",
    specialty: "Chanderi silk-cotton sarees",
    yearsOfExperience: 12,
  },
  {
    id: "w-002",
    name: "Rakesh Verma",
    phone: "+91 97525 88301",
    village: "Pranpur",
    isVerified: true,
    cooperativeId: "coop-chanderi-01",
    specialty: "Zari border motifs",
    yearsOfExperience: 9,
  },
  {
    id: "w-003",
    name: "Sita Bai",
    phone: "+91 88893 20417",
    village: "Chanderi",
    isVerified: false,
    cooperativeId: "coop-chanderi-01",
    specialty: "Lightweight cotton sarees",
    yearsOfExperience: 17,
  },
  {
    id: "w-004",
    name: "Abdul Rashid",
    phone: "+91 90099 73255",
    village: "Bamhori",
    isVerified: true,
    cooperativeId: "coop-chanderi-01",
    specialty: "Butti (motif) weaving",
    yearsOfExperience: 21,
  },
];

export const products: Product[] = [
  {
    id: "chanderi-001",
    title: "Lightweight Chanderi Silk-Cotton Saree",
    category: "Saree",
    fabricType: "Silk × Cotton (Sico)",
    pattern: "Gold zari border, ashrafi butti",
    loomType: "Pit loom",
    price: 4800,
    quantity: 3,
    weaverId: "w-001",
    story:
      "This Chanderi saree is woven on a pit loom that has been in Meena Devi's family for two generations. The warp is fine silk and the weft is unbleached cotton, giving the fabric its signature featherweight drape. The ashrafi (coin) buttis are woven in by hand, one motif at a time — around nine days of work from warp to finish.",
  },
  {
    id: "chanderi-002",
    title: "Chanderi Cotton Saree with Temple Border",
    category: "Saree",
    fabricType: "Pure cotton",
    pattern: "Temple border, plain body",
    loomType: "Pit loom",
    price: 2650,
    quantity: 5,
    weaverId: "w-003",
    story:
      "A breathable everyday Chanderi cotton saree by Sita Bai, woven with a traditional temple border. The plain body keeps it light for summer wear while the border carries the cluster's classic geometry.",
  },
  {
    id: "chanderi-003",
    title: "Zari Border Chanderi Dupatta",
    category: "Dupatta",
    fabricType: "Silk × Cotton (Sico)",
    pattern: "Fine zari border, sheer body",
    loomType: "Frame loom",
    price: 1900,
    quantity: 8,
    weaverId: "w-002",
    story:
      "Rakesh Verma specializes in border work — this dupatta's zari edge takes three days of careful shuttle passes. The sheer Chanderi body catches light the way only a handloom weave can.",
  },
  {
    id: "chanderi-004",
    title: "Butti-Work Chanderi Stole",
    category: "Stole",
    fabricType: "Silk × Cotton (Sico)",
    pattern: "Scattered floral butti",
    loomType: "Pit loom",
    price: 1450,
    quantity: 6,
    weaverId: "w-004",
    story:
      "Abdul Rashid has woven buttis for over two decades. Each floral motif on this stole is inlaid by hand using a separate needle-like tool called a kaandi — no two pieces come out identical.",
  },
];

export const events: ProductEvent[] = [
  {
    id: "ev-001",
    productId: "chanderi-001",
    eventType: "CREATED",
    timestamp: "2026-06-02T10:15:00+05:30",
    actorName: "Meena Devi (Weaver)",
    hashPreview: "9fa3b7c04d…c1",
  },
  {
    id: "ev-002",
    productId: "chanderi-001",
    eventType: "QC_PASSED",
    timestamp: "2026-06-05T14:40:00+05:30",
    actorName: "Chanderi Weavers Cooperative (QC)",
    hashPreview: "4e21d98a7f…8b",
  },
  {
    id: "ev-003",
    productId: "chanderi-001",
    eventType: "LISTED",
    timestamp: "2026-06-06T09:05:00+05:30",
    actorName: "Chanderi Weavers Cooperative",
    hashPreview: "c7f50e13a2…d4",
  },
];

export const bulkOrders: BulkOrder[] = [
  {
    id: "bo-001",
    buyerName: "Taana Baana Boutique, Delhi",
    buyerType: "Boutique",
    productCategory: "Chanderi silk-cotton sarees",
    quantity: 25,
    status: "In Discussion",
    notes: "Wants zari border sarees for festive season; asking for weaver stories on tags.",
  },
  {
    id: "bo-002",
    buyerName: "Meridian Exports GmbH",
    buyerType: "Export House",
    productCategory: "Chanderi dupattas & stoles",
    quantity: 40,
    status: "New",
    notes: "EU order — requires GI/authenticity documentation. QR passports fit the compliance ask.",
  },
  {
    id: "bo-003",
    buyerName: "Weft & Warp Retail, Mumbai",
    buyerType: "Retail Chain",
    productCategory: "Cotton sarees",
    quantity: 30,
    status: "Confirmed",
    notes: "Repeat buyer. Requested QC_PASSED events visible on every product page.",
  },
];

/* ---------- helpers used across screens ---------- */

export function weaverById(id: string): Weaver | undefined {
  return weavers.find((w) => w.id === id);
}

export function productCountByWeaver(weaverId: string): number {
  return products.filter((p) => p.weaverId === weaverId).length;
}

export function eventsForProduct(productId: string): ProductEvent[] {
  return events.filter((e) => e.productId === productId);
}

export function totalInventoryValue(): number {
  return products.reduce((sum, p) => sum + p.price * p.quantity, 0);
}

export function totalQuantity(): number {
  return products.reduce((sum, p) => sum + p.quantity, 0);
}

export function formatINR(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
