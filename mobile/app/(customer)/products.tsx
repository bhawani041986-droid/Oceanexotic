import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useProductSearch, useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/customer/ProductCard";
import { SectionTitle } from "@/components/customer/SectionTitle";
import { CutSelectionModal } from "@/components/customer/CutSelectionModal";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ui/Toast";
import { homeService, type CutOption, type TodaysCatchItem } from "@/services/homeService";
import type { Product } from "@/services/productService";
import { cn } from "@/lib/utils";

const TABS = [
  "All Seafood",
  "Fin Fish",
  "Shellfish",
  "Prawns",
  "Crab",
  "Lobster",
];

export default function ProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; search?: string }>();
  const { toast, ToastHost } = useToast();
  const cart = useCartStore();

  const [searchQuery, setSearchQuery] = useState(params.search ?? "");
  const [activeTab, setActiveTab] = useState(
    params.category
      ? TABS.find((t) => t.toLowerCase().includes(String(params.category).toLowerCase())) ?? "All Seafood"
      : "All Seafood"
  );

  const registry = useProducts();
  const search = useProductSearch(searchQuery, activeTab === "All Seafood" ? "" : activeTab);

  const [cutProduct, setCutProduct] = useState<Product | null>(null);
  const [cutOptions, setCutOptions] = useState<CutOption[]>([]);
  const [selectedCut, setSelectedCut] = useState<CutOption | null>(null);
  const [cutLoading, setCutLoading] = useState(false);
  const [cutOpen, setCutOpen] = useState(false);

  const displayList = useMemo(() => {
    if (searchQuery.trim()) {
      return search.data?.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        image_url: p.image,
        seller_name: p.seller,
        stock: p.stock ?? 10,
        status: p.is_live ? "LIVE" : "ACTIVE",
      })) as Product[];
    }
    const all = registry.data ?? [];
    return all.filter((p) => {
      const matchTab =
        activeTab === "All Seafood" ||
        (p.category ?? "").toLowerCase().includes(activeTab.toLowerCase().split(" ")[0]);
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [searchQuery, activeTab, registry.data, search.data]);

  const isLoading = registry.isLoading || (searchQuery.trim() ? search.isLoading : false);

  const openCut = async (product: Product) => {
    setCutProduct(product);
    setCutOpen(true);
    setCutLoading(true);
    setSelectedCut(null);
    try {
      const options = await homeService.fetchCutOptions(String(product.id));
      setCutOptions(options);
      setSelectedCut(options.find((c) => c.is_available !== false) ?? options[0] ?? null);
    } catch {
      toast("Cut Registry Handshake Failure", "error");
    } finally {
      setCutLoading(false);
    }
  };

  const confirmCut = () => {
    if (!cutProduct || !selectedCut) return;
    cart.addItem({
      id: `${cutProduct.id}-${selectedCut.cut_type}`,
      name: `${cutProduct.name} (${selectedCut.label})`,
      price: selectedCut.final_price,
      quantity: 1,
      image: cutProduct.image_url,
      sellerId: cutProduct.seller_id,
      metadata: { cut_type: selectedCut.cut_type, base_product_id: cutProduct.id },
    });
    toast(`${cutProduct.name} added to cart`, "success");
    setCutOpen(false);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28 px-4 pt-2"
        refreshControl={
          <RefreshControl refreshing={registry.isRefetching} onRefresh={() => registry.refetch()} tintColor="#7C3AED" />
        }
      >
        <SectionTitle title="Harvest Registry" subtitle="Premium Seafood Discovery • Live Fleet Sync" />

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search the database..."
          placeholderTextColor="#94A3B8"
          className="mt-4 h-12 rounded-xl border border-white/10 bg-card px-4 text-sm text-foreground"
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={cn("mr-2 rounded-xl px-4 py-2", activeTab === tab ? "bg-primary" : "bg-secondary/50")}
            >
              <Text
                className={cn(
                  "text-[9px] font-black uppercase",
                  activeTab === tab ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {displayList.length} assets in registry
        </Text>

        {isLoading ? (
          <ActivityIndicator className="my-12" color="#7C3AED" size="large" />
        ) : displayList.length > 0 ? (
          <View className="mt-4 flex-row flex-wrap justify-between gap-y-3">
            {displayList.map((p) => (
              <ProductCard key={p.id} product={p} compact onSelectCut={() => openCut(p)} />
            ))}
          </View>
        ) : (
          <View className="my-12 items-center rounded-2xl border border-dashed border-white/10 p-8">
            <Text className="text-xs font-black uppercase text-muted-foreground">No harvest in this sector</Text>
            <Pressable onPress={() => router.replace("/home")} className="mt-4">
              <Text className="text-[10px] font-bold text-primary">Return to Harbor Home</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <CutSelectionModal
        visible={cutOpen}
        product={cutProduct as unknown as TodaysCatchItem}
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
