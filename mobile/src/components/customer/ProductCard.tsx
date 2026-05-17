import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import type { Product } from "@/services/productService";

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
  const aspectRatio = useImageAspectRatio(uri);

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/product/[id]", params: { id: product.id } })}
      className={`overflow-hidden rounded-2xl border border-white/5 bg-card ${compact ? "w-[48%]" : "w-full"}`}
    >
      <View 
        className="relative bg-secondary/50 items-center justify-center overflow-hidden w-full"
        style={{ aspectRatio }}
      >
        {uri && (uri.startsWith("http") || uri.startsWith("/") || uri.startsWith("data:")) ? (
          <Image source={{ uri }} className="h-full w-full" contentFit="cover" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-5xl">🐟</Text>
          </View>
        )}
        {outOfStock ? (
          <View className="absolute inset-0 items-center justify-center bg-black/50">
            <Text className="text-[9px] font-black uppercase text-white">Out of stock</Text>
          </View>
        ) : null}
      </View>
      <View className="gap-1 p-3">
        <Text className="text-[8px] font-black uppercase text-muted-foreground" numberOfLines={1}>
          {product.seller_name || product.seller_id || "Verified Fleet"}
        </Text>
        <Text className="text-sm font-black uppercase italic text-foreground" numberOfLines={2}>
          {product.name}
        </Text>
        <View className="flex-row items-center justify-between pt-1">
          <Text className="text-lg font-black italic text-foreground">₹{Number(product.price).toLocaleString()}</Text>
          {onSelectCut ? (
            <Pressable onPress={onSelectCut} className="rounded-xl bg-primary px-3 py-2">
              <Text className="text-[9px] font-black uppercase text-foreground">+ CUT</Text>
            </Pressable>
          ) : onAdd ? (
            <Pressable onPress={onAdd} disabled={outOfStock} className="rounded-xl bg-primary px-3 py-2 opacity-100 disabled:opacity-40">
              <Text className="text-[9px] font-black uppercase text-foreground">+ ADD</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
