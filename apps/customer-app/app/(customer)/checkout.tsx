import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { checkoutService, type SavedAddress } from "@/services/checkoutService";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useThemeColors";
import i18n from "@/lib/i18n";

type Step = 1 | 2 | 3;

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { toast, ToastHost } = useToast();
  const colors = useThemeColors();
  const { settings } = useSettingsStore();
  const currentLanguage = settings.language; // force re-render on language change

  const primaryColor = colors.primary;

  const [activeStep, setActiveStep] = useState<Step>(1);
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(true);
  const [isPlacing, setIsPlacing] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);

  const subtotal = getTotal();
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + tax;

  // ── Load address vault ────────────────────────────────────────────────────
  useEffect(() => {
    const loadAddresses = async () => {
      const userId = user?.id;
      if (!userId) { setIsFetchingAddresses(false); return; }
      setIsFetchingAddresses(true);
      try {
        const addresses = await checkoutService.fetchAddresses(userId);
        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          const def = addresses.find((a) => a.is_default) ?? addresses[0];
          setSelectedAddress(def);
          setActiveStep(2); // skip to payment if address already exists
        }
      } catch {
        toast("Failed to sync Address Vault.", "error");
      } finally {
        setIsFetchingAddresses(false);
      }
    };
    loadAddresses();
  }, [user?.id]);

  // ── Place order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = useCallback(async () => {
    if (!selectedAddress) {
      toast("Delivery coordinates required.", "error");
      return;
    }
    setIsPlacing(true);
    try {
      const addressStr = [
        selectedAddress.hotel_name,
        selectedAddress.room_no ? `(${selectedAddress.room_no})` : "",
        selectedAddress.address,
        `Jetty: ${selectedAddress.jetty}`,
      ]
        .filter(Boolean)
        .join(", ");

      const result = await checkoutService.placeOrder({
        userId: user?.id ?? "GUEST",
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        total: grandTotal,
        address: addressStr,
        phone: selectedAddress.phone,
        paymentMethod: "COD",
      });

      if (result.status === "success") {
        clearCart();
        toast(`Order #${result.orderId} confirmed!`, "success");
        router.replace({ pathname: "/orders" });
      } else {
        toast(result.message ?? "Order failed. Please retry.", "error");
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ?? "Connection failure. Please retry.";
      toast(msg, "error");
    } finally {
      setIsPlacing(false);
    }
  }, [selectedAddress, items, grandTotal, user?.id]);

  // ── Empty cart guard ──────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-8">
        <Text className="text-6xl mb-6">🛍️</Text>
        <Text className="text-2xl font-black uppercase italic text-foreground text-center">
          Your Cart is Empty
        </Text>
        <Text className="text-sm text-muted-foreground text-center mt-3 mb-8">
          Add fresh harbor catches before proceeding to checkout.
        </Text>
        <Button
          label="GO TO MARKET"
          onPress={() => router.replace("/products")}
          className="w-full"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {ToastHost}

      {/* ── Progress Header ────────────────────────────────────────── */}
      <LinearGradient
        colors={["#020617", "#0d1b2a"]}
        className="px-4 pt-14 pb-4 border-b border-white/5"
      >
        <Text className="text-[9px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: primaryColor }}>
          Secure Checkout
        </Text>
        <View className="flex-row items-center gap-0">
          {(["1", "2", "3"] as const).map((s, idx) => {
            const stepNum = (idx + 1) as Step;
            const done = activeStep > stepNum;
            const active = activeStep === stepNum;
            const labels = ["Shipping", "Payment", "Review"];
            return (
              <View key={s} className="flex-row items-center flex-1">
                <Pressable
                  onPress={() => done ? setActiveStep(stepNum) : undefined}
                  className="items-center gap-1"
                >
                  <View
                    className="w-7 h-7 rounded-full items-center justify-center border"
                    style={done ? {
                      backgroundColor: "#10B981",
                      borderColor: "#10B981"
                    } : active ? {
                      backgroundColor: primaryColor,
                      borderColor: primaryColor
                    } : {
                      backgroundColor: "transparent",
                      borderColor: "rgba(255, 255, 255, 0.2)"
                    }}
                  >
                    {done ? (
                      <Text className="text-[10px] font-black text-white">✓</Text>
                    ) : (
                      <Text
                        className={cn(
                          "text-[10px] font-black",
                          active ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {s}
                      </Text>
                    )}
                  </View>
                  <Text
                    className="text-[7px] font-black uppercase tracking-widest"
                    style={{
                      color: active ? primaryColor : done ? "#10B981" : "#94A3B8"
                    }}
                  >
                    {labels[idx]}
                  </Text>
                </Pressable>
                {idx < 2 && (
                  <View
                    className={cn(
                      "flex-1 h-[1px] mx-1 mb-4",
                      done ? "bg-emerald-500/50" : "bg-white/10"
                    )}
                  />
                )}
              </View>
            );
          })}
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerClassName="px-4 py-6 gap-5 pb-32">

        {/* ══ STEP 1: Shipping Address ════════════════════════════════ */}
        <StepCard
          stepNum={1}
          label="Shipping Address"
          active={activeStep === 1}
          done={activeStep > 1}
          summary={
            selectedAddress
              ? `${selectedAddress.hotel_name}, ${selectedAddress.address}`
              : undefined
          }
          onEdit={() => setActiveStep(1)}
        >
          {isFetchingAddresses ? (
            <View className="py-10 items-center gap-3">
              <ActivityIndicator color={primaryColor} />
              <Text className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                Syncing Address Vault...
              </Text>
            </View>
          ) : savedAddresses.length > 0 ? (
            <View className="gap-3">
              {savedAddresses.map((addr) => {
                const selected = selectedAddress?.id === addr.id;
                return (
                  <Pressable
                    key={String(addr.id)}
                    onPress={() => setSelectedAddress(addr)}
                    className="rounded-xl border-2 p-4"
                    style={selected ? {
                      borderColor: primaryColor,
                      backgroundColor: colors.primary + "1A"
                    } : {
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      backgroundColor: "rgba(255, 255, 255, 0.05)"
                    }}
                  >
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="bg-white/10 px-2 py-0.5 rounded">
                        <Text className="text-[8px] font-black uppercase text-foreground">
                          {addr.type || addr.label}
                        </Text>
                      </View>
                      {selected && (
                        <View className="w-4 h-4 rounded-full items-center justify-center" style={{ backgroundColor: primaryColor }}>
                          <Text className="text-[8px] text-foreground font-black">✓</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm font-black text-foreground">
                      {addr.hotel_name}
                    </Text>
                    {addr.room_no ? (
                      <Text className="text-[9px] font-black uppercase mt-0.5" style={{ color: primaryColor }}>
                        ROOM: {addr.room_no}
                      </Text>
                    ) : null}
                    <Text className="text-xs text-muted-foreground mt-1 leading-snug">
                      {addr.address}
                    </Text>
                    <Text className="text-[9px] font-black text-muted-foreground mt-2">
                      🚢 JETTY: {addr.jetty}
                    </Text>
                    <Text className="text-[9px] text-muted-foreground mt-0.5">
                      📞 {addr.phone}
                    </Text>
                  </Pressable>
                );
              })}

              <View className="flex-row justify-between mt-2 gap-3">
                <Button
                  label="+ ADD ADDRESS"
                  variant="ghost"
                  onPress={() => router.push("/profile")}
                  className="flex-1 border border-white/10"
                />
                <Button
                  label="USE THIS ADDRESS"
                  onPress={() => {
                    if (!selectedAddress) { toast("Select an address.", "error"); return; }
                    setActiveStep(2);
                  }}
                  disabled={!selectedAddress}
                  className="flex-1"
                />
              </View>
            </View>
          ) : (
            <View className="py-10 items-center gap-4 border-2 border-dashed border-white/10 rounded-xl">
              <Text className="text-4xl">📍</Text>
              <Text className="text-sm font-bold text-muted-foreground text-center">
                No addresses found in your vault.
              </Text>
              <Button
                label="+ ADD IN PROFILE"
                variant="ghost"
                onPress={() => router.push("/profile")}
                className="border border-white/10"
              />
            </View>
          )}
        </StepCard>

        {/* ══ STEP 2: Payment Method ══════════════════════════════════ */}
        <StepCard
          stepNum={2}
          label="Payment Method"
          active={activeStep === 2}
          done={activeStep > 2}
          summary="Cash on Delivery"
          onEdit={() => activeStep > 2 ? setActiveStep(2) : undefined}
        >
          {/* COD is the only method (mirrors web) */}
          <View 
            className="border-2 rounded-xl p-5 flex-row items-center gap-4"
            style={{
              borderColor: primaryColor,
              backgroundColor: colors.primary + "0D"
            }}
          >
            <Text className="text-3xl">🚚</Text>
            <View className="flex-1">
              <Text className="font-black uppercase italic text-foreground">
                Cash on Delivery
              </Text>
              <Text className="text-xs text-muted-foreground mt-1">
                Handshake at the jetty upon trade fulfillment
              </Text>
            </View>
            <View className="w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: primaryColor }}>
              <Text className="text-[9px] text-foreground font-black">✓</Text>
            </View>
          </View>
          <View className="flex-row justify-end mt-4">
            <Button
              label="CONTINUE"
              onPress={() => setActiveStep(3)}
              className="min-w-[140px]"
            />
          </View>
        </StepCard>

        {/* ══ STEP 3: Review & Place Order ═══════════════════════════ */}
        <StepCard
          stepNum={3}
          label="Review Items & Shipping"
          active={activeStep === 3}
          done={false}
        >
          {/* Item list */}
          <View className="gap-3 mb-6">
            {items.map((item) => {
              const imgUri = resolveMediaUrl(item.image);
              return (
                <View
                  key={item.id}
                  className="flex-row gap-4 items-center p-3 rounded-xl border border-white/10 bg-secondary/30"
                >
                  <View className="w-14 h-14 rounded-lg overflow-hidden bg-secondary/50">
                    {imgUri ? (
                      <Image
                        source={{ uri: imgUri }}
                        className="w-full h-full"
                        contentFit="cover"
                      />
                    ) : (
                      <View className="flex-1 items-center justify-center">
                        <Text className="text-2xl">🐟</Text>
                      </View>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-xs font-black uppercase italic text-foreground"
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                    <Text className="text-[9px] font-black uppercase text-muted-foreground mt-0.5">
                      QTY: {item.quantity} KG
                    </Text>
                  </View>
                  <Text className="text-sm font-black italic text-foreground">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Order Total */}
          <View className="bg-secondary/40 border border-white/10 rounded-xl p-4 mb-6 gap-2">
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted-foreground">Subtotal</Text>
              <Text className="text-xs font-bold text-foreground">₹{subtotal.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted-foreground">Regulatory Tax (5%)</Text>
              <Text className="text-xs font-bold" style={{ color: primaryColor }}>₹{tax.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted-foreground">Shipping &amp; Handling</Text>
              <Text className="text-xs font-bold text-emerald-400">FREE</Text>
            </View>
            <View className="border-t border-white/10 pt-2 flex-row justify-between">
              <Text className="text-sm font-black uppercase text-foreground">Order Total</Text>
              <Text className="text-lg font-black italic" style={{ color: primaryColor }}>
                ₹{grandTotal.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Delivery summary */}
          {selectedAddress && (
            <View 
              className="border rounded-xl p-4 mb-6 gap-1"
              style={{
                backgroundColor: colors.primary + "0D",
                borderColor: colors.primary + "33"
              }}
            >
              <Text className="text-[8px] font-black uppercase tracking-widest mb-1" style={{ color: primaryColor }}>
                Delivering to
              </Text>
              <Text className="text-sm font-black text-foreground">
                {selectedAddress.hotel_name}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {selectedAddress.address}
              </Text>
              <Text className="text-[9px] text-muted-foreground mt-0.5">
                🚢 Jetty: {selectedAddress.jetty} · 📞 {selectedAddress.phone}
              </Text>
            </View>
          )}

          {/* Authorize finalize */}
          <View className="bg-secondary/40 border border-white/10 rounded-2xl p-6 items-center gap-4">
            <Text className="text-3xl">🛡️</Text>
            <Text className="text-[10px] font-black uppercase tracking-widest text-foreground italic text-center">
              Confirm Delivery Address
            </Text>
            <Text className="text-[10px] text-muted-foreground italic text-center leading-relaxed">
              By finalizing, you authorize the secure delivery of fresh seafood to your address.
            </Text>
            <Button
              label={isPlacing ? "PROCESSING..." : "PLACE ORDER"}
              onPress={handlePlaceOrder}
              disabled={isPlacing}
              className="w-full"
            />
            {isPlacing && <ActivityIndicator color={primaryColor} />}
          </View>
        </StepCard>
      </ScrollView>

      {/* ── Sticky bottom summary ───────────────────────────────────── */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-background/95 px-4 py-3">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            {items.length} item{items.length !== 1 ? "s" : ""} · COD
          </Text>
          <Text className="text-lg font-black italic text-foreground">
            ₹{grandTotal.toLocaleString()}
          </Text>
        </View>
        {activeStep === 3 ? (
          <Button
            label={isPlacing ? "PROCESSING..." : "PLACE YOUR ORDER"}
            onPress={handlePlaceOrder}
            disabled={isPlacing || !selectedAddress}
            className="w-full"
          />
        ) : (
          <View className="w-full py-3 rounded-xl border border-white/10 bg-secondary/40 items-center">
            <Text className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Complete steps above to place order
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StepCard — progressive disclosure container (mirrors Amazon-style accordion)
// ─────────────────────────────────────────────────────────────────────────────
interface StepCardProps {
  stepNum: Step;
  label: string;
  active: boolean;
  done: boolean;
  summary?: string;
  onEdit?: () => void;
  children?: React.ReactNode;
}

function StepCard({ stepNum, label, active, done, summary, onEdit, children }: StepCardProps) {
  const colors = useThemeColors();
  const primaryColor = colors.primary;

  return (
    <View
      className="rounded-2xl border overflow-hidden"
      style={{
        borderColor: active
          ? colors.primary + "66"
          : "rgba(255, 255, 255, 0.1)"
      }}
    >
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={{
          backgroundColor: active
            ? colors.primary + "0D"
            : "rgba(30, 41, 59, 0.3)"
        }}
      >
        <View className="flex-row items-center gap-3">
          <View
            className="w-6 h-6 rounded-full items-center justify-center"
            style={done ? {
              backgroundColor: "#10B981"
            } : active ? {
              backgroundColor: primaryColor
            } : {
              backgroundColor: "rgba(255, 255, 255, 0.1)"
            }}
          >
            {done ? (
              <Text className="text-[9px] font-black text-white">✓</Text>
            ) : (
              <Text
                className={cn(
                  "text-[9px] font-black",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {stepNum}
              </Text>
            )}
          </View>
          <Text
            className={cn(
              "text-sm font-black uppercase",
              active ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {label}
          </Text>
        </View>
        {done && onEdit && (
          <Pressable onPress={onEdit} className="px-2 py-1">
            <Text className="text-[9px] font-black uppercase" style={{ color: primaryColor }}>
              Change
            </Text>
          </Pressable>
        )}
      </View>

      {/* Collapsed summary */}
      {!active && done && summary ? (
        <View className="px-6 py-3 border-t border-white/5">
          <Text className="text-xs font-bold italic text-muted-foreground">
            {summary}
          </Text>
        </View>
      ) : null}

      {/* Expanded content */}
      {active ? (
        <View className="p-4 border-t border-white/5">{children}</View>
      ) : null}
    </View>
  );
}
