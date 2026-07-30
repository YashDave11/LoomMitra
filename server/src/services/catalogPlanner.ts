import { ProductType } from "@prisma/client";

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

const SAREE_PLAN: Omit<ShotDescriptor, "status">[] = [
  { kind: "MODEL_FRONT", description: "Model wearing saree, front view", order: 1 },
  { kind: "MODEL_SIDE", description: "Model wearing saree, side view showing pallu drape", order: 2 },
  { kind: "HANGER_DISPLAY", description: "Saree displayed on hanger, full length", order: 3 },
  { kind: "CLOSEUP_TEXTURE", description: "Close-up of fabric texture and weave pattern", order: 4 },
  { kind: "CLOSEUP_BORDER", description: "Close-up of border design and craftsmanship", order: 5 },
];

const MUFFLER_PLAN: Omit<ShotDescriptor, "status">[] = [
  { kind: "MODEL_FRONT", description: "Model wearing muffler, front view", order: 1 },
  { kind: "MODEL_SIDE", description: "Model wearing muffler, side view showing length and drape around neck", order: 2 },
  { kind: "HANGER_DISPLAY", description: "Muffler displayed on hanger, full length", order: 3 },
  { kind: "CLOSEUP_TEXTURE", description: "Close-up of fabric texture and weave pattern", order: 4 },
  { kind: "CLOSEUP_BORDER", description: "Close-up of fringe and edge detail", order: 5 },
];

const OTHER_PLAN: Omit<ShotDescriptor, "status">[] = [
  { kind: "MODEL_FRONT", description: "Model with product, front view", order: 1 },
  { kind: "MODEL_SIDE", description: "Model with product, side view showing drape", order: 2 },
  { kind: "HANGER_DISPLAY", description: "Product displayed on hanger, full view", order: 3 },
  { kind: "CLOSEUP_TEXTURE", description: "Close-up of fabric texture and weave pattern", order: 4 },
  { kind: "CLOSEUP_BORDER", description: "Close-up of border and edge detail", order: 5 },
];

export function planCatalog(productType: ProductType): ShotDescriptor[] {
  let base: Omit<ShotDescriptor, "status">[];

  switch (productType) {
    case "SAREE":
      base = SAREE_PLAN;
      break;
    case "MUFFLER":
      base = MUFFLER_PLAN;
      break;
    default:
      base = OTHER_PLAN;
      break;
  }

  return base.map((shot) => ({ ...shot, status: "PENDING" as const }));
}

export const SHOT_KIND_TO_MEDIA_TYPE: Record<ShotKind, string> = {
  MODEL_FRONT: "CATALOG_MODEL_FRONT",
  MODEL_SIDE: "CATALOG_MODEL_SIDE",
  HANGER_DISPLAY: "CATALOG_HANGER",
  CLOSEUP_TEXTURE: "CATALOG_CLOSEUP_TEXTURE",
  CLOSEUP_BORDER: "CATALOG_CLOSEUP_BORDER",
};
