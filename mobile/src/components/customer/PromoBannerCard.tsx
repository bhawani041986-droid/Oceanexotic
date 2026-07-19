import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Pressable } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Rect, Circle } from "react-native-svg";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useToast } from "@/components/ui/Toast";
import api from "@/services/api";

export function PromoBannerCard() {
  const colors = useThemeColors();
  const { toast } = useToast();
  const [coupon, setCoupon] = useState<any>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await api.get("/system/coupons");
        if (Array.isArray(data)) {
          const activeCoupon = data.find(c => c.is_active);
          if (activeCoupon) setCoupon(activeCoupon);
        }
      } catch (err) {
        console.error("Failed to fetch coupons for promo card", err);
      }
    };
    fetchCoupons();
  }, []);

  if (!coupon) return null;

  const handleCopy = () => {
    toast(`Use code ${coupon.code} at checkout!`, "success");
  };

  const discountText = coupon.discount_type === "PERCENTAGE" 
    ? `${coupon.discount_value}%`
    : `₹${coupon.discount_value}`;

  return (
    <Pressable 
      onPress={handleCopy}
      className="mx-4 my-2 rounded-xl overflow-hidden relative shadow-lg"
      style={{
        borderWidth: 1,
        borderColor: `${colors.primary}33`,
        backgroundColor: colors.card,
        minHeight: 70, // Reduced from 140
      }}
    >
      {/* Background Gradient & Glows using SVG */}
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.primary} stopOpacity={0.2} />
            <Stop offset="0.5" stopColor={colors.primary} stopOpacity={0.05} />
            <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grad)" />
        {/* Glow bubble top-left */}
        <Circle cx="-10" cy="35" r="40" fill={colors.primary} fillOpacity={0.15} />
      </Svg>

      <View className="relative z-10 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-1 justify-center">
          <View className="flex-row items-center gap-2">
             <View 
               className="rounded-full px-2 py-0.5 border"
               style={{ backgroundColor: colors.primary, borderColor: `${colors.primary}33` }}
             >
               <Text className="text-[8px] font-black uppercase tracking-widest italic" style={{ color: colors.bg }}>
                 Offer
               </Text>
             </View>
             <Text className="text-[10px] font-medium" style={{ color: colors.textMuted }}>
               Valid today
             </Text>
          </View>
          <Text className="mt-1 text-lg font-black uppercase italic leading-tight" style={{ color: colors.text }}>
            Save <Text style={{ color: colors.primary }}>{discountText}</Text>
          </Text>
        </View>

        <View 
          className="items-center rounded-lg border px-3 py-1.5 flex-row gap-2"
          style={{ 
            backgroundColor: colors.bgAlt, 
            borderColor: `${colors.text}1A` 
          }}
        >
          <View>
            <Text className="text-[7px] font-black uppercase tracking-widest italic text-center mb-0.5" style={{ color: colors.textMuted }}>
              Code
            </Text>
            <View 
              className="px-2 py-1 rounded border"
              style={{ backgroundColor: `${colors.primary}1A`, borderColor: `${colors.primary}4D` }}
            >
              <Text className="text-sm font-black tracking-[0.1em]" style={{ color: colors.primary }}>
                {coupon.code}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
