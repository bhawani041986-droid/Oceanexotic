import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import type { Product } from "@/services/productService";
import { useThemeColors } from "@/hooks/useThemeColors";
import i18n from "@/lib/i18n";
import { useSettingsStore } from "@/store/settingsStore";

import { useImageAspectRatio } from "@/hooks/useImageAspectRatio";

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
  const router = useRouter();
  const uri = imageUri(product);
  const outOfStock = (product.stock ?? 1) <= 0 || product.status === "OUT OF STOCK";
  const { settings } = useSettingsStore();
  const currentLanguage = settings.language; // force re-render
  const { aspectRatio, onLoad } = useImageAspectRatio(uri);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const w = layout.width;
  const h = layout.height;

  const colors = useThemeColors();

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/product/[id]", params: { id: product.id } })}
      onLayout={(e) => setLayout(e.nativeEvent.layout)}
      className={`${compact ? "w-[48%]" : "w-full"} relative overflow-hidden`}
      style={{ minHeight: 250 }}
    >
      {/* Absolute Svg Custom Card Bevel Shape Background with Border */}
      {w > 0 && h > 0 ? (
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          <Path
            d={`M16,0 L${w},0 L${w},${h - 16} L${w - 16},${h} L0,${h} L0,16 Z`}
            fill={colors.card}
            stroke={colors.border}
            strokeWidth="1"
          />
        </Svg>
      ) : null}

      <View 
        className="relative items-center justify-center overflow-hidden w-full"
        style={{ aspectRatio: 1, backgroundColor: colors.isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
      >
        {uri && (uri.startsWith("http") || uri.startsWith("/") || uri.startsWith("data:")) ? (
          <Image source={{ uri }} onLoad={onLoad} className="h-full w-full" contentFit="contain" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-5xl">🐟</Text>
          </View>
        )}
        {outOfStock ? (
          <View className="absolute inset-0 items-center justify-center bg-black/50">
            <Text className="text-[9px] font-black uppercase text-white">{i18n.t('out_of_stock')}</Text>
          </View>
        ) : (
          <View className="absolute right-2 top-2 rounded bg-red-500/90 px-2 py-0.5 z-20">
            <Text className="text-[7px] font-black uppercase text-white">15% OFF</Text>
          </View>
        )}
      </View>
      <View className="gap-1 p-3">
        <Text 
          className="text-[8px] font-black uppercase" 
          style={{ color: colors.textMuted }}
          numberOfLines={1}
        >
          {product.seller_name ? `${i18n.t('handled_by')} ${product.seller_name}` : i18n.t('special_offer')}
        </Text>
        <Text 
          className="text-sm font-black uppercase italic" 
          style={{ color: colors.text }}
          numberOfLines={2}
        >
          {product.name}
        </Text>
        <View className="flex-row items-center justify-between pt-1">
          <Text className="text-lg font-black italic" style={{ color: colors.text }}>₹{Number(product.price).toLocaleString()}</Text>
          {onSelectCut ? (
            <Pressable onPress={onSelectCut} className="rounded-xl px-3 py-2 overflow-hidden relative" style={{ backgroundColor: colors.primary }}>
              <Text className="text-[9px] font-black uppercase text-white relative z-10">+ CUT</Text>
              <Svg width="8" height="8" style={{ position: "absolute", top: -1, left: -1, zIndex: 20 }}>
                <Path d="M0,0 L8,0 L0,8 Z" fill={colors.card} />
              </Svg>
              <Svg width="8" height="8" style={{ position: "absolute", bottom: -1, right: -1, zIndex: 20 }}>
                <Path d="M8,8 L0,8 L8,0 Z" fill={colors.card} />
              </Svg>
            </Pressable>
          ) : onAdd ? (
            <Pressable onPress={onAdd} disabled={outOfStock} className="rounded-xl px-3 py-2 opacity-100 disabled:opacity-40 overflow-hidden relative" style={{ backgroundColor: colors.primary }}>
              <Text className="text-[9px] font-black uppercase text-white relative z-10">+ ADD</Text>
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

      {/* Solid Triangle Bevel Overlays to Clip Corner content/borders perfectly */}
      <Svg width="16" height="16" style={{ position: "absolute", top: -1, left: -1, zIndex: 40 }}>
        <Path d="M0,0 L16,0 L0,16 Z" fill={colors.bg} />
        <Path d="M16,0 L0,16" stroke={colors.border} strokeWidth="1" />
      </Svg>
      <Svg width="16" height="16" style={{ position: "absolute", bottom: -1, right: -1, zIndex: 40 }}>
        <Path d="M16,16 L0,16 L16,0 Z" fill={colors.bg} />
        <Path d="M0,16 L16,0" stroke={colors.border} strokeWidth="1" />
      </Svg>
    </Pressable>
  );
}
