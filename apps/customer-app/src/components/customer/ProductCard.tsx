import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import type { Product } from "@/services/productService";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useTranslation } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settingsStore";
import { ChamferedBox } from "@/components/ui/ChamferedBox";

interface ProductCardProps {
  product: Product;
  onAdd?: () => void;
  onSelectCut?: () => void;
  compact?: boolean;
}

function imageUri(product: Product): string {
  const raw = product.image_url || product.images?.[0] || product.image || "";
  if (!raw) return "";
  const resolved = resolveMediaUrl(raw);
  if (resolved) return resolved;
  if (!raw.startsWith("http") && !raw.startsWith("/")) return raw;
  return "";
}

export function ProductCard({ product, onAdd, onSelectCut, compact }: ProductCardProps) {
  const { t, language } = useTranslation();
  const router = useRouter();
  const uri = imageUri(product);
  const outOfStock = (product.stock ?? 1) <= 0 || product.status === "OUT OF STOCK";
  
  const colors = useThemeColors();

  const isLightColor = (colorStr: string) => {
    if (!colorStr || !colorStr.startsWith("#")) return false;
    let cleanHex = colorStr.replace("#", "");
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split("").map(c => c + c).join("");
    }
    if (cleanHex.length !== 6) return false;
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 180;
  };

  // Dynamic badge: only show when discount_percent > 0
  const discount = Number(product.discount_percent ?? 0);
  const hasDiscount = !outOfStock && discount > 0;
  const originalPrice = product.original_price
    ? Number(product.original_price)
    : discount > 0
    ? Math.round((Number(product.price) * 100) / (100 - discount))
    : null;

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/product/[id]", params: { id: product.id } })}
      className={compact ? "w-[48%]" : "w-full"}
    >
      <ChamferedBox
        fillColor={colors.card}
        strokeColor={colors.border}
        bevelSize={16}
        style={{ minHeight: 250 }}
        className="w-full relative overflow-hidden"
      >
        <View 
          className="relative items-center justify-center overflow-hidden w-full"
          style={{ aspectRatio: 1, backgroundColor: colors.isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
        >
          {uri && (uri.startsWith("http") || uri.startsWith("/") || uri.startsWith("data:")) ? (
            <Image source={{ uri }} className="h-full w-full" contentFit="contain" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-5xl">🐟</Text>
            </View>
          )}
          {outOfStock ? (
            <View className="absolute inset-0 items-center justify-center bg-black/50">
              <Text className="text-[9px] font-black uppercase text-white">{t('out_of_stock')}</Text>
            </View>
          ) : hasDiscount ? (
            <View className="absolute right-2 top-2 rounded bg-red-500/90 px-2 py-0.5 z-20">
              <Text className="text-[7px] font-black uppercase text-white">{discount}% OFF</Text>
            </View>
          ) : null}
        </View>
        <View className="gap-1 p-3">
          <Text 
            className="text-[8px] font-black uppercase" 
            style={{ color: colors.textMuted }}
            numberOfLines={1}
          >
            {product.seller_name ? `${t('handled_by')} ${product.seller_name}` : t('special_offer')}
          </Text>
          <Text 
            className="text-sm font-black uppercase italic" 
            style={{ color: colors.text }}
            numberOfLines={2}
          >
            {product.name}
          </Text>
          <View className="flex-row items-center justify-between pt-1">
            <View className="gap-0.5">
              <Text className="text-lg font-black italic" style={{ color: colors.text }}>₹{Number(product.price).toLocaleString()}</Text>
              {hasDiscount && originalPrice ? (
                <Text className="text-[9px] font-medium line-through" style={{ color: colors.textMuted }}>
                  ₹{originalPrice.toLocaleString()}
                </Text>
              ) : null}
            </View>
            {onSelectCut ? (
              <Pressable onPress={onSelectCut} className="rounded-none px-3 py-2 overflow-hidden relative" style={{ backgroundColor: colors.primary }}>
                <Text 
                  className="text-[9px] font-black uppercase relative z-10" 
                  style={{ color: isLightColor(colors.primary) ? "#000000" : "#FFFFFF" }}
                >
                  + CUT
                </Text>
                <Svg width="8" height="8" style={{ position: "absolute", top: -1, left: -1, zIndex: 20 }}>
                  <Path d="M0,0 L8,0 L0,8 Z" fill={colors.card} />
                </Svg>
                <Svg width="8" height="8" style={{ position: "absolute", bottom: -1, right: -1, zIndex: 20 }}>
                  <Path d="M8,8 L0,8 L8,0 Z" fill={colors.card} />
                </Svg>
              </Pressable>
            ) : onAdd ? (
              <Pressable onPress={onAdd} disabled={outOfStock} className="rounded-none px-3 py-2 opacity-100 disabled:opacity-40 overflow-hidden relative" style={{ backgroundColor: colors.primary }}>
                <Text 
                  className="text-[9px] font-black uppercase relative z-10" 
                  style={{ color: isLightColor(colors.primary) ? "#000000" : "#FFFFFF" }}
                >
                  + ADD
                </Text>
                <Svg width="8" height="8" style={{ position: "absolute", top: -1, left: -1, zIndex: 20 }}>
                  <Path d="M0,0 L8,0 L0,8 Z" fill={colors.card} />
                </Svg>
                <Svg width="8" height="8" style={{ position: "absolute", bottom: -1, right: -1, zIndex: 20 }}>
                  <Path d="M8,8 L0,8 L8,0 Z" fill={colors.card} />
                </Svg>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Solid Triangle Bevel Overlays to Clip Corner content perfectly */}
        <Svg width="16" height="16" style={{ position: "absolute", top: -1, left: -1, zIndex: 40 }}>
          <Path d="M0,0 L16,0 L0,16 Z" fill={colors.bg} />
        </Svg>
        <Svg width="16" height="16" style={{ position: "absolute", bottom: -1, right: -1, zIndex: 40 }}>
          <Path d="M16,16 L0,16 L16,0 Z" fill={colors.bg} />
        </Svg>
      </ChamferedBox>
    </Pressable>
  );
}
