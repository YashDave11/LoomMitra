import { ProductType } from "@prisma/client";

const FESTIVE_PATTERN = /festive|wedding|bridal/i;
const CASUAL_PATTERN = /daily|casual|everyday/i;

export function selectStyle(productType: ProductType, description: string | null): string {
  const desc = description || "";

  if (FESTIVE_PATTERN.test(desc)) {
    return "festive richly-lit studio, vibrant but tasteful styling";
  }

  if (CASUAL_PATTERN.test(desc)) {
    return "minimal clean studio, simple natural styling";
  }

  switch (productType) {
    case "MUFFLER":
      return "minimal modern studio, soft neutral lighting";
    case "SAREE":
      return "classic Indian studio portrait, warm neutral background, elegant traditional styling";
    default:
      return "classic Indian studio portrait, warm neutral background, elegant traditional styling";
  }
}
