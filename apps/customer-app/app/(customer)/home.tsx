import { useMemo, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import Svg, { Polygon, Defs, LinearGradient as SvgLinearGradient, Stop, Path, ClipPath, Image as SvgImage } from "react-native-svg";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useHomeData } from "@/hooks/useHomeData";
import { useProducts } from "@/hooks/useProducts";
import { useFlashDealTimer } from "@/hooks/useFlashDealTimer";
import { ProductCard } from "@/components/customer/ProductCard";
import { useSettingsStore } from "@/store/settingsStore";
import { useCartStore } from "@/store/cartStore";
import { CATEGORIES } from "@/constants/categories";
import { SectionTitle } from "@/components/customer/SectionTitle";
import { CutSelectionModal } from "@/components/customer/CutSelectionModal";
import { MaritimeWaveDivider } from "@/components/customer/MaritimeWaveDivider";
import { AndamanMaritimeTelemetry } from "@/components/customer/AndamanMaritimeTelemetry";
import { OceanReelsFeed } from "@/components/customer/OceanReelsFeed";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { homeService, type CutOption, type TodaysCatchItem } from "@/services/homeService";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import { useImageAspectRatio } from "@/hooks/useImageAspectRatio";
import { t } from "@/lib/i18n";

import { useThemeColors } from "@/hooks/useThemeColors";

type BatchFilter = "ALL" | "MORNING" | "AFTERNOON" | "EVENING";

const PREMIUM_SELLERS = [
  { id: "SEL-001", name: "Marine Masters", rating: 4.9, speed: "30 min", image: "🚢", products: ["🍣", "🐟", "🦑"] },
  { id: "SEL-002", name: "Deep Sea Fleet", rating: 5.0, speed: "45 min", image: "⚓", products: ["🦞", "🦀", "🦐"] },
  { id: "SEL-003", name: "Arctic Harvest", rating: 4.8, speed: "60 min", image: "❄️", products: ["🥩", "🐟", "🦀"] },
];

const RECIPES = [
  { id: "REC-1", title: "Pan-Seared King Salmon", time: "20 min", difficulty: "Easy", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80" },
  { id: "REC-2", title: "Spicy Garlic Tiger Prawns", time: "15 min", difficulty: "Medium", image: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80" },
];

interface TodaysCatchCardProps {
  item: TodaysCatchItem;
  onPress: () => void;
  onOpenCut: () => void;
}

function TodaysCatchCard({ item, onPress, onOpenCut }: TodaysCatchCardProps) {
  const uri = resolveMediaUrl(item.catch_image_url || item.image_url);
  const { aspectRatio, onLoad } = useImageAspectRatio(uri);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const w = layout.width;
  const h = layout.height;

  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      onLayout={(e) => setLayout(e.nativeEvent.layout)}
      className="w-[48%] relative overflow-hidden"
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
        <Image
          source={{ uri }}
          onLoad={onLoad}
          className="h-full w-full"
          contentFit="contain"
        />
        <LinearGradient
          colors={["transparent", colors.isDark ? "rgba(2,6,23,0.8)" : "rgba(255,255,255,0.8)"]}
          className="absolute inset-0"
        />
        <View className="absolute left-2 top-2 rounded bg-emerald-500/80 px-2 py-0.5">
          <Text className="text-[7px] font-black uppercase text-white">
            {item.freshness_label}
          </Text>
        </View>
        {/* Offer Badge (Amazon/Licious Style) */}
        <View className="absolute right-2 top-2 rounded bg-red-500/90 px-2 py-0.5 z-20">
          <Text className="text-[7px] font-black uppercase text-white">
            15% OFF
          </Text>
        </View>
        <View className="absolute bottom-2 left-2 rounded-lg border border-white/10 bg-black/60 px-2 py-1">
          <Text className="text-[7px] font-black uppercase text-foreground">
            {item.harbor_node}
          </Text>
        </View>
        <View className="absolute bottom-2 right-2">
          <Text className="text-[7px] font-black text-foreground/60 uppercase">
            {t('stock')}
          </Text>
          <Text className="text-[10px] font-black" style={{ color: colors.primary }}>
            {item.remaining_kg}kg
          </Text>
        </View>
      </View>
      <View className="gap-2 p-3">
        <Text className="text-[8px] font-black uppercase text-emerald-500">
          {t('fresh_catch_of_the_day')}
        </Text>
        <Text
          className="text-sm font-black uppercase italic text-foreground"
          style={{ color: colors.text }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text className="text-[8px] uppercase italic text-muted-foreground" style={{ color: colors.textMuted }}>
          {t('handled_by')} {item.seller_name}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-black italic text-foreground" style={{ color: colors.text }}>
            ₹{item.price_per_kg}
            <Text className="text-[10px] opacity-40">/kg</Text>
          </Text>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onOpenCut();
            }}
            className="rounded-xl px-3 py-2 overflow-hidden relative"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-[9px] font-black uppercase text-white relative z-10">
              + CUT
            </Text>
            <Svg width="8" height="8" style={{ position: "absolute", top: -1, left: -1, zIndex: 20 }}>
              <Path d="M0,0 L8,0 L0,8 Z" fill={colors.card} />
            </Svg>
            <Svg width="8" height="8" style={{ position: "absolute", bottom: -1, right: -1, zIndex: 20 }}>
              <Path d="M8,8 L0,8 L8,0 Z" fill={colors.card} />
            </Svg>
          </Pressable>
        </View>
      </View>

      {/* High-Tech Beveled Corner Overlays for Visual Parity */}
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

export default function CustomerHomeScreen() {
  const { width } = Dimensions.get("window");
  const router = useRouter();
  const settings = useSettingsStore();
  const currentLanguage = useSettingsStore((s) => s.language); // Force re-render on language change
  const cart = useCartStore();
  const { toast, ToastHost } = useToast();
  const { cms, territories, todaysCatch } = useHomeData();
  const { data: allProducts } = useProducts();
  const { timeLeft, flashDealActive } = useFlashDealTimer();
  const featured = (allProducts ?? []).slice(0, 4);
  const promo = cms.data?.find((c) => c.type === "PROMO" && c.status === "PUBLISHED");

  const [activeBatch, setActiveBatch] = useState<BatchFilter>("ALL");
  const [cutProduct, setCutProduct] = useState<TodaysCatchItem | null>(null);
  const [cutOptions, setCutOptions] = useState<CutOption[]>([]);
  const [selectedCut, setSelectedCut] = useState<CutOption | null>(null);
  const [cutLoading, setCutLoading] = useState(false);
  const [cutOpen, setCutOpen] = useState(false);
  const [subEmailLayout, setSubEmailLayout] = useState({ width: 0, height: 0 });
  const [subBtnLayout, setSubBtnLayout] = useState({ width: 0, height: 0 });

  const banner = cms.data?.find((c) => c.type === "BANNER" && c.status === "PUBLISHED");
  const titleParts = banner?.title?.split(":") ?? [];
  const heroTitle = titleParts[0] || "Maritime";
  const heroAccent = titleParts[1]?.trim() || "Redefined.";
  const heroImage = resolveMediaUrl(settings.customerAssets.hero);
  const promoImage =
    resolveMediaUrl(banner?.image_url) || resolveMediaUrl(settings.customerAssets.promo);

  const colors = useThemeColors();
  const primaryColor = colors.primary;

  const getRgba = (hex: string, alpha: number) => {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  useEffect(() => {
    settings.fetchSettings();
  }, [settings.fetchSettings]);

  const filteredCatch = useMemo(() => {
    const items = todaysCatch.data ?? [];
    if (activeBatch === "ALL") return items;
    return items.filter((c) => c.batch_label === activeBatch);
  }, [todaysCatch.data, activeBatch]);

  const onRefresh = useCallback(() => {
    settings.fetchSettings();
    cms.refetch();
    todaysCatch.refetch();
  }, [settings.fetchSettings, cms, todaysCatch]);

  const openCutModal = async (product: TodaysCatchItem) => {
    setCutProduct(product);
    setCutOpen(true);
    setCutLoading(true);
    setSelectedCut(null);
    try {
      const options = await homeService.fetchCutOptions(
        String(product.product_id)
      );
      setCutOptions(options);
      const first = options.find((c) => c.is_available !== false) ?? options[0] ?? null;
      setSelectedCut(first);
    } catch {
      toast("Failed to load options", "error");
    } finally {
      setCutLoading(false);
    }
  };

  const confirmCut = () => {
    if (!cutProduct || !selectedCut) return;
    const pid = cutProduct.product_id;
    cart.addItem({
      id: `${pid}-${selectedCut.cut_type}`,
      name: `${cutProduct.name} (${selectedCut.label})`,
      price: selectedCut.final_price,
      quantity: 1,
      image: cutProduct.catch_image_url || cutProduct.image_url,
      sellerName: cutProduct.seller_name,
      metadata: {
        cut_type: selectedCut.cut_type,
        base_product_id: pid,
      },
    });
    toast(`${cutProduct.name} [${selectedCut.label}] added to cart`, "success");
    setCutOpen(false);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28 pt-2"
        refreshControl={
          <RefreshControl
            refreshing={todaysCatch.isRefetching}
            onRefresh={onRefresh}
            tintColor={primaryColor}
          />
        }
      >
        {/* Hero */}
        <View className="relative min-h-[224px] overflow-hidden">
          {heroImage ? (
            <Image
              source={{ uri: heroImage }}
              className="absolute inset-0 h-full w-full"
              contentFit="cover"
              priority="high"
            />
          ) : null}
          <View className="relative z-10 px-4 pb-5 pt-3 flex-1">
            <View className="flex-1">
              <View 
                className="self-start rounded-full border px-2.5 py-1"
                style={{
                  borderColor: getRgba(primaryColor, 0.2),
                  backgroundColor: getRgba(primaryColor, 0.1)
                }}
              >
                <Text className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: primaryColor }}>
                  {banner?.sector || "Local"} Market Sync: Active
                </Text>
              </View>
              <Text className="mt-2 text-2xl font-black uppercase italic leading-tight" style={{ color: colors.text }}>
                {heroTitle}
                {"\n"}
                <Text style={{ color: primaryColor }}>{heroAccent}</Text>
              </Text>
              <Text className="mt-1.5 text-xs font-medium italic" style={{ color: colors.textMuted }}>
                Delivered Fresh in Under 90 Minutes. Trusted by 50,000+ Customers.
              </Text>
            </View>
            <View className="mt-auto pt-3 flex-row gap-2">
              <Button
                label="SHOP FRESH"
                onPress={() => router.push("/products")}
                className="h-10 flex-1 shadow-[0_0_15px_rgba(0,0,0,0.8)]"
              />
              <Button
                label="CATEGORIES"
                variant="ghost"
                onPress={() => router.push("/products")}
                className="h-10 flex-1 border border-white/10 bg-black/40"
              />
            </View>
          </View>
        </View>

        {/* Ocean Reels Video Feed */}
        <OceanReelsFeed />

        {/* Maritime Wave Divider */}
        <MaritimeWaveDivider />

        {/* Category Grid - 4 columns, 2 rows circular layout (Amazon style) */}
        <View className="border-y border-white/5 py-4 px-4">
          <View className="flex-row flex-wrap justify-between gap-y-3.5">
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.slug}
                onPress={() =>
                  router.push({ pathname: "/products", params: { category: cat.slug } })
                }
                className="w-[23%] items-center"
              >
                <View
                  className="w-14 h-14 rounded-full items-center justify-center relative overflow-hidden"
                  style={{
                    backgroundColor: colors.isDark ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.9)",
                    borderWidth: 1.5,
                    borderColor: `${cat.glowColor}50`,
                  }}
                >
                  <Image
                    source={cat.image}
                    className="h-10 w-10"
                    contentFit="contain"
                  />
                </View>
                <Text
                  className="mt-1.5 text-center text-[7px] font-black uppercase tracking-widest"
                  numberOfLines={2}
                  style={{ color: colors.text, width: "100%", lineHeight: 9 }}
                >
                  {cat.name.replace(" ", "\n")}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Today's Catch */}
        <View className="px-4 py-8">
          <View className="mb-6 flex-col gap-4">
            <SectionTitle 
              title={t('todays_catch')}
              subtitle="Live Harbor Arrival • Freshness Guaranteed"
            />
             <View className="flex-row flex-wrap rounded-2xl border border-white/5 bg-secondary/40 p-1">
              {(["ALL", "MORNING", "AFTERNOON", "EVENING"] as BatchFilter[]).map((batch) => (
                <Pressable
                  key={batch}
                  onPress={() => setActiveBatch(batch)}
                  className="rounded-xl px-3 py-2"
                  style={activeBatch === batch ? { backgroundColor: primaryColor } : undefined}
                >
                  <Text
                    className="text-[9px] font-black uppercase tracking-widest"
                    style={{
                      color: activeBatch === batch ? "#FFFFFF" : colors.textMuted
                    }}
                  >
                    {t(batch.toLowerCase())}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {todaysCatch.isLoading ? (
            <View className="flex-row flex-wrap gap-3">
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  className="h-64 w-[47%] animate-pulse rounded-3xl bg-secondary/40"
                />
              ))}
            </View>
          ) : filteredCatch.length > 0 ? (
            <View className="flex-row flex-wrap justify-between gap-y-3">
              {filteredCatch.map((item) => (
                <TodaysCatchCard
                  key={item.catch_id}
                  item={item}
                  onPress={() =>
                    router.push({ pathname: "/product/[id]", params: { id: String(item.product_id) } })
                  }
                  onOpenCut={() => openCutModal(item)}
                />
              ))}
            </View>
          ) : (
            <View className="h-48 items-center justify-center rounded-3xl border-2 border-dashed border-white/10 opacity-50">
              <Text className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                No Live Harbor Stock in this sector
              </Text>
            </View>
          )}

          {todaysCatch.isError ? (
            <Text className="mt-4 text-center text-[10px] font-bold text-danger">
              Failed to sync products. Pull to refresh.
            </Text>
          ) : null}
        </View>

        {/* Featured Seafood */}
        <View className="border-y border-white/5 bg-secondary/20 px-4 py-8">
          <SectionTitle title="Featured Seafood" subtitle="Premium Fresh Quality" />
          {featured.length > 0 ? (
            <View className="mt-4 flex-row flex-wrap justify-between gap-y-3">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} compact onSelectCut={() => openCutModal({
                  catch_id: p.id,
                  product_id: p.id,
                  name: p.name,
                  seller_name: p.seller_name ?? "Verified Fleet",
                  harbor_node: "",
                  remaining_kg: p.stock ?? 0,
                  price_per_kg: Number(p.price),
                  batch_label: "MORNING",
                  freshness_label: "FRESH",
                  catch_image_url: p.image_url,
                })} />
              ))}
            </View>
          ) : (
            <ActivityIndicator className="my-8" color={primaryColor} />
          )}
        </View>

        {/* Chef's Recipes */}
        <View className="px-4 py-8">
          <View className="flex-row justify-between items-end mb-4">
            <SectionTitle title="Chef's Recipes" subtitle="Chef Tested Recipes" />
            <Pressable 
              onPress={() => router.push("/recipe")}
              className="px-3 py-1.5 rounded-lg border"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: colors.border }}
            >
              <Text className="text-[9px] font-black uppercase tracking-widest text-primary">VIEW ALL ➜</Text>
            </Pressable>
          </View>
          <View className="gap-4">
            {((cms.data?.filter(c => c.type === 'RECIPE' && c.status === 'PUBLISHED')?.length || 0) > 0
               ? cms.data!.filter(c => c.type === 'RECIPE' && c.status === 'PUBLISHED')
               : RECIPES).map((recipe: any) => {
               const meta = recipe.metadata ? (typeof recipe.metadata === 'string' ? JSON.parse(recipe.metadata) : recipe.metadata) : {};
               return (
              <Pressable 
                key={recipe.id} 
                className="relative h-44 overflow-hidden shadow-2xl justify-end"
                onPress={() => router.push({ pathname: "/recipe/[id]", params: { id: String(recipe.id) } })}
              >
                <Image 
                  source={{ uri: recipe.image_url || recipe.image }} 
                  className="absolute inset-0 h-full w-full opacity-60" 
                  contentFit="cover"
                />
                <LinearGradient 
                  colors={["transparent", "rgba(8,13,25,0.95)"]} 
                  className="absolute inset-0"
                />
                <View className="relative z-10 p-5 gap-2">
                  <View className="flex-row gap-2">
                    <View 
                      className="border px-2 py-0.5 rounded"
                      style={{
                        borderColor: getRgba(primaryColor, 0.2),
                        backgroundColor: getRgba(primaryColor, 0.1)
                      }}
                    >
                      <Text className="text-[8px] font-black uppercase" style={{ color: primaryColor }}>{meta.difficulty || recipe.difficulty || 'Expert'}</Text>
                    </View>
                    <View className="bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                      <Text className="text-[8px] font-black uppercase text-muted-foreground">{meta.time || recipe.time || '25m'}</Text>
                    </View>
                  </View>
                  <Text className="text-xl font-black uppercase italic text-foreground">{recipe.title}</Text>
                  <Text className="text-[9px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>VIEW RECIPE ➜</Text>
                </View>

                {/* Beveled overlays for culinary recipe cards */}
                <Svg width="24" height="24" style={{ position: "absolute", top: -1, left: -1, zIndex: 40 }}>
                  <Path d="M0,0 L24,0 L0,24 Z" fill={colors.bg} />
                  <Path d="M24,0 L0,24" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                </Svg>
                <Svg width="24" height="24" style={{ position: "absolute", bottom: -1, right: -1, zIndex: 40 }}>
                  <Path d="M24,24 L0,24 L24,0 Z" fill={colors.bg} />
                  <Path d="M0,24 L24,0" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                </Svg>
              </Pressable>
            );
          })}
          </View>
        </View>

        {/* Flash Deals */}
        {promo ? (
          <View 
            className="mx-4 my-6 p-6 relative overflow-hidden"
            style={{
              backgroundColor: getRgba(primaryColor, 0.2),
              borderColor: colors.border,
              borderWidth: 1
            }}
          >
            <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>
              {promo?.sector || "Flash Harvest"} Protocol
            </Text>
            <Text className="mt-2 text-3xl font-black uppercase italic" style={{ color: colors.text }}>
              {promo?.title || "Flash Deals."}
            </Text>
            
            {/* Render countdown only if flashDealActive is true */}
            {flashDealActive ? (
              <View className="mt-4 flex-row justify-center gap-2">
                {[timeLeft.hrs, timeLeft.min, timeLeft.sec].map((val, i) => (
                  <View key={i} className="min-w-[56px] rounded-xl border px-3 py-2" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                    <Text className="text-center text-xl font-black italic" style={{ color: colors.text }}>{val}</Text>
                    <Text className="text-center text-[7px] font-black uppercase" style={{ color: colors.textMuted }}>
                      {i === 0 ? "HRS" : i === 1 ? "MIN" : "SEC"}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="mt-4 self-center rounded border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
                <Text className="text-[9px] font-black uppercase text-emerald-500">
                  PROMO ACTIVE • SECURE HARVEST
                </Text>
              </View>
            )}
            
            <Button label="CLAIM ACCESS NOW" onPress={() => router.push("/products")} className="mt-6" />

            {/* Beveled overlays for flash deals */}
            <Svg width="24" height="24" style={{ position: "absolute", top: -1, left: -1, zIndex: 40 }}>
              <Path d="M0,0 L24,0 L0,24 Z" fill={colors.bg} />
              <Path d="M24,0 L0,24" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </Svg>
            <Svg width="24" height="24" style={{ position: "absolute", bottom: -1, right: -1, zIndex: 40 }}>
              <Path d="M24,24 L0,24 L24,0 Z" fill={colors.bg} />
              <Path d="M0,24 L24,0" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </Svg>
          </View>
        ) : null}

        {/* Split Promo: Maritime Grill & Flame-Sea Collections */}
        <View className="mx-4 my-6 bg-[#070b13] shadow-2xl relative overflow-hidden" style={{ height: 200 }}>
          <Svg width={width - 32} height={200} style={StyleSheet.absoluteFill}>
            <Defs>
              <SvgLinearGradient id="gradGrill" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#E23744" stopOpacity={0.8} />
                <Stop offset="0.7" stopColor="#7F1D1D" stopOpacity={0.9} />
                <Stop offset="1" stopColor="#450A0A" stopOpacity={0.95} />
              </SvgLinearGradient>
              <SvgLinearGradient id="gradSea" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#00d4ff" stopOpacity={0.15} />
                <Stop offset="0.6" stopColor="#0369a1" stopOpacity={0.85} />
                <Stop offset="1" stopColor={colors.bg} stopOpacity={0.98} />
              </SvgLinearGradient>
              <ClipPath id="clipGrill">
                <Polygon points={`0,0 ${width - 32},0 0,200`} />
              </ClipPath>
              <ClipPath id="clipSea">
                <Polygon points={`0,200 ${width - 32},0 ${width - 32},200`} />
              </ClipPath>
            </Defs>
            
            {/* Panel A Gradient Overlay (bottom layer) */}
            <Polygon points={`0,0 ${width - 32},0 0,200`} fill="url(#gradGrill)" />
            {/* Background Image for Grill (clipped, top layer) */}
            <SvgImage
              href={{ uri: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80" }}
              width={width - 32}
              height={200}
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#clipGrill)"
              opacity={0.65}
            />

            {/* Panel B Gradient Overlay (bottom layer) */}
            <Polygon points={`0,200 ${width - 32},0 ${width - 32},200`} fill="url(#gradSea)" />
            {/* Background Image for Sea (clipped, top layer) */}
            <SvgImage
              href={{ uri: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80" }}
              width={width - 32}
              height={200}
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#clipSea)"
              opacity={0.55}
            />
          </Svg>

          {/* Left Panel A Content (Maritime Grill Masters) */}
          <View style={{ position: "absolute", left: 16, top: 16, width: (width - 32) * 0.52, zIndex: 10 }}>
            {/* Floating HUD Icons for Grill Panel */}
            <View style={StyleSheet.absoluteFillObject} className="pointer-events-none opacity-20">
              <MaterialCommunityIcons name="fire" size={24} color="#E23744" style={{ position: "absolute", top: 10, left: 70 }} />
              <MaterialCommunityIcons name="fish" size={26} color="#fff" style={{ position: "absolute", top: 80, left: 30, transform: [{ rotate: "-45deg" }] }} />
              <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#fff" style={{ position: "absolute", top: 110, left: 90 }} />
              <MaterialCommunityIcons name="chef-hat" size={22} color="#E23744" style={{ position: "absolute", top: 30, left: 120 }} />
            </View>

            <View className="flex-row items-center gap-1">
              <Text className="text-[9px] font-black text-foreground uppercase tracking-widest">🔥 GRILL MASTER</Text>
            </View>
            <Text className="mt-1 text-[15px] font-black uppercase italic leading-none text-foreground">
              PREMIUM{"\n"}<Text className="text-amber-400">GRILL</Text>
            </Text>
            <Text className="mt-1.5 text-[8px] font-bold text-white/70 uppercase">Fresh Catches</Text>
            <Pressable
              onPress={() => router.push("/products")}
              className="mt-3 self-start rounded-full bg-white px-3 py-1.5 active:bg-white/90"
              style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 }}
            >
              <Text className="text-[7.5px] font-black uppercase text-black tracking-wider">EXPLORE</Text>
            </Pressable>
          </View>

          {/* Right Panel B Content (Flame-Sea Collections) */}
          <View style={{ position: "absolute", right: 16, bottom: 16, width: (width - 32) * 0.52, zIndex: 10, alignItems: "flex-end" }}>
            {/* Floating HUD Icons for Sea Panel */}
            <View style={StyleSheet.absoluteFillObject} className="pointer-events-none opacity-20">
              <MaterialCommunityIcons name="water" size={24} color="#00d4ff" style={{ position: "absolute", bottom: 10, right: 70 }} />
              <MaterialCommunityIcons name="anchor" size={26} color="#fff" style={{ position: "absolute", bottom: 80, right: 30, transform: [{ rotate: "15deg" }] }} />
              <MaterialCommunityIcons name="compass-outline" size={22} color="#00d4ff" style={{ position: "absolute", bottom: 110, right: 90 }} />
              <MaterialCommunityIcons name="ferry" size={20} color="#fff" style={{ position: "absolute", bottom: 30, right: 120 }} />
            </View>

            <View className="flex-row items-center gap-1">
              <Text className="text-[9px] font-black text-[#00f3ff] uppercase tracking-widest">⚡ PREMIUM</Text>
            </View>
            <Text className="mt-1 text-[15px] font-black uppercase italic leading-none text-white text-right">
              PREMIUM{"\n"}<Text className="text-[#00d4ff]">SEAFOOD</Text>
            </Text>
            <Text className="mt-1.5 text-[8px] font-bold text-white/70 uppercase text-right">Prime Seasteak</Text>
            <Pressable
              onPress={() => router.push("/products")}
              className="mt-3 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 active:bg-black/60"
            >
              <Text className="text-[7.5px] font-black uppercase text-white tracking-wider">VIEW ALL</Text>
            </Pressable>
          </View>

          {/* HUD Tech Corner Details */}
          <View className="absolute top-2 right-2 w-3 h-3 border-t border-r border-white/20 pointer-events-none" />
          <View className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-white/20 pointer-events-none" />

          {/* Beveled overlays for split promo */}
          <Svg width="24" height="24" style={{ position: "absolute", top: -1, left: -1, zIndex: 40 }}>
            <Path d="M0,0 L24,0 L0,24 Z" fill={colors.bg} />
            <Path d="M24,0 L0,24" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </Svg>
          <Svg width="24" height="24" style={{ position: "absolute", bottom: -1, right: -1, zIndex: 40 }}>
            <Path d="M24,24 L0,24 L24,0 Z" fill={colors.bg} />
            <Path d="M0,24 L24,0" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </Svg>
        </View>

        {/* Premium Sellers ("The Fleet Elite") */}
        <View className="px-4 py-8">
          <SectionTitle title="The Fleet Elite" subtitle="Verified Local Sellers" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
            {PREMIUM_SELLERS.map((seller) => (
              <Pressable
                key={seller.id}
                onPress={() => router.push({ pathname: "/products", params: { sellerId: seller.id } })}
                className="mr-3 w-56 p-4 shadow-xl relative overflow-hidden"
                style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-[8px] font-black uppercase" style={{ color: primaryColor }}>{seller.id}</Text>
                  <View className="flex-row items-center gap-1">
                    <View className="h-1.5 w-1.5 rounded-full bg-[#00ff88]" />
                    <Text className="text-[6px] font-black uppercase" style={{ color: colors.textMuted }}>LIVE</Text>
                  </View>
                </View>
                
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 rounded-xl items-center justify-center border" style={{ backgroundColor: colors.bgAlt, borderColor: colors.border }}>
                    <Text className="text-2xl">{seller.image}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-black uppercase italic" style={{ color: colors.text }} numberOfLines={1}>
                      {seller.name}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <Text className="text-[8px] font-black text-warning">★ {seller.rating}</Text>
                      <Text className="text-[8px] font-black" style={{ color: primaryColor }}>{seller.speed}</Text>
                    </View>
                  </View>
                </View>
                
                <View className="flex-row justify-between items-center mt-3 pt-2 border-t" style={{ borderTopColor: colors.border }}>
                  <View className="flex-row gap-1">
                    {seller.products.map((p, idx) => (
                      <View key={idx} className="h-5 w-5 rounded items-center justify-center border" style={{ backgroundColor: colors.bgAlt, borderColor: colors.border }}>
                        <Text className="text-xs">{p}</Text>
                      </View>
                    ))}
                  </View>
                  <Text className="text-[8px] font-black uppercase" style={{ color: primaryColor }}>VIEW NODE ➜</Text>
                </View>

                {/* Beveled overlays for premium sellers */}
                <Svg width="14" height="14" style={{ position: "absolute", top: -1, left: -1, zIndex: 40 }}>
                  <Path d="M0,0 L14,0 L0,14 Z" fill={colors.bg} />
                  <Path d="M14,0 L0,14" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                </Svg>
                <Svg width="14" height="14" style={{ position: "absolute", bottom: -1, right: -1, zIndex: 40 }}>
                  <Path d="M14,14 L0,14 L14,0 Z" fill={colors.bg} />
                  <Path d="M0,14 L14,0" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                </Svg>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Live Telemetry Radar */}
        <AndamanMaritimeTelemetry territories={territories.data ?? []} />



        {/* High-Tech Trust Badge Grid */}
        <View className="px-4 py-4" style={{ borderBottomColor: colors.border, borderBottomWidth: 1 }}>
          <View className="flex-row justify-between gap-2">
            {[ 
              { icon: "🛡️", title: "Authorized", subtitle: "Fleet Verified", color: "#00ff88" }, 
              { icon: "⚡", title: "Instant", subtitle: "90 Min Dispatch", color: "#eab308" }, 
              { icon: "❄️", title: "Cold-Chain", subtitle: "0°C Controlled", color: "#00d4ff" }, 
              { icon: "📍", title: "Local Nodes", subtitle: "Port Blair Hub", color: "#ef4444" } 
            ].map((item, i) => (
              <View 
                key={i} 
                className="flex-1 items-center justify-center p-3 relative overflow-hidden"
                style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
              >
                <View 
                  style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}30` }} 
                  className="w-10 h-10 rounded-xl items-center justify-center border mb-2 shadow-lg"
                >
                  <Text className="text-lg">{item.icon}</Text>
                </View>
                <Text className="text-[8px] font-black uppercase italic tracking-wider text-center" style={{ color: colors.text }}>{item.title}</Text>
                <Text className="text-[5.5px] font-bold uppercase text-center mt-0.5" style={{ color: colors.textMuted }}>{item.subtitle}</Text>

                {/* Beveled overlays for trust badges */}
                <Svg width="12" height="12" style={{ position: "absolute", top: -1, left: -1, zIndex: 40 }}>
                  <Path d="M0,0 L12,0 L0,12 Z" fill={colors.bg} />
                  <Path d="M12,0 L0,12" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                </Svg>
                <Svg width="12" height="12" style={{ position: "absolute", bottom: -1, right: -1, zIndex: 40 }}>
                  <Path d="M12,12 L0,12 L12,0 Z" fill={colors.bg} />
                  <Path d="M0,12 L12,0" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                </Svg>
              </View>
            ))}
          </View>
        </View>

        {/* Customer Reviews */}
        <View className="px-4 pb-8">
          <SectionTitle title="Fleet Testimonials" subtitle="Verified Citizen Feedback" />
          {[
            { user: "Vikram S.", text: "The Bluefin Tuna was absolutely pristine. Delivered in 40 minutes.", rating: 5 },
            { user: "Ananya K.", text: "Best lobster I've had in years. The cold-chain delivery is real.", rating: 5 },
            { user: "Rajesh M.", text: "Professional service and verifiable freshness.", rating: 5 },
          ].map((r) => (
            <View key={r.user} className="mt-3 p-4 relative overflow-hidden" style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}>
              <Text className="text-[10px] font-black uppercase" style={{ color: primaryColor }}>★ {r.rating}.0</Text>
              <Text className="mt-2 text-sm italic" style={{ color: colors.textMuted }}>&ldquo;{r.text}&rdquo;</Text>
              <Text className="mt-2 text-[10px] font-black uppercase" style={{ color: colors.text }}>— {r.user}</Text>

              {/* Beveled overlays for review testimonials */}
              <Svg width="14" height="14" style={{ position: "absolute", top: -1, left: -1, zIndex: 40 }}>
                <Path d="M0,0 L14,0 L0,14 Z" fill={colors.bg} />
                <Path d="M14,0 L0,14" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              </Svg>
              <Svg width="14" height="14" style={{ position: "absolute", bottom: -1, right: -1, zIndex: 40 }}>
                <Path d="M14,14 L0,14 L14,0 Z" fill={colors.bg} />
                <Path d="M0,14 L14,0" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              </Svg>
            </View>
          ))}
        </View>

        {/* Join the Fleet - Subscription Newsletter Panel */}
        <View className="mx-4 mb-8 p-6 relative overflow-hidden" style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}>
          <LinearGradient
            colors={["transparent", getRgba(primaryColor, 0.06)]}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={["transparent", primaryColor, "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="absolute top-0 left-0 right-0 h-[1px] opacity-30"
          />
          <View className="space-y-2 items-center text-center">
            <Text className="text-[7.5px] font-black uppercase tracking-[0.4em]" style={{ color: primaryColor }}>
              Global Dispatch Subscription
            </Text>
            <Text className="text-2xl font-black uppercase italic text-center" style={{ color: colors.text }}>
              Join the Fleet.
            </Text>
            <Text className="text-[9px] text-center italic max-w-[280px]" style={{ color: colors.textMuted }}>
              Join our newsletter for the latest fresh catches and exclusive offers.
            </Text>
          </View>
          <View className="mt-5 space-y-2">
            <View 
              onLayout={(e) => setSubEmailLayout(e.nativeEvent.layout)}
              className="px-4 py-3.5 items-center justify-center relative overflow-hidden"
              style={{ height: 50 }}
            >
              {subEmailLayout.width > 0 && subEmailLayout.height > 0 ? (
                <Svg width={subEmailLayout.width} height={subEmailLayout.height} style={StyleSheet.absoluteFill}>
                  <Path
                    d={`M10,0 L${subEmailLayout.width},0 L${subEmailLayout.width},${subEmailLayout.height} L0,${subEmailLayout.height} L0,10 Z`}
                    fill="rgba(0,0,0,0.4)"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1"
                  />
                </Svg>
              ) : null}
              <Text className="text-xs italic tracking-wider relative z-10" style={{ color: colors.textMuted }}>
                Support Email: support@oceanexotic.com
              </Text>
            </View>
            <Pressable
              onPress={() => toast("Subscribed to newsletter!", "success")}
              onLayout={(e) => setSubBtnLayout(e.nativeEvent.layout)}
              className="py-3.5 items-center justify-center relative overflow-hidden"
              style={{ height: 50 }}
            >
              {subBtnLayout.width > 0 && subBtnLayout.height > 0 ? (
                <Svg width={subBtnLayout.width} height={subBtnLayout.height} style={StyleSheet.absoluteFill}>
                  <Polygon
                    points={`15,0 ${subBtnLayout.width},0 ${subBtnLayout.width - 15},${subBtnLayout.height} 0,${subBtnLayout.height}`}
                    fill={primaryColor}
                  />
                </Svg>
              ) : null}
              <Text className="text-[10px] font-black text-white uppercase tracking-[0.2em] relative z-10">
                SUBSCRIBE NOW
              </Text>
            </Pressable>
          </View>
          <View 
            className="absolute top-2 right-2 w-4 h-4 border-t border-r" 
            style={{ borderColor: getRgba(primaryColor, 0.2) }}
          />
          <View 
            className="absolute bottom-2 left-2 w-4 h-4 border-b border-l" 
            style={{ borderColor: getRgba(primaryColor, 0.2) }}
          />

          {/* Beveled overlays for subscription panel */}
          <Svg width="24" height="24" style={{ position: "absolute", top: -1, left: -1, zIndex: 40 }}>
            <Path d="M0,0 L24,0 L0,24 Z" fill={colors.bg} />
            <Path d="M24,0 L0,24" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </Svg>
          <Svg width="24" height="24" style={{ position: "absolute", bottom: -1, right: -1, zIndex: 40 }}>
            <Path d="M24,24 L0,24 L24,0 Z" fill={colors.bg} />
            <Path d="M0,24 L24,0" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </Svg>
        </View>

        {/* Trust strip */}
        <View className="mx-4 mb-8 flex-row flex-wrap justify-center gap-3 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          {["FSSAI AUTH", "ISO 22000", "COLD-CHAIN", "SUSTAINABLE"].map((label) => (
            <View 
              key={label} 
              className="rounded-full border px-3 py-1"
              style={{
                borderColor: getRgba(primaryColor, 0.2),
                backgroundColor: getRgba(primaryColor, 0.1)
              }}
            >
              <Text className="text-[8px] font-black uppercase" style={{ color: primaryColor }}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <CutSelectionModal
        visible={cutOpen}
        product={cutProduct}
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


