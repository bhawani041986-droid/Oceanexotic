import { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import api from "@/services/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useProductSearch, useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/customer/ProductCard";
import { SectionTitle } from "@/components/customer/SectionTitle";
import { CutSelectionModal } from "@/components/customer/CutSelectionModal";
import { useCartStore } from "@/store/cartStore";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useToast } from "@/components/ui/Toast";
import { homeService, type CutOption, type TodaysCatchItem } from "@/services/homeService";
import type { Product } from "@/services/productService";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settingsStore";

const TABS = [
  "All Seafood",
  "Seawater Fish",
  "Freshwater Fish",
  "Prawns & Shrimps",
  "Crabs & Lobsters",
  "Steaks & Fillets",
  "Exotic Catch",
  "Ready to Cook",
  "Coastal Dry Fish",
];

export default function ProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; search?: string }>();
  const { toast, ToastHost } = useToast();
  const cart = useCartStore();
  const colors = useThemeColors();
  const { settings } = useSettingsStore();
  const currentLanguage = settings.language; // force re-render

  const [searchQuery, setSearchQuery] = useState(params.search ?? "");
  const [activeTab, setActiveTab] = useState(() => {
    if (!params.category) return "All Seafood";
    const slug = String(params.category).toLowerCase();
    if (slug === "seawater" || slug === "reef" || slug === "snapper") return "Seawater Fish";
    if (slug === "freshwater" || slug === "river" || slug === "mackerel") return "Freshwater Fish";
    if (slug === "prawns" || slug === "shrimp") return "Prawns & Shrimps";
    if (slug === "crustaceans" || slug === "crab" || slug === "lobster") return "Crabs & Lobsters";
    if (slug === "fillets" || slug === "steaks" || slug === "kingfish") return "Steaks & Fillets";
    if (slug === "exotic" || slug === "premium") return "Exotic Catch";
    if (slug === "ready-to-cook" || slug === "ready") return "Ready to Cook";
    if (slug === "dry-fish" || slug === "dry" || slug === "pomfret") return "Coastal Dry Fish";
    return TABS.find((t) => t.toLowerCase().includes(slug)) ?? "All Seafood";
  });

  const registry = useProducts();
  const search = useProductSearch(searchQuery, "");

  const [cutProduct, setCutProduct] = useState<Product | null>(null);
  const [cutOptions, setCutOptions] = useState<CutOption[]>([]);
  const [selectedCut, setSelectedCut] = useState<CutOption | null>(null);
  const [cutLoading, setCutLoading] = useState(false);
  const [cutOpen, setCutOpen] = useState(false);

  const displayList = useMemo(() => {
    const rawList: Product[] = searchQuery.trim()
      ? ((search.data?.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          image_url: p.image,
          seller_name: p.seller,
          stock: p.stock ?? 10,
          status: p.is_live ? "LIVE" : "ACTIVE",
        })) as Product[]) ?? [])
      : (registry.data ?? []);

    return rawList.filter((p) => {
      // 1. Name search matching (only needed if using client-side registry list directly, 
      // but harmless to enforce for consistency)
      const matchSearch = !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      // 2. Active Tab Category Resolver (Smart Mapping)
      if (activeTab === "All Seafood") return true;

      const catLower = (p.category ?? "").toLowerCase();
      const nameLower = p.name.toLowerCase();

      if (activeTab === "Seawater Fish") {
        return (
          catLower.includes("sea") ||
          catLower.includes("reef") ||
          catLower.includes("coastal") ||
          catLower.includes("marine") ||
          catLower.includes("fin-fish") ||
          catLower.includes("snapper") ||
          catLower.includes("pomfret") ||
          catLower.includes("grouper") ||
          catLower.includes("cod")
        );
      }
      if (activeTab === "Freshwater Fish") {
        return (
          catLower.includes("freshwater") ||
          catLower.includes("river") ||
          catLower.includes("lake") ||
          catLower.includes("sweetwater") ||
          catLower.includes("mackerel") ||
          nameLower.includes("mackerel")
        );
      }
      if (activeTab === "Prawns & Shrimps") {
        return (
          catLower.includes("prawn") ||
          catLower.includes("shrimp") ||
          catLower.includes("crustacean") ||
          catLower.includes("shellfish") ||
          nameLower.includes("prawn") ||
          nameLower.includes("shrimp")
        );
      }
      if (activeTab === "Crabs & Lobsters") {
        return (
          catLower.includes("crab") ||
          catLower.includes("lobster") ||
          catLower.includes("mangrove") ||
          catLower.includes("crustacean") ||
          catLower.includes("shellfish") ||
          nameLower.includes("crab") ||
          nameLower.includes("lobster")
        );
      }
      if (activeTab === "Steaks & Fillets") {
        return (
          catLower.includes("fillet") ||
          catLower.includes("steak") ||
          catLower.includes("cut") ||
          nameLower.includes("steak") ||
          nameLower.includes("fillet") ||
          nameLower.includes("surmai") ||
          nameLower.includes("kingfish") ||
          nameLower.includes("cut")
        );
      }
      if (activeTab === "Exotic Catch") {
        return (
          catLower.includes("exotic") ||
          catLower.includes("premium") ||
          catLower.includes("deep sea") ||
          nameLower.includes("tuna") ||
          nameLower.includes("salmon") ||
          nameLower.includes("lobster")
        );
      }
      if (activeTab === "Ready to Cook") {
        return (
          catLower.includes("ready") ||
          catLower.includes("marinated") ||
          catLower.includes("cook") ||
          nameLower.includes("marinated") ||
          nameLower.includes("fry") ||
          nameLower.includes("finger") ||
          nameLower.includes("batter")
        );
      }
      if (activeTab === "Coastal Dry Fish") {
        return (
          catLower.includes("dry") ||
          catLower.includes("dried") ||
          nameLower.includes("dry") ||
          nameLower.includes("dried")
        );
      }

      return catLower.includes(activeTab.toLowerCase().split(" ")[0]);
    });
  }, [searchQuery, activeTab, registry.data, search.data]);

  const isLoading = registry.isLoading || (searchQuery.trim() ? search.isLoading : false);

  const [addons, setAddons] = useState<any[]>([]);
  useEffect(() => {
    api.get("/addons/list")
      .then(res => setAddons(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error(err));
  }, []);

  const showLayers = activeTab === "All Seafood" && !searchQuery.trim();
  const bestsellers = useMemo(() => displayList.slice(0, 8), [displayList]);
  const readyToCook = useMemo(() => displayList.filter(p => 
    p.category?.toLowerCase() === "ready to cook" || 
    /marinate|grill|fry|masala|ready|spice/i.test((p.name || "") + " " + (p.description || ""))
  ), [displayList]);

  const handleAddAddon = (addon: any) => {
    cart.addItem({
      id: addon.id,
      name: addon.name,
      price: parseFloat(addon.price),
      quantity: 1,
      image: addon.image_url || "https://images.unsplash.com/photo-1596683788737-88981f33f674?q=80&w=500",
      sellerId: "ADDON",
      metadata: { is_addon: true }
    });
    toast(`${addon.name} added to cart`, "success");
  };

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
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28 px-4 pt-2"
        refreshControl={
          <RefreshControl refreshing={registry.isRefetching} onRefresh={() => registry.refetch()} tintColor={colors.primary} />
        }
      >
        <SectionTitle title="Harvest Registry" subtitle="Premium Seafood Discovery • Live Fleet Sync" />

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('search_seafood')}
          placeholderTextColor={colors.isDark ? "#94A3B8" : "#6B7280"}
          className="mt-4 h-12 rounded-xl border px-4 text-sm"
          style={{ 
            backgroundColor: colors.card, 
            borderColor: colors.border, 
            color: colors.text 
          }}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                className="mr-2 rounded-xl px-4 py-2 border"
                style={active ? { 
                  backgroundColor: colors.primary, 
                  borderColor: colors.primary 
                } : { 
                  backgroundColor: colors.card, 
                  borderColor: colors.border 
                }}
              >
                <Text
                  className="text-[9px] font-black uppercase"
                  style={{ color: active ? "#FFFFFF" : colors.textMuted }}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text 
          className="mt-4 text-[10px] font-black uppercase tracking-widest"
          style={{ color: colors.textMuted }}
        >
          {displayList.length} assets in registry
        </Text>

        {isLoading ? (
          <ActivityIndicator className="my-12" color={colors.primary} size="large" />
        ) : displayList.length > 0 ? (
          <View>
            {showLayers && (
              <View className="mb-6 space-y-8">
                {/* LAYER 1: TODAY'S CATCH */}
                <View className="space-y-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xl font-black uppercase italic" style={{ color: colors.text }}>
                      Today's <Text style={{ color: colors.primary }}>Catch</Text>
                    </Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4 pb-2">
                    <View className="flex-row gap-4 pr-8">
                      {bestsellers.map(p => (
                        <View key={p.id} className="w-[180px]">
                          <ProductCard product={p} onSelectCut={() => openCut(p)} />
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* LAYER 2: CHEF'S SPECIALS */}
                {readyToCook.length > 0 && (
                  <View className="space-y-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xl font-black uppercase italic" style={{ color: colors.text }}>
                        Chef's <Text style={{ color: "#F59E0B" }}>Specials</Text>
                      </Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4 pb-2">
                      <View className="flex-row gap-4 pr-8">
                        {readyToCook.map(p => (
                          <View key={p.id} className="w-[180px]">
                            <ProductCard product={p} onSelectCut={() => openCut(p)} />
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

                {/* LAYER 3: ADDONS */}
                {addons.length > 0 && (
                  <View className="space-y-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xl font-black uppercase italic" style={{ color: colors.text }}>
                        Culinary <Text style={{ color: "#10B981" }}>Add-ons</Text>
                      </Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4 pb-2">
                      <View className="flex-row gap-3 pr-8">
                        {addons.map(addon => (
                          <View key={addon.id} className="w-[180px] rounded-xl border p-2" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                            <View className="flex-row items-center gap-2">
                              <Image source={{ uri: addon.image_url || "https://images.unsplash.com/photo-1596683788737-88981f33f674?q=80&w=500" }} className="h-10 w-10 rounded-lg bg-black/10" contentFit="cover" />
                              <View className="flex-1">
                                <Text className="text-[10px] font-black uppercase leading-tight" style={{ color: colors.text }} numberOfLines={2}>{addon.name}</Text>
                                <Text className="text-[8px] italic" style={{ color: colors.textMuted }}>{addon.type || "Add-on"}</Text>
                              </View>
                            </View>
                            <View className="mt-2 flex-row items-center justify-between border-t pt-2" style={{ borderTopColor: colors.border }}>
                              <Text className="text-[10px] font-black text-emerald-400">₹{addon.price}</Text>
                              <Pressable onPress={() => handleAddAddon(addon)} className="rounded-md px-3 py-1.5" style={{ backgroundColor: colors.primary }}>
                                <Text className="text-[8px] font-black uppercase text-white">+ ADD</Text>
                              </Pressable>
                            </View>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

                <View className="flex-row items-center gap-4 py-2">
                  <View className="h-px flex-1" style={{ backgroundColor: colors.border }} />
                  <Text className="text-[10px] font-black uppercase tracking-widest italic" style={{ color: colors.textMuted }}>Full Catalog</Text>
                  <View className="h-px flex-1" style={{ backgroundColor: colors.border }} />
                </View>
              </View>
            )}

            <View className="flex-row flex-wrap justify-between gap-y-3">
              {displayList.map((p) => (
                <ProductCard key={p.id} product={p} compact onSelectCut={() => openCut(p)} />
              ))}
            </View>
          </View>
        ) : (
          <View 
            className="my-12 items-center rounded-2xl border border-dashed p-8"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-xs font-black uppercase" style={{ color: colors.textMuted }}>No harvest in this sector</Text>
            <Pressable onPress={() => router.replace("/home")} className="mt-4">
              <Text className="text-[10px] font-bold" style={{ color: colors.primary }}>Return to Harbor Home</Text>
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

