import { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable, FlatList, Dimensions, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { productService } from "@/services/productService";
import { homeService, type CutOption } from "@/services/homeService";
import { CutSelectionModal } from "@/components/customer/CutSelectionModal";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { assetUrl } from "@/config/assets";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import type { TodaysCatchItem } from "@/services/homeService";
import { useImageAspectRatio } from "@/hooks/useImageAspectRatio";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColors } from "@/hooks/useThemeColors";
import { SectionTitle } from "@/components/customer/SectionTitle";
import Svg, { Path } from "react-native-svg";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/customer/ProductCard";
import { useAuthStore } from "@/store/authStore";
import { checkoutService } from "@/services/checkoutService";
import i18n from "@/lib/i18n";
import { useSettingsStore } from "@/store/settingsStore";

const MOCK_RECIPES = [
  { title: "Simple Steam", time: "15 min", difficulty: "Easy" },
  { title: "Pan-Seared with Garlic", time: "20 min", difficulty: "Medium" }
];

const MOCK_REVIEWS = [
  { name: "John D.", rating: 5, date: "2 days ago", comment: "Exceptional quality. The freshness was undeniable." },
  { name: "Sarah M.", rating: 4, date: "1 week ago", comment: "Very good, though delivery took slightly longer than expected." }
];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const cart = useCartStore();
  const { toast, ToastHost } = useToast();
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  const currentLanguage = settings.language; // force re-render

  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [cutOpen, setCutOpen] = useState(false);
  const [cutOptions, setCutOptions] = useState<CutOption[]>([]);
  const [selectedCut, setSelectedCut] = useState<CutOption | null>(null);
  const [cutLoading, setCutLoading] = useState(false);
  const [currentArea, setCurrentArea] = useState("");
  const [showAllAddons, setShowAllAddons] = useState(false);

  const [currentPrice, setCurrentPrice] = useState(0);
  const [selectedPrepOption, setSelectedPrepOption] = useState<any>(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullScreenVisible, setIsFullScreenVisible] = useState(false);
  const screenWidth = Dimensions.get("window").width;
  const flatListRef = useRef<FlatList>(null);

  const getProductGallery = (prod: any): string[] => {
    if (!prod) return [];
    const galleryVal = prod.gallery;
    if (!galleryVal) return [];
    if (Array.isArray(galleryVal)) return galleryVal;
    try {
      const parsed = typeof galleryVal === 'string' ? JSON.parse(galleryVal) : galleryVal;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  const rawImages = product
    ? [
        String(product.image_url ?? (product.images as string[])?.[0] ?? product.image ?? ""),
        ...getProductGallery(product)
      ].filter(Boolean)
    : [];
  const allImages = Array.from(new Set(rawImages));

  const hasThumbnails = allImages.length > 1;
  const paddingLeft = hasThumbnails ? 0 : 16;
  const paddingRight = 16;
  const thumbnailWidth = hasThumbnails ? 72 : 0;
  const gapWidth = hasThumbnails ? 10 : 0;
  const viewWidth = screenWidth - paddingLeft - paddingRight - thumbnailWidth - gapWidth;

  const img = allImages[0] ?? "";
  const colors = useThemeColors();
  const { data: allProducts } = useProducts();
  const similarProducts = (allProducts ?? []).filter(p => p.id !== id).slice(0, 4);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      setLoading(true);
      let area = "";
      try {
        if (user) {
          const addresses = await checkoutService.fetchAddresses(user.id);
          const defaultAddr = addresses.find((a) => a.is_default === 1 || a.is_default === true) || addresses[0];
          if (defaultAddr && defaultAddr.jetty) {
            area = defaultAddr.jetty;
            setCurrentArea(area);
          }
        }
      } catch (err) {
        console.log("Error loading address in mobile details:", err);
      }
      
      try {
        const data = await productService.fetchById(String(id), area);
        setProduct(data);
        if (data && data.prep_options && data.prep_options.length > 0) {
          const rawOpt = data.prep_options.find((o: any) => o.prep_type === 'RAW');
          setSelectedPrepOption(rawOpt || data.prep_options[0]);
        }
      } catch {
        toast("Product sync failed", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, user]);

  useEffect(() => {
    if (!product) return;
    const p = product as any;
    const base = Number(p.live_price ?? p.price ?? 0);
    const prepAdd = selectedPrepOption ? parseFloat(selectedPrepOption.price_flat_add) : 0;
    setCurrentPrice(base + prepAdd);
  }, [product, selectedPrepOption]);

  const openCut = async () => {
    setCutOpen(true);
    setCutLoading(true);
    try {
      const options = await homeService.fetchCutOptions(String(id), currentArea);
      setCutOptions(options);
      setSelectedCut(options.find((c) => c.is_available !== false) ?? options[0] ?? null);
    } catch {
      toast("Cut options unavailable", "error");
    } finally {
      setCutLoading(false);
    }
  };

  const confirmCut = (weight: number) => {
    if (!product || !selectedCut) return;
    const name = String(product.name ?? "Product");
    const rawImg = String(product.image_url ?? (product.images as string[])?.[0] ?? product.image ?? "");
    const prepAdd = selectedPrepOption ? parseFloat(selectedPrepOption.price_flat_add) : 0;
    cart.addItem({
      id: `${id}-${selectedCut.cut_type}${selectedPrepOption ? '-' + selectedPrepOption.prep_type : ''}`,
      name: `${name} (${selectedCut.label})${selectedPrepOption ? ' - ' + selectedPrepOption.name : ''}`,
      price: selectedCut.final_price + prepAdd,
      quantity: weight,
      image: rawImg,
      sellerId: String(product.seller_id ?? ""),
      metadata: {
        cut_type: selectedCut.cut_type,
        base_product_id: id,
        prep_option: selectedPrepOption ? {
          id: selectedPrepOption.id,
          prep_type: selectedPrepOption.prep_type,
          name: selectedPrepOption.name,
          price_flat_add: selectedPrepOption.price_flat_add
        } : null
      },
    });
    toast("Added to cart", "success");
    setCutOpen(false);
  };

  const handleAddAddonToCart = (addon: any) => {
    cart.addItem({
      id: addon.id,
      name: addon.name,
      price: parseFloat(addon.price),
      quantity: 1,
      image: addon.image_url || resolveMediaUrl("/ICONS/masala.png"),
      sellerId: product ? String(product.seller_id ?? "") : "",
      metadata: { is_addon: true }
    });
    toast(`${addon.name} added to cart.`, "success");
  };

  const isAddonInCart = (addonId: string) => {
    return cart.items.some((item: any) => item.id === addonId);
  };

  const handleToggleAddon = (addon: any) => {
    if (isAddonInCart(addon.id)) {
      cart.removeItem(addon.id);
      toast(`${addon.name} removed from cart.`, "success");
    } else {
      handleAddAddonToCart(addon);
    }
  };

  const isComingSoon = product ? (product.badge === 'COMING SOON' || product.badge === 'COMING_SOON' || product.availability === 'Coming Soon' || product.availability === 'COMING SOON') : false;

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

  const p = product as any;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <ScrollView contentContainerClassName="pb-28">
        <View style={{ width: screenWidth, height: viewWidth, flexDirection: 'row', backgroundColor: colors.bg, paddingLeft: paddingLeft, paddingRight: paddingRight, marginTop: 8 }}>
          {/* Left-side Thumbnails */}
          {allImages.length > 1 && (
            <ScrollView 
              style={{ width: 72, height: '100%' }} 
              showsVerticalScrollIndicator={false}
            >
              {allImages.map((imgUrl, i) => {
                const isActive = i === activeImageIndex;
                return (
                  <Pressable 
                    key={i} 
                    onPress={() => {
                      flatListRef.current?.scrollToIndex({ index: i, animated: true });
                      setActiveImageIndex(i);
                    }}
                    style={{ 
                      width: 72, 
                      height: 72, 
                      marginBottom: 6, 
                      borderWidth: 2, 
                      borderRadius: 8,
                      borderColor: isActive ? colors.primary : 'transparent',
                      opacity: isActive ? 1 : 0.6,
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    {imgUrl ? (
                      <Image source={{ uri: resolveMediaUrl(imgUrl) }} style={{ width: '100%', height: '100%', borderRadius: 6 }} contentFit="contain" />
                    ) : (
                      <Text style={{ fontSize: 24 }}>🐟</Text>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <View 
            style={{ 
              width: viewWidth, 
              height: viewWidth, 
              position: 'relative', 
              backgroundColor: colors.card, 
              borderRadius: 12, 
              borderWidth: 1, 
              borderColor: colors.border,
              overflow: 'hidden',
              marginLeft: gapWidth
            }}
          >
            {allImages.length > 0 ? (
              <FlatList
                ref={flatListRef}
                data={allImages}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `${item}-${index}`}
                style={{ width: viewWidth, height: viewWidth }}
                onScroll={(event) => {
                  const xOffset = event.nativeEvent.contentOffset.x;
                  const index = Math.round(xOffset / viewWidth);
                  if (index !== activeImageIndex && index >= 0 && index < allImages.length) {
                    setActiveImageIndex(index);
                  }
                }}
                scrollEventThrottle={16}
                renderItem={({ item }) => {
                  return (
                    <Pressable
                      onPress={() => setIsFullScreenVisible(true)}
                      style={{ width: viewWidth, height: viewWidth }}
                    >
                      <Image
                        source={{ uri: resolveMediaUrl(item) }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="contain"
                      />
                    </Pressable>
                  );
                }}
              />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: viewWidth, height: viewWidth }}>
                <Text className="text-8xl">🐟</Text>
              </View>
            )}

            {/* Floating Badge Indicator (Amazon Style) */}
            {allImages.length > 1 && (
              <View className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded-full border border-white/10 z-10">
                <Text className="text-white text-[10px] font-black tracking-widest">
                  {activeImageIndex + 1} / {allImages.length}
                </Text>
              </View>
            )}

            {/* Tap overlay info */}
            {allImages.length > 0 && (
              <View className="absolute top-4 right-4 bg-black/45 px-2 py-1 rounded flex-row items-center gap-1 border border-white/5 z-10">
                <MaterialCommunityIcons name="magnify-plus-outline" size={10} color="#fff" />
                <Text className="text-white text-[8px] font-bold uppercase">Tap to zoom</Text>
              </View>
            )}
          </View>
        </View>

        {/* Dynamic Pagination Dots (Amazon Style Dynamic Pills) */}
        {allImages.length > 1 && (
          <View className="flex-row justify-center items-center gap-1.5 py-3 bg-background">
            {allImages.map((_, index) => {
              const isActive = index === activeImageIndex;
              return (
                <View
                  key={index}
                  className="transition-all duration-200"
                  style={{
                    height: 6,
                    width: isActive ? 16 : 6,
                    borderRadius: 3,
                    backgroundColor: isActive ? colors.primary : `${colors.textMuted}30`
                  }}
                />
              );
            })}
          </View>
        )}
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
          <View className="flex-row items-baseline gap-2 mt-4">
            <Text className="text-3xl font-black italic text-primary">
              ₹{currentPrice.toLocaleString()}
              <Text className="text-sm opacity-60 font-normal">/{String(product.unit ?? "kg")}</Text>
            </Text>
            {p.discount_percent > 0 ? (
              <>
                <Text className="text-sm line-through text-muted-foreground ml-1 font-mono">
                  ₹{Math.round(Number(p.originalPrice ?? currentPrice * (100/(100-p.discount_percent)))).toLocaleString()}
                </Text>
                <View className="rounded bg-red-500/10 px-1.5 py-0.5 border border-red-500/20 ml-1">
                  <Text className="text-[8px] font-black text-red-500 uppercase">{p.discount_percent}% OFF</Text>
                </View>
              </>
            ) : null}
          </View>
          {product.live_harbor ? (
            <Text className="mt-2 text-[10px] font-black uppercase text-emerald-500">
              Live @ {String(product.live_harbor)} • {String(product.remaining_kg ?? product.live_stock)}kg left
            </Text>
          ) : null}

          {/* --- FRESHNESS DECAY CLOCK --- */}
          <View className="mt-4 p-3 border flex-row items-center justify-between" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="clock-outline" size={16} color={colors.primary} />
              <View>
                <Text className="text-[10px] font-black uppercase" style={{ color: colors.text }}>Landed: 4h 12m ago</Text>
                <Text className="text-[8px] font-bold uppercase" style={{ color: colors.textMuted }}>Prime Quality Index (A+)</Text>
              </View>
            </View>
            <View className="rounded-full bg-emerald-500/10 px-2 py-1 border border-emerald-500/20">
              <Text className="text-[8px] font-black text-emerald-500 uppercase">98% FRESH</Text>
            </View>
          </View>

          {/* Licious-Style Smart Add-ons Cross-Sell Engine */}
          {p.addons && p.addons.length > 0 ? (
            <View className="mt-6 p-4 rounded-[20px] border" style={{ backgroundColor: 'rgba(16, 185, 129, 0.03)', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-1">
                  <MaterialCommunityIcons name="plus" size={14} color="#10B981" />
                  <Text className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    Complete Your Recipe
                  </Text>
                </View>
                <View className="rounded bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/20">
                  <Text className="text-[6px] font-black text-emerald-400 uppercase tracking-widest">
                    RECOMMENDED PAIRING
                  </Text>
                </View>
              </View>
              <Text className="text-[9px] text-muted-foreground mb-3 leading-4">
                Frequently bought together with this catch for a perfect culinary experience:
              </Text>
              
              <View className="flex-col gap-2 mt-1">
                {(showAllAddons ? p.addons : p.addons.slice(0, 3)).map((addon: any) => {
                  const inCart = isAddonInCart(addon.id);
                  const addonImg = addon.image_url || resolveMediaUrl("/ICONS/masala.png");
                  return (
                    <View 
                      key={addon.id} 
                      className="w-full p-2 border rounded-xl flex-row items-center justify-between"
                      style={{ backgroundColor: colors.card, borderColor: colors.border }}
                    >
                      <View className="flex-row items-center flex-1 pr-3">
                        <Image 
                          source={{ uri: addonImg }} 
                          className="w-10 h-10 rounded-lg bg-black/10 border mr-3"
                          style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
                        />
                        <View className="flex-1 justify-center">
                          <Text className="text-[10px] font-black uppercase text-foreground" numberOfLines={1}>{addon.name}</Text>
                          <Text className="text-[8px] text-muted-foreground mt-0.5" numberOfLines={1}>
                            {addon.description || "Fresh pairing."}
                          </Text>
                          <Text className="text-[10px] font-black text-emerald-400 mt-0.5">₹{addon.price}</Text>
                        </View>
                      </View>
                      
                      <Pressable
                        onPress={() => handleToggleAddon(addon)}
                        className={`px-3 py-1.5 rounded-lg flex-row items-center justify-center gap-1 border ${
                          inCart ? 'bg-emerald-600 border-emerald-600' : 'bg-transparent'
                        }`}
                        style={{ borderColor: inCart ? '#059669' : colors.primary }}
                      >
                        {inCart ? (
                          <>
                            <MaterialCommunityIcons name="check" size={10} color="#fff" />
                            <Text className="text-[9px] font-black uppercase tracking-widest text-white">ADDED</Text>
                          </>
                        ) : (
                          <Text className="text-[9px] font-black uppercase tracking-widest" style={{ color: colors.primary }}>+ ADD</Text>
                        )}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
              {p.addons.length > 3 && (
                <Pressable
                  onPress={() => setShowAllAddons(!showAllAddons)}
                  className="mt-3 py-2 items-center justify-center border rounded-lg bg-emerald-500/10"
                  style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}
                >
                  <Text className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    {showAllAddons ? "View Less ↑" : `View ${p.addons.length - 3} More Add-ons ↓`}
                  </Text>
                </Pressable>
              )}
            </View>
          ) : null}

          {/* Preparation & Cooking Customizations */}
          {p.prep_options && p.prep_options.length > 0 ? (
            <View className="mt-6">
              <Text className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: colors.primary }}>
                🍳 Cooking Prep Customization
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                {p.prep_options.map((option: any) => {
                  const isSelected = selectedPrepOption?.id === option.id;
                  const getPrepEmoji = (type: string) => {
                    switch (type.toUpperCase()) {
                      case 'RAW': return '🐟';
                      case 'MARINATED': return '🧂';
                      case 'GRILLED': return '🔥';
                      case 'FRIED': return '🍳';
                      default: return '🍽️';
                    }
                  };
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setSelectedPrepOption(option)}
                      className="p-3 border rounded-xl items-center justify-center min-w-[90px]"
                      style={{
                        backgroundColor: isSelected ? `${colors.primary}15` : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border
                      }}
                    >
                      <Text className="text-xl mb-1">{getPrepEmoji(option.prep_type)}</Text>
                      <Text className="text-[10px] font-black uppercase text-foreground">{option.name}</Text>
                      <Text className="text-[9px] text-muted-foreground mt-0.5">
                        {option.price_flat_add > 0 ? `+ ₹${option.price_flat_add}` : "Included"}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}


          {isComingSoon ? (
            <View className="mt-8">
              <View className="bg-amber-500/20 border border-amber-500/30 rounded-xl py-4 items-center">
                <Text className="text-amber-500 font-black uppercase tracking-widest text-center">
                  🚢 COMING SOON - NOT YET HARVESTED IN THIS SECTOR
                </Text>
              </View>
            </View>
          ) : (
            <View className="mt-8 gap-3">
              <Button label="SELECT CUT & ADD" onPress={openCut} />
              <Button
                label="ADD WHOLE TO CART"
                variant="ghost"
                onPress={() => {
                  const prepAdd = selectedPrepOption ? parseFloat(selectedPrepOption.price_flat_add) : 0;
                  cart.addItem({
                    id: `${id}${selectedPrepOption ? '-' + selectedPrepOption.prep_type : ''}`,
                    name: selectedPrepOption ? `${String(product.name)} (${selectedPrepOption.name})` : String(product.name),
                    price: Number(product.live_price ?? product.price ?? 0) + prepAdd,
                    quantity: 1,
                    image: img,
                    sellerId: String(product.seller_id ?? ""),
                    metadata: {
                      prep_option: selectedPrepOption ? {
                        id: selectedPrepOption.id,
                        prep_type: selectedPrepOption.prep_type,
                        name: selectedPrepOption.name,
                        price_flat_add: selectedPrepOption.price_flat_add
                      } : null
                    }
                  });
                  toast("Added to cart", "success");
                }}
              />
            </View>
          )}

          {/* --- YIELD & CULINARY CUT VISUALIZER --- */}
          <View className="mt-6 p-4 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <Text className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: colors.primary }}>
              🔪 Yield & Cut Reference
            </Text>
            <View className="gap-2">
              {[
                { name: "Curry Cut", yield: "75% Yield", desc: "Bone-in, perfect for traditional slow curries." },
                { name: "Fillet", yield: "55% Yield", desc: "Boneless & skinless, ideal for pan-searing/grilling." },
                { name: "Whole Cleaned", yield: "85% Yield", desc: "Cleaned gills & entrails, best for baking/tandoor." }
              ].map((item, idx) => (
                <View key={idx} className="flex-row justify-between items-start py-1.5 border-b" style={{ borderBottomColor: `${colors.border}50` }}>
                  <View className="flex-1 pr-4">
                    <Text className="text-xs font-black uppercase text-foreground">{item.name}</Text>
                    <Text className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</Text>
                  </View>
                  <Text className="text-xs font-black italic text-primary">{item.yield}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* --- LAYER 2: INTELLIGENCE MATRIX --- */}
        <View className="px-4 py-6 border-t" style={{ borderColor: colors.border }}>
          <SectionTitle title="Scientific Intelligence" subtitle="ALPHA-v1.1" />
          <View className="flex-row flex-wrap gap-2 mt-4">
            {[
              { label: "Protein", value: p?.nutrition?.protein || "20g", icon: "fire", color: colors.primary },
              { label: "Omega-3", value: p?.nutrition?.omega3 || "300mg", icon: "heart", color: "#3b82f6" },
              { label: "Calories", value: p?.nutrition?.calories || "100 kcal", icon: "lightning-bolt", color: "#f59e0b" },
              { label: "Fat", value: p?.nutrition?.fat || "2g", icon: "snowflake", color: "#06b6d4" }
            ].map((fact, idx) => (
              <View 
                key={idx} 
                className="w-[48%] p-3 items-center justify-center border" 
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
              >
                <MaterialCommunityIcons name={fact.icon as any} size={16} color={fact.color} />
                <Text className="text-[10px] font-black uppercase mt-1" style={{ color: colors.textMuted }}>{fact.label}</Text>
                <Text className="text-sm font-black italic mt-1" style={{ color: colors.text }}>{fact.value}</Text>
              </View>
            ))}
          </View>

          {/* --- COLD-CHAIN TELEMETRY GUARD --- */}
          <View className="mt-4 p-4 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <Text className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: colors.primary }}>
              ❄️ Cold-Chain Telemetry Guard
            </Text>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-xs font-black" style={{ color: colors.text }}>Stable -18.2°C</Text>
                <Text className="text-[8px] font-bold uppercase mt-0.5" style={{ color: colors.textMuted }}>Continuous Cold-Chain Active</Text>
              </View>
              <View className="flex-row gap-1">
                {[-18.0, -18.2, -18.1, -18.2].map((t, idx) => (
                  <View key={idx} className="bg-blue-500/10 px-1.5 py-1 border border-blue-500/20 rounded">
                    <Text className="text-[8px] font-black text-blue-500">{t}°C</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className="mt-4 p-4 border flex-row items-center gap-4" style={{ backgroundColor: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.3)" }}>
            <MaterialCommunityIcons name="check-decagram" size={24} color="#22c55e" />
            <View>
              <Text className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Quality Tested & Freshness Certified</Text>
              <Text className="text-[10px] uppercase font-bold text-emerald-500/70 mt-1">Certified Fresh • 100% Safe</Text>
            </View>
          </View>
        </View>

        {/* --- LAYER 3: CULINARY INTELLIGENCE --- */}
        <View className="px-4 py-6 border-t" style={{ borderColor: colors.border }}>
          <SectionTitle title="Chef Recipes" subtitle="Chef Recommended Preparations" />
          <View className="mt-4 gap-3">
            {(p.recipes || MOCK_RECIPES).map((recipe: any, i: number) => (
              <Pressable 
                key={i} 
                onPress={() => router.push({ pathname: "/recipe/[id]", params: { id: String(recipe.id || 1) } })}
                className="p-4 border flex-row items-center justify-between"
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
              >
                <View>
                  <Text className="text-xs font-black uppercase italic" style={{ color: colors.text }}>{recipe.title}</Text>
                  <View className="flex-row items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest">
                    <Text className="text-[10px]" style={{ color: colors.textMuted }}>⏱ {recipe.time}</Text>
                    <Text className="text-[10px]" style={{ color: colors.textMuted }}>{recipe.difficulty}</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.primary} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* --- LAYER 4: AUTHORITY REGISTRY --- */}
        <View className="px-4 py-6 border-t" style={{ borderColor: colors.border }}>
          <SectionTitle title="Authority Registry" subtitle="Fleet Certification" />
          <View className="p-4 mt-4 border flex-row items-center gap-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
             <View className="w-12 h-12 rounded-full items-center justify-center border" style={{ backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}40` }}>
                <Text className="text-xl">⚓</Text>
             </View>
             <View>
                <Text className="text-sm font-black uppercase italic" style={{ color: colors.text }}>
                  {String(p.seller_name ?? "Verified Fleet")}
                </Text>
                <Text className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mt-1">
                  Fleet Certified Agent
                </Text>
             </View>
          </View>

          {/* --- LIVE VESSEL & TRACEABILITY REGISTRY --- */}
          <View className="p-4 mt-3 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <Text className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: colors.primary }}>
              🚢 Live Vessel & Traceability Registry
            </Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-[10px] font-black uppercase text-muted-foreground">Vessel ID</Text>
                <Text className="text-[10px] font-black uppercase text-foreground">M.V. Samudra-III</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-[10px] font-black uppercase text-muted-foreground">Gear Used</Text>
                <Text className="text-[10px] font-black uppercase text-foreground">Handline / Line-Caught</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-[10px] font-black uppercase text-muted-foreground">Captain</Text>
                <Text className="text-[10px] font-black uppercase text-foreground">Capt. Anand Shekhar</Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- LAYER 5: CUSTOMER INTELLIGENCE --- */}
        <View className="px-4 py-6 border-t" style={{ borderColor: colors.border }}>
          <SectionTitle title="Customer Intelligence" subtitle="Reputation Ledger" />
          <View className="mt-4 gap-3">
            {(p.customerReviews || MOCK_REVIEWS).map((review: any, i: number) => (
              <View key={i} className="p-4 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-center gap-2">
                    <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
                      <Text className="font-black" style={{ color: colors.primary }}>{review.name.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text className="text-[10px] font-black uppercase" style={{ color: colors.text }}>{review.name}</Text>
                      <Text className="text-[8px] font-bold uppercase" style={{ color: colors.textMuted }}>{review.date}</Text>
                    </View>
                  </View>
                  <Text className="text-[10px] font-black" style={{ color: "#f59e0b" }}>★ {review.rating}</Text>
                </View>
                <Text className="text-xs italic" style={{ color: colors.textMuted }}>"{review.comment}"</Text>
              </View>
            ))}
          </View>
          <Button label="SUBMIT FEEDBACK" variant="ghost" className="mt-4 border border-white/10" />
        </View>

        {/* --- LAYER 6: SIMILAR FLEET ASSETS --- */}
        <View className="px-4 py-6 border-t" style={{ borderColor: colors.border }}>
          <SectionTitle title="Similar Fleet Assets" subtitle="Explore Alternatives" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
            {similarProducts.map((p) => (
              <View key={p.id} className="mr-3 w-48">
                <ProductCard 
                  product={p} 
                  onSelectCut={() => {
                     // Normally you would navigate to the new product or open cut modal here
                     router.push({ pathname: "/product/[id]", params: { id: String(p.id) } });
                  }} 
                />
              </View>
            ))}
          </ScrollView>
        </View>

      </ScrollView>
      <CutSelectionModal
        visible={cutOpen}
        product={{ name: String(p.name), product_id: String(id) } as TodaysCatchItem}
        options={cutOptions}
        selected={selectedCut}
        loading={cutLoading}
        onSelect={setSelectedCut}
        onClose={() => setCutOpen(false)}
        onConfirm={confirmCut}
      />

      {/* Fullscreen Photo Viewer Modal (Amazon Style) */}
      <Modal
        visible={isFullScreenVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setIsFullScreenVisible(false)}
      >
        <View className="flex-1 bg-black justify-center items-center relative">
          {/* Top bar with Close button */}
          <View className="absolute top-12 left-0 right-0 px-6 flex-row justify-between items-center z-50">
            <Text className="text-white/60 text-xs font-black uppercase tracking-widest">
              Product Media Room
            </Text>
            <Pressable
              onPress={() => setIsFullScreenVisible(false)}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/10"
            >
              <MaterialCommunityIcons name="close" size={20} color="#fff" />
            </Pressable>
          </View>

          {/* Fullscreen Swipeable FlatList */}
          <FlatList
            data={allImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={activeImageIndex}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            keyExtractor={(item, index) => `fs-${item}-${index}`}
            renderItem={({ item }) => (
              <ScrollView
                style={{ width: screenWidth, height: '100%' }}
                contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', minHeight: '100%' }}
                maximumZoomScale={5.0}
                minimumZoomScale={1.0}
                bounces={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
              >
                <Image
                  source={{ uri: resolveMediaUrl(item) }}
                  style={{ width: screenWidth, height: screenWidth }}
                  contentFit="contain"
                />
              </ScrollView>
            )}
          />

          {/* Fullscreen bottom info overlay */}
          <View className="absolute bottom-12 left-0 right-0 items-center">
            <Text className="text-white text-sm font-black italic tracking-widest">
              {String(product.name)}
            </Text>
            <Text className="text-white/50 text-[10px] uppercase font-bold mt-1">
              Swipe left / right to navigate
            </Text>
          </View>
        </View>
      </Modal>

      {ToastHost}
    </View>
  );
}
