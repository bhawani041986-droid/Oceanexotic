import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, Easing, Dimensions } from "react-native";
import api from "../../services/api";
import { useThemeColors } from "@/hooks/useThemeColors";
import { t } from "@/lib/i18n";

export function AnnouncementBar() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const colors = useThemeColors();
  const screenWidth = Dimensions.get("window").width;
  const animatedValue = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    api.get("/system/coupons")
      .then(({ data }) => {
        if (data.status === "success" && data.content) {
          const valid = data.content.filter((c: any) => {
            if (c.status !== 'ACTIVE') return false;
            if (c.usage_limit && c.usage_count >= c.usage_limit) return false;
            if (c.expiry_date && new Date(c.expiry_date) < new Date()) return false;
            return true;
          });
          setCoupons(valid);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (coupons.length === 0) return;
    
    const runMarquee = () => {
      animatedValue.setValue(screenWidth);
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: -screenWidth - 200,
          duration: 15000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    runMarquee();
  }, [coupons, screenWidth]);

  if (coupons.length === 0) return null;

  return (
    <View 
      className="py-1.5 overflow-hidden flex flex-row items-center bg-slate-950 border-b"
      style={{ borderColor: `${colors.primary}33`, height: 26 }}
    >
      <Animated.View
        style={{
          transform: [{ translateX: animatedValue }],
          flexDirection: "row",
          alignItems: "center",
          gap: 40,
        }}
      >
        {coupons.slice(0, 3).map((coupon) => (
          <Text
            key={coupon.id}
            className="text-[9px] font-black uppercase italic text-white"
          >
            🔥 {t('use_code')}{" "}
            <Text style={{ color: colors.primary }}>
              {coupon.code}
            </Text>{" "}
            {t('for_text')}{" "}
            <Text style={{ color: colors.primary }}>
              {coupon.type === "PERCENTAGE" ? `${coupon.value}% ${t('off_text')}` : `₹${coupon.value} ${t('off_text')}`}
            </Text>
            {coupon.min_purchase > 0 && ` (${t('min_text')} ₹${coupon.min_purchase})`}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}
