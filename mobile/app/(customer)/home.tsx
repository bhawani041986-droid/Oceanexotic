import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  FlatList,
  InteractionManager,
  TextInput,
} from "react-native";
import Svg, { Polygon, Defs, LinearGradient as SvgLinearGradient, Stop, Path, ClipPath, Image as SvgImage, Line } from "react-native-svg";
import { Image } from "expo-image";
import Animated, { FadeIn, FadeOut, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const AnimatedImage = Animated.createAnimatedComponent(Image);
const IMG_NEWSLETTER_BANNER = require("../../assets/newsletter_banner.jpg");
const IMG_QUALITY_CHECKED_BANNER = require("../../assets/quality_checked_banner.jpg");
const IMG_FSSAI_BANNER = require("../../assets/fssai_banner.jpg");
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useHomeData } from "@/hooks/useHomeData";
import { useProducts } from "@/hooks/useProducts";
import { useFlashDealTimer } from "@/hooks/useFlashDealTimer";
import { ProductCard } from "@/components/customer/ProductCard";
import type { Product } from "@/services/productService";
import { useSettingsStore } from "@/store/settingsStore";
import { useCartStore } from "@/store/cartStore";
import { CATEGORIES, getSortedCategories } from "@/constants/categories";
import { SectionTitle } from "@/components/customer/SectionTitle";
import { CutSelectionModal } from "@/components/customer/CutSelectionModal";
import { MaritimeWaveDivider } from "@/components/customer/MaritimeWaveDivider";
import { AndamanMaritimeTelemetry } from "@/components/customer/AndamanMaritimeTelemetry";
import { OceanReelsFeed } from "@/components/customer/OceanReelsFeed";
import { LiveTickerMarquee } from "@/components/customer/LiveTickerMarquee";
import { FlashDealsBanner } from "@/components/customer/FlashDealsBanner";
import { AmazonHeroCardGrid } from "@/components/customer/AmazonHeroCardGrid";
import { Button } from "@/components/ui/Button";
import { ChamferedBox } from "@/components/ui/ChamferedBox";
import { useToast } from "@/components/ui/Toast";
import { ShieldCheckIcon, InstantClockIcon, ColdChainIcon, LocalCatchIcon, LeafIcon, TruckIcon } from "@/components/customer/TrustIcons";
import { homeService, type CutOption, type TodaysCatchItem } from "@/services/homeService";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import { useImageAspectRatio } from "@/hooks/useImageAspectRatio";
import { useTranslation } from "@/lib/i18n";

import { useThemeColors } from "@/hooks/useThemeColors";
import api from "@/services/api";

type BatchFilter = "ALL" | "MORNING" | "AFTERNOON" | "EVENING";

const GRID_CATEGORIES = [
  { label: "SEAWATER FISH", slug: "seawater", image: require("../../assets/categories/seawater.jpg") },
  { label: "FRESHWATER FISH", slug: "freshwater", image: require("../../assets/categories/freshwater.jpg") },
  { label: "PRAWNS & SHRIMPS", slug: "prawns", image: require("../../assets/categories/prawns.jpg") },
  { label: "CRABS & LOBSTERS", slug: "crustaceans", image: require("../../assets/categories/crabs.jpg") },
  { label: "STEAKS & FILLETS", slug: "fillets", image: require("../../assets/categories/steaks.jpg") },
  { label: "EXOTIC CATCH", slug: "exotic", image: require("../../assets/categories/exotic.jpg") },
  { label: "READY TO COOK", slug: "ready-to-cook", image: require("../../assets/categories/ready.jpg") },
  { label: "COASTAL DRY FISH", slug: "dry-fish", image: require("../../assets/categories/dry_fish.jpg") },
  { label: "MUTTON", slug: "mutton", image: require("../../assets/categories/mutton.jpg") },
  { label: "CHICKEN", slug: "chicken", image: require("../../assets/categories/chicken.jpg") }
];

const FALLBACK_REVIEWS = [
  { id: "REV-1", user_name: "Arjun Das", comment: "Incredible quality. Arrived perfectly chilled.", rating: 5 },
  { id: "REV-2", user_name: "Priya Sharma", comment: "Delivery was prompt and the fish was super fresh!", rating: 4 },
  { id: "REV-3", user_name: "Rahul K.", comment: "Great cuts, perfectly portioned for sushi. The packaging was excellent.", rating: 4 },
];

interface TodaysCatchCardProps {
  item: TodaysCatchItem;
  onPress: () => void;
  onOpenCut: () => void;
}

function TodaysCatchCardComponent({ item, onPress, onOpenCut }: TodaysCatchCardProps) {
  const { t } = useTranslation();
  const uri = resolveMediaUrl(item.catch_image_url || item.image_url);
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      className="w-[48%]"
    >
      <ChamferedBox
        fillColor={colors.card}
        strokeColor={colors.border}
        bevelSize={16}
        style={{ minHeight: 250 }}
        className="w-full relative overflow-hidden"
      >
        <View 
          className="relative items-center justify-center overflow-hidden w-full"
          style={{ aspectRatio: 1, backgroundColor: colors.isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
        >
          <Image
            source={{ uri }}
            className="h-full w-full"
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", colors.isDark ? "rgba(2,6,23,0.8)" : "rgba(255,255,255,0.8)"]}
            className="absolute inset-0"
          />
          <View className="absolute left-2 top-2 rounded-none bg-emerald-500/80 px-2 py-0.5 relative overflow-hidden">
            <Text className="text-[7px] font-black uppercase text-white relative z-10">
              {item.freshness_label}
            </Text>
            <Svg width={4} height={4} style={{ position: 'absolute', top: -1, left: -1, zIndex: 20 }}><Polygon points="0,0 4,0 0,4" fill={colors.bg} /></Svg>
            <Svg width={4} height={4} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 20 }}><Polygon points="4,4 0,4 4,0" fill={colors.bg} /></Svg>
          </View>
          {/* Offer Badge (Amazon/Licious Style) */}
          {Number(item.discount_percent ?? 0) > 0 ? (
            <View className="absolute right-2 top-2 rounded-none bg-red-500/90 px-2 py-0.5 z-20 relative overflow-hidden">
              <Text className="text-[7px] font-black uppercase text-white relative z-10">
                {Number(item.discount_percent)}% OFF
              </Text>
              <Svg width={4} height={4} style={{ position: 'absolute', top: -1, left: -1, zIndex: 20 }}><Polygon points="0,0 4,0 0,4" fill={colors.bg} /></Svg>
              <Svg width={4} height={4} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 20 }}><Polygon points="4,4 0,4 4,0" fill={colors.bg} /></Svg>
            </View>
          ) : null}
          <View className="absolute bottom-2 left-2 rounded-none border border-white/10 bg-black/60 px-2 py-1">
            <Text className="text-[7px] font-black uppercase text-foreground">
              {item.harbor_node}
            </Text>
          </View>
          <View className="absolute bottom-2 right-2">
            <Text className="text-[7px] font-black text-foreground/60 uppercase">
              {t('stock') || "STOCK"}
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
            {t('handled_by') || "Handled by"} {item.seller_name}
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
              className="rounded-none px-3 py-2 overflow-hidden relative"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-[9px] font-black uppercase text-white relative z-10">
                {t('plus_cut') || "+ CUT"}
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
        </Svg>
        <Svg width="16" height="16" style={{ position: "absolute", bottom: -1, right: -1, zIndex: 40 }}>
          <Path d="M16,16 L0,16 L16,0 Z" fill={colors.bg} />
        </Svg>
      </ChamferedBox>
    </Pressable>
  );
}

const TodaysCatchCard = React.memo(TodaysCatchCardComponent);

// --- ISOLATED TIMER COMPONENT ---
// This prevents the massive CustomerHomeScreen from re-rendering every 1 second
function FlashDealCountdown() {
  const { t } = useTranslation();
  const { timeLeft, flashDealActive } = useFlashDealTimer();
  const colors = useThemeColors();

  if (!flashDealActive) {
    return (
      <View className="mt-4 self-center rounded-none border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 relative overflow-hidden">
        <Text className="text-[9px] font-black uppercase text-emerald-500 relative z-10">
          {t('promo_active')} • {t('radar_secure')}
        </Text>
        <Svg width={6} height={6} style={{ position: 'absolute', top: -1, left: -1, zIndex: 20 }}><Polygon points="0,0 6,0 0,6" fill={colors.bg} /></Svg>
        <Svg width={6} height={6} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 20 }}><Polygon points="6,6 0,6 6,0" fill={colors.bg} /></Svg>
      </View>
    );
  }

  return (
    <View className="mt-4 flex-row justify-center gap-2">
      {[timeLeft.hrs, timeLeft.min, timeLeft.sec].map((val, i) => (
        <View key={i} className="w-14 h-14 rounded-full border items-center justify-center" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <Text className="text-center text-base font-black italic" style={{ color: colors.text }}>{val}</Text>
          <Text className="text-center text-[7px] font-black uppercase mt-0.5" style={{ color: colors.textMuted }}>
            {i === 0 ? t('hrs') : i === 1 ? t('min') : t('sec')}
          </Text>
        </View>
      ))}
    </View>
  );
}

// --- ISOLATED NEWSLETTER COMPONENT ---
function NewsletterSection() {
  const { t } = useTranslation();
  const { width } = Dimensions.get("window");
  const { toast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleSubscribeNewsletter = async () => {
    const trimmedEmail = newsletterEmail.trim();
    if (!trimmedEmail) {
      toast(t('enter_email_address') || "Please enter your email address", "error");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast(t('enter_valid_email') || "Please enter a valid email address", "error");
      return;
    }
    try {
      const res = await homeService.subscribeNewsletter(trimmedEmail);
      if (res.success || (res as any).message === "Already subscribed") {
        toast(t('subscribed_to_newsletter') || "Subscribed to newsletter!", "success");
        setNewsletterEmail("");
      } else {
        toast(res.error || "Subscription failed", "error");
      }
    } catch (error: any) {
      console.error("Newsletter error:", error);
      toast(error?.response?.data?.error || "Subscription failed", "error");
    }
  };

  const newsletterWidth = width - 32;
  const newsletterHeight = newsletterWidth / 1.469;

  return (
    <View 
      className="mx-4 mb-0 relative overflow-hidden" 
      style={{ width: newsletterWidth, height: newsletterHeight, marginBottom: 0 }}
    >
      <Image
        source={IMG_NEWSLETTER_BANNER}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
      />
      <TextInput
        value={newsletterEmail}
        onChangeText={setNewsletterEmail}
        placeholder={(t('email_address') || "ENTER YOUR EMAIL ADDRESS").toUpperCase()}
        placeholderTextColor="#94A3B8"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          position: 'absolute',
          top: '48.5%',
          left: '21%',
          width: '68%',
          height: '11%',
          fontSize: newsletterWidth * 0.028,
          color: '#1E293B',
          backgroundColor: 'transparent',
          paddingHorizontal: 8,
          fontStyle: 'italic',
        }}
      />
      <Pressable
        onPress={handleSubscribeNewsletter}
        style={{
          position: 'absolute',
          top: '66%',
          left: '6%',
          width: '88%',
          height: '15%',
        }}
      />
    </View>
  );
}

export default function CustomerHomeScreen() {
  const { t } = useTranslation();

  const { width } = Dimensions.get("window");
  const router = useRouter();
  const settings = useSettingsStore();
  const currentLanguage = useSettingsStore((s) => s.language); // Force re-render on language change
  const cart = useCartStore();
  const { toast, ToastHost } = useToast();
  const { cms, territories, todaysCatch } = useHomeData();
  const { data: allProducts } = useProducts();
  const [search, setSearch] = useState("");
  const [catScrollProgress, setCatScrollProgress] = useState(0);
  const onSearch = () => {
    router.push({
      pathname: "/products",
      params: search.trim() ? { search: search.trim() } : {},
    });
  };
  const featured = useMemo(() => {
    const list = allProducts ?? [];
    const feat = list.filter(p => p.is_featured === true || p.is_featured === 1 || p.is_featured === "true");
    return feat.length > 0 ? feat : list.slice(0, 4);
  }, [allProducts]);
  const promo = cms.data?.find((c) => c.type === "PROMO" && c.status === "PUBLISHED");
  const splitPromo = cms.data?.find((c) => c.type === "SPLIT_PROMO");
  const showSplitPromo = splitPromo && splitPromo.status === "PUBLISHED";

  const promoDataParsed = useMemo(() => {
    let defaultPromo = {
      panelA: {
        title: "SEAFOOD\nGRILL.",
        subtitle: "Grill Mode",
        tagline: "Volcanic products.",
        link: "/customer/products?search=grill",
        image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80"
      },
      panelB: {
        title: "FLAME-SEA\nCOLLECTIONS",
        subtitle: "Node: Flame",
        tagline: "Volcanic collections.",
        link: "/customer/products?search=fry",
        image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80"
      }
    };
    if (splitPromo) {
      try {
        const parsed = typeof splitPromo.metadata === 'string' ? JSON.parse(splitPromo.metadata) : splitPromo.metadata;
        if (parsed && parsed.panelA && parsed.panelB) {
          return {
            panelA: { ...defaultPromo.panelA, ...parsed.panelA },
            panelB: { ...defaultPromo.panelB, ...parsed.panelB }
          };
        }
      } catch (e) {}
    }
    return defaultPromo;
  }, [splitPromo]);

  const handleCMSNavigation = useCallback((link: string) => {
    if (!link) return;
    // Strip "/customer" prefix if present
    const cleanLink = link.replace(/^\/customer/, '');
    const [path, queryStr] = cleanLink.split('?');
    const params: any = {};
    if (queryStr) {
      queryStr.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        if (k) params[k] = decodeURIComponent(v || '');
      });
    }
    router.push({ pathname: path as any, params });
  }, [router]);



  const [activeBatch, setActiveBatch] = useState<BatchFilter>("ALL");
  const [cutProduct, setCutProduct] = useState<TodaysCatchItem | null>(null);
  const [cutOptions, setCutOptions] = useState<CutOption[]>([]);
  const [selectedCut, setSelectedCut] = useState<CutOption | null>(null);
  const [cutLoading, setCutLoading] = useState(false);
  const [cutOpen, setCutOpen] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveReviews, setLiveReviews] = useState<any[]>([]);

  const banner = cms.data?.find((c) => c.type === "BANNER" && c.status === "PUBLISHED");
  const titleParts = banner?.title?.split(":") ?? [];
  const heroTitle = titleParts[0] || "Maritime";
  const heroAccent = titleParts[1]?.trim() || "Redefined.";
  
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const heroSlides = useMemo(() => {
    const fallbackHero2 = "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80"; 
    const fallbackHero3 = "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80";
    return [
      resolveMediaUrl(settings.customerAssets.hero), 
      resolveMediaUrl((settings.customerAssets as any).hero2) || fallbackHero2, 
      resolveMediaUrl((settings.customerAssets as any).hero3) || fallbackHero3
    ].filter(Boolean) as string[];
  }, [settings.customerAssets]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const promoImage =
    resolveMediaUrl(banner?.image_url) || resolveMediaUrl(settings.customerAssets.promo);

  const colors = useThemeColors();
  const primaryColor = colors.primary;

  const isLightColor = useCallback((colorStr: string) => {
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
  }, []);

  const getRgba = useCallback((colorStr: string, alpha: number) => {
    if (!colorStr) return `rgba(0, 0, 0, ${alpha})`;
    if (colorStr.startsWith("rgba(")) {
      return colorStr.replace(/[\d.]+\)$/, `${alpha})`);
    }
    if (colorStr.startsWith("rgb(")) {
      return colorStr.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
    }
    if (colorStr.startsWith("#")) {
      let cleanHex = colorStr.replace("#", "");
      if (cleanHex.length === 3) {
        cleanHex = cleanHex.split("").map(c => c + c).join("");
      }
      if (cleanHex.length === 6) {
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    }
    return colorStr;
  }, []);

  useEffect(() => {
    settings.fetchSettings();
  }, [settings.fetchSettings]);

  useEffect(() => {
    const fetchApprovedReviews = async () => {
      try {
        const res = await api.get('/reviews/all');
        const data = res.data;
        if (Array.isArray(data)) {
          const approved = data
            .filter((r: any) => (r.status || '').toUpperCase() === 'APPROVED')
            .slice(0, 6);
          if (approved.length > 0) setLiveReviews(approved);
        }
      } catch (err) {
        // Silently fall back to FALLBACK_REVIEWS
      }
    };
    fetchApprovedReviews();
  }, []);

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
      toast(t('failed_to_load_options') || "Failed to load options", "error");
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
    toast(`${cutProduct.name} [${selectedCut.label}] ${t('added_to_cart') || "added to cart"}`, "success");
    setCutOpen(false);
    setCutOpen(false);
  };

  const rawOpacity = settings.customerAssets?.heroOverlayOpacity;
  const imageOpacity = rawOpacity !== undefined ? 1 - (rawOpacity / 100) : 0.6;
  
  const heroBadgeColor = settings.customerAssets?.heroBadgeColor || primaryColor;
  const heroTitle1Color = settings.customerAssets?.heroTitle1Color || colors.text;
  const heroTitle2Color = settings.customerAssets?.heroTitle2Color || colors.accent;
  const heroSubtitleColor = settings.customerAssets?.heroSubtitleColor || colors.text;

  const homeSectionOrder = useMemo(() => {
    const rawOrder = settings.homeSectionOrder || ["HERO", "CATEGORIES", "TODAYS_CATCH", "FEATURED", "RECIPES", "PROMO", "SELLERS", "RADAR", "REVIEWS", "NEWSLETTER", "QUALITY_CHECKED", "FSSAI"];
    let order = rawOrder.filter(sec => sec !== "TRUST" && sec !== "NEWSLETTER" && sec !== "QUALITY_CHECKED" && sec !== "FSSAI");
    order.push("NEWSLETTER", "QUALITY_CHECKED", "FSSAI");
    return order;
  }, [settings.homeSectionOrder]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <LiveTickerMarquee />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-16 pt-2"
        refreshControl={
          <RefreshControl
            refreshing={todaysCatch.isRefetching}
            onRefresh={onRefresh}
            tintColor={primaryColor}
          />
        }
      >
        {/* Render Sections dynamically based on settings.homeSectionOrder */}
        {homeSectionOrder.map((sectionId) => {
          switch (sectionId) {
            case "HERO":
              if (!settings.heroStyle || settings.heroStyle === "AMAZON_CARD_GRID") {
                return (
                  <View key="HERO" className="w-full">
                    <AmazonHeroCardGrid products={allProducts} />
                  </View>
                );
              }

              if (settings.heroStyle === "COMPACT_MINIMAL_STRIP") {
                const stripConf = settings.compactStripConfig || { tickerText: "🔥 20% OFF ALL SEAWATER FISH TODAY | FREE EXPRESS DELIVERY OVER ₹499" };
                return (
                  <View key="HERO" className="mx-4 my-2 p-3.5 rounded-2xl bg-teal-900/90 border border-teal-500/40 shadow-lg flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-full bg-emerald-500/20 items-center justify-center border border-emerald-500/40">
                      <MaterialCommunityIcons name="lightning-bolt" size={18} color="#10b981" />
                    </View>
                    <Text className="flex-1 text-xs font-black text-white" numberOfLines={2}>
                      {stripConf.tickerText}
                    </Text>
                  </View>
                );
              }

              if (settings.heroStyle === "SWIGGY_DYNAMIC_BANNER") {
                const banners = (settings.swiggyBanners && settings.swiggyBanners.length > 0) ? settings.swiggyBanners : [
                  { id: "s1", title: "FRESH SURMAI & SALMON FESTIVAL", subtitle: "Direct landed catch from Port Blair Harbour. Delivered chilled in 90 min.", ctaText: "SHOP FRESH", ctaLink: "/products?search=surmai", imageUrl: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&q=80", badge: "Port Blair Dock" }
                ];
                const activeSlide = banners[currentHeroIndex % banners.length] || banners[0];
                return (
                  <View key="HERO" className="relative min-h-[220px] overflow-hidden rounded-2xl mx-4 my-2 border border-slate-800 shadow-xl">
                    <Image
                      source={{ uri: resolveMediaUrl(activeSlide.imageUrl) }}
                      className="absolute inset-0 h-full w-full opacity-60"
                      contentFit="cover"
                    />
                    <View className="relative z-10 p-5 flex-1 justify-between bg-slate-950/40">
                      <View className="self-start px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-500/40">
                        <Text className="text-[9px] font-black uppercase tracking-widest text-teal-300">
                          {activeSlide.badge}
                        </Text>
                      </View>
                      <View className="my-2">
                        <Text className="text-xl font-black uppercase text-white tracking-tight leading-tight">
                          {activeSlide.title}
                        </Text>
                        <Text className="text-xs font-medium text-slate-200 mt-1" numberOfLines={2}>
                          {activeSlide.subtitle}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleCMSNavigation(activeSlide.ctaLink)}
                        className="self-start px-5 py-2.5 rounded-full bg-teal-500 shadow-lg shadow-teal-500/40"
                      >
                        <Text className="text-xs font-black uppercase tracking-wider text-slate-950">
                          {activeSlide.ctaText || "SHOP NOW"} →
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              }

              // Default Fallback: Zomato High-Impact Hero
              const zomatoConf = settings.zomatoHeroConfig || {
                backdropUrl: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80",
                titleLine1: "FRESHNESS",
                titleLine2: "REDEFINED.",
                subtitle: "Delivered Fresh in Under 90 Minutes. Trusted by 50,000+ Customers.",
                badgeText: "PREMIUM SEAFOOD MARKET",
                trustBadge1: "🛡️ FSSAI Quality Certified",
                trustBadge2: "⏱️ 90-Min Superfast Express",
                trustBadge3: "❄️ 100% Cold Chain Sealed"
              };

              return (
                <View key="HERO" className="relative min-h-[230px] overflow-hidden">
                  <AnimatedImage
                    key={currentHeroIndex}
                    entering={FadeIn.duration(1000)}
                    exiting={FadeOut.duration(1000)}
                    source={{ uri: resolveMediaUrl(zomatoConf.backdropUrl) }}
                    className="absolute inset-0 h-full w-full"
                    style={{ opacity: imageOpacity }}
                    contentFit="cover"
                    priority="high"
                  />
                  <View className="relative z-10 px-4 pb-5 pt-3 flex-1">
                    <Animated.View entering={FadeInDown.duration(800).delay(200)} className="flex-1">
                      <View 
                        className="self-start rounded-none border px-2.5 py-1"
                        style={{
                          borderColor: getRgba(heroBadgeColor, 0.2),
                          backgroundColor: getRgba(heroBadgeColor, 0.1)
                        }}
                      >
                        <Text numberOfLines={1} ellipsizeMode="tail" className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: heroBadgeColor }}>
                          {zomatoConf.badgeText}
                        </Text>
                      </View>
                      <Text className="mt-2 text-2xl font-black uppercase italic leading-tight" style={{ color: heroTitle1Color }}>
                        {zomatoConf.titleLine1} <Text style={{ color: heroTitle2Color }}>{zomatoConf.titleLine2}</Text>
                      </Text>
                      <Text className="mt-1.5 text-xs font-medium italic drop-shadow-md" style={{ color: heroSubtitleColor }}>
                        {zomatoConf.subtitle}
                      </Text>
                    </Animated.View>

                    {/* Pagination Fish Icons */}
                    {heroSlides.length > 1 && (
                      <View className="absolute bottom-4 left-4 flex-row items-center gap-1.5 z-30">
                        {heroSlides.map((_, idx) => (
                          <Pressable
                            key={idx}
                            onPress={() => setCurrentHeroIndex(idx)}
                          >
                            <MaterialCommunityIcons 
                              name="fish" 
                              size={currentHeroIndex === idx ? 24 : 18} 
                              color={currentHeroIndex === idx ? primaryColor : "rgba(255,255,255,0.5)"} 
                            />
                          </Pressable>
                        ))}
                      </View>
                    )}

                    {/* Compact Pre-Orders Banner Widget */}
                    <View className="absolute top-2 right-2 w-[38%] z-30 pointer-events-auto" style={{ aspectRatio: 3.737, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 }}>
                      <Image
                        source={require("../../assets/pre_orders_mockup.jpg")}
                        style={StyleSheet.absoluteFillObject}
                        contentFit="fill"
                      />
                      <Pressable
                        onPress={() => router.push("/orders")}
                        style={StyleSheet.absoluteFillObject}
                      />
                    </View>
                  </View>
                </View>
              );
            case "CATEGORIES":
              return (
                <View key="CATEGORIES">
                  {/* Maritime Wave Divider */}
                  <MaritimeWaveDivider />

                  {/* Dynamic Category Scroll */}
                  <View className="w-full mt-2">
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false} 
                      contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
                      scrollEventThrottle={16}
                      onScroll={(event) => {
                        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
                        const maxScroll = contentSize.width - layoutMeasurement.width;
                        const progress = maxScroll > 0 ? contentOffset.x / maxScroll : 0;
                        setCatScrollProgress(progress);
                      }}
                    >
                      {(settings.productCategories || [])
                        .filter(c => c.status?.toUpperCase() !== "INACTIVE")
                        .map((cat, idx) => {
                          const l = (cat.label || "").toLowerCase();
                          let iconSource = require("../../assets/categories/seawater.jpg"); // default fallback
                          
                          if (l.includes("freshwater")) iconSource = require("../../assets/categories/new/freshwater.png");
                          else if (l.includes("prawn") || l.includes("shrimp")) iconSource = require("../../assets/categories/new/prawns.png");
                          else if (l.includes("crab") || l.includes("lobster")) iconSource = require("../../assets/categories/new/crabs.png");
                          else if (l.includes("steak") || l.includes("fillet")) iconSource = require("../../assets/categories/new/steaks.png");
                          else if (l.includes("exotic")) iconSource = require("../../assets/categories/new/exotic.png");
                          else if (l.includes("cook")) iconSource = require("../../assets/categories/new/ready_to_cook.png");
                          else if (l.includes("dry")) iconSource = require("../../assets/categories/new/dry_fish.png");
                          else if (l.includes("mutton")) iconSource = require("../../assets/categories/new/mutton.png");
                          else if (l.includes("chicken")) iconSource = require("../../assets/categories/new/chicken.png");
                          else if (l.includes("seawater")) iconSource = require("../../assets/categories/new/seawater.png");
                          else if (cat.imageUrl) iconSource = { uri: cat.imageUrl };

                          return (
                            <Pressable 
                              key={cat.id || idx}
                              onPress={() => router.push({ pathname: "/products", params: { category: cat.id } })}
                              style={{ width: 62, alignItems: 'center' }}
                            >
                              <View style={{ width: 62, height: 62, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' }}>
                                <Image
                                  source={iconSource}
                                  style={{ width: '100%', height: '100%' }}
                                  contentFit="contain"
                                />
                              </View>
                              {cat.label && (
                                <Text 
                                  className="text-[7.5px] font-black uppercase text-center mt-2 leading-tight" 
                                  style={{ color: colors.text }}
                                  numberOfLines={2}
                                >
                                  {t(cat.label.toLowerCase().replace(/ & /g, "_").replace(/ /g, "_")) || cat.label}
                                </Text>
                              )}
                            </Pressable>
                          );
                        })}
                    </ScrollView>

                    {/* Neon sliding scroll indicator */}
                    {(settings.productCategories || []).filter(c => c.status?.toUpperCase() !== "INACTIVE").length > 5 && (
                      <View style={{ height: 3, width: 50, backgroundColor: '#E2E8F0', borderRadius: 1.5, alignSelf: 'center', marginTop: 10, overflow: 'hidden' }}>
                        <View 
                          style={{ 
                            height: '100%', 
                            width: '35%', 
                            backgroundColor: '#00F3FF', // neon cyan
                            borderRadius: 1.5,
                            transform: [{
                              translateX: catScrollProgress * (50 * 0.65) // 50 * (1 - 0.35)
                            }]
                          }} 
                        />
                      </View>
                    )}
                  </View>
                </View>
              );
            case "TODAYS_CATCH":
              return (
                <View key="TODAYS_CATCH" className="px-4 py-4">
                  <View className="mb-6 flex-col gap-4">
                    <View className="gap-1">
                      <View>
                        <Text className="text-xl font-black uppercase italic" style={{ color: '#FF5E36' }}>
                          {t('todays_catch')}
                        </Text>
                        <View className="mt-1.5 mb-3" style={{ height: 3, width: 80, borderRadius: 999, overflow: 'hidden' }}>
                          <LinearGradient
                            colors={['#FF3E3E', '#FFD700', '#00F3FF']} // Red -> Gold -> Cyan
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ flex: 1 }}
                          />
                        </View>
                      </View>
                      <Text className="text-[10px] font-medium uppercase tracking-widest" style={{ color: colors.textMuted }}>
                        {t('live_harbor_arrival')}
                      </Text>
                    </View>
                     <View 
                       className="flex-row flex-wrap rounded-none border p-1"
                       style={{ backgroundColor: colors.bgAlt, borderColor: colors.border }}
                     >
                      {(["ALL", "MORNING", "AFTERNOON", "EVENING"] as BatchFilter[]).map((batch) => (
                        <Pressable
                          key={batch}
                          onPress={() => setActiveBatch(batch)}
                          className="rounded-none px-3 py-2 relative overflow-hidden"
                          style={activeBatch === batch ? { backgroundColor: primaryColor } : undefined}
                        >
                          <Text
                            className="text-[9px] font-black uppercase tracking-widest"
                            style={{
                              color: activeBatch === batch ? (isLightColor(primaryColor) ? "#000000" : "#FFFFFF") : colors.textMuted
                            }}
                          >
                            {t(batch.toLowerCase())}
                          </Text>
                          {/* Cut-corner bevel overlays on active filter tab */}
                          {activeBatch === batch && (
                            <>
                              <Svg width={5} height={5} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}>
                                <Path d="M0,0 L5,0 L0,5 Z" fill={colors.bg} />
                              </Svg>
                              <Svg width={5} height={5} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}>
                                <Path d="M5,5 L0,5 L5,0 Z" fill={colors.bg} />
                              </Svg>
                            </>
                          )}
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {todaysCatch.isLoading ? (
                    <View className="flex-row flex-wrap gap-3">
                      {[0, 1, 2, 3].map((i) => (
                        <View
                          key={i}
                          className="h-64 w-[47%] animate-pulse rounded-none"
                          style={{ backgroundColor: colors.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
                        />
                      ))}
                    </View>
                  ) : filteredCatch.length > 0 ? (
                    <View className="flex-row flex-wrap justify-between gap-y-3">
                      {filteredCatch.map((item) => {
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
                          <ProductCard
                            key={item.id}
                            product={mappedProduct}
                            compact
                            onSelectCut={() => openCutModal(item)}
                          />
                        );
                      })}
                    </View>
                  ) : (
                    <View className="h-48 items-center justify-center rounded-none border-2 border-dashed border-white/10 opacity-50">
                      <Text className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                        {t('no_live_harbor_stock') || "No Live Harbor Stock in this sector"}
                      </Text>
                    </View>
                  )}

                  {todaysCatch.isError ? (
                    <Text className="mt-4 text-center text-[10px] font-bold text-danger">
                      {t('failed_to_sync_products') || "Failed to sync products. Pull to refresh."}
                    </Text>
                  ) : null}
                </View>
              );
            case "FEATURED":
              return (
                <View key="FEATURED" className="border-y px-4 py-4" style={{ backgroundColor: colors.bgAlt, borderColor: colors.border }}>
                  <SectionTitle title={t('featured_seafood') || "Featured Seafood"} subtitle={t('certified_daily_catches') || "Premium Fresh Quality"} />
                  {featured.length > 0 ? (
                    <View className="mt-4 flex-row flex-wrap justify-between gap-y-3">
                      {featured.map((p) => (
                        <ProductCard key={p.id} product={p} compact onSelectCut={() => openCutModal({
                          id: p.id,
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
              );
            case "RECIPES":
              return (
                <View key="RECIPES" className="px-4 py-4">
                  <View className="flex-row justify-between items-end mb-4">
                    <SectionTitle title={t('chefs_recipes') || "Chef's Recipes"} subtitle={t('chef_tested_recipes') || "Chef Tested Recipes"} />
                    <Pressable 
                      onPress={() => router.push("/recipe")}
                      className="px-3 py-1.5 rounded-none border relative overflow-hidden"
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: colors.border }}
                    >
                      <Text className="text-[9px] font-black uppercase tracking-widest" style={{ color: colors.primary }}>{t('view_all_arrow')}</Text>
                      <Svg width={6} height={6} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}>
                        <Path d="M0,0 L6,0 L0,6 Z" fill={colors.bg} />
                        <Path d="M6,0 L0,6" stroke={colors.border} strokeWidth={1} />
                      </Svg>
                      <Svg width={6} height={6} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}>
                        <Path d="M6,6 L0,6 L6,0 Z" fill={colors.bg} />
                        <Path d="M0,6 L6,0" stroke={colors.border} strokeWidth={1} />
                      </Svg>
                    </Pressable>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
                    {(cms.data?.filter(c => c.type === 'RECIPE' && c.status === 'PUBLISHED') || []).slice(0, 6).map((recipe: any) => {
                       const meta = recipe.metadata ? (typeof recipe.metadata === 'string' ? JSON.parse(recipe.metadata) : recipe.metadata) : {};
                       return (
                      <Pressable
                        key={recipe.id}
                        onPress={() => router.push({ pathname: "/recipe/[id]", params: { id: String(recipe.id) } })}
                        className="mr-3 w-56"
                      >
                        <ChamferedBox
                          fillColor="transparent"
                          strokeColor="rgba(255,255,255,0.08)"
                          bevelSize={16}
                          style={{ height: 176, minHeight: 176 }}
                          className="w-full relative overflow-hidden shadow-2xl"
                        >
                          <Image 
                            source={{ uri: recipe.image_url || ((meta.gallery && meta.gallery.length > 0) ? meta.gallery[0] : recipe.image) }} 
                            className="absolute inset-0 h-full w-full opacity-60" 
                            contentFit="cover"
                          />
                          <LinearGradient 
                            colors={["transparent", "rgba(8,13,25,0.95)"]} 
                            className="absolute inset-0"
                          />
                          <View className="relative z-10 p-4 gap-2 h-full justify-end">
                            <View className="flex-row gap-2">
                              <ChamferedBox 
                                fillColor={getRgba(primaryColor, 0.1)}
                                strokeColor={getRgba(primaryColor, 0.2)}
                                bevelSize={4}
                                style={{ minHeight: 20 }}
                                className="flex-shrink"
                                contentClassName="w-auto flex-shrink px-2 py-0.5"
                              >
                                <Text className="text-[8px] font-black uppercase relative z-10" style={{ color: primaryColor }}>{meta.difficulty || recipe.difficulty || 'Expert'}</Text>
                              </ChamferedBox>
                              <ChamferedBox
                                fillColor="rgba(255,255,255,0.05)"
                                strokeColor="rgba(255,255,255,0.1)"
                                bevelSize={4}
                                style={{ minHeight: 20 }}
                                className="flex-shrink"
                                contentClassName="w-auto flex-shrink px-2 py-0.5"
                              >
                                <Text className="text-[8px] font-black uppercase text-muted-foreground relative z-10">{meta.time || recipe.time || '25m'}</Text>
                              </ChamferedBox>
                            </View>
                            <Text className="text-sm font-black uppercase italic text-foreground" numberOfLines={2}>{recipe.title}</Text>
                            <Text className="text-[9px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>{t('view_recipe')}</Text>
                          </View>
                        </ChamferedBox>
                      </Pressable>
                    );
                  })}
                  </ScrollView>
                </View>
              );
            case "PROMO":
              return (
                <View key="PROMO">
                  {/* Flame-Sea Diagonal Promo Banner — Flash Deals Section */}
                  <FlashDealsBanner />
                  
                  {/* Split Promo: Maritime Grill & Flame-Sea Collections */}
                  {showSplitPromo && (
                    <View className="mx-4 my-4 bg-[#070b13] shadow-2xl relative overflow-hidden" style={{ height: 200 }}>
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
                          <SvgLinearGradient id="rgbDivider" x1="1" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#ff007f" />
                            <Stop offset="0.5" stopColor="#00f3ff" />
                            <Stop offset="1" stopColor="#ffaa00" />
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
                          href={{ uri: resolveMediaUrl(promoDataParsed.panelA.image_url) }}
                          width={width - 32}
                          height={200}
                          preserveAspectRatio="xMidYMid slice"
                          clipPath="url(#clipGrill)"
                          opacity={1}
                        />

                        {/* Panel B Gradient Overlay (bottom layer) */}
                        <Polygon points={`0,200 ${width - 32},0 ${width - 32},200`} fill="url(#gradSea)" />
                        {/* Background Image for Sea (clipped, top layer) */}
                        <SvgImage
                          href={{ uri: resolveMediaUrl(promoDataParsed.panelB.image_url) }}
                          width={width - 32}
                          height={200}
                          preserveAspectRatio="xMidYMid slice"
                          clipPath="url(#clipSea)"
                          opacity={1}
                        />

                        {/* Neon Stacked Glow Divider */}
                        <Line x1={width - 32} y1={0} x2={0} y2={200} stroke="#ffaa00" strokeWidth={8} opacity={0.15} />
                        <Line x1={width - 32} y1={0} x2={0} y2={200} stroke="#ff007f" strokeWidth={5} opacity={0.3} />
                        <Line x1={width - 32} y1={0} x2={0} y2={200} stroke="#00f3ff" strokeWidth={3} opacity={0.6} />
                        <Line x1={width - 32} y1={0} x2={0} y2={200} stroke="url(#rgbDivider)" strokeWidth={1.5} opacity={1} />
                      </Svg>

                      {/* Floating HUD SVG/Vector Icons (placed on top of background but behind text content) */}
                      <View style={[StyleSheet.absoluteFillObject, { opacity: 0.55 }]} pointerEvents="none">
                        {/* Panel A Icons */}
                        <MaterialCommunityIcons name="fire" size={20} color="#ff007f" style={{ position: "absolute", top: 10, left: (width - 32) * 0.35 }} />
                        <MaterialCommunityIcons name="chef-hat" size={16} color="#ffaa00" style={{ position: "absolute", top: 50, left: (width - 32) * 0.25 }} />
                        <MaterialCommunityIcons name="fish" size={28} color="#ff007f" style={{ position: "absolute", top: 110, left: (width - 32) * 0.12, transform: [{ rotate: "-45deg" }] }} />
                        <MaterialCommunityIcons name="silverware-fork-knife" size={14} color="#fff" style={{ position: "absolute", top: 150, left: (width - 32) * 0.05 }} />
                        <MaterialCommunityIcons name="clock-outline" size={12} color="#00ff88" style={{ position: "absolute", top: 30, left: (width - 32) * 0.18 }} />
                        <MaterialCommunityIcons name="pulse" size={14} color="#ff007f" style={{ position: "absolute", top: 80, left: (width - 32) * 0.32 }} />
                        <MaterialCommunityIcons name="flash" size={14} color="#ffaa00" style={{ position: "absolute", top: 15, left: (width - 32) * 0.45 }} />

                        {/* Panel B Icons */}
                        <MaterialCommunityIcons name="waves" size={20} color="#00d4ff" style={{ position: "absolute", bottom: 10, right: (width - 32) * 0.35 }} />
                        <MaterialCommunityIcons name="gauge" size={16} color="#00ff88" style={{ position: "absolute", bottom: 50, right: (width - 32) * 0.25 }} />
                        <MaterialCommunityIcons name="anchor" size={24} color="#fff" style={{ position: "absolute", bottom: 110, right: (width - 32) * 0.12, transform: [{ rotate: "15deg" }] }} />
                        <MaterialCommunityIcons name="ferry" size={16} color="#ffaa00" style={{ position: "absolute", bottom: 15, right: (width - 32) * 0.05 }} />
                        <MaterialCommunityIcons name="compass-outline" size={16} color="#00d4ff" style={{ position: "absolute", bottom: 30, right: (width - 32) * 0.18 }} />
                        <MaterialCommunityIcons name="weather-windy" size={14} color="#00d4ff" style={{ position: "absolute", bottom: 80, right: (width - 32) * 0.32 }} />
                        <MaterialCommunityIcons name="navigation" size={12} color="#00ff88" style={{ position: "absolute", bottom: 15, right: (width - 32) * 0.45 }} />
                        <MaterialCommunityIcons name="fish" size={16} color="#ffaa00" style={{ position: "absolute", bottom: 45, right: (width - 32) * 0.08, transform: [{ rotate: "45deg" }] }} />
                      </View>

                      {/* Left Panel A Content (Maritime Grill Masters) */}
                      <View style={{ position: "absolute", left: 16, top: 16, width: (width - 32) * 0.52, zIndex: 10 }}>
                        <View className="flex-row items-center gap-1">
                          <Text className="text-[9px] font-black text-foreground uppercase tracking-widest">{promoDataParsed.panelA.subtitle}</Text>
                        </View>
                        <Text className="mt-1 text-[15px] font-black uppercase italic leading-none text-foreground">
                          {promoDataParsed.panelA.title.split('\n').map((line: string, idx: number) => (
                            <Text key={idx} style={idx === 1 ? { color: '#fbbf24' } : undefined}>
                              {line}{idx < promoDataParsed.panelA.title.split('\n').length - 1 ? '\n' : ''}
                            </Text>
                          ))}
                        </Text>
                        <Text className="mt-1.5 text-[8px] font-bold text-white/70 uppercase">{promoDataParsed.panelA.tagline}</Text>
                        <Pressable
                          onPress={() => handleCMSNavigation(promoDataParsed.panelA.link)}
                          className="mt-3 self-start rounded-none bg-white px-3 py-1.5 active:bg-white/90 relative overflow-hidden"
                          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 }}
                        >
                          <Text className="text-[7.5px] font-black uppercase text-black tracking-wider">{t('explore') || "EXPLORE"}</Text>
                          <Svg width={6} height={6} style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
                            <Polygon points="0,0 6,0 0,6" fill="rgba(0,0,0,0.5)" />
                          </Svg>
                          <Svg width={6} height={6} style={{ position: 'absolute', bottom: 0, right: 0, zIndex: 10 }}>
                            <Polygon points="6,6 0,6 6,0" fill="rgba(0,0,0,0.5)" />
                          </Svg>
                        </Pressable>
                      </View>

                      {/* Right Panel B Content (Flame-Sea Collections) */}
                      <View style={{ position: "absolute", right: 16, bottom: 16, width: (width - 32) * 0.52, zIndex: 10, alignItems: "flex-end" }}>
                        <View className="flex-row items-center gap-1">
                          <Text className="text-[9px] font-black text-[#00f3ff] uppercase tracking-widest">{promoDataParsed.panelB.subtitle}</Text>
                        </View>
                        <Text className="mt-1 text-[15px] font-black uppercase italic leading-none text-white text-right">
                          {promoDataParsed.panelB.title.split('\n').map((line: string, idx: number) => (
                            <Text key={idx} style={idx === 1 ? { color: '#00d4ff' } : undefined}>
                              {line}{idx < promoDataParsed.panelB.title.split('\n').length - 1 ? '\n' : ''}
                            </Text>
                          ))}
                        </Text>
                        <Text className="mt-1.5 text-[8px] font-bold text-white/70 uppercase text-right">{promoDataParsed.panelB.tagline}</Text>
                        <Pressable
                          onPress={() => handleCMSNavigation(promoDataParsed.panelB.link)}
                          className="mt-3 rounded-none border border-white/20 bg-black/40 px-3 py-1.5 active:bg-black/60 relative overflow-hidden"
                        >
                          <Text className="text-[7.5px] font-black uppercase text-white tracking-wider">{t('view_all') || "VIEW ALL"}</Text>
                          <Svg width={6} height={6} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}>
                            <Polygon points="0,0 6,0 0,6" fill="rgba(0,0,0,0.5)" />
                          </Svg>
                          <Svg width={6} height={6} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}>
                            <Polygon points="6,6 0,6 6,0" fill="rgba(0,0,0,0.5)" />
                          </Svg>
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
                  )}
                </View>
              );
            case "SELLERS":
              return (
                <View key="SELLERS" className="px-4 py-4">
                  <SectionTitle title={t('premium_sellers') || "Premium Sellers"} subtitle={t('certified_daily_catches') || "Top Rated Sellers"} />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
                    {(settings.topSellers || []).map((seller) => {
                      return (
                        <Pressable
                          key={seller.id}
                          onPress={() => router.push({ pathname: "/products", params: { sellerId: seller.id } })}
                          className="mr-3 w-56 rounded-2xl p-3 shadow-md border"
                          style={{
                            backgroundColor: colors.isDark ? "#0D1527" : "#FFFFFF",
                            borderColor: colors.border,
                            height: 122,
                            justifyContent: "space-between"
                          }}
                        >
                          {/* Top Row: Seller ID & LIVE Beacon */}
                          <View className="flex-row justify-between items-center">
                            <Text className="text-[10px] font-black uppercase" style={{ color: primaryColor }}>{seller.id}</Text>
                            <View className="flex-row items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                              <View className="h-1 w-1 rounded-full bg-[#10b981]" />
                              <Text className="text-[6.5px] font-black uppercase text-[#10b981]">LIVE</Text>
                            </View>
                          </View>
                          
                          {/* Middle Row: Emblem & Name/Rating */}
                          <View className="flex-row items-center gap-2.5 my-0.5">
                            <View className="h-10 w-10 items-center justify-center rounded-xl border" style={{ backgroundColor: colors.bgAlt, borderColor: colors.border }}>
                              <Text className="text-xl">{seller.image}</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-xs font-black uppercase italic" style={{ color: colors.text }} numberOfLines={1}>
                                {seller.name}
                              </Text>
                              <View className="flex-row items-center gap-1 mt-0.5">
                                <View className="flex-row items-center gap-1 px-1 rounded" style={{ backgroundColor: colors.isDark ? "#1E293B" : "#FEF3C7", borderColor: colors.border }}>
                                  <Text className="text-[8px] font-black text-amber-500">★ {seller.rating}</Text>
                                </View>
                                <Text className="text-[8px]" style={{ color: colors.textMuted }}>|</Text>
                                <View className="flex-row items-center gap-0.5 px-1 rounded" style={{ backgroundColor: colors.isDark ? "#1E293B" : "#F1F5F9" }}>
                                  <MaterialCommunityIcons name="clock-outline" size={7} color={colors.textMuted} />
                                  <Text className="text-[8px] font-black" style={{ color: colors.textMuted }}>{seller.speed}</Text>
                                </View>
                              </View>
                            </View>
                          </View>
                          
                          {/* Bottom Row: Products & Shop Now Button */}
                          <View className="flex-row justify-between items-center pt-1.5 border-t" style={{ borderTopColor: colors.border }}>
                            <View className="flex-row gap-0.5">
                              {seller.products.slice(0, 3).map((p, idx) => (
                                <View
                                  key={idx}
                                  className="h-6 w-6 items-center justify-center rounded-lg border"
                                  style={{ backgroundColor: colors.bgAlt, borderColor: colors.border }}
                                >
                                  <Text className="text-xs">{p}</Text>
                                </View>
                              ))}
                            </View>
                            
                            {/* SHOP NOW Button */}
                            <View className="flex-row items-center gap-0.5 px-2 py-0.5 rounded-full shadow-sm" style={{ backgroundColor: "#0284c7" }}>
                              <MaterialCommunityIcons name="cart-outline" size={8} color="#ffffff" />
                              <Text className="text-[7px] font-black uppercase text-white tracking-wider">SHOP NOW</Text>
                              <View className="bg-white rounded-full p-0.5 ml-0.5">
                                <MaterialCommunityIcons name="chevron-right" size={5} color="#0284c7" />
                              </View>
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              );
            case "RADAR":
              return (
                <AndamanMaritimeTelemetry key="RADAR" territories={territories.data ?? []} />
              );
            case "QUALITY_CHECKED":
              {
                const qualityWidth = width - 32;
                return (
                  <View key="QUALITY_CHECKED" className="mx-4 mb-4 flex-row justify-between" style={{ width: qualityWidth, gap: 6, marginTop: -10 }}>
                    {[
                      { icon: <ShieldCheckIcon size={20} color="#0d9488" />, title: t('quality_checked') || "QUALITY CHECKED", subtitle: t('verified_seller') || "VERIFIED SELLER", color: "#0d9488", bg: "#e2f0ec", border: "#a7f3d0", barColor: "#0d9488" },
                      { icon: <InstantClockIcon size={20} color="#ea580c" />, title: t('instant') || "INSTANT", subtitle: t('min_dispatch') || "90 MIN DISPATCH", color: "#ea580c", bg: "#ffedd5", border: "#fed7aa", barColor: "#ea580c" },
                      { icon: <ColdChainIcon size={20} color="#0284c7" />, title: t('cold_chain') || "COLD-CHAIN", subtitle: t('controlled_temp') || "0°C CONTROLLED", color: "#0284c7", bg: "#e0f2fe", border: "#bae6fd", barColor: "#0284c7" },
                      { icon: <LocalCatchIcon size={20} color="#e11d48" />, title: t('local_catch') || "LOCAL CATCH", subtitle: t('harbor_hub') || "PORT BLAIR HUB", color: "#e11d48", bg: "#ffe4e6", border: "#fecdd3", barColor: "#e11d48" }
                    ].map((item, idx) => (
                      <ChamferedBox
                        key={idx}
                        bevelSize={10}
                        fillColor={colors.card === '#020617' ? '#0b1329' : '#f8fafc'}
                        strokeColor={colors.card === '#020617' ? '#1e293b' : '#e2e8f0'}
                        style={{ flex: 1, padding: 6, alignItems: "center", minHeight: 130 }}
                      >
                        {/* Icon Background bevel */}
                        <ChamferedBox
                          bevelSize={6}
                          fillColor={item.bg}
                          strokeColor={item.border}
                          style={{ width: 34, height: 34, alignItems: "center", justifyContent: "center", marginTop: 4, marginBottom: 8 }}
                        >
                          {item.icon}
                        </ChamferedBox>

                        <Text 
                          numberOfLines={2}
                          className="text-[7.5px] font-black italic uppercase text-center leading-tight" 
                          style={{ color: colors.text, minHeight: 20 }}
                        >
                          {item.title}
                        </Text>

                        {/* Line Decorator */}
                        <View style={{ width: 14, height: 1.5, backgroundColor: item.barColor, marginVertical: 4 }} />

                        <Text 
                          numberOfLines={2}
                          className="text-[6px] font-bold text-center uppercase leading-tight" 
                          style={{ color: colors.textMuted }}
                        >
                          {item.subtitle}
                        </Text>
                      </ChamferedBox>
                    ))}
                  </View>
                );
              }
            case "FSSAI":
              {
                const fssaiWidth = width - 32;
                return (
                  <ChamferedBox
                    key="FSSAI"
                    bevelSize={12}
                    fillColor={colors.card === '#020617' ? '#081125' : '#f8fafc'}
                    strokeColor={colors.card === '#020617' ? '#1e293b' : '#cbd5e1'}
                    style={{ marginHorizontal: 16, padding: 6, marginBottom: 16, marginTop: -6, width: fssaiWidth }}
                    contentStyle={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4 }}
                  >
                    {/* 1. FSSAI Card */}
                    <ChamferedBox
                      bevelSize={6}
                      fillColor="#fff7ed"
                      strokeColor="#fed7aa"
                      style={{ flex: 1.1, paddingVertical: 4, alignItems: "center", justifyContent: "center" }}
                    >
                      <View className="flex-row items-baseline -mt-[2px]">
                        <Text className="text-[12px] italic leading-none" style={{ color: "#0c3f87", fontWeight: '800', fontFamily: 'serif', letterSpacing: -0.5 }}>fssa</Text>
                        <Text className="text-[12px] italic leading-none" style={{ color: "#ea580c", fontWeight: '800', fontFamily: 'serif' }}>i</Text>
                        <Text style={{ fontSize: 7, marginLeft: 1 }}>🍃</Text>
                      </View>
                      <Text className="text-[4.5px] font-black text-[#ea580c] mt-0.5" numberOfLines={1}>
                        Reg. No. 22926204000077
                      </Text>
                    </ChamferedBox>

                    {/* 2. Cold Chain Card */}
                    <ChamferedBox
                      bevelSize={6}
                      fillColor="#f0f9ff"
                      strokeColor="#bae6fd"
                      style={{ flex: 1, paddingVertical: 4 }}
                      contentStyle={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3, height: "100%" }}
                    >
                      <ColdChainIcon size={12} color="#0284c7" />
                      <Text className="text-[7.5px] font-black text-[#0284c7] uppercase">{t('cold_chain') || "COLD-CHAIN"}</Text>
                    </ChamferedBox>

                    {/* 3. Sustainable Card */}
                    <ChamferedBox
                      bevelSize={6}
                      fillColor="#f0fdf4"
                      strokeColor="#bbf7d0"
                      style={{ flex: 1, paddingVertical: 4 }}
                      contentStyle={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3, height: "100%" }}
                    >
                      <LeafIcon size={12} color="#0f766e" />
                      <Text className="text-[7.5px] font-black text-[#0f766e] uppercase">{t('sustainable') || "SUSTAINABLE"}</Text>
                    </ChamferedBox>

                    {/* 4. Rapid Delivery Card */}
                    <ChamferedBox
                      bevelSize={6}
                      fillColor="#f0fdfa"
                      strokeColor="#99f6e4"
                      style={{ flex: 1, paddingVertical: 4 }}
                      contentStyle={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3, height: "100%" }}
                    >
                      <TruckIcon size={12} color="#0d9488" />
                      <Text className="text-[7.5px] font-black text-[#0d9488] uppercase text-center leading-none" numberOfLines={2}>
                        {t('rapid_delivery') ? t('rapid_delivery').replace(' ', '\n') : "RAPID\nDELIVERY"}
                      </Text>
                    </ChamferedBox>
                  </ChamferedBox>
                );
              }
            case "REVIEWS":
              return (
                <View key="REVIEWS" className="pb-4">
                  <View className="px-4">
                    <SectionTitle title={t('fleet_testimonials') || "Customer Reviews"} subtitle={t('verified_buyer_reviews') || "Verified Buyer Reviews"} />
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }} className="mt-3">
                    {(liveReviews.length > 0 ? liveReviews : FALLBACK_REVIEWS).map((r: any) => {
                      const displayName = r.user_name || r.user || 'Customer';
                      const displayText = r.comment || r.text || '';
                      const initials = displayName.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
                      const ratingNum = parseFloat(r.rating) || 5;
                      return (
                        <View 
                          key={r.id} 
                          className="p-3 w-64 rounded-2xl shadow-md border"
                          style={{
                            backgroundColor: colors.isDark ? "#0D1527" : "#FFFFFF",
                            borderColor: colors.border,
                            minHeight: 120,
                            justifyContent: "space-between"
                          }}
                        >
                          {/* Top: Star Rating & Verified Badge */}
                          <View className="flex-row justify-between items-center mb-1">
                            <View className="flex-row">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <MaterialCommunityIcons 
                                  key={i} 
                                  name="star" 
                                  size={10} 
                                  color={i < Math.floor(ratingNum) ? "#f59e0b" : "#e2e8f0"} 
                                />
                              ))}
                            </View>
                            <View className="flex-row items-center gap-0.5 bg-sky-500/10 px-1.5 py-0.5 rounded-full">
                              <MaterialCommunityIcons name="decagram" size={8} color="#0284c7" />
                              <Text className="text-[7px] font-black uppercase text-[#0284c7]">{t('verified') || "VERIFIED"}</Text>
                            </View>
                          </View>

                          {/* Middle: Review Comment Text */}
                          <Text className="text-[11px] italic text-slate-500 leading-tight flex-1" style={{ color: colors.textMuted }} numberOfLines={3}>
                            &ldquo;{displayText}&rdquo;
                          </Text>

                          {/* Bottom: User Info */}
                          <View className="flex-row items-center gap-2 pt-1.5 border-t" style={{ borderTopColor: colors.border }}>
                            <View className="h-6 w-6 rounded-full items-center justify-center border" style={{ backgroundColor: colors.bgAlt, borderColor: colors.border }}>
                              <Text className="text-[8px] font-black" style={{ color: colors.text }}>{initials || 'C'}</Text>
                            </View>
                            <Text className="text-[9px] font-black uppercase" style={{ color: colors.text }}>— {displayName}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              );
            case "NEWSLETTER":
              return <NewsletterSection key="NEWSLETTER" />;
            default:
              return null;
          }
        })}
      </ScrollView>

      {/* Picture-in-Picture Ocean Reels Feed */}
      <OceanReelsFeed variant="pip" />

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

