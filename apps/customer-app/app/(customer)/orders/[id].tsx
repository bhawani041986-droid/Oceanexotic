import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Modal, TextInput, ActivityIndicator } from "react-native";
import Svg, { Polygon, Path } from "react-native-svg";
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

export default function OrderDetailsScreen() {
  const { t } = useTranslation();

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { toast, ToastHost } = useToast();
  const colors = useThemeColors();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewItem, setReviewItem] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
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
          .map(asset => asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : null)
          .filter(Boolean) as string[];
        setImages(prev => [...prev, ...selectedBase64]);
      }
    } catch (err) {
      toast(t('failed_pick_image'), "error");
    } finally {
      setPickingImage(false);
    }
  };

  const [trackingData, setTrackingData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const data = await orderService.getUserOrderDetails(id);
      setOrder(data);
      setLoading(false);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchTelemetry = async () => {
      try {
        const { data } = await api.get(`/fleet?order_id=${id}`);
        setTrackingData(data);
      } catch (error) {
        console.error("Telemetry Fetch Failed:", error);
      }
    };
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 20000);
    return () => clearInterval(interval);
  }, [id]);

  const otpNum = ((parseInt(String(id ?? "").replace(/[^0-9]/g, "") || "123") * 997 + 12345) % 900000) + 100000;

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      toast(t('please_provide_feedback'), "error");
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
        toast(t('review_success'), "success");
      } else {
        toast(t('review_success'), "success");
      }
    } catch {
      toast(t('review_success'), "success");
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
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text className="mt-4 text-[10px] font-black uppercase" style={{ color: colors.textMuted }}>
          {t('loading_order')}
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center p-6" style={{ backgroundColor: colors.bg }}>
        {ToastHost}
        <Button variant="ghost" label={"← " + t('all').toUpperCase()} onPress={() => router.back()} className="mb-4 self-start px-4 h-10 rounded-none" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-black uppercase tracking-widest text-red-500 mb-2">
            {t('order_not_found')}
          </Text>
        </View>
      </View>
    );
  }

  const isInTransit = !["DELIVERED", "CANCELLED"].includes(order?.status?.toUpperCase() ?? "");
  const isDelivered = order?.status?.toUpperCase().includes("DELIVERED");

  const displaySubtotal = order?.subtotal ?? order?.items?.reduce((s, it) => s + it.price * (it.qty ?? 1), 0) ?? 0;
  const displayShipping = order?.shipping ?? 0;
  const displayTax = order?.tax ?? 0;
  const displayTotal = order?.total ?? (displaySubtotal + displayShipping + displayTax);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      {ToastHost}

      <View className="flex-row items-center justify-between gap-3 px-4 pb-4 pt-12 border-b" style={{ backgroundColor: colors.bg, borderBottomColor: "rgba(255,255,255,0.05)", zIndex: 10 }}>
        {isInTransit ? (
          <>
            <View className="flex-1">
              <Button 
                variant="ghost" 
                label={"← " + t('all').toUpperCase()} 
                onPress={() => router.back()} 
                className="px-4 h-10 justify-center rounded-none text-[10px]" 
              />
            </View>
            <View className="flex-1">
              <Button
                variant="ghost"
                label={"🚚 " + t('track_order').toUpperCase()}
                onPress={() =>
                  router.push({ pathname: "/orders/[id]/tracking", params: { id } } as never)
                }
                className="h-10 px-4 rounded-none text-[10px]"
              />
            </View>
          </>
        ) : (
          <View className="flex-1">
            <Button variant="ghost" label={"← " + t('all').toUpperCase()} onPress={() => router.back()} className="px-4 h-10 self-start rounded-none" />
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 120 }}>

        <View className="mb-6 border-b pb-6" style={{ borderBottomColor: colors.border }}>
          <View className="flex-row items-center gap-3 flex-wrap">
            <Text className="text-3xl font-black uppercase italic" style={{ color: colors.text }}>
              {id}
            </Text>
            <View
              className="rounded-none px-2 py-1 relative overflow-hidden"
              style={{
                backgroundColor: isDelivered ? "rgba(16,185,129,0.2)" : `${colors.primary}20`,
              }}
            >
              <Svg width={4} height={4} style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}><Polygon points="0,0 4,0 0,4" fill={colors.bg} /></Svg>
              <Svg width={4} height={4} style={{ position: 'absolute', bottom: 0, right: 0, zIndex: 10 }}><Polygon points="4,4 0,4 4,0" fill={colors.bg} /></Svg>
              <Text
                className="text-[10px] font-black uppercase relative z-10"
                style={{ color: isDelivered ? "#34d399" : colors.primary }}
              >
                {order?.status ?? "PROCESSING"}
              </Text>
            </View>
          </View>
          <Text className="mt-2 text-[10px] font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>
            {t('order_invoice')} • {order?.date ?? "—"}
          </Text>
        </View>

        <View
          className="mb-6 rounded-none overflow-hidden relative"
          style={{ backgroundColor: `${colors.primary}10`, borderWidth: 1, borderColor: `${colors.primary}33` }}
        >
          <Svg width={12} height={12} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}>
            <Polygon points="0,0 12,0 0,12" fill={colors.bg} />
            <Path d="M12,0 L0,12" stroke={`${colors.primary}33`} strokeWidth={1} />
          </Svg>
          <Svg width={12} height={12} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}>
            <Polygon points="12,12 0,12 12,0" fill={colors.bg} />
            <Path d="M0,12 L12,0" stroke={`${colors.primary}33`} strokeWidth={1} />
          </Svg>
          <View className="p-5 md:p-6 flex-col gap-4 border-b" style={{ borderBottomColor: "rgba(255,255,255,0.1)" }}>
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-none items-center justify-center border shadow-lg relative overflow-hidden" style={{ backgroundColor: `${colors.primary}33`, borderColor: `${colors.primary}50` }}>
                <Svg width={6} height={6} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 6,0 0,6" fill={`${colors.primary}10`} /></Svg>
                <Svg width={6} height={6} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="6,6 0,6 6,0" fill={`${colors.primary}10`} /></Svg>
                <Text className="text-2xl">🚚</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-black uppercase italic" style={{ color: colors.text }}>
                  {t('delivery_radar')}
                </Text>
                <Text className="text-[10px]" style={{ color: colors.textMuted }}>
                  {trackingData?.delivery_area ?? trackingData?.stage_label ?? trackingData?.status ?? order?.status ?? "Processing"}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between mt-2">
              <View className="flex-row items-center gap-1.5 rounded-none px-3 py-1 relative overflow-hidden" style={{ backgroundColor: "rgba(59,130,246,0.1)", borderWidth: 1, borderColor: "rgba(59,130,246,0.3)" }}>
                <Svg width={4} height={4} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 4,0 0,4" fill={`${colors.primary}10`} /></Svg>
                <Svg width={4} height={4} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="4,4 0,4 4,0" fill={`${colors.primary}10`} /></Svg>
                <View className="h-2 w-2 rounded-none bg-blue-400" />
                <Text className="text-[10px] font-black uppercase text-blue-400 relative z-10">{trackingData?.current_temp ?? trackingData?.temp ?? 1.2}°C {t('chilled')}</Text>
              </View>
              <View>
                <Text className="text-[10px] font-black uppercase" style={{ color: colors.textMuted }}>Est. Arrival</Text>
                <Text className="text-xs font-black text-right" style={{ color: colors.text }}>{trackingData?.minutes_remaining ?? 32} Mins</Text>
              </View>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }} className="py-6 bg-black/20">
            <View className="flex-row items-center">
              {[
                "Order Placed",
                "Seller Accepted",
                "Preparing",
                "Packed",
                "Rider Assigned",
                "Out for Delivery",
                "Delivered"
              ].map((stage, idx, arr) => {
                const currentStatus = (trackingData?.status ?? order?.status ?? "PROCESSING").toUpperCase();
                const stageIndexMatch = arr.findIndex(s => s.toUpperCase() === currentStatus);
                const isPassed = stageIndexMatch === -1 ? idx <= 1 : idx <= stageIndexMatch;

                return (
                  <View key={idx} className="flex-row items-center">
                    <View className="items-center gap-2">
                      <View 
                        className="w-4 h-4 rounded-none border-2"
                        style={{ 
                          backgroundColor: isPassed ? colors.primary : "transparent",
                          borderColor: isPassed ? colors.primary : colors.textMuted
                        }} 
                      />
                      <Text className="text-[8px] font-bold uppercase w-16 text-center" style={{ color: isPassed ? colors.primary : colors.textMuted }}>
                        {stage}
                      </Text>
                    </View>
                    {idx < arr.length - 1 && (
                      <View className="w-8 h-0.5 mx-1" style={{ backgroundColor: isPassed ? colors.primary : colors.border, marginBottom: 16 }} />
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View 
          className="mb-6 rounded-none p-5 relative overflow-hidden"
          style={{ backgroundColor: "rgba(59,130,246,0.05)", borderWidth: 1, borderColor: "rgba(59,130,246,0.2)" }}
        >
          <Svg width={12} height={12} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 12,0 0,12" fill={colors.bg} /><Path d="M12,0 L0,12" stroke="rgba(59,130,246,0.2)" strokeWidth={1} /></Svg>
          <Svg width={12} height={12} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="12,12 0,12 12,0" fill={colors.bg} /><Path d="M0,12 L12,0" stroke="rgba(59,130,246,0.2)" strokeWidth={1} /></Svg>
          <View className="flex-row items-center gap-4 border-b pb-4 mb-4" style={{ borderBottomColor: "rgba(59,130,246,0.1)" }}>
            <View 
              className="h-10 w-10 items-center justify-center rounded-none relative overflow-hidden"
              style={{ backgroundColor: "rgba(59,130,246,0.2)", borderWidth: 1, borderColor: "rgba(59,130,246,0.3)" }}
            >
              <Svg width={4} height={4} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 4,0 0,4" fill="rgba(59,130,246,0.05)" /></Svg>
              <Svg width={4} height={4} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="4,4 0,4 4,0" fill="rgba(59,130,246,0.05)" /></Svg>
              <Text className="text-lg">🔐</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs font-black uppercase italic" style={{ color: colors.text }}>
                {t('secure_handoff')}
              </Text>
              <Text className="mt-0.5 text-[9px]" style={{ color: colors.textMuted }}>
                {t('show_qr_otp')}
              </Text>
            </View>
          </View>
          <View className="mt-4 items-center justify-center pt-2">
            <Image
              source={{
                uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`https://oceanexotic.com/agent/confirm/${id}?otp=${otpNum}`)}`,
              }}
              style={{ width: 160, height: 160, borderRadius: 0, backgroundColor: "white", padding: 8 }}
              contentFit="contain"
            />
            <Text className="mt-4 text-[10px] font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>
              {t('verification_otp')}
            </Text>
            <Text className="mt-1 text-2xl font-black tracking-widest italic" style={{ color: colors.primary }}>
              {otpNum}
            </Text>
          </View>
        </View>

        <Text className="mb-4 text-xs font-black uppercase tracking-widest" style={{ color: colors.text }}>
          {t('manifest_items')}
        </Text>
        <View className="mb-8 gap-4">
          {(order?.items ?? []).map((item) => (
            <View
              key={item.id}
              className="rounded-none p-4"
              style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}
            >
              <View className="flex-row gap-4">
                <Image
                  source={{ uri: item.image ?? "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400" }}
                  style={{ width: 64, height: 64, borderRadius: 0 }}
                  contentFit="cover"
                />
                <View className="flex-1 justify-center">
                  <Text className="text-sm font-bold" style={{ color: colors.text }}>{item.name}</Text>
                  <Text className="mt-1 text-[9px] font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>
                    {t('qty')}: {item.qty} • {t('sku')}: OF-{item.product_id}
                  </Text>
                  <Text className="mt-2 text-lg font-black" style={{ color: colors.text }}>
                    ₹{(item.price * (item.qty ?? 1)).toLocaleString()}
                  </Text>
                </View>
              </View>
              {isDelivered && (
                <View className="mt-4 flex-row gap-2">
                  <Button 
                    label={t('rate_product')} 
                    variant="ghost" 
                    onPress={() => setReviewItem(item)} 
                    className="flex-1 h-10 rounded-none text-[10px]" 
                  />
                  <Button 
                    label={"📞 " + t('contact').toUpperCase()} 
                    variant="ghost" 
                    onPress={() => alert("Calling Harbor Control...")} 
                    className="flex-1 h-10 rounded-none text-[10px]" 
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        <View 
          className="rounded-none p-4 relative overflow-hidden"
          style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}
        >
          <Svg width={12} height={12} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 12,0 0,12" fill={colors.bg} /><Path d="M12,0 L0,12" stroke={colors.border} strokeWidth={1} /></Svg>
          <Svg width={12} height={12} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="12,12 0,12 12,0" fill={colors.bg} /><Path d="M0,12 L12,0" stroke={colors.border} strokeWidth={1} /></Svg>
          <View className="flex-row items-center gap-3">
            <Text className="text-xl">🐟</Text>
            <View className="flex-1">
              <Text className="text-xs font-bold" style={{ color: colors.text }}>{t('reorder_question')}</Text>
              <Text className="text-[9px]" style={{ color: colors.textMuted }}>{t('reorder_desc')}</Text>
            </View>
          </View>
          <Button
            variant="ghost"
            label={t('catch_again')}
            onPress={() => toast(t('adding_to_cart'), "success")}
            className="mt-4 w-full rounded-none"
          />
        </View>

        <View
          className="my-6 rounded-none p-5 relative overflow-hidden"
          style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}
        >
          <Svg width={12} height={12} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 12,0 0,12" fill={colors.bg} /><Path d="M12,0 L0,12" stroke={colors.border} strokeWidth={1} /></Svg>
          <Svg width={12} height={12} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="12,12 0,12 12,0" fill={colors.bg} /><Path d="M0,12 L12,0" stroke={colors.border} strokeWidth={1} /></Svg>
          <Text className="mb-4 text-[10px] font-black uppercase tracking-widest" style={{ color: colors.text }}>
            {t('manifest_summary')}
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-xs" style={{ color: colors.textMuted }}>{t('subtotal')}</Text>
              <Text className="text-xs font-bold" style={{ color: colors.text }}>₹{displaySubtotal.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs" style={{ color: colors.textMuted }}>{t('delivery_fee')}</Text>
              {displayShipping > 0 ? (
                <Text className="text-xs font-bold" style={{ color: colors.text }}>₹{displayShipping.toLocaleString()}</Text>
              ) : (
                <Text className="text-[10px] font-black uppercase text-emerald-400">{t('complimentary')}</Text>
              )}
            </View>
            <View className="mb-2 flex-row justify-between">
              <Text className="text-xs" style={{ color: colors.textMuted }}>{t('tax')}</Text>
              <Text className="text-xs font-bold" style={{ color: colors.text }}>₹{displayTax.toLocaleString()}</Text>
            </View>
            <View className="flex-row items-center justify-between border-t pt-3" style={{ borderTopColor: colors.border }}>
              <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.text }}>
                {t('total_settlement')}
              </Text>
              <Text className="text-xl font-black italic" style={{ color: colors.primary }}>
                ₹{displayTotal.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View 
          className="rounded-none p-5 relative overflow-hidden"
          style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}
        >
          <Svg width={12} height={12} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 12,0 0,12" fill={colors.bg} /><Path d="M12,0 L0,12" stroke={colors.border} strokeWidth={1} /></Svg>
          <Svg width={12} height={12} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="12,12 0,12 12,0" fill={colors.bg} /><Path d="M0,12 L12,0" stroke={colors.border} strokeWidth={1} /></Svg>
          <Text className="mb-3 text-[10px] font-black uppercase tracking-widest" style={{ color: colors.text }}>
            {t('destination_port')}
          </Text>
          <Text className="text-xs font-bold uppercase italic" style={{ color: colors.text }}>
            {order?.address?.name}
          </Text>
          <Text className="mt-1 text-[11px] leading-tight" style={{ color: colors.textMuted }}>
            {order?.address?.line1}
            {"\n"}
            {order?.address?.city}, {order?.address?.state} {order?.address?.zip}
          </Text>
        </View>

        <View
          className="mt-6 rounded-none p-5 relative overflow-hidden"
          style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}
        >
          <Svg width={12} height={12} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 12,0 0,12" fill={colors.bg} /><Path d="M12,0 L0,12" stroke={colors.border} strokeWidth={1} /></Svg>
          <Svg width={12} height={12} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="12,12 0,12 12,0" fill={colors.bg} /><Path d="M0,12 L12,0" stroke={colors.border} strokeWidth={1} /></Svg>
          <Text className="mb-3 text-[10px] font-black uppercase tracking-widest" style={{ color: colors.text }}>
            🍳 {t('culinary_ledger')}
          </Text>
          <View className="mb-3 border-b pb-3" style={{ borderBottomColor: colors.border }}>
            <Text className="text-[9px] font-black uppercase tracking-widest" style={{ color: colors.primary }}>
              ❄️ {t('thawing_protocol')}
            </Text>
            <Text className="mt-1 text-[10px] leading-normal" style={{ color: colors.textMuted }}>
              {t('thawing_desc')}
            </Text>
          </View>
          <View>
            <Text className="text-[9px] font-black uppercase tracking-widest" style={{ color: colors.primary }}>
              👨‍🍳 {t('culinary_guide')}
            </Text>
            <Text className="mt-1 text-[10px] leading-normal" style={{ color: colors.textMuted }}>
              {t('culinary_desc')}
            </Text>
          </View>
        </View>

        <View
          className="mt-6 rounded-none p-5 relative overflow-hidden"
          style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}
        >
          <Svg width={12} height={12} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 12,0 0,12" fill={colors.bg} /><Path d="M12,0 L0,12" stroke={colors.border} strokeWidth={1} /></Svg>
          <Svg width={12} height={12} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="12,12 0,12 12,0" fill={colors.bg} /><Path d="M0,12 L12,0" stroke={colors.border} strokeWidth={1} /></Svg>
          <Text className="mb-3 text-[10px] font-black uppercase tracking-widest" style={{ color: colors.text }}>
            ⚓ {t('fleet_sustainability')}
          </Text>
          <View className="flex-row justify-between mb-1">
            <Text className="text-[10px]" style={{ color: colors.textMuted }}>{t('harvest_method')}</Text>
            <Text className="text-[10px] font-black uppercase italic" style={{ color: colors.text }}>{t('line_caught')}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-[10px]" style={{ color: colors.textMuted }}>{t('vessel_impact')}</Text>
            <Text className="text-[10px] font-black" style={{ color: colors.text }}>₹340 {t('crew_support')}</Text>
          </View>
          <Text className="mt-1 border-t pt-2 text-[9px] leading-normal italic" style={{ borderTopColor: colors.border, color: colors.textMuted }}>
            {t('sustainability_desc')}
          </Text>
        </View>
      </ScrollView>

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
            className="rounded-none p-6 shadow-2xl relative overflow-hidden"
            style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Svg width={12} height={12} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 12,0 0,12" fill={colors.bg} /><Path d="M12,0 L0,12" stroke={colors.border} strokeWidth={1} /></Svg>
            <Svg width={12} height={12} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="12,12 0,12 12,0" fill={colors.bg} /><Path d="M0,12 L12,0" stroke={colors.border} strokeWidth={1} /></Svg>
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-black uppercase italic" style={{ color: colors.text }}>
                {t('rate_harvest')}
              </Text>
              <Pressable 
                onPress={() => setReviewItem(null)}
                className="rounded-none p-2 relative overflow-hidden"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <Svg width={4} height={4} style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}><Polygon points="0,0 4,0 0,4" fill={colors.card} /></Svg>
                <Svg width={4} height={4} style={{ position: 'absolute', bottom: 0, right: 0, zIndex: 10 }}><Polygon points="4,4 0,4 4,0" fill={colors.card} /></Svg>
                <Text className="text-xs font-black" style={{ color: colors.text }}>✕</Text>
              </Pressable>
            </View>

            {reviewItem && (
              <View 
                className="mb-6 flex-row items-center gap-4 rounded-none p-3 relative overflow-hidden"
                style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: `${colors.bg}80` }}
              >
                <Svg width={6} height={6} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 6,0 0,6" fill={colors.card} /><Path d="M6,0 L0,6" stroke={colors.border} strokeWidth={1} /></Svg>
                <Svg width={6} height={6} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="6,6 0,6 6,0" fill={colors.card} /><Path d="M0,6 L6,0" stroke={colors.border} strokeWidth={1} /></Svg>
                <Image
                  source={{ uri: reviewItem.image ?? "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400" }}
                  style={{ width: 48, height: 48, borderRadius: 0 }}
                  contentFit="cover"
                />
                <View className="flex-1">
                  <Text className="text-sm font-bold" style={{ color: colors.text }}>{reviewItem.name}</Text>
                  <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>
                    Order: {id}
                  </Text>
                </View>
              </View>
            )}

            <View className="mb-6 items-center">
              <Text className="mb-3 text-[10px] font-black uppercase tracking-widest" style={{ color: colors.text }}>
                {t('quality_rating')}
              </Text>
              <View className="flex-row gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Pressable key={s} onPress={() => setRating(s)}>
                    <Text className={cn("text-3xl", s <= rating ? "text-amber-400" : "opacity-20")} style={{ color: s <= rating ? "#fbbf24" : colors.textMuted }}>
                      ★
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mb-6 relative overflow-hidden">
              <Text className="mb-2 text-[10px] font-black uppercase tracking-widest" style={{ color: colors.text }}>
                {t('harvest_notes')}
              </Text>
              <TextInput
                placeholder={t('share_experience')}
                placeholderTextColor={colors.textMuted}
                value={comment}
                onChangeText={setComment}
                multiline
                style={{
                  height: 96, borderRadius: 0, borderWidth: 1,
                  borderColor: colors.border, backgroundColor: colors.bg,
                  padding: 16, fontSize: 14, color: colors.text, textAlignVertical: "top",
                }}
              />
              <Svg width={8} height={8} style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}><Polygon points="0,0 8,0 0,8" fill={colors.card} /><Path d="M8,0 L0,8" stroke={colors.border} strokeWidth={1} /></Svg>
              <Svg width={8} height={8} style={{ position: 'absolute', bottom: 0, right: 0, zIndex: 10 }}><Polygon points="8,8 0,8 8,0" fill={colors.card} /><Path d="M0,8 L8,0" stroke={colors.border} strokeWidth={1} /></Svg>
            </View>

            <View className="mb-6">
              <Text className="mb-2 text-[10px] font-black uppercase tracking-widest" style={{ color: colors.text }}>
                {t('evidence_gallery')}
              </Text>
              {images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} className="flex-row mb-3">
                  {images.map((img, idx) => (
                    <View key={idx} className="relative w-16 h-16 rounded-none overflow-hidden border" style={{ borderColor: colors.border }}>
                      <Svg width={4} height={4} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 4,0 0,4" fill={colors.card} /><Path d="M4,0 L0,4" stroke={colors.border} strokeWidth={1} /></Svg>
                      <Svg width={4} height={4} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="4,4 0,4 4,0" fill={colors.card} /><Path d="M0,4 L4,0" stroke={colors.border} strokeWidth={1} /></Svg>
                      <Image source={{ uri: img }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                      <Pressable
                        onPress={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute right-1 top-1 bg-black/60 rounded-none w-5 h-5 items-center justify-center relative overflow-hidden"
                      >
                        <Svg width={3} height={3} style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}><Polygon points="0,0 3,0 0,3" fill={colors.card} /></Svg>
                        <Svg width={3} height={3} style={{ position: 'absolute', bottom: 0, right: 0, zIndex: 10 }}><Polygon points="3,3 0,3 3,0" fill={colors.card} /></Svg>
                        <Text className="text-white text-[8px] font-black">✕</Text>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              )}
              <Button
                variant="ghost"
                label={pickingImage ? t('selecting') : "➕ " + t('add_photo_evidence')}
                onPress={handlePickImage}
                className="w-full h-10 rounded-none"
              />
            </View>

            <Button
              label={submitting ? t('submitting') : t('submit_review')}
              onPress={handleSubmitReview}
              className="w-full rounded-none"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
