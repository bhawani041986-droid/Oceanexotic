"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import {
  MapPin,
  CreditCard,
  ShieldCheck,
  Truck,
  Zap,
  ArrowRight,
  Loader2,
  CheckCircle2,
  User,
  Phone,
  ChevronRight,
  AlertCircle,
  Edit3,
  Lock,
  ChevronDown,
  ShoppingBag,
  Package,
  ArrowLeft,
  Ticket,
  XCircle,
  Clock,
  Sun,
  Moon,
  CalendarDays,
  Smartphone,
  Wallet,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────
interface DeliverySlot {
  slot_key: string;
  slot_label: string;
  slot_time: string;
  is_active: boolean;
  max_orders: number;
  cutoff_time: string;
}

const PAYMENT_METHODS = [
  { key: "UPI",         label: "UPI",          subtitle: "Google Pay, PhonePe, Paytm",   icon: <Smartphone className="w-5 h-5" /> },
  { key: "CARD",        label: "Debit / Credit Card", subtitle: "Visa, Mastercard, RuPay", icon: <CreditCard className="w-5 h-5" /> },
  { key: "NET_BANKING", label: "Net Banking",   subtitle: "All major banks supported",    icon: <Building2 className="w-5 h-5" /> },
  { key: "WALLET",      label: "Wallet",        subtitle: "Paytm, Mobikwik, FreeCharge",  icon: <Wallet className="w-5 h-5" /> },
];

const SLOT_ICONS: Record<string, React.ReactNode> = {
  TODAY_AM: <Sun className="w-5 h-5 text-amber-500" />,
  TODAY_PM: <Moon className="w-5 h-5 text-indigo-500" />,
  TOMORROW: <CalendarDays className="w-5 h-5 text-emerald-500" />,
};

// ─── Helpers ─────────────────────────────────────────────
function isSlotAvailable(slot: DeliverySlot): boolean {
  if (!slot.is_active) return false;
  if (slot.slot_key === "TOMORROW") return true;
  const now = new Date();
  const [hh, mm] = slot.cutoff_time.split(":").map(Number);
  const cutoff = new Date();
  cutoff.setHours(hh, mm, 0, 0);
  return now < cutoff;
}

// ─── Component ───────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, getTotal, clearCart } = useCartStore();
  const {
    payu,
    ordersEnabled,
    ordersOpenTime,
    ordersCloseTime,
    ordersNextOpenText,
    fetchSettings,
  } = useSettingsStore();
  const { user, isHydrated } = useAuthStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isClosed, setIsClosed] = useState(false);
  const [isPreOrder, setIsPreOrder] = useState(false);

  // Delivery slot state
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [allowedSlots, setAllowedSlots] = useState<string[]>([]);
  const [customSlots, setCustomSlots] = useState<Record<string, string>>({});

  // Payment state (prepaid only — NO COD)
  const [selectedPayment, setSelectedPayment] = useState<string>("UPI");

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    type: string;
    value: number;
  } | null>(null);
  const [activeCoupons, setActiveCoupons] = useState<any[]>([]);

  const cartTotal = getTotal();
  const finalTotal = appliedCoupon
    ? Math.max(0, cartTotal - appliedCoupon.discountAmount)
    : cartTotal;

  // ── Fetch delivery slots ──────────────────────────────
  useEffect(() => {
    fetch("/api/system/delivery-slots")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setDeliverySlots(d);
          // Auto-select first available slot
          const first = d.find(isSlotAvailable);
          if (first) setSelectedSlot(first.slot_key);
        }
      })
      .catch(() => {
        // Fallback slots if API not yet built
        const fallback: DeliverySlot[] = [
          { slot_key: "TODAY_AM", slot_label: "Today Morning",  slot_time: "10:00 AM – 12:00 PM", is_active: true, max_orders: 30, cutoff_time: "09:00" },
          { slot_key: "TODAY_PM", slot_label: "Today Evening",  slot_time: "4:00 PM – 7:00 PM",   is_active: true, max_orders: 30, cutoff_time: "14:00" },
          { slot_key: "TOMORROW", slot_label: "Tomorrow",       slot_time: "Next day delivery",    is_active: true, max_orders: 50, cutoff_time: "21:00" },
        ];
        setDeliverySlots(fallback);
        const first = fallback.find(isSlotAvailable);
        if (first) setSelectedSlot(first.slot_key);
      });
  }, []);

  // ── Validate address and load allowed slots ───────────
  useEffect(() => {
    if (!selectedAddress) {
      setAllowedSlots([]);
      setCustomSlots({});
      return;
    }
    fetch(`/api/system/check-area?area=${encodeURIComponent(selectedAddress.address || selectedAddress.address_line1 || selectedAddress.hotel_name)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.deliverable) {
          if (Array.isArray(data.allowed_slots) && data.allowed_slots.length > 0) {
            setAllowedSlots(data.allowed_slots);
          } else {
            setAllowedSlots(["TODAY_AM", "TODAY_PM", "TOMORROW"]);
          }
          if (data.custom_slots) {
            setCustomSlots(data.custom_slots);
          } else {
            setCustomSlots({});
          }
        } else {
          setAllowedSlots([]);
          setCustomSlots({});
        }
      })
      .catch(() => {
        setAllowedSlots(["TODAY_AM", "TODAY_PM", "TOMORROW"]);
        setCustomSlots({});
      });
  }, [selectedAddress]);

  // ── Adjust selected slot if not allowed by selected area ──
  useEffect(() => {
    if (allowedSlots.length > 0 && selectedSlot && !allowedSlots.includes(selectedSlot)) {
      const firstAvailable = deliverySlots.find(s => allowedSlots.includes(s.slot_key) && isSlotAvailable(s));
      if (firstAvailable) {
        setSelectedSlot(firstAvailable.slot_key);
      } else {
        setSelectedSlot("");
      }
    }
  }, [allowedSlots, deliverySlots, selectedSlot]);

  // ── Fetch coupons ─────────────────────────────────────
  useEffect(() => {
    fetch("/api/system/coupons")
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "success" && d.content) {
          const valid = d.content.filter((c: any) => {
            if (c.status !== "ACTIVE") return false;
            if (c.usage_limit && c.usage_count >= c.usage_limit) return false;
            if (c.expiry_date && new Date(c.expiry_date) < new Date()) return false;
            return true;
          });
          setActiveCoupons(valid);
        }
      })
      .catch(console.error);

    const loadProfileData = async () => {
      const userId = user?.id || "USR-TOWG2LBPP";
      setIsFetchingData(true);
      try {
        const res = await fetch(`/api/user/addresses?userId=${userId}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSavedAddresses(data);
          const savedId = localStorage.getItem("oceanexotic_checkout_address_id");
          const primary =
            data.find((a: any) => a.id.toString() === savedId) ||
            data.find((a: any) => a.is_default) ||
            data[0];
          setSelectedAddress(primary);
          setActiveStep(2);
        }
      } catch (err) {
        toast("Failed to sync with saved addresses.", "error");
      } finally {
        setIsFetchingData(false);
      }
    };

    if (isHydrated) loadProfileData();
  }, [user?.id, isHydrated]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (ordersOpenTime && ordersCloseTime) {
      const now = new Date();
      const cur = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      let outside = false;
      if (ordersOpenTime < ordersCloseTime) {
        if (cur < ordersOpenTime || cur > ordersCloseTime) outside = true;
      } else {
        if (cur < ordersOpenTime && cur > ordersCloseTime) outside = true;
      }
      if (!ordersEnabled || outside) {
        setIsClosed(true);
        setIsPreOrder(true);
      } else {
        setIsClosed(false);
      }
    }
  }, [ordersEnabled, ordersOpenTime, ordersCloseTime]);

  useEffect(() => {
    if (appliedCoupon) handleApplyCoupon(appliedCoupon.code);
  }, [cartTotal]);

  // ── Coupon handlers ───────────────────────────────────
  const handleApplyCoupon = async (codeToApply = couponCodeInput) => {
    if (!codeToApply.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/marketplace/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToApply, cartTotal }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setAppliedCoupon({
          code: codeToApply.toUpperCase(),
          discountAmount: data.discountAmount,
          type: data.couponType,
          value: data.couponValue,
        });
        toast("Coupon applied successfully!", "success");
      } else {
        setAppliedCoupon(null);
        setCouponError(data.message || "Invalid or expired code.");
      }
    } catch {
      setCouponError("Could not verify coupon. Try again.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    setCouponError("");
  };

  // ── Place order (prepaid only) ────────────────────────
  const handlePlaceOrder = async () => {
    if (finalTotal < 500) {
      toast("Minimum order value is ₹500. Please add more items to your cart.", "error");
      return;
    }
    if (!selectedAddress) {
      toast("Please select a delivery address.", "error");
      return;
    }
    if (!selectedSlot) {
      toast("Please select a delivery time slot.", "error");
      return;
    }
    if (!selectedPayment) {
      toast("Please select a payment method.", "error");
      return;
    }

    setIsProcessing(true);
    try {
      // Validate service area availability dynamically
      const areaCheckRes = await fetch(`/api/system/check-area?area=${encodeURIComponent(selectedAddress.address || selectedAddress.address_line1 || selectedAddress.hotel_name)}`);
      const areaCheck = await areaCheckRes.json();
      if (!areaCheck.deliverable) {
        toast(`Delivery is currently unavailable to your location: ${selectedAddress.address || selectedAddress.address_line1 || selectedAddress.hotel_name}. Please choose an active delivery zone.`, "error");
        setIsProcessing(false);
        return;
      }
    } catch (e) {
      console.warn("Service area validation error during checkout:", e);
    }

    try {
      const res = await fetch("/api/marketplace/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "USR-DEMO",
          items,
          total: finalTotal,
          address: `${selectedAddress.hotel_name}${selectedAddress.room_no ? ` (${selectedAddress.room_no})` : ""}, ${selectedAddress.address || selectedAddress.address_line1}`,
          phone: selectedAddress.phone,
          paymentMethod: selectedPayment,   // ← prepaid method, never "COD"
          deliverySlot: selectedSlot,
          isPreOrder: isPreOrder ? 1 : 0,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          discountAmount: appliedCoupon ? appliedCoupon.discountAmount : 0,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        clearCart();
        toast("Order placed! Prepare for fresh delivery. 🐟", "success");
        router.push(`/customer/checkout/success?orderId=${data.orderId}`);
      } else {
        toast(data.message || "Failed to place order.", "error");
      }
    } catch {
      toast("Connection issue. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Slot label helper ─────────────────────────────────
  const selectedSlotData = deliverySlots.find((s) => s.slot_key === selectedSlot);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <ShoppingBag className="w-24 h-24 text-primary opacity-10 mb-6" />
        <h1 className="text-3xl font-black uppercase italic mb-4">Your Cart is Empty</h1>
        <Link href="/customer/products">
          <Button className="bg-primary text-black font-black px-12 h-14 rounded-full">
            GO TO MARKET
          </Button>
        </Link>
      </div>
    );
  }

  // ── Step label helper ─────────────────────────────────
  const stepCircle = (n: number) =>
    cn(
      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
      activeStep === n
        ? "bg-[var(--c-primary)] text-[var(--c-bg)]"
        : activeStep > n
        ? "bg-emerald-500 text-white"
        : "bg-[var(--foreground)]/5 text-[var(--c-text-secondary)]"
    );

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text-primary)] font-sans pb-32">
      <main className="container mx-auto max-w-5xl px-4 pt-8 md:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── Main Column ────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Pre-Order / Closed banner */}
            {isClosed && (
              <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/70 text-slate-800 space-y-3 shadow-sm relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
                      Ordering Closed — Pre-Order Active
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      We are outside delivery hours (
                      <span className="font-bold text-slate-800">{ordersOpenTime} – {ordersCloseTime}</span>
                      ). Your order will be delivered at the next available slot.
                    </p>
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mt-1.5 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" /> Next slot: {ordersNextOpenText || "Tomorrow 10:00 AM"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 1: Address ──────────────────────── */}
            <div className={cn("border rounded-xl transition-all overflow-hidden shadow-sm",
              activeStep === 1
                ? "border-[var(--c-primary)]/50 ring-1 ring-[var(--c-primary)]/20"
                : "border-[var(--foreground)]/10")}>
              <div className={cn("px-6 py-4 flex items-center justify-between",
                activeStep === 1 ? "bg-[var(--c-bg-alt)]" : "bg-[var(--c-bg)]")}>
                <div className="flex items-center gap-4">
                  <span className={stepCircle(1)}>
                    {activeStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : "1"}
                  </span>
                  <h2 className="text-lg font-bold text-[var(--c-text-primary)]">Delivery Address</h2>
                </div>
                {activeStep > 1 && selectedAddress && (
                  <button onClick={() => setActiveStep(1)} className="text-xs font-bold text-blue-600 hover:underline">
                    Change
                  </button>
                )}
              </div>

              {activeStep === 1 ? (
                <div className="p-6 space-y-6 bg-[var(--c-bg)] animate-in slide-in-from-top-2 duration-300">
                  {isFetchingData ? (
                    <div className="flex flex-col items-center py-12 space-y-4">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Addresses…</p>
                    </div>
                  ) : savedAddresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddress(addr)}
                          className={cn(
                            "p-5 border-2 rounded-xl cursor-pointer transition-all hover:bg-slate-50 relative overflow-hidden",
                            selectedAddress?.id === addr.id
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-slate-100"
                          )}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <Badge className="bg-slate-200 text-slate-700 text-[8px] font-bold uppercase">{addr.label || addr.type || "Home"}</Badge>
                            {selectedAddress?.id === addr.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                          </div>
                          <p className="font-bold text-sm text-slate-900">{addr.hotel_name || addr.label}</p>
                          {addr.room_no && <p className="text-[10px] font-bold text-primary uppercase mt-0.5">ROOM: {addr.room_no}</p>}
                          <p className="text-xs text-slate-500 leading-tight mt-1">{addr.address || addr.address_line1}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1.5">
                            <Phone className="w-3 h-3" /> {addr.phone}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                      <MapPin className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                      <p className="text-sm font-medium text-slate-500">No saved addresses found.</p>
                      <Link href="/customer/profile">
                        <Button variant="outline" className="mt-4 text-xs font-bold">+ ADD ADDRESS IN PROFILE</Button>
                      </Link>
                    </div>
                  )}

                  <div className="flex justify-end border-t pt-6">
                    <Button
                      onClick={() => {
                        setActiveStep(2);
                        if (selectedAddress?.id)
                          localStorage.setItem("oceanexotic_checkout_address_id", selectedAddress.id.toString());
                      }}
                      disabled={!selectedAddress}
                      className="bg-primary text-black font-black px-10 h-12 rounded-lg shadow-lg"
                    >
                      USE THIS ADDRESS
                    </Button>
                  </div>
                </div>
              ) : selectedAddress && (
                <div className="px-6 pb-4 text-sm text-[var(--c-text-secondary)]">
                  <p className="font-bold text-[var(--c-text-primary)]">{selectedAddress.hotel_name || selectedAddress.label}</p>
                  <p>{selectedAddress.address || selectedAddress.address_line1}</p>
                  <p>Phone: {selectedAddress.phone}</p>
                </div>
              )}
            </div>

            {/* ── STEP 2: Delivery Slot ────────────────── */}
            <div className={cn("border rounded-xl transition-all overflow-hidden shadow-sm",
              activeStep === 2
                ? "border-[var(--c-primary)]/50 ring-1 ring-[var(--c-primary)]/20"
                : "border-[var(--foreground)]/10")}>
              <div className={cn("px-6 py-4 flex items-center justify-between",
                activeStep === 2 ? "bg-[var(--c-bg-alt)]" : "bg-[var(--c-bg)]")}>
                <div className="flex items-center gap-4">
                  <span className={stepCircle(2)}>
                    {activeStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : "2"}
                  </span>
                  <h2 className="text-lg font-bold text-[var(--c-text-primary)]">Delivery Time Slot</h2>
                </div>
                {activeStep > 2 && (
                  <button onClick={() => setActiveStep(2)} className="text-xs font-bold text-blue-600 hover:underline">
                    Change
                  </button>
                )}
              </div>

              {activeStep === 2 ? (
                <div className="p-6 space-y-4 bg-[var(--c-bg)] animate-in slide-in-from-top-2 duration-300">
                  <p className="text-xs text-[var(--c-text-secondary)] font-medium">
                    Choose when you want your fresh seafood delivered 🐟
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {deliverySlots.filter(s => allowedSlots.length === 0 || allowedSlots.includes(s.slot_key)).map((slot) => {
                      const available = isSlotAvailable(slot);
                      const selected = selectedSlot === slot.slot_key;
                      return (
                        <button
                          key={slot.slot_key}
                          disabled={!available}
                          onClick={() => available && setSelectedSlot(slot.slot_key)}
                          className={cn(
                            "relative p-4 rounded-xl border-2 text-left transition-all",
                            selected
                              ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                              : available
                              ? "border-[var(--foreground)]/10 hover:border-primary/40 hover:bg-[var(--c-bg-alt)]"
                              : "border-[var(--foreground)]/5 opacity-40 cursor-not-allowed bg-[var(--foreground)]/2"
                          )}
                        >
                          {/* Selected tick */}
                          {selected && (
                            <CheckCircle2 className="w-4 h-4 text-primary absolute top-3 right-3" />
                          )}
                          {/* Unavailable badge */}
                          {!available && (
                            <span className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-widest bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
                              CLOSED
                            </span>
                          )}

                          <div className="flex items-center gap-2 mb-2">
                            {SLOT_ICONS[slot.slot_key] || <Clock className="w-5 h-5 text-primary" />}
                            <span className={cn("text-sm font-black uppercase tracking-tight",
                              selected ? "text-primary" : "text-[var(--c-text-primary)]")}>
                              {slot.slot_label}
                            </span>
                          </div>
                          <p className={cn("text-xs font-semibold",
                            selected ? "text-primary/80" : "text-[var(--c-text-secondary)]")}>
                            {customSlots[slot.slot_key] || slot.slot_time}
                          </p>
                          {slot.slot_key !== "TOMORROW" && (
                            <p className="text-[9px] font-bold text-[var(--c-text-secondary)] uppercase tracking-widest mt-1 opacity-60">
                              Order by {slot.cutoff_time}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-semibold text-emerald-700 leading-relaxed">
                      Freshly caught this morning · Cleaned &amp; vacuum packed before delivery · Delivered in under 90 minutes from dispatch
                    </p>
                  </div>

                  <div className="flex justify-end border-t pt-4">
                    <Button
                      onClick={() => setActiveStep(3)}
                      disabled={!selectedSlot}
                      className="bg-primary text-black font-black px-10 h-12 rounded-lg shadow-lg"
                    >
                      CONFIRM SLOT
                    </Button>
                  </div>
                </div>
              ) : activeStep > 2 && selectedSlotData && (
                <div className="px-6 pb-4 flex items-center gap-2 text-sm text-[var(--c-text-secondary)]">
                  {SLOT_ICONS[selectedSlotData.slot_key]}
                  <span className="font-bold text-[var(--c-text-primary)]">{selectedSlotData.slot_label}</span>
                  <span>·</span>
                  <span>{selectedSlotData.slot_time}</span>
                </div>
              )}
            </div>

            {/* ── STEP 3: Payment Method (Prepaid Only) ── */}
            <div className={cn("border rounded-xl transition-all overflow-hidden shadow-sm",
              activeStep === 3
                ? "border-[var(--c-primary)]/50 ring-1 ring-[var(--c-primary)]/20"
                : "border-[var(--foreground)]/10")}>
              <div className={cn("px-6 py-4 flex items-center justify-between",
                activeStep === 3 ? "bg-[var(--c-bg-alt)]" : "bg-[var(--c-bg)]")}>
                <div className="flex items-center gap-4">
                  <span className={stepCircle(3)}>
                    {activeStep > 3 ? <CheckCircle2 className="w-4 h-4" /> : "3"}
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--c-text-primary)]">Payment Method</h2>
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Prepaid Only — 100% Secure
                    </p>
                  </div>
                </div>
                {activeStep > 3 && (
                  <button onClick={() => setActiveStep(3)} className="text-xs font-bold text-blue-600 hover:underline">Change</button>
                )}
              </div>

              {activeStep === 3 ? (
                <div className="p-6 space-y-4 bg-[var(--c-bg)] animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map((pm) => (
                      <button
                        key={pm.key}
                        onClick={() => setSelectedPayment(pm.key)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3",
                          selectedPayment === pm.key
                            ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                            : "border-[var(--foreground)]/10 hover:border-primary/30 hover:bg-[var(--c-bg-alt)]"
                        )}
                      >
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                          selectedPayment === pm.key ? "bg-primary/10 text-primary" : "bg-[var(--foreground)]/5 text-[var(--c-text-secondary)]")}>
                          {pm.icon}
                        </div>
                        <div className="flex-1">
                          <p className={cn("text-sm font-black",
                            selectedPayment === pm.key ? "text-primary" : "text-[var(--c-text-primary)]")}>
                            {pm.label}
                          </p>
                          <p className="text-[10px] text-[var(--c-text-secondary)] font-medium mt-0.5">{pm.subtitle}</p>
                        </div>
                        {selectedPayment === pm.key && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <p className="text-[10px] font-semibold text-blue-700">
                      Payments are processed securely via PayU. We never store your card details.
                    </p>
                  </div>

                  <div className="flex justify-end border-t pt-4">
                    <Button
                      onClick={() => setActiveStep(4)}
                      disabled={!selectedPayment}
                      className="bg-primary text-black font-black px-10 h-12 rounded-lg shadow-lg"
                    >
                      CONTINUE TO REVIEW
                    </Button>
                  </div>
                </div>
              ) : activeStep > 3 && (
                <div className="px-6 pb-4 text-sm text-[var(--c-text-secondary)] font-bold flex items-center gap-2">
                  {PAYMENT_METHODS.find((p) => p.key === selectedPayment)?.icon}
                  <span>{PAYMENT_METHODS.find((p) => p.key === selectedPayment)?.label}</span>
                </div>
              )}
            </div>

            {/* ── STEP 4: Review & Confirm ─────────────── */}
            <div className={cn("border rounded-xl transition-all overflow-hidden shadow-sm",
              activeStep === 4
                ? "border-[var(--c-primary)]/50 ring-1 ring-[var(--c-primary)]/20"
                : "border-[var(--foreground)]/10")}>
              <div className={cn("px-6 py-4 flex items-center gap-4",
                activeStep === 4 ? "bg-[var(--c-bg-alt)]" : "bg-[var(--c-bg)]")}>
                <span className={stepCircle(4)}>4</span>
                <h2 className="text-lg font-bold text-[var(--c-text-primary)]">Review & Confirm</h2>
              </div>

              {activeStep === 4 && (
                <div className="p-6 bg-[var(--c-bg)] animate-in slide-in-from-top-2 duration-300 space-y-6">
                  {/* Items list */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center p-4 rounded-xl border border-[var(--foreground)]/10">
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                          <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold">{item.name}</h4>
                          <p className="text-xs text-[var(--c-text-secondary)] font-bold uppercase mt-0.5">QTY: {item.quantity} KG</p>
                          <p className="text-sm font-bold text-[var(--c-text-primary)] mt-0.5 italic">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary: address, slot, payment */}
                  <div className="p-4 rounded-xl bg-[var(--c-bg-alt)] border border-[var(--foreground)]/5 space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--c-text-secondary)] font-semibold uppercase tracking-wider">Deliver to</span>
                      <span className="font-bold text-right max-w-[60%]">
                        {selectedAddress?.hotel_name || selectedAddress?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--c-text-secondary)] font-semibold uppercase tracking-wider">Slot</span>
                      <span className="font-bold">{selectedSlotData?.slot_label} · {selectedSlotData?.slot_time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--c-text-secondary)] font-semibold uppercase tracking-wider">Payment</span>
                      <span className="font-bold">{PAYMENT_METHODS.find((p) => p.key === selectedPayment)?.label}</span>
                    </div>
                  </div>

                  {/* Place order button */}
                  <div className="flex flex-col gap-4 w-full">
                    {finalTotal < 500 && (
                      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-2">
                        ⚠️ MINIMUM ORDER VALUE OF ₹500 REQUIRED TO CHECKOUT
                      </div>
                    )}
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing || finalTotal < 500}
                      className="w-full h-16 bg-primary text-black font-black uppercase tracking-widest text-lg rounded-xl shadow-xl active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>PLACE ORDER — ₹{finalTotal.toLocaleString()}</>
                      )}
                    </Button>
                    <p className="text-[10px] text-center text-[var(--c-text-secondary)] italic">
                      By placing your order, you agree to Ocean Exotic's delivery policy. Payment will be collected via {PAYMENT_METHODS.find((p) => p.key === selectedPayment)?.label}.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>{/* end main column */}

          {/* ── Sidebar ────────────────────────────────── */}
          <div className="lg:col-span-4">
            <Card className="sticky top-10 p-8 space-y-8 border-[var(--foreground)]/10 bg-[var(--c-bg-alt)] shadow-xl rounded-2xl">

              {/* Place Order CTA */}
              <div className="space-y-4">
                <Button
                  onClick={handlePlaceOrder}
                  disabled={activeStep < 4 || isProcessing || finalTotal < 500}
                  className="w-full h-12 bg-primary text-black font-black uppercase tracking-widest rounded-lg shadow-lg disabled:opacity-40"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "PLACE YOUR ORDER"}
                </Button>
                {activeStep < 4 && (
                  <p className="text-[9px] text-center text-[var(--c-text-secondary)] italic">
                    Complete all steps above to place your order.
                  </p>
                )}
              </div>

              {/* Slot reminder */}
              {selectedSlotData && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  {SLOT_ICONS[selectedSlotData.slot_key]}
                  <div>
                    <p className="text-xs font-black text-emerald-700 uppercase tracking-tight">{selectedSlotData.slot_label}</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">{selectedSlotData.slot_time}</p>
                  </div>
                </div>
              )}

              {/* Promo Code */}
              <div className="border-t border-[var(--foreground)]/10 pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm">Promo Code</h3>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-primary/10 border border-primary/20 p-3 rounded-lg animate-fade-in">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-primary uppercase tracking-widest">{appliedCoupon.code}</span>
                      <span className="text-[10px] font-bold text-primary/70 uppercase">−₹{appliedCoupon.discountAmount} saved!</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-[var(--c-text-secondary)] hover:text-danger transition-colors p-1">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 relative">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE…"
                        disabled={isApplyingCoupon}
                        className="flex-1 bg-[var(--c-bg)] border border-[var(--foreground)]/10 rounded-lg px-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-primary transition-all h-10"
                      />
                      <Button
                        onClick={() => handleApplyCoupon()}
                        disabled={isApplyingCoupon || !couponCodeInput.trim()}
                        className="bg-[var(--foreground)]/5 text-[var(--c-text-primary)] hover:bg-primary hover:text-black font-black text-xs px-4 rounded-lg transition-all h-10"
                      >
                        {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "APPLY"}
                      </Button>
                    </div>
                    {couponError && <p className="text-[10px] font-bold text-danger uppercase">{couponError}</p>}
                    {activeCoupons.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-2">
                        {activeCoupons.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => { setCouponCodeInput(c.code); handleApplyCoupon(c.code); }}
                            disabled={isApplyingCoupon}
                            className="px-2 py-1 bg-primary/10 border border-primary/20 rounded text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-black transition-all"
                          >
                            {c.code}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="border-t border-[var(--foreground)]/10 pt-6 space-y-4">
                <h3 className="font-bold text-sm">Order Summary</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-[var(--c-text-secondary)] font-medium">
                    <span>Subtotal:</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[var(--c-text-secondary)] font-medium">
                    <span>Delivery:</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-primary font-black animate-fade-in bg-primary/5 p-2 -mx-2 rounded-md">
                      <span>Discount ({appliedCoupon.code}):</span>
                      <span>−₹{appliedCoupon.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-[var(--foreground)]/10 pt-3 flex justify-between font-black text-xl text-[var(--c-text-primary)]">
                    <span>Total:</span>
                    <span>₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Trust badge */}
              <div className="bg-[var(--c-bg)]/40 border border-[var(--foreground)]/5 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-[var(--c-primary)]">
                  <ShieldCheck className="w-4 h-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Secure Prepaid Payment</p>
                </div>
                <p className="text-[9px] text-[var(--c-text-secondary)] italic leading-relaxed">
                  All payments are encrypted and processed securely via PayU. No cash collection at delivery — fresher, safer, faster.
                </p>
              </div>

            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
