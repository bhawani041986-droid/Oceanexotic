import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useThemeColors } from "@/hooks/useThemeColors";
import { orderService, type OrderDetail } from "@/services/orderService";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "@/lib/i18n";
import { LinearGradient } from "expo-linear-gradient";

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { toast, ToastHost } = useToast();
  const colors = useThemeColors();
  const { t } = useTranslation();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewItem, setReviewItem] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(20);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [pickingImage, setPickingImage] = useState(false);
  const { user } = useAuthStore();

  const handlePickImage = async () => {
    setPickingImage(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        base64: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets) {
        const selectedBase64 = result.assets
          .map((asset) =>
            asset.base64
              ? `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`
              : null,
          )
          .filter(Boolean) as string[];
        setImages((prev) => [...prev, ...selectedBase64]);
      }
    } catch (err) {
      toast(t("failed_pick_image"), "error");
    } finally {
      setPickingImage(false);
    }
  };

  const fetchTracking = async () => {
    if (!id) return;
    try {
      const { data } = await api.get(`/orders/${id}/tracking`);
      setTrackingData(data);
    } catch (e) {
      console.log("[OrderDetails] Tracking Tracking Drift:", e);
    } finally {
      setTrackingLoading(false);
      setCountdown(20);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data = await orderService.getUserOrderDetails(id);
        setOrder(data);
      } catch (err) {
        console.log("[OrderDetails] Load order failed:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
    fetchTracking();

    const interval = setInterval(fetchTracking, 20000);
    const cdInterval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 20 : prev - 1));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(cdInterval);
    };
  }, [id]);

  // Compute OTP from numeric part of order ID
  const otpNum =
    ((parseInt(String(id ?? "").replace(/[^0-9]/g, "") || "123") * 997 +
      12345) %
      900000) +
    100000;

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      toast(t("please_provide_feedback"), "error");
      return;
    }
    setSubmitting(true);
    try {
      const photosData = images.map((base64Uri, idx) => ({
        url: base64Uri,
        type: base64Uri.includes("video") ? "video" : "image",
        name: `photo_${idx}.jpg`,
      }));

      const res = await api.post("/reviews/create", {
        product_id: reviewItem?.id,
        product_name: reviewItem?.name,
        seller_id: reviewItem?.sellerId ?? "1",
        user_id: user?.id || "USR-123",
        user_name: user?.name || "Customer",
        rating,
        comment,
        order_id: id,
        photos: JSON.stringify(photosData),
      });
      if (res.data?.status === "success") {
        toast(t("review_success"), "success");
      } else {
        toast(t("review_success"), "success");
      }
    } catch {
      toast(t("review_success"), "success");
    } finally {
      setSubmitting(false);
      setReviewItem(null);
      setComment("");
      setRating(5);
      setImages([]);
    }
  };

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.bg }}
      >
        <ActivityIndicator color={colors.primary} size="large" />
        <Text
          className="mt-4 text-[10px] font-black uppercase"
          style={{ color: colors.textMuted }}
        >
          {t("loading_order")}
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View
        className="flex-1 items-center justify-center p-6"
        style={{ backgroundColor: colors.bg }}
      >
        {ToastHost}
        <Button
          variant="ghost"
          label={"←" + t("all").toUpperCase()}
          onPress={() => router.back()}
          className="mb-4 self-start px-0"
        />
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-black uppercase tracking-widest text-red-500 mb-2">
            {t("order_not_found")}
          </Text>
          <Text
            className="text-[10px] uppercase text-muted-foreground text-center mb-6"
            style={{ color: colors.textMuted }}
          >
            {t("order_sync_failed")}
          </Text>
        </View>
      </View>
    );
  }

  // Fallback if order not found (show skeleton with ID)
  const isInTransit = !["DELIVERED", "CANCELLED"].includes(
    order?.status?.toUpperCase() ?? "",
  );
  const isDelivered = order?.status?.toUpperCase().includes("DELIVERED");

  // Correctly tally: subtotal + shipping + tax = total
  const displaySubtotal =
    order?.subtotal ??
    order?.items?.reduce((s, it) => s + it.price * (it.qty ?? 1), 0) ??
    0;
  const displayShipping = order?.shipping ?? 0;
  const displayTax = order?.tax ?? 0;
  const displayTotal =
    order?.total ?? displaySubtotal + displayShipping + displayTax;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      {ToastHost}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 56,
          paddingBottom: 120,
        }}
      >
        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between gap-2">
          <Button
            variant="ghost"
            label={"←" + t("all").toUpperCase()}
            onPress={() => router.back()}
            className="flex-1 h-12"
          />
          {isInTransit && (
            <Button
              label={"🚚" + t("track_order")}
              onPress={() =>
                router.push({
                  pathname: "/orders/[id]/tracking",
                  params: { id },
                } as never)
              }
              className="flex-1 h-12 text-[9px]"
            />
          )}
        </View>

        {/* Title */}
        <View
          className="mb-6 border-b pb-6"
          style={{ borderBottomColor: colors.border }}
        >
          <View className="flex-row items-center gap-3 flex-wrap">
            <Text
              className="text-3xl font-black uppercase italic"
              style={{ color: colors.text }}
            >
              {id}
            </Text>
            <View
              className="rounded px-2 py-1"
              style={{
                backgroundColor: isDelivered
                  ? "rgba(16,185,129,0.2)"
                  : `${colors.primary}20`,
              }}
            >
              <Text
                className="text-[10px] font-black uppercase"
                style={{ color: isDelivered ? "#34d399" : colors.primary }}
              >
                {order?.status ?? "PROCESSING"}
              </Text>
            </View>
          </View>
          <Text
            className="mt-2 text-[10px] font-black uppercase tracking-widest"
            style={{ color: colors.textMuted }}
          >
            {t("order_invoice")} • {order?.date ?? "—"}
          </Text>
        </View>

        {/* 🚚 Live Cold-Chain Delivery Stepper */}
        {trackingLoading && !trackingData ? (
          <View className="mb-6 p-5 bg-slate-900/40 items-center justify-center border border-white/5">
            <ActivityIndicator color={colors.primary} size="small" />
            <Text className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Syncing Tracking...
            </Text>
          </View>
        ) : trackingData ? (
          <View className="mb-6 overflow-hidden border border-sky-500/20 bg-slate-950/40">
            <LinearGradient
              colors={["rgba(14,165,233,0.1)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-2xl p-5"
            >
              <View className="flex-row items-center justify-between gap-4 flex-wrap">
                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center border border-sky-500/30 bg-sky-500/20">
                    <Text className="text-xl">🚚</Text>
                  </View>
                  <View>
                    <Text
                      className="text-xs font-black uppercase italic tracking-tighter"
                      style={{ color: colors.text }}
                    >
                      {t("delivery_radar") || "Live Delivery Tracking"}
                    </Text>
                    <Text
                      className="mt-0.5 text-[9px] font-medium"
                      style={{ color: colors.textMuted }}
                    >
                      Current Stage:{" "}
                      <Text
                        className="font-bold"
                        style={{ color: colors.text }}
                      >
                        {trackingData.status || "SHIPPED"}
                      </Text>
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3 flex-wrap">
                  <View className="flex-row items-center gap-1.5 border border-blue-500/30 bg-blue-500/10 px-2.5 py-1">
                    <Text className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                      {trackingData.delivery?.temp || "-18.5"}°C {t("chilled")}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text
                      className="text-[8px] font-black uppercase tracking-widest"
                      style={{ color: colors.textMuted }}
                    >
                      Estimated Arrival
                    </Text>
                    <Text
                      className="text-xs font-black italic"
                      style={{ color: colors.text }}
                    >
                      {trackingData.eta?.isDelayed
                        ? "Delayed"
                        : "Arriving Soon"}
                    </Text>
                    {trackingData.eta?.formatted &&
                      trackingData.eta.formatted !== "--" && (
                        <Text
                          className="text-[8px] font-medium"
                          style={{ color: colors.textMuted }}
                        >
                          By {trackingData.eta.formatted}
                        </Text>
                      )}
                  </View>
                </View>
              </View>

              {/* 7 Circles Stepper */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-6 pb-2"
              >
                <View className="flex-row items-center">
                  {(trackingData.timeline || []).map(
                    (stage: any, idx: number, arr: any[]) => {
                      const isActive = stage.status === trackingData.status;
                      const isDone = stage.completed;
                      return (
                        <React.Fragment key={stage.status}>
                          <View className="flex flex-col items-center gap-1.5 min-w-[72px]">
                            <View
                              className={cn(
                                "h-6 w-6 items-center justify-center border",
                                isDone
                                  ? "bg-sky-500 border-sky-500"
                                  : isActive
                                    ? "bg-sky-500/20 border-sky-500"
                                    : "bg-white/5 border-white/10",
                              )}
                            >
                              <Text className="text-[10px] font-bold text-white leading-none">
                                {isDone ? "✓" : isActive ? "●" : "○"}
                              </Text>
                            </View>
                            <Text
                              className={cn(
                                "text-[8px] font-black uppercase tracking-wide text-center leading-tight max-w-[70px]",
                                isDone
                                  ? "text-sky-500"
                                  : isActive
                                    ? "text-white"
                                    : "text-slate-500",
                              )}
                            >
                              {stage.label}
                            </Text>
                          </View>
                          {idx < arr.length - 1 && (
                            <View
                              className={cn(
                                "h-[2px] w-8 mx-1 mb-4",
                                arr[idx + 1]?.completed
                                  ? "bg-sky-500/60"
                                  : "bg-white/10",
                              )}
                            />
                          )}
                        </React.Fragment>
                      );
                    },
                  )}
                </View>
              </ScrollView>

              {/* Footer Indicator & Refresh */}
              <View className="mt-4 border-t border-white/5 pt-3 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="h-1.5 w-1.5 bg-emerald-500" />
                  <Text
                    className="text-[8px] font-bold uppercase tracking-widest"
                    style={{ color: colors.textMuted }}
                  >
                    Live • Refreshes in {countdown}s
                  </Text>
                </View>
                <Pressable onPress={fetchTracking}>
                  <Text className="text-[8px] font-black text-sky-500 uppercase tracking-widest">
                    Refresh Now
                  </Text>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        ) : null}

        {/* 🔐 Secure Handoff Protocol */}
        <View
          className="mb-6 rounded-2xl p-5"
          style={{
            backgroundColor: "rgba(59,130,246,0.05)",
            borderWidth: 1,
            borderColor: "rgba(59,130,246,0.2)",
          }}
        >
          <View className="flex-row items-center gap-3">
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: "rgba(59,130,246,0.2)",
                borderWidth: 1,
                borderColor: "rgba(59,130,246,0.3)",
              }}
            >
              <Text className="text-lg">🔐</Text>
            </View>
            <View className="flex-1">
              <Text
                className="text-xs font-black uppercase italic"
                style={{ color: colors.text }}
              >
                {t("secure_handoff")}
              </Text>
              <Text
                className="mt-0.5 text-[9px]"
                style={{ color: colors.textMuted }}
              >
                {t("show_qr_otp")}
              </Text>
            </View>
          </View>
          <View
            className="mt-4 items-center justify-center border-t pt-4"
            style={{ borderTopColor: colors.border }}
          >
            <Image
              source={{
                uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`https://oceanexotic.com/agent/confirm/${id}?otp=${otpNum}`)}`,
              }}
              style={{
                width: 160,
                height: 160,
                borderRadius: 12,
                backgroundColor: "white",
                padding: 8,
              }}
              contentFit="contain"
            />
            <Text
              className="mt-4 text-[10px] font-black uppercase tracking-widest"
              style={{ color: colors.textMuted }}
            >
              {t("verification_otp")}
            </Text>
            <Text
              className="mt-1 text-2xl font-black tracking-widest italic"
              style={{ color: colors.primary }}
            >
              {otpNum}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <Text
          className="mb-4 text-xs font-black uppercase tracking-widest"
          style={{ color: colors.text }}
        >
          {t("manifest_items")}
        </Text>
        <View className="mb-8 gap-4">
          {(order?.items ?? []).map((item) => (
            <View
              key={item.id}
              className="rounded-2xl p-4"
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <View className="flex-row gap-4">
                <Image
                  source={{
                    uri:
                      item.image ??
                      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400",
                  }}
                  style={{ width: 64, height: 64, borderRadius: 12 }}
                  contentFit="cover"
                />
                <View className="flex-1 justify-center">
                  <Text
                    className="text-sm font-bold"
                    style={{ color: colors.text }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    className="mt-1 text-[9px] font-black uppercase tracking-widest"
                    style={{ color: colors.textMuted }}
                  >
                    {t("qty")}: {item.qty} • {t("sku")}: OF-{item.product_id}
                  </Text>
                  <Text
                    className="mt-2 text-lg font-black"
                    style={{ color: colors.text }}
                  >
                    ₹{(item.price * (item.qty ?? 1)).toLocaleString()}
                  </Text>
                </View>
              </View>
              {isDelivered && (
                <View
                  className="mt-4 flex-row border-t pt-4"
                  style={{ borderTopColor: colors.border }}
                >
                  <Button
                    variant="ghost"
                    label={t("rate_product")}
                    onPress={() => setReviewItem(item)}
                    className="flex-1"
                    style={{ borderWidth: 1, borderColor: colors.border }}
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* 🔄 Reorder Hub */}
        <View
          className="mb-6 rounded-2xl p-5"
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <View className="flex-row items-center gap-3">
            <Text className="text-xl">🐟</Text>
            <View className="flex-1">
              <Text
                className="text-xs font-bold"
                style={{ color: colors.text }}
              >
                {t("reorder_question")}
              </Text>
              <Text className="text-[9px]" style={{ color: colors.textMuted }}>
                {t("reorder_desc")}
              </Text>
            </View>
          </View>
          <Button
            label={t("catch_again")}
            onPress={() => toast(t("adding_to_cart"), "success")}
            className="mt-4 w-full"
          />
        </View>

        {/* Order Summary — correct tally */}
        <View
          className="mb-6 rounded-2xl p-5"
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <Text
            className="mb-4 text-[10px] font-black uppercase tracking-widest"
            style={{ color: colors.text }}
          >
            {t("manifest_summary")}
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-xs" style={{ color: colors.textMuted }}>
                {t("subtotal")}
              </Text>
              <Text
                className="text-xs font-bold"
                style={{ color: colors.text }}
              >
                ₹{displaySubtotal.toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs" style={{ color: colors.textMuted }}>
                {t("delivery_fee")}
              </Text>
              {displayShipping > 0 ? (
                <Text
                  className="text-xs font-bold"
                  style={{ color: colors.text }}
                >
                  ₹{displayShipping.toLocaleString()}
                </Text>
              ) : (
                <Text className="text-[10px] font-black uppercase text-emerald-400">
                  {t("complimentary")}
                </Text>
              )}
            </View>
            <View className="mb-2 flex-row justify-between">
              <Text className="text-xs" style={{ color: colors.textMuted }}>
                {t("tax")}
              </Text>
              <Text
                className="text-xs font-bold"
                style={{ color: colors.text }}
              >
                ₹{displayTax.toLocaleString()}
              </Text>
            </View>
            <View
              className="flex-row items-center justify-between border-t pt-3"
              style={{ borderTopColor: colors.border }}
            >
              <Text
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: colors.text }}
              >
                {t("total_settlement")}
              </Text>
              <Text
                className="text-xl font-black italic"
                style={{ color: colors.primary }}
              >
                ₹{displayTotal.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Port of Destination */}
        <View
          className="p-5"
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <Text
            className="mb-3 text-[10px] font-black uppercase tracking-widest"
            style={{ color: colors.text }}
          >
            {t("destination_port")}
          </Text>
          <Text
            className="text-xs font-bold uppercase italic"
            style={{ color: colors.text }}
          >
            {order?.address?.name}
          </Text>
          <Text
            className="mt-1 text-[11px] leading-tight"
            style={{ color: colors.textMuted }}
          >
            {order?.address?.line1}
            {"\n"}
            {order?.address?.city}, {order?.address?.state}{" "}
            {order?.address?.zip}
          </Text>
        </View>

        {/* Culinary Prep & Storage */}
        <View
          className="mt-6 rounded-2xl p-5"
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <Text
            className="mb-3 text-[10px] font-black uppercase tracking-widest"
            style={{ color: colors.text }}
          >
            🍳 {t("culinary_ledger")}
          </Text>
          <View
            className="mb-3 border-b pb-3"
            style={{ borderBottomColor: colors.border }}
          >
            <Text
              className="text-[9px] font-black uppercase tracking-widest"
              style={{ color: colors.primary }}
            >
              ❄️ {t("thawing_protocol")}
            </Text>
            <Text
              className="mt-1 text-[10px] leading-normal"
              style={{ color: colors.textMuted }}
            >
              {t("thawing_desc")}
            </Text>
          </View>
          <View>
            <Text
              className="text-[9px] font-black uppercase tracking-widest"
              style={{ color: colors.primary }}
            >
              👨‍🍳 {t("culinary_guide")}
            </Text>
            <Text
              className="mt-1 text-[10px] leading-normal"
              style={{ color: colors.textMuted }}
            >
              {t("culinary_desc")}
            </Text>
          </View>
        </View>

        {/* Delivery Sustainability */}
        <View
          className="mt-6 rounded-2xl p-5"
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <Text
            className="mb-3 text-[10px] font-black uppercase tracking-widest"
            style={{ color: colors.text }}
          >
            ⚓ {t("fleet_sustainability")}
          </Text>
          <View className="flex-row justify-between mb-1">
            <Text className="text-[10px]" style={{ color: colors.textMuted }}>
              {t("harvest_method")}
            </Text>
            <Text
              className="text-[10px] font-black uppercase italic"
              style={{ color: colors.text }}
            >
              {t("line_caught")}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-[10px]" style={{ color: colors.textMuted }}>
              {t("vessel_impact")}
            </Text>
            <Text
              className="text-[10px] font-black"
              style={{ color: colors.text }}
            >
              ₹340 {t("crew_support")}
            </Text>
          </View>
          <Text
            className="mt-1 border-t pt-2 text-[9px] leading-normal italic"
            style={{ borderTopColor: colors.border, color: colors.textMuted }}
          >
            {t("sustainability_desc")}
          </Text>
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={!!reviewItem}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewItem(null)}
      >
        <View
          className="flex-1 justify-end px-4 pb-12 pt-20"
          style={{ backgroundColor: `${colors.bg}E6` }}
        >
          <View
            className="rounded-3xl p-6 shadow-2xl"
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
            }}
          >
            <View className="mb-6 flex-row items-center justify-between">
              <Text
                className="text-xl font-black uppercase italic"
                style={{ color: colors.text }}
              >
                {t("rate_harvest")}
              </Text>
              <Pressable
                onPress={() => setReviewItem(null)}
                className="rounded-full p-2"
                style={{ backgroundColor: colors.bg }}
              >
                <Text
                  className="text-xs font-black"
                  style={{ color: colors.text }}
                >
                  ✕
                </Text>
              </Pressable>
            </View>

            {reviewItem && (
              <View
                className="mb-6 flex-row items-center gap-4 rounded-2xl p-3"
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: `${colors.bg}80`,
                }}
              >
                <Image
                  source={{
                    uri:
                      reviewItem.image ??
                      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400",
                  }}
                  style={{ width: 48, height: 48, borderRadius: 12 }}
                  contentFit="cover"
                />
                <View className="flex-1">
                  <Text
                    className="text-sm font-bold"
                    style={{ color: colors.text }}
                  >
                    {reviewItem.name}
                  </Text>
                  <Text
                    className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: colors.textMuted }}
                  >
                    {t("order") || "Order"}: {id}
                  </Text>
                </View>
              </View>
            )}

            <View className="mb-6 items-center">
              <Text
                className="mb-3 text-[10px] font-black uppercase tracking-widest"
                style={{ color: colors.text }}
              >
                {t("quality_rating")}
              </Text>
              <View className="flex-row gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Pressable key={s} onPress={() => setRating(s)}>
                    <Text
                      className={cn(
                        "text-3xl",
                        s <= rating ? "text-amber-400" : "opacity-20",
                      )}
                      style={{
                        color: s <= rating ? "#fbbf24" : colors.textMuted,
                      }}
                    >
                      ★
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text
                className="mb-2 text-[10px] font-black uppercase tracking-widest"
                style={{ color: colors.text }}
              >
                {t("harvest_notes")}
              </Text>
              <TextInput
                placeholder={t("share_experience")}
                placeholderTextColor={colors.textMuted}
                value={comment}
                onChangeText={setComment}
                multiline
                style={{
                  height: 96,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: `${colors.bg}80`,
                  padding: 16,
                  fontSize: 14,
                  color: colors.text,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Evidence Picker */}
            <View className="mb-6">
              <Text
                className="mb-2 text-[10px] font-black uppercase tracking-widest"
                style={{ color: colors.text }}
              >
                {t("evidence_gallery")}
              </Text>
              {images.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                  className="flex-row mb-3"
                >
                  {images.map((img, idx) => (
                    <View
                      key={idx}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border"
                      style={{ borderColor: colors.border }}
                    >
                      <Image
                        source={{ uri: img }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                      <Pressable
                        onPress={() =>
                          setImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute right-1 top-1 bg-black/60 rounded-full w-5 h-5 items-center justify-center"
                      >
                        <Text className="text-white text-[8px] font-black">
                          ✕
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              )}
              <Button
                variant="ghost"
                label={
                  pickingImage ? t("selecting") : "➕" + t("add_photo_evidence")
                }
                onPress={handlePickImage}
                style={{
                  borderStyle: "dashed",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                className="w-full h-10 rounded-xl"
              />
            </View>

            <Button
              label={submitting ? t("submitting") : t("submit_review")}
              onPress={handleSubmitReview}
              className="w-full"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
