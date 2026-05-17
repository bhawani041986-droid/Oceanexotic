import { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { homeService, type CutOption, type TodaysCatchItem } from "@/services/homeService";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import { useImageAspectRatio } from "@/hooks/useImageAspectRatio";

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
  const aspectRatio = useImageAspectRatio(uri);

  return (
    <Pressable
      onPress={onPress}
      className="w-[48%] overflow-hidden rounded-2xl border border-white/5 bg-card"
    >
      <View 
        className="relative bg-secondary/60 items-center justify-center overflow-hidden w-full"
        style={{ aspectRatio }}
      >
        <Image
          source={{ uri }}
          className="h-full w-full"
          contentFit="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(2,6,23,0.8)"]}
          className="absolute inset-0"
        />
        <View className="absolute left-2 top-2 rounded bg-emerald-500/80 px-2 py-0.5">
          <Text className="text-[7px] font-black uppercase text-white">
            {item.freshness_label}
          </Text>
        </View>
        <View className="absolute bottom-2 left-2 rounded-lg border border-white/10 bg-black/60 px-2 py-1">
          <Text className="text-[7px] font-black uppercase text-foreground">
            {item.harbor_node}
          </Text>
        </View>
        <View className="absolute bottom-2 right-2">
          <Text className="text-[7px] font-black text-foreground/60 uppercase">
            Stock
          </Text>
          <Text className="text-[10px] font-black text-primary">
            {item.remaining_kg}kg
          </Text>
        </View>
      </View>
      <View className="gap-2 p-3">
        <Text className="text-[8px] font-black uppercase text-emerald-500">
          Verified Daily Harvest
        </Text>
        <Text
          className="text-sm font-black uppercase italic text-foreground"
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text className="text-[8px] uppercase italic text-muted-foreground">
          Handled by {item.seller_name}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-black italic text-foreground">
            ₹{item.price_per_kg}
            <Text className="text-[10px] opacity-40">/kg</Text>
          </Text>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onOpenCut();
            }}
            className="rounded-xl bg-primary px-3 py-2"
          >
            <Text className="text-[9px] font-black uppercase text-foreground">
              + CUT
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default function CustomerHomeScreen() {
  const router = useRouter();
  const settings = useSettingsStore();
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

  const banner = cms.data?.find((c) => c.type === "BANNER" && c.status === "PUBLISHED");
  const titleParts = banner?.title?.split(":") ?? [];
  const heroTitle = titleParts[0] || "Maritime";
  const heroAccent = titleParts[1]?.trim() || "Redefined.";
  const heroImage = resolveMediaUrl(settings.customerAssets.hero);
  const promoImage =
    resolveMediaUrl(banner?.image_url) || resolveMediaUrl(settings.customerAssets.promo);

  const filteredCatch = useMemo(() => {
    const items = todaysCatch.data ?? [];
    if (activeBatch === "ALL") return items;
    return items.filter((c) => c.batch_label === activeBatch);
  }, [todaysCatch.data, activeBatch]);

  const onRefresh = useCallback(() => {
    cms.refetch();
    todaysCatch.refetch();
  }, [cms, todaysCatch]);

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
      toast("Cut Registry Handshake Failure", "error");
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
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28 pt-2"
        refreshControl={
          <RefreshControl
            refreshing={todaysCatch.isRefetching}
            onRefresh={onRefresh}
            tintColor="#7C3AED"
          />
        }
      >
        {/* Hero */}
        <View className="relative min-h-[320px] overflow-hidden">
          {heroImage ? (
            <Image
              source={{ uri: heroImage }}
              className="absolute inset-0 h-full w-full opacity-40"
              contentFit="cover"
            />
          ) : null}
          <LinearGradient
            colors={["rgba(2,6,23,0.3)", "#020617", "#020617"]}
            className="absolute inset-0"
          />
          <View className="relative z-10 px-6 pb-8 pt-4">
            <View className="self-start rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
              <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                {banner?.sector || "Sovereign"} Market Sync: Active
              </Text>
            </View>
            <Text className="mt-4 text-4xl font-black uppercase italic leading-tight text-foreground">
              {heroTitle}
              {"\n"}
              <Text className="text-primary">{heroAccent}</Text>
            </Text>
            <Text className="mt-3 text-base font-medium italic text-muted-foreground">
              {heroImage && banner?.image_url
                ? "Dynamic Asset Synchronized."
                : "Delivered Fresh in Under 90 Minutes. Trusted by 50,000+ Customers."}
            </Text>
            {promoImage ? (
              <View className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                <Image source={{ uri: promoImage }} className="h-36 w-full" contentFit="cover" />
              </View>
            ) : null}
            <View className="mt-6 flex-row flex-wrap gap-3">
              <Button
                label="SHOP FRESH SEAFOOD"
                onPress={() => router.push("/products")}
                className="min-w-[200px] flex-1"
              />
              <Button
                label="EXPLORE CATEGORIES"
                variant="ghost"
                onPress={() => router.push("/products")}
                className="min-w-[200px] flex-1 border border-white/10"
              />
            </View>
          </View>
        </View>

        {/* Maritime Wave Divider */}
        <MaritimeWaveDivider />

        {/* Category ribbon — horizontal scroll on mobile */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="border-y border-white/5 py-4"
          contentContainerClassName="px-2"
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.slug}
              onPress={() =>
                router.push({ pathname: "/products", params: { category: cat.slug } })
              }
              className="mr-2 w-20 overflow-hidden rounded-lg border border-white/5 bg-secondary/40"
            >
              <View className="aspect-square items-center justify-center p-2">
                <Image
                  source={cat.image}
                  className="h-12 w-12"
                  contentFit="contain"
                />
              </View>
              <View
                className="items-center justify-center px-1 py-2"
                style={{ borderTopColor: `${cat.glowColor}80`, borderTopWidth: 1 }}
              >
                <Text className="text-center text-[8px] font-black uppercase leading-tight text-foreground">
                  {cat.name}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Today's Catch */}
        <View className="px-4 py-8">
          <View className="mb-6 flex-col gap-4">
            <SectionTitle
              title="Today's Catch"
              subtitle="Live Harbor Arrival • Freshness Guaranteed"
            />
            <View className="flex-row flex-wrap rounded-2xl border border-white/5 bg-secondary/40 p-1">
              {(["ALL", "MORNING", "AFTERNOON", "EVENING"] as BatchFilter[]).map((batch) => (
                <Pressable
                  key={batch}
                  onPress={() => setActiveBatch(batch)}
                  className={cn(
                    "rounded-xl px-3 py-2",
                    activeBatch === batch ? "bg-primary" : ""
                  )}
                >
                  <Text
                    className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      activeBatch === batch ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {batch}
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
              Harbor registry sync failed. Pull to refresh.
            </Text>
          ) : null}
        </View>

        {/* Featured Harvests — live registry */}
        <View className="border-y border-white/5 bg-secondary/20 px-4 py-8">
          <SectionTitle title="Featured Harvests" subtitle="Highest Authority Maritime Grade" />
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
            <ActivityIndicator className="my-8" color="#7C3AED" />
          )}
        </View>

        {/* Flash Deals */}
        {flashDealActive ? (
          <View className="mx-4 my-6 overflow-hidden rounded-3xl border border-primary/30 bg-primary/20 p-6">
            <Text className="text-[10px] font-black uppercase tracking-widest text-primary">
              {promo?.sector || "Flash Harvest"} Protocol
            </Text>
            <Text className="mt-2 text-3xl font-black uppercase italic text-foreground">
              {promo?.title || "Flash Deals."}
            </Text>
            <View className="mt-4 flex-row justify-center gap-2">
              {[timeLeft.hrs, timeLeft.min, timeLeft.sec].map((val, i) => (
                <View key={i} className="min-w-[56px] rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                  <Text className="text-center text-xl font-black italic text-foreground">{val}</Text>
                  <Text className="text-center text-[7px] font-black uppercase text-muted-foreground">
                    {i === 0 ? "HRS" : i === 1 ? "MIN" : "SEC"}
                  </Text>
                </View>
              ))}
            </View>
            <Button label="CLAIM ACCESS NOW" onPress={() => router.push("/products")} className="mt-6" />
          </View>
        ) : null}

        {/* Premium Sellers ("The Fleet Elite") */}
        <View className="px-4 py-8">
          <SectionTitle title="The Fleet Elite" subtitle="Verified Maritime Sellers" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
            {PREMIUM_SELLERS.map((seller) => (
              <Pressable
                key={seller.id}
                onPress={() => router.push({ pathname: "/products", params: { sellerId: seller.id } })}
                className="mr-3 w-56 rounded-2xl border border-white/5 bg-card p-4 shadow-xl"
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-[8px] font-black text-primary uppercase">{seller.id}</Text>
                  <View className="flex-row items-center gap-1">
                    <View className="h-1.5 w-1.5 rounded-full bg-[#00ff88]" />
                    <Text className="text-[6px] font-black text-foreground/50 uppercase">LIVE</Text>
                  </View>
                </View>
                
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 bg-secondary/50 rounded-xl items-center justify-center border border-white/5">
                    <Text className="text-2xl">{seller.image}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-black uppercase italic text-foreground" numberOfLines={1}>
                      {seller.name}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <Text className="text-[8px] font-black text-warning">★ {seller.rating}</Text>
                      <Text className="text-[8px] font-black text-primary">{seller.speed}</Text>
                    </View>
                  </View>
                </View>
                
                <View className="flex-row justify-between items-center mt-3 pt-2 border-t border-white/5">
                  <View className="flex-row gap-1">
                    {seller.products.map((p, idx) => (
                      <View key={idx} className="h-5 w-5 bg-white/5 rounded items-center justify-center border border-white/5">
                        <Text className="text-xs">{p}</Text>
                      </View>
                    ))}
                  </View>
                  <Text className="text-[8px] font-black text-primary uppercase">VIEW NODE ➜</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Live Telemetry Radar */}
        <AndamanMaritimeTelemetry territories={territories.data ?? []} />

        {/* Customer Reviews */}
        <View className="px-4 py-8">
          <SectionTitle title="Fleet Testimonials" subtitle="Verified Citizen Feedback" />
          {[
            { user: "Vikram S.", text: "The Bluefin Tuna was absolutely pristine. Delivered in 40 minutes.", rating: 5 },
            { user: "Ananya K.", text: "Best lobster I've had in years. The cold-chain delivery is real.", rating: 5 },
            { user: "Rajesh M.", text: "Professional service and verifiable freshness.", rating: 5 },
          ].map((r) => (
            <View key={r.user} className="mt-3 rounded-2xl border border-white/5 bg-card p-4">
              <Text className="text-[10px] font-black uppercase text-primary">★ {r.rating}.0</Text>
              <Text className="mt-2 text-sm italic text-muted-foreground">&ldquo;{r.text}&rdquo;</Text>
              <Text className="mt-2 text-[10px] font-black uppercase text-foreground">— {r.user}</Text>
            </View>
          ))}
        </View>

        {/* Culinary Hub Recipes */}
        <View className="px-4 py-8">
          <SectionTitle title="Culinary Hub" subtitle="Verified Maritime Recipes" />
          <View className="mt-4 gap-4">
            {RECIPES.map((recipe) => (
              <View 
                key={recipe.id} 
                className="relative h-44 overflow-hidden rounded-3xl border border-white/5 shadow-2xl justify-end"
              >
                <Image 
                  source={{ uri: recipe.image }} 
                  className="absolute inset-0 h-full w-full opacity-60" 
                  contentFit="cover"
                />
                <LinearGradient 
                  colors={["transparent", "rgba(8,13,25,0.95)"]} 
                  className="absolute inset-0"
                />
                <View className="relative z-10 p-5 gap-2">
                  <View className="flex-row gap-2">
                    <View className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                      <Text className="text-[8px] font-black uppercase text-primary">{recipe.difficulty}</Text>
                    </View>
                    <View className="bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                      <Text className="text-[8px] font-black uppercase text-muted-foreground">{recipe.time}</Text>
                    </View>
                  </View>
                  <Text className="text-xl font-black uppercase italic text-foreground">{recipe.title}</Text>
                  <Text className="text-[9px] font-black uppercase text-primary tracking-widest">OPEN PROTOCOL ➜</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Trust strip */}
        <View className="mx-4 mb-8 flex-row flex-wrap justify-center gap-3 rounded-2xl border border-white/5 bg-card p-4">
          {["FSSAI AUTH", "ISO 22000", "COLD-CHAIN", "SUSTAINABLE"].map((label) => (
            <View key={label} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
              <Text className="text-[8px] font-black uppercase text-primary">{label}</Text>
            </View>
          ))}
        </View>

        {/* Cart shortcut */}
        <View className="mx-4 mb-4">
          <Button
            label={`VIEW CART (${cart.itemCount()})`}
            variant="ghost"
            onPress={() => router.push("/cart")}
            className="border border-white/10"
          />
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

