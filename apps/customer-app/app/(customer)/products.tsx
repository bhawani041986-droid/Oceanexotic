import React, { useMemo, useState, useEffect } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import api from "@/services/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useProductSearch, useProducts } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { ProductCard } from "@/components/customer/ProductCard";
import { SectionTitle } from "@/components/customer/SectionTitle";
import { CutSelectionModal } from "@/components/customer/CutSelectionModal";
import { PromoBannerCard } from "@/components/customer/PromoBannerCard";
import { FssaiBanner } from "@/components/customer/FssaiBanner";
import { useCartStore } from "@/store/cartStore";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useToast } from "@/components/ui/Toast";
import { homeService, type CutOption, type TodaysCatchItem } from "@/services/homeService";
import type { Product } from "@/services/productService";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settingsStore";
import { useHomeData } from "@/hooks/useHomeData";
import { CATEGORIES, getSortedCategories } from "@/constants/categories";
import { ChamferedBox } from "@/components/ui/ChamferedBox";

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

const getTabLabel = (tab: string, t: any) => {
  switch (tab) {
    case "All Seafood":
      return t('all_seafood') || t('all') || "All Seafood";
    case "Seawater Fish":
      return t('seawater_fish') || "Seawater Fish";
    case "Freshwater Fish":
      return t('freshwater_fish') || "Freshwater Fish";
    case "Prawns & Shrimps":
      return t('prawns_shrimps') || "Prawns & Shrimps";
    case "Crabs & Lobsters":
      return t('crabs_lobsters') || "Crabs & Lobsters";
    case "Steaks & Fillets":
      return t('steaks_fillets') || "Steaks & Fillets";
    case "Exotic Catch":
      return t('exotic_catch') || "Exotic Catch";
    case "Ready to Cook":
      return t('ready_to_cook') || "Ready to Cook";
    case "Coastal Dry Fish":
      return t('coastal_dry_fish') || "Coastal Dry Fish";
    default:
      return tab;
  }
};

export default function ProductsScreen() {
  const { t } = useTranslation();

  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; search?: string }>();
  const { toast, ToastHost } = useToast();
  const cart = useCartStore();
  const colors = useThemeColors();
  const settings = useSettingsStore();

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

  const currentLanguage = useSettingsStore((s) => s.language); // force re-render

  const [searchText, setSearchText] = useState(params.search ?? "");
  const searchQuery = useDebounce(searchText, 300);
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
  const { todaysCatch } = useHomeData();
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
      // When using server search results, skip redundant client-side name filter
      // (server already filtered by name). Only apply it to registry list.
      if (searchQuery.trim() && search.data) return true;

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
  const isSearching = searchText.trim() !== searchQuery.trim(); // debounce in progress

  const [addons, setAddons] = useState<any[]>([]);
  useEffect(() => {
    api.get("/addons/list")
      .then(res => setAddons(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error(err));
  }, []);

  const showLayers = activeTab === "All Seafood" && !searchQuery.trim();

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
      toast("Failed to load options", "error");
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
        contentContainerClassName="pb-16 px-4 pt-2"
        refreshControl={
          <RefreshControl refreshing={registry.isRefetching} onRefresh={() => registry.refetch()} tintColor={colors.primary} />
        }
      >
        <SectionTitle title={t('product_catalog')} subtitle={t('catalog_subtitle')} />

        {/* Polished Search Bar */}
        <View
          className="mt-4 h-12 flex-row items-center rounded-none border px-3"
          style={{ backgroundColor: colors.card, borderColor: searchText.trim() ? colors.primary : colors.border }}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={18}
            color={searchText.trim() ? colors.primary : (colors.isDark ? "#94A3B8" : "#6B7280")}
          />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t('search_seafood')}
            placeholderTextColor={colors.isDark ? "#94A3B8" : "#6B7280"}
            style={{ flex: 1, color: colors.text, fontSize: 13, marginHorizontal: 8 }}
            returnKeyType="search"
            clearButtonMode="never"
          />
          {isSearching && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
          {!isSearching && searchText.trim().length > 0 && (
            <Pressable
              onPress={() => setSearchText("")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color={colors.isDark ? "#94A3B8" : "#6B7280"}
              />
            </Pressable>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <ChamferedBox
                key={tab}
                fillColor={active ? colors.primary : colors.card}
                strokeColor={active ? colors.primary : colors.border}
                bevelSize={8}
                style={{ minHeight: 30 }}
                className="mr-2"
                contentClassName="w-auto flex-shrink px-4 py-2 justify-center items-center"
              >
                <Pressable onPress={() => setActiveTab(tab)}>
                  <Text
                    className="text-[9px] font-black uppercase"
                    style={{ color: active ? (isLightColor(colors.primary) ? "#000000" : "#FFFFFF") : colors.textMuted }}
                  >
                    {getTabLabel(tab, t)}
                  </Text>
                </Pressable>
              </ChamferedBox>
            );
          })}
        </ScrollView>
        <PromoBannerCard />
        <Text 
          className="mt-4 text-[10px] font-black uppercase tracking-widest"
          style={{ color: colors.textMuted }}
        >
          {displayList.length} {t('items_in_catalog')}
        </Text>

        {isLoading ? (
          <ActivityIndicator className="my-12" color={colors.primary} size="large" />
        ) : displayList.length > 0 ? (
          <View>
             {showLayers && (
               <View className="mb-6 space-y-8">
                 {/* TODAY'S CATCH LAYER */}
                 {todaysCatch.data && todaysCatch.data.length > 0 && (
                   <View className="space-y-3 mb-6">
                     <View className="flex-row items-center justify-between">
                       <View>
                         <Text className="text-xl font-black uppercase italic" style={{ color: colors.text }} numberOfLines={1}>
                           Today's <Text style={{ color: colors.primary }}>Catch</Text>
                         </Text>
                         <View className="mt-1.5 mb-2.5" style={{ height: 2, width: 64, borderRadius: 999, overflow: 'hidden' }}>
                           <LinearGradient
                             colors={[colors.text, colors.primary]}
                             start={{ x: 0, y: 0 }}
                             end={{ x: 1, y: 0 }}
                             style={{ flex: 1 }}
                           />
                         </View>
                       </View>
                       <Pressable onPress={() => setActiveTab("Seawater Fish")}>
                          <Text className="text-[10px] font-black uppercase" style={{ color: colors.primary }}>View All</Text>
                       </Pressable>
                     </View>
                     <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4 pb-2">
                       <View className="flex-row gap-4 pr-8">
                         {todaysCatch.data.slice(0, 10).map(item => {
                           const mappedProduct: Product = {
                             id: item.product_id,
                             name: item.name,
                             price: item.price_per_kg,
                             image_url: item.catch_image_url || item.image_url,
                             seller_name: item.seller_name,
                             stock: item.remaining_kg || 10,
                             status: "LIVE",
                             discount_percent: item.discount_percent
                           };
                           return (
                             <View key={item.id} className="w-[180px]">
                               <ProductCard product={mappedProduct} onSelectCut={() => openCut(mappedProduct)} />
                             </View>
                           );
                         })}
                       </View>
                     </ScrollView>
                   </View>
                 )}

                 {/* DYNAMIC CATEGORY LAYERS */}
                {getSortedCategories(settings.productCategories).map(category => {
                  const categoryProducts = displayList.filter(p => {
                    const catLower = (p.category ?? "").toLowerCase();
                    const nameLower = p.name.toLowerCase();
                    const target = category.name;
                    
                    if (target === "Seawater Fish") return catLower.includes("sea") || catLower.includes("reef") || catLower.includes("snapper");
                    if (target === "Freshwater Fish") return catLower.includes("fresh") || catLower.includes("river") || catLower.includes("rohu");
                    if (target === "Prawns & Shrimps") return catLower.includes("prawn") || catLower.includes("shrimp");
                    if (target === "Crabs & Lobsters") return catLower.includes("crab") || catLower.includes("lobster") || catLower.includes("crustacean");
                    if (target === "Steaks & Fillets") return catLower.includes("steak") || catLower.includes("fillet") || catLower.includes("cut");
                    if (target === "Exotic Catch") return catLower.includes("exotic") || catLower.includes("premium") || catLower.includes("deep sea") || nameLower.includes("tuna") || nameLower.includes("salmon") || nameLower.includes("lobster");
                    if (target === "Ready to Cook") return catLower.includes("ready") || catLower.includes("marinated") || catLower.includes("cook") || nameLower.includes("marinated") || nameLower.includes("fry") || nameLower.includes("finger") || nameLower.includes("batter");
                    if (target === "Coastal Dry Fish") return catLower.includes("dry") || catLower.includes("dried") || nameLower.includes("dry") || nameLower.includes("dried");
                    return catLower.includes(target.toLowerCase().split(" ")[0]);
                  });

                  if (categoryProducts.length === 0) return null;

                  return (
                    <React.Fragment key={category.slug}>
                      <View className="space-y-3">
                         <View className="flex-row items-center justify-between">
                          <View>
                            <Text className="text-xl font-black uppercase italic" style={{ color: colors.text }} numberOfLines={1}>
                              {category.name.split(" ")[0]} <Text style={{ color: category.glowColor }}>{category.name.split(" ").slice(1).join(" ") || ""}</Text>
                            </Text>
                            <View className="mt-1.5 mb-2.5" style={{ height: 2, width: 64, borderRadius: 999, overflow: 'hidden' }}>
                              <LinearGradient
                                colors={[colors.text, category.glowColor]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ flex: 1 }}
                              />
                            </View>
                          </View>
                          <Pressable onPress={() => setActiveTab(category.name)}>
                             <Text className="text-[10px] font-black uppercase" style={{ color: colors.primary }}>View All</Text>
                          </Pressable>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4 pb-2">
                          <View className="flex-row gap-4 pr-8">
                            {categoryProducts.slice(0, 10).map(p => (
                              <View key={p.id} className="w-[180px]">
                                <ProductCard product={p} onSelectCut={() => openCut(p)} />
                              </View>
                            ))}
                          </View>
                        </ScrollView>
                      </View>

                      {category.name === "Seawater Fish" && addons.length > 0 && (
                        <View className="space-y-3 mt-6">
                          <View className="flex-row items-center justify-between">
                            <View>
                              <Text className="text-xl font-black uppercase italic" style={{ color: colors.text }} numberOfLines={1}>
                                Cooking <Text style={{ color: "#10B981" }}>Extras</Text>
                              </Text>
                              <View className="mt-1.5 mb-2.5" style={{ height: 2, width: 64, borderRadius: 999, overflow: 'hidden' }}>
                                <LinearGradient
                                  colors={[colors.text, "#10B981"]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  style={{ flex: 1 }}
                                />
                              </View>
                            </View>
                          </View>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4 pb-2">
                            <View className="flex-row gap-3 pr-8">
                              {addons.map(addon => (
                                <View key={addon.id} className="w-[180px] rounded-none border p-2" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                                  <View className="flex-row items-center gap-2">
                                    <Image source={{ uri: addon.image_url || "https://images.unsplash.com/photo-1596683788737-88981f33f674?q=80&w=500" }} className="h-10 w-10 rounded-none bg-black/10" contentFit="cover" />
                                    <View className="flex-1">
                                      <Text className="text-[10px] font-black uppercase leading-tight" style={{ color: colors.text }} numberOfLines={2}>{addon.name}</Text>
                                      <Text className="text-[8px] italic" style={{ color: colors.textMuted }}>{addon.type || "Add-on"}</Text>
                                    </View>
                                  </View>
                                  <View className="mt-2 flex-row items-center justify-between border-t pt-2" style={{ borderTopColor: colors.border }}>
                                    <Text className="text-[10px] font-black text-emerald-400">₹{addon.price}</Text>
                                    <Pressable onPress={() => handleAddAddon(addon)} className="rounded-none px-3 py-1.5" style={{ backgroundColor: colors.primary }}>
                                      <Text 
                                        className="text-[8px] font-black uppercase" 
                                        style={{ color: isLightColor(colors.primary) ? "#000000" : "#FFFFFF" }}
                                      >
                                        + ADD
                                      </Text>
                                    </Pressable>
                                  </View>
                                </View>
                              ))}
                            </View>
                          </ScrollView>
                        </View>
                      )}
                    </React.Fragment>
                  );
                })}

              </View>
            )}

            {!showLayers && (
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {displayList.map((p) => (
                  <ProductCard key={p.id} product={p} compact onSelectCut={() => openCut(p)} />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View 
            className="my-12 items-center rounded-none border border-dashed p-8"
            style={{ borderColor: colors.border }}
          >
            <Text style={{ fontSize: 32 }}>🔍</Text>
            <Text className="mt-3 text-sm font-black uppercase" style={{ color: colors.text }}>
              {searchText.trim() ? 'No products found' : 'No products available'}
            </Text>
            <Text className="mt-1 text-[10px] font-semibold text-center" style={{ color: colors.textMuted }}>
              {searchText.trim()
                ? `We couldn't find anything matching "${searchText.trim()}". Try a different keyword.`
                : `No products are listed in this category right now. Check back soon!`}
            </Text>
            {searchText.trim() ? (
              <Pressable onPress={() => setSearchText('')} className="mt-4 px-4 py-2" style={{ backgroundColor: colors.primary, borderRadius: 4 }}>
                <Text 
                  className="text-[10px] font-black uppercase" 
                  style={{ color: isLightColor(colors.primary) ? "#000000" : "#FFFFFF" }}
                >
                  Clear Search
                </Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => router.replace("/home")} className="mt-4">
                <Text className="text-[10px] font-bold" style={{ color: colors.primary }}>Back to Home</Text>
              </Pressable>
            )}
          </View>
        )}
        <FssaiBanner />
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

