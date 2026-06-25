import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, Easing, Dimensions } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import api from "@/services/api";

export function LiveTickerMarquee() {
  const colors = useThemeColors();
  const screenWidth = Dimensions.get("window").width;
  const animatedValue = useRef(new Animated.Value(screenWidth)).current;
  const [contentWidth, setContentWidth] = useState(0);
  const [coupons, setCoupons] = useState<any[]>([]);

  useEffect(() => {
    api
      .get("/system/coupons")
      .then(({ data }) => {
        if (data.status === "success" && data.content) {
          const valid = data.content.filter((c: any) => {
            if (c.status !== "ACTIVE") return false;
            if (c.usage_limit && c.usage_count >= c.usage_limit) return false;
            if (c.expiry_date && new Date(c.expiry_date) < new Date())
              return false;
            return true;
          });
          setCoupons(valid);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (coupons.length === 0 || contentWidth === 0) return;

    const speed = 40; // pixels per second
    const distance = screenWidth + contentWidth;
    const duration = (distance / speed) * 1000;

    const loop = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: -contentWidth,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animatedValue.setValue(screenWidth);
    loop.start();

    return () => loop.stop();
  }, [coupons, screenWidth, contentWidth, animatedValue]);

  if (coupons.length === 0) return null;

  return (
    <View
      className="h-8 flex-row items-center overflow-hidden border-y"
      style={{
        backgroundColor: colors.primary,
        borderColor: `${colors.text}1A`,
      }}
    >
      <Animated.View
        onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)}
        style={{
          transform: [{ translateX: animatedValue }],
          flexDirection: "row",
          alignItems: "center",
          gap: 40,
        }}
      >
        {[...coupons, ...coupons].map((coupon, index) => {
          const discountText = coupon.type === "PERCENTAGE" ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`;
          const minPurchaseText = coupon.min_purchase > 0 ? `(Min ₹${coupon.min_purchase})` : "";
          const msg = `🔥 USE CODE ${coupon.code} FOR ${discountText}! ${minPurchaseText}`;
          return (
            <View key={`${coupon.id}-${index}`} className="flex-row items-center gap-2">
              <View className="w-1 h-1 rounded-full bg-white opacity-80" />
              <Text
                className="text-[10px] font-black uppercase tracking-[0.2em] italic"
                style={{ color: colors.bg }}
              >
                {msg}
              </Text>
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}
