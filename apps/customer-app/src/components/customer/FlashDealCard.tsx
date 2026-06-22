import React from "react";
import { View, Text } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { useFlashDealTimer } from "@/hooks/useFlashDealTimer";
import { ChamferedBox } from "@/components/ui/ChamferedBox";
import { Button } from "@/components/ui/Button";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useTranslation } from "@/lib/i18n";
import { useRouter } from "expo-router";

export const FlashDealCard = React.memo(function FlashDealCard({
  promo,
}: {
  promo: any;
}) {
  const { timeLeft, flashDealActive } = useFlashDealTimer();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const router = useRouter();

  // getRgba copied temporarily or locally so it works in this component, or import it.
  // Actually, I can just use getRgba here as a local utility.
  const getRgba = (hex: string, alpha: number) => {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  if (!promo) return null;

  return (
    <ChamferedBox
      className="mt-6 mx-4 p-5 shadow-2xl"
      fillColor={getRgba(colors.primary, 0.2)}
      strokeColor={colors.border}
    >
      <Text
        className="text-[10px] font-black uppercase tracking-widest"
        style={{ color: colors.primary }}
      >
        {promo.sector || "Flash Deal"}
      </Text>
      <Text
        className="mt-2 text-3xl font-black uppercase italic"
        style={{ color: colors.text }}
      >
        {promo.title || "Flash Deals."}
      </Text>

      {flashDealActive ? (
        <View className="mt-4 flex-row justify-center gap-2">
          {[timeLeft.hrs, timeLeft.min, timeLeft.sec].map((val, i) => (
            <View
              key={i}
              className="min-w-[56px] border px-3 py-2 rounded-none relative overflow-hidden"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <Text
                className="text-center text-xl font-black italic relative z-10"
                style={{ color: colors.text }}
              >
                {val}
              </Text>
              <Text
                className="text-center text-[7px] font-black uppercase relative z-10"
                style={{ color: colors.textMuted }}
              >
                {i === 0
                  ? t("hrs") || "HRS"
                  : i === 1
                    ? t("min") || "MIN"
                    : t("sec") || "SEC"}
              </Text>
              <Svg width={4} height={4} style={{ position: 'absolute', top: -1, left: -1, zIndex: 20 }}><Polygon points="0,0 4,0 0,4" fill={colors.bg} /></Svg>
              <Svg width={4} height={4} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 20 }}><Polygon points="4,4 0,4 4,0" fill={colors.bg} /></Svg>
            </View>
          ))}
        </View>
      ) : (
        <View className="mt-4 self-center border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 rounded-none relative overflow-hidden">
          <Text className="text-[9px] font-black uppercase text-emerald-500 relative z-10">
            {t("promo_active") || "PROMO ACTIVE"}
          </Text>
          <Svg width={4} height={4} style={{ position: 'absolute', top: -1, left: -1, zIndex: 20 }}><Polygon points="0,0 4,0 0,4" fill={colors.bg} /></Svg>
          <Svg width={4} height={4} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 20 }}><Polygon points="4,4 0,4 4,0" fill={colors.bg} /></Svg>
        </View>
      )}

      <Button
        label={t("claim_access_now") || "CLAIM ACCESS NOW"}
        onPress={() => router.push("/products")}
        className="mt-6"
      />
    </ChamferedBox>
  );
});
