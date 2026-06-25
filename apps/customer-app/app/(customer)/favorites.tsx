import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useProducts } from "@/hooks/useProducts";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { ProductCard } from "@/components/customer/ProductCard";
import { SectionTitle } from "@/components/customer/SectionTitle";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useToast } from "@/components/ui/Toast";
import { t } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settingsStore";
import type { Product } from "@/services/productService";

export default function FavoritesScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { toast, ToastHost } = useToast();
  const cart = useCartStore();
  const currentLanguage = useSettingsStore((s) => s.language); // force re-render

  const registry = useProducts();
  const wishlistItems = useWishlistStore((state) => state.items);

  // Sync details from registry if active, otherwise fallback to saved wishlist state
  const displayList = useMemo(() => {
    return wishlistItems.map((favItem) => {
      const active = (registry.data || []).find((p) => p.id === favItem.id);
      return active ? active : favItem;
    });
  }, [wishlistItems, registry.data]);

  const handleAddProduct = (p: Product) => {
    cart.addItem({
      id: p.id,
      name: p.name,
      price: p.price,
      quantity: 1,
      image: p.image_url || p.image || ""
    });
    toast(`Added ${p.name} to Cart`, "success");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28 px-4 pt-2"
        refreshControl={
          <RefreshControl 
            refreshing={registry.isRefetching} 
            onRefresh={() => registry.refetch()} 
            tintColor={colors.primary} 
          />
        }
      >
        <SectionTitle 
          title={t('favorites')} 
          subtitle="Your Personal Harbor Selection" 
        />

        <Text 
          className="mt-4 text-[10px] font-black uppercase tracking-widest"
          style={{ color: colors.textMuted }}
        >
          {displayList.length} items in favorites
        </Text>

        {displayList.length > 0 ? (
          <View className="mt-4 flex-row flex-wrap justify-between gap-y-3">
            {displayList.map((p) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                compact 
                onAdd={() => handleAddProduct(p)} 
              />
            ))}
          </View>
        ) : (
          <View 
            className="my-12 items-center rounded-none border border-dashed p-8"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-xs font-black uppercase" style={{ color: colors.textMuted }}>
              No favorites saved yet
            </Text>
            <Pressable onPress={() => router.push("/products")} className="mt-4">
              <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.primary }}>
                Shop Fresh Catch
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
      {ToastHost}
    </View>
  );
}
