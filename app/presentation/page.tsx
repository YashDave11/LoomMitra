import type { Metadata } from "next";

import PresentationDeck from "@/components/presentation/PresentationDeck";

export const metadata: Metadata = {
  title: "LoomMitra — Pitch Deck",
  description:
    "LoomMitra pitch deck: trust & markets for Indian handloom — digital product passports connecting weavers, buyers, and cooperatives.",
};

export default function PresentationPage() {
  return <PresentationDeck />;
}
