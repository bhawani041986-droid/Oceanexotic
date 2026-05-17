import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { productService } from "@/services/productService";
import { homeService, type CutOption } from "@/services/homeService";
import { CutSelectionModal } from "@/components/customer/CutSelectionModal";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { assetUrl } from "@/config/assets";
import type { TodaysCatchItem } from "@/services/homeService";
import { useImageAspectRatio } from "@/hooks/useImageAspectRatio";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const cart = useCartStore();
  const { toast, ToastHost } = useToast();

  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [cutOpen, setCutOpen] = useState(false);
  const [cutOptions, setCutOptions] = useState<CutOption[]>([]);
  const [selectedCut, setSelectedCut] = useState<CutOption | null>(null);
  const [cutLoading, setCutLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    productService
      .fetchById(String(id))
      .then(setProduct)
      .catch(() => toast("Product sync failed", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const openCut = async () => {
    setCutOpen(true);
    setCutLoading(true);
    try {
      const options = await homeService.fetchCutOptions(String(id));
      setCutOptions(options);
      setSelectedCut(options.find((c) => c.is_available !== false) ?? options[0] ?? null);
    } catch {
      toast("Cut options unavailable", "error");
    } finally {
      setCutLoading(false);
    }
  };

  const confirmCut = () => {
    if (!product || !selectedCut) return;
    const name = String(product.name ?? "Product");
    cart.addItem({
      id: `${id}-${selectedCut.cut_type}`,
      name: `${name} (${selectedCut.label})`,
      price: selectedCut.final_price,
      quantity: 1,
      image: String(product.image_url ?? ""),
      sellerId: String(product.seller_id ?? ""),
      metadata: { cut_type: selectedCut.cut_type, base_product_id: id },
    });
    toast("Added to cart", "success");
    setCutOpen(false);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#7C3AED" size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center font-black uppercase text-foreground">Product not found</Text>
        <Button label="GO BACK" onPress={() => router.back()} className="mt-6" />
      </View>
    );
  }

  const img = String(product.image_url ?? "");
  const uri = img.startsWith("http") ? img : img ? assetUrl(img) : "";
  const aspectRatio = useImageAspectRatio(uri, 1 / 1);

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-28">
        <View className="bg-secondary w-full" style={{ aspectRatio }}>
          {uri ? (
            <Image source={{ uri }} className="h-full w-full" contentFit="cover" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-8xl">🐟</Text>
            </View>
          )}
        </View>
        <View className="p-6">
          <Text className="text-[10px] font-black uppercase text-primary">
            {String(product.seller_name ?? "Verified Fleet")}
          </Text>
          <Text className="mt-2 text-3xl font-black uppercase italic text-foreground">
            {String(product.name)}
          </Text>
          {product.description ? (
            <Text className="mt-3 text-sm text-muted-foreground">{String(product.description)}</Text>
          ) : null}
          <Text className="mt-4 text-3xl font-black italic text-primary">
            ₹{Number(product.live_price ?? product.price ?? 0).toLocaleString()}
            <Text className="text-sm opacity-60">/{String(product.unit ?? "kg")}</Text>
          </Text>
          {product.live_harbor ? (
            <Text className="mt-2 text-[10px] font-black uppercase text-emerald-500">
              Live @ {String(product.live_harbor)} • {String(product.remaining_kg ?? product.live_stock)}kg left
            </Text>
          ) : null}
          <View className="mt-8 gap-3">
            <Button label="SELECT CUT & ADD" onPress={openCut} />
            <Button
              label="ADD WHOLE TO CART"
              variant="ghost"
              onPress={() => {
                cart.addItem({
                  id: String(id),
                  name: String(product.name),
                  price: Number(product.live_price ?? product.price ?? 0),
                  quantity: 1,
                  image: img,
                  sellerId: String(product.seller_id ?? ""),
                });
                toast("Added to cart", "success");
              }}
            />
          </View>
        </View>
      </ScrollView>
      <CutSelectionModal
        visible={cutOpen}
        product={{ name: String(product.name), product_id: String(id) } as TodaysCatchItem}
        options={cutOptions}
        selected={selectedCut}
        loading={cutLoading}
        onSelect={setSelectedCut}
        onClose={() => setCutOpen(false)}
        onConfirm={confirmCut}
      />
      {ToastHost}
    </View>
  );
}
