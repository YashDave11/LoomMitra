"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Download } from "lucide-react";
import type { Product } from "@/lib/types";

/**
 * Renders a per-product authentic QR code card. The QR encodes a URL that
 * points to the public verification page for this product, so anyone who
 * receives the physical item can scan it to confirm they got the correct
 * product with full provenance details.
 */
export function ProductQRCard({ product }: { product: Product }) {
  // Build a public verification URL. In production this would be the public
  // domain; here we use the current origin so it resolves in any environment.
  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/app/verify?p=${product.id}`
      : `/app/verify?p=${product.id}`;

  function handleDownload() {
    const svg = document.getElementById(`qr-${product.id}`);
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loommitra-qr-${product.id}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="border-neutral-200 shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50">
            <QrCode className="h-5 w-5 text-neutral-700" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">Authentic QR Code</CardTitle>
            <p className="text-xs text-neutral-500 mt-0.5">
              Scan to verify this product on delivery
            </p>
          </div>
          <Badge variant="dashed" className="text-xs">Unique</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-lg border-2 border-black bg-white p-4">
            <QRCodeSVG
              id={`qr-${product.id}`}
              value={verifyUrl}
              size={180}
              level="M"
              includeMargin={false}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-500">
              Each product gets its own QR code. Print this and attach it to
              the product so the buyer can scan to verify authenticity and see
              full provenance details.
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download QR (SVG)
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
