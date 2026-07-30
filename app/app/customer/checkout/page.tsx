"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRequireRole } from "@/lib/useRequireRole";
import { useCart } from "@/lib/CartContext";
import { apiClient } from "@/lib/apiClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  MapPin,
  Lock,
  ShieldCheck,
  ShoppingBag,
  PartyPopper,
} from "lucide-react";

type Step = "shipping" | "payment" | "processing" | "success";
type PayMethod = "card" | "upi" | "cod";

import { useTranslation } from "react-i18next";

export default function CheckoutPage() {
  const { t } = useTranslation(["customer", "common"]);
  const { ready } = useRequireRole("CUSTOMER");
  const router = useRouter();
  const { items, hydrated, subtotal, count, clear } = useCart();

  const [step, setStep] = useState<Step>("shipping");
  const [orderId, setOrderId] = useState<string>("");
  const [orderCount, setOrderCount] = useState(1);

  // Shipping form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [shipError, setShipError] = useState<string | null>(null);

  // Payment form
  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [payError, setPayError] = useState<string | null>(null);

  const shipping = items.length > 0 ? 99 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  if (!ready) return null;

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  // Empty cart guard — nothing to check out.
  if (items.length === 0 && step !== "success") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center">
          <ShoppingBag className="mb-4 h-16 w-16 text-neutral-300" strokeWidth={1.5} />
          <h3 className="text-xl font-bold">{t("customer:checkout.emptyTitle")}</h3>
          <p className="mt-2 text-neutral-500">{t("customer:checkout.emptyDesc")}</p>
          <Button asChild className="mt-6 bg-black hover:bg-neutral-800">
            <Link href="/app/discover">{t("customer:checkout.browseProducts")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  function validateShipping(): boolean {
    if (!fullName.trim()) {
      setShipError(t("customer:checkout.errorFullName"));
      return false;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setShipError(t("customer:checkout.errorPhone"));
      return false;
    }
    if (!address.trim()) {
      setShipError(t("customer:checkout.errorAddress"));
      return false;
    }
    if (!city.trim()) {
      setShipError(t("customer:checkout.errorCity"));
      return false;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      setShipError(t("customer:checkout.errorPincode"));
      return false;
    }
    setShipError(null);
    return true;
  }

  function validatePayment(): boolean {
    if (payMethod === "card") {
      if (cardNumber.replace(/\s/g, "").length < 12) {
        setPayError("Please enter a valid card number.");
        return false;
      }
      if (!cardName.trim()) {
        setPayError("Please enter the name on the card.");
        return false;
      }
      if (!/^\d{2}\/\d{2}$/.test(expiry.trim())) {
        setPayError("Please enter expiry as MM/YY.");
        return false;
      }
      if (!/^\d{3,4}$/.test(cvv.trim())) {
        setPayError("Please enter a valid CVV.");
        return false;
      }
    } else if (payMethod === "upi") {
      if (!/^[\w.\-]+@[\w.\-]+$/.test(upiId.trim())) {
        setPayError("Please enter a valid UPI ID (e.g. name@bank).");
        return false;
      }
    }
    setPayError(null);
    return true;
  }

  // Create the order(s) on the backend — the server splits the cart into one
  // order per weaver and decrements stock.
  async function processPayment() {
    setStep("processing");
    try {
      const orders = await apiClient.createCustomerOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
        },
        paymentMethod: payMethod,
      });
      setOrderId(orders.map((o) => o.id.slice(0, 8).toUpperCase()).join(", "));
      setOrderCount(orders.length);
      clear();
      setStep("success");
    } catch (err) {
      setPayError(err instanceof Error ? err.message : t("customer:checkout.orderFailed"));
      setStep("payment");
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6"
        onClick={() =>
          step === "shipping" ? router.push("/app/customer/cart") : setStep("shipping")
        }
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {step === "shipping" ? t("customer:checkout.backToCart") : t("customer:checkout.backToShipping")}
      </Button>

      {/* ── Stepper ── */}
      {step !== "success" && step !== "processing" && (
        <div className="mb-8 flex items-center gap-2">
          <StepDot label={t("customer:checkout.stepShipping")} active={step === "shipping"} done={false} />
          <div className={`h-0.5 w-8 ${step === "payment" ? "bg-black" : "bg-neutral-200"}`} />
          <StepDot label={t("customer:checkout.stepPayment")} active={step === "payment"} done={false} />
          <div className="h-0.5 w-8 bg-neutral-200" />
          <StepDot label={t("customer:checkout.stepConfirm")} active={false} done={false} />
        </div>
      )}

      {/* ── Success ── */}
      {step === "success" && (
        <div className="mx-auto max-w-lg">
          <Card className="border-2 border-green-600 shadow-[4px_4px_0px_0px_rgba(22,163,74,0.4)]">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                <PartyPopper className="h-8 w-8 text-green-700" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">{t("customer:checkout.orderConfirmed")}</h1>
              <p className="mt-2 text-neutral-600">
                {orderCount > 1 ? t("customer:checkout.thankYou_other") : t("customer:checkout.thankYou_one")}
              </p>
              {orderCount > 1 && (
                <p className="mt-1 text-xs text-neutral-500">
                  {t("customer:checkout.splitNote", { count: orderCount })}
                </p>
              )}
              <div className="mt-6 w-full rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">{orderCount > 1 ? t("customer:checkout.orderIdLabel_other") : t("customer:checkout.orderIdLabel_one")}</span>
                  <span className="font-bold font-mono">{orderId}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-neutral-500">{t("customer:checkout.amountPaid")}</span>
                  <span className="font-bold">₹{total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-neutral-500">{t("customer:checkout.paymentMethodLabel")}</span>
                  <span className="font-medium capitalize">
                    {payMethod === "cod" ? t("customer:checkout.cashOnDelivery") : payMethod}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-neutral-500">{t("customer:checkout.deliveryLabel")}</span>
                  <span className="font-medium">{t("customer:checkout.deliveryTime")}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                {t("customer:checkout.qrNote")}
              </div>
              <div className="mt-6 flex gap-3 w-full">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/app/customer/orders">
                    <ShoppingBag className="h-4 w-4" />
                    Track My Orders
                  </Link>
                </Button>
                <Button asChild className="flex-1 bg-black hover:bg-neutral-800">
                  <Link href="/app/discover">
                    Continue Shopping
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Processing ── */}
      {step === "processing" && (
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-black" />
          <h2 className="mt-6 text-xl font-bold">Processing Payment…</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Securely contacting the payment gateway. Please don&apos;t close this page.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-neutral-400">
            <Lock className="h-3 w-3" />
            Your payment is encrypted end-to-end
          </div>
        </div>
      )}

      {/* ── Shipping + Payment form layout ── */}
      {(step === "shipping" || step === "payment") && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* ── Shipping step ── */}
            {step === "shipping" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50">
                      <MapPin className="h-5 w-5 text-neutral-700" strokeWidth={1.5} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Shipping Address</CardTitle>
                      <CardDescription>Where should we deliver your order?</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="e.g. Ananya Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        placeholder="6-digit pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        placeholder="House no, street, area"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="e.g. Jaipur"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                  </div>

                  {shipError && (
                    <p className="mt-4 text-sm font-medium text-red-600">{shipError}</p>
                  )}

                  <Button
                    className="mt-6 w-full h-12 bg-black hover:bg-neutral-800"
                    onClick={() => validateShipping() && setStep("payment")}
                  >
                    Continue to Payment
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* ── Payment step ── */}
            {step === "payment" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50">
                      <CreditCard className="h-5 w-5 text-neutral-700" strokeWidth={1.5} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Payment Method</CardTitle>
                      <CardDescription>
                        Dummy flow — no real charges. Choose how you&apos;d like to pay.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Method selector */}
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { key: "card", label: "Card", icon: CreditCard },
                      { key: "upi", label: "UPI", icon: ShieldCheck },
                      { key: "cod", label: "Cash on Delivery", icon: MapPin },
                    ] as const).map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => {
                          setPayMethod(m.key);
                          setPayError(null);
                        }}
                        className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-xs font-medium transition-colors ${
                          payMethod === m.key
                            ? "border-black bg-neutral-50 text-black"
                            : "border-neutral-200 text-neutral-500 hover:border-neutral-400"
                        }`}
                      >
                        <m.icon className="h-5 w-5" />
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* Card fields */}
                  {payMethod === "card" && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="4242 4242 4242 4242"
                          value={cardNumber}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                            const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
                            setCardNumber(formatted);
                          }}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          placeholder="As printed on the card"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry (MM/YY)</Label>
                        <Input
                          id="expiry"
                          placeholder="12/28"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          type="password"
                          placeholder="•••"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        />
                      </div>
                    </div>
                  )}

                  {/* UPI field */}
                  {payMethod === "upi" && (
                    <div className="space-y-2">
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        placeholder="yourname@bank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                      <p className="text-xs text-neutral-500">
                        A dummy payment request will be sent to this UPI ID.
                      </p>
                    </div>
                  )}

                  {/* COD note */}
                  {payMethod === "cod" && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      Pay in cash when your order is delivered. A ₹40 handling fee may apply
                      (waived in this demo).
                    </div>
                  )}

                  {payError && (
                    <p className="text-sm font-medium text-red-600">{payError}</p>
                  )}

                  <Button
                    className="w-full h-12 bg-black hover:bg-neutral-800"
                    onClick={() => validatePayment() && processPayment()}
                  >
                    <Lock className="h-4 w-4" />
                    Pay ₹{total.toLocaleString("en-IN")} {payMethod === "cod" ? "(Place Order)" : "Securely"}
                  </Button>
                  <p className="text-center text-xs text-neutral-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    This is a demo — no real payment will be processed.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Order summary sidebar ── */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-2">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-neutral-200 bg-neutral-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-neutral-900">{item.title}</p>
                        <p className="text-xs text-neutral-500">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-neutral-200 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Subtotal ({count})</span>
                    <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Shipping</span>
                    <span className="font-medium">₹{shipping.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">GST (5%)</span>
                    <span className="font-medium">₹{tax.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-2 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-extrabold">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Stepper dot ── */
function StepDot({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold ${
          active
            ? "border-black bg-black text-white"
            : done
            ? "border-green-600 bg-green-600 text-white"
            : "border-neutral-300 text-neutral-400"
        }`}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : label.charAt(0)}
      </div>
      <span className={`text-sm font-medium ${active ? "text-black" : "text-neutral-400"}`}>
        {label}
      </span>
    </div>
  );
}
