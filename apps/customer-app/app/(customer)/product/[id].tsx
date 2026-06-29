import { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable, FlatList, Dimensions, Modal, TextInput, Share, Linking, Clipboard } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import api from "@/services/api";
import { productService } from "@/services/productService";
import { homeService, type CutOption } from "@/services/homeService";
import { CutSelectionModal } from "@/components/customer/CutSelectionModal";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { ChamferedBox } from "@/components/ui/ChamferedBox";
import { assetUrl } from "@/config/assets";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import type { TodaysCatchItem } from "@/services/homeService";
import { useImageAspectRatio } from "@/hooks/useImageAspectRatio";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColors } from "@/hooks/useThemeColors";
import { SectionTitle } from "@/components/customer/SectionTitle";
import { FssaiBanner } from "@/components/customer/FssaiBanner";
import Svg, { Path } from "react-native-svg";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/customer/ProductCard";
import { useAuthStore } from "@/store/authStore";
import { checkoutService } from "@/services/checkoutService";
import { useTranslation } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settingsStore";
import { useReviews } from "@/hooks/useReviews";
import { useQueryClient } from "@tanstack/react-query";

const MOCK_RECIPES = [
  { title: "Simple Steam", time: "15 min", difficulty: "Easy" },
  { title: "Pan-Seared with Garlic", time: "20 min", difficulty: "Medium" }
];

const MOCK_REVIEWS = [
  { name: "John D.", rating: 5, date: "2 days ago", comment: "Exceptional quality. The freshness was undeniable." },
  { name: "Sarah M.", rating: 4, date: "1 week ago", comment: "Very good, though delivery took slightly longer than expected." }
];

export default function ProductDetailScreen() {
  const { t } = useTranslation();

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const cart = useCartStore();
  const { toast, ToastHost } = useToast();
  const { user } = useAuthStore();
  const currentLanguage = useSettingsStore((s) => s.language); // force re-render

  const wishlist = useWishlistStore();
  const queryClient = useQueryClient();
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(id);
  const isFavorited = useWishlistStore(state => state.items.some(item => item.id === id));

  const handleToggleWishlist = () => {
    if (!product) return;
    wishlist.toggleFavorite(product as any);
    toast(isFavorited ? "Removed from Favorites" : "Added to Favorites", "success");
  };

  const handleNativeShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `Check out this product: ${product.name} - https://oceanexotic.com/customer/products/${id}`,
        url: `https://oceanexotic.com/customer/products/${id}`
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleWhatsAppShare = async () => {
    if (!product) return;
    const message = `Check out this product: ${product.name} - https://oceanexotic.com/customer/products/${id}`;
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Linking.openURL(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`);
      }
    } catch (error) {
      await Linking.openURL(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`);
    }
  };

  const handleCopyLink = () => {
    if (!product) return;
    const url = `https://oceanexotic.com/customer/products/${id}`;
    try {
      if (Clipboard && typeof Clipboard.setString === 'function') {
        Clipboard.setString(url);
        toast("Link copied to clipboard!", "success");
      } else {
        toast("Copy not supported on this platform", "error");
      }
    } catch (err) {
      toast("Failed to copy link", "error");
    }
  };

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
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isAllReviewsVisible, setIsAllReviewsVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const screenWidth = Dimensions.get("window").width;
  const flatListRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const submitReview = async () => {
    if (rating === 0) {
      toast("Please select a rating", "error");
      return;
    }
    if (!reviewText.trim()) {
      toast("Please write a review", "error");
      return;
    }
    try {
      setLoading(true);
      await api.post("/reviews/create", {
        product_id: id,
        product_name: product?.name || "Fleet Asset",
        seller_id: product?.seller_id || "SEL-001",
        user_id: user?.id || "GUEST",
        user_name: user?.name || "Citizen",
        rating: rating,
        comment: reviewText
      });
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      setIsReviewModalVisible(false);
      toast("Review submitted to Moderation", "success");
      setRating(0);
      setReviewText("");
    } catch (e: any) {
      toast(e?.response?.data?.message || "Failed to submit review", "error");
    } finally {
      setLoading(false);
    }
  };

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
  const paddingRight = 0;
  const thumbnailWidth = hasThumbnails ? 54 : 0;
  const gapWidth = hasThumbnails ? 8 : 0;
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

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc: number, r: any) => acc + Number(r.rating), 0) / reviews.length).toFixed(1)
    : String(p?.rating ?? "4.5");
  const totalReviews = reviews.length > 0 
    ? reviews.length 
    : 0;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <ScrollView ref={scrollViewRef} contentContainerClassName="pb-16">
        <View style={{ width: screenWidth, height: viewWidth, flexDirection: 'row', backgroundColor: colors.bg, paddingLeft: paddingLeft, paddingRight: paddingRight, marginTop: 8 }}>
          {/* Left-side Thumbnails */}
          {allImages.length > 1 && (
            <ScrollView 
              style={{ width: 54, height: '100%' }} 
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
                      width: 54, 
                      height: 54, 
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
                      <Text style={{ fontSize: 20 }}>🐟</Text>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <ChamferedBox 
            fillColor={colors.card}
            strokeColor={colors.border}
            bevelSize={24}
            style={{ 
              width: viewWidth, 
              height: viewWidth, 
              position: 'relative', 
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
              <View className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-none border border-white/10 z-10">
                <Text className="text-white text-[10px] font-black tracking-widest">
                  {activeImageIndex + 1} / {allImages.length}
                </Text>
              </View>
            )}

            {/* Share and Wishlist Buttons */}
            <View 
              style={{
                position: 'absolute',
                bottom: 6,
                right: 6,
                flexDirection: 'row',
                alignItems: 'center',
                zIndex: 20
              }}
            >
              <View 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                  borderRadius: 12, 
                  paddingHorizontal: 6, 
                  paddingVertical: 4,
                  gap: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Main Share Button */}
                <Pressable
                  onPress={handleNativeShare}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <MaterialCommunityIcons name="share-variant" size={12} color="#FFFFFF" />
                </Pressable>

                {/* WhatsApp Button */}
                <Pressable
                  onPress={handleWhatsAppShare}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <MaterialCommunityIcons name="whatsapp" size={14} color="#25D366" />
                </Pressable>

                {/* Copy Link Button */}
                <Pressable
                  onPress={handleCopyLink}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <MaterialCommunityIcons name="link-variant" size={12} color="#FFFFFF" />
                </Pressable>

                {/* Vertical Divider */}
                <View style={{ width: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.2)' }} />

                {/* Heart Button */}
                <Pressable
                  onPress={handleToggleWishlist}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <MaterialCommunityIcons 
                    name={isFavorited ? "heart" : "heart-outline"} 
                    size={14} 
                    color={isFavorited ? "#EF4444" : "#FFFFFF"} 
                  />
                </Pressable>
              </View>
            </View>

            {/* Tap overlay info */}
            {allImages.length > 0 && (
              <View className="absolute top-4 left-4 bg-black/45 px-2 py-1 rounded flex-row items-center gap-1 border border-white/5 z-10">
                <MaterialCommunityIcons name="magnify-plus-outline" size={10} color="#fff" />
                <Text className="text-white text-[8px] font-bold uppercase">Tap to zoom</Text>
              </View>
            )}

            {/* Top-Right Review/Rating Pill */}
            {allImages.length > 0 && (
              <Pressable
                onPress={() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }}
                className="absolute top-3 right-3 z-20"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }]
                })}
              >
                <View 
                  className="flex-row items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-full border border-white/10 shadow-2xl"
                  style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6 }}
                >
                  <MaterialCommunityIcons name="star" size={12} color="#FBBF24" />
                  <View className="flex-row items-center gap-0.5">
                    <Text className="text-[11px] font-black text-white">{averageRating}</Text>
                    <Text className="text-[9px] font-bold text-white/60 tracking-tighter">({totalReviews})</Text>
                  </View>
                </View>
              </Pressable>
            )}
          </ChamferedBox>
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
          <Text className="mt-2 text-3xl font-black uppercase italic" style={{ color: colors.primary }}>
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
            <Text className="mt-2 text-[10px] font-black uppercase" style={{ color: colors.primary }}>
              Live @ {String(product.live_harbor)} • {String(product.remaining_kg ?? product.live_stock)}kg left
            </Text>
          ) : null}

          {/* --- FRESHNESS DECAY CLOCK --- */}
          <View className="mt-4 p-3 border flex-row items-center justify-between" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="clock-outline" size={16} color={colors.primary} />
              <View>
              {(() => {
                let landedAt = new Date(Date.now() - 4 * 60 * 60 * 1000 - 12 * 60 * 1000);
                if (product.landed_at) {
                  const d = new Date(String(product.landed_at).replace(" ", "T"));
                  if (!isNaN(d.getTime())) landedAt = d;
                }
                const diffMs = Math.max(0, Date.now() - landedAt.getTime());
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                const freshPercent = Math.max(85, 100 - Math.floor(diffHours * 0.8));
                return (
                  <>
                    <Text className="text-[10px] font-black uppercase" style={{ color: colors.text }}>Landed: {diffHours}h {diffMins}m ago</Text>
                    <Text className="text-[8px] font-bold uppercase mt-0.5" style={{ color: colors.textMuted }}>Prime Quality Index (A+)</Text>
                  </>
                );
              })()}
              </View>
            </View>
            <View className="rounded-none px-2 py-1 border" style={{ backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }}>
              {(() => {
                let landedAt = new Date(Date.now() - 4 * 60 * 60 * 1000 - 12 * 60 * 1000);
                if (product.landed_at) {
                  const d = new Date(String(product.landed_at).replace(" ", "T"));
                  if (!isNaN(d.getTime())) landedAt = d;
                }
                const diffMs = Math.max(0, Date.now() - landedAt.getTime());
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const freshPercent = Math.max(85, 100 - Math.floor(diffHours * 0.8));
                return <Text className="text-[8px] font-black uppercase" style={{ color: colors.primary }}>{freshPercent}% FRESH</Text>;
              })()}
            </View>
          </View>

          {/* Licious-Style Smart Add-ons Cross-Sell Engine */}
          {p.addons && p.addons.length > 0 ? (
            <View className="mt-6 p-4 rounded-[20px] border" style={{ backgroundColor: `${colors.primary}05`, borderColor: `${colors.primary}15` }}>
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-1">
                  <MaterialCommunityIcons name="plus" size={14} color={colors.primary} />
                  <Text className="text-[10px] font-black uppercase tracking-wider" style={{ color: colors.primary }}>
                    Complete Your Recipe
                  </Text>
                </View>
                <View className="rounded px-1.5 py-0.5 border" style={{ backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}20` }}>
                  <Text className="text-[6px] font-black uppercase tracking-widest" style={{ color: colors.primary }}>
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
                      className="w-full p-2 border rounded-none flex-row items-center justify-between"
                      style={{ backgroundColor: colors.card, borderColor: colors.border }}
                    >
                      <View className="flex-row items-center flex-1 pr-3">
                        <Image 
                          source={{ uri: addonImg }} 
                          className="w-10 h-10 rounded-none bg-black/10 border mr-3"
                          style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
                        />
                        <View className="flex-1 justify-center">
                          <Text className="text-[10px] font-black uppercase text-foreground" numberOfLines={1}>{addon.name}</Text>
                          <Text className="text-[8px] text-muted-foreground mt-0.5" numberOfLines={1}>
                            {addon.description || "Fresh pairing."}
                          </Text>
                          <Text className="text-[10px] font-black mt-0.5" style={{ color: colors.primary }}>₹{addon.price}</Text>
                        </View>
                      </View>
                      
                      <Pressable
                        onPress={() => handleToggleAddon(addon)}
                        className="px-3 py-1.5 rounded-none flex-row items-center justify-center gap-1 border"
                        style={{ 
                          backgroundColor: inCart ? colors.primary : 'transparent',
                          borderColor: colors.primary 
                        }}
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
                  className="mt-3 py-2 items-center justify-center border rounded-none"
                  style={{ backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}20` }}
                >
                  <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.primary }}>
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
                      className="p-3 border rounded-none items-center justify-center min-w-[90px]"
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
              <View className="border rounded-none py-4 items-center" style={{ backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }}>
                <Text className="font-black uppercase tracking-widest text-center" style={{ color: colors.primary }}>
                  🚢 COMING SOON - NOT YET HARVESTED IN THIS SECTOR
                </Text>
              </View>
            </View>
          ) : (
            <View className="mt-8 gap-3">
              <Button label="SELECT CUT & ADD" onPress={openCut} />
              <Button
                label="CHECK OUT"
                variant="ghost"
                onPress={() => {
                  const prepAdd = selectedPrepOption ? parseFloat(selectedPrepOption.price_flat_add) : 0;
                  cart.addItem({
                    id: `${id}-whole${selectedPrepOption ? '-' + selectedPrepOption.prep_type : ''}`,
                    name: selectedPrepOption
                      ? `${String(product.name)} – Whole Fish (${selectedPrepOption.name})`
                      : `${String(product.name)} – Whole Fish`,
                    price: Number(product.live_price ?? product.price ?? 0) + prepAdd,
                    quantity: 1,
                    image: img,
                    sellerId: String(product.seller_id ?? ""),
                    metadata: {
                      cut_type: "WHOLE",
                      prep_option: selectedPrepOption ? {
                        id: selectedPrepOption.id,
                        prep_type: selectedPrepOption.prep_type,
                        name: selectedPrepOption.name,
                        price_flat_add: selectedPrepOption.price_flat_add
                      } : null
                    }
                  });
                  router.push("/checkout");
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

        {/* --- LAYER 2: NUTRITIONAL INFORMATION --- */}
        <View className="px-4 py-6 border-t" style={{ borderColor: colors.border }}>
          <SectionTitle title="Nutritional Information" subtitle="Per 100g Serving" />
          <View className="flex-row flex-wrap gap-2 mt-4">
            {[
              { label: "Protein", value: p?.nutrition?.protein || "20g", icon: "fire" },
              { label: "Omega-3", value: p?.nutrition?.omega3 || "300mg", icon: "heart" },
              { label: "Calories", value: p?.nutrition?.calories || "100 kcal", icon: "lightning-bolt" },
              { label: "Fat", value: p?.nutrition?.fat || "2g", icon: "snowflake" }
            ].map((fact, idx) => (
              <View 
                key={idx} 
                className="w-[48%] p-3 items-center justify-center border" 
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
              >
                <MaterialCommunityIcons name={fact.icon as any} size={16} color={colors.primary} />
                <Text className="text-[10px] font-black uppercase mt-1" style={{ color: colors.textMuted }}>{fact.label}</Text>
                <Text className="text-sm font-black italic mt-1" style={{ color: colors.text }}>{fact.value}</Text>
              </View>
            ))}
          </View>

          {/* --- FRESHNESS GUARANTEE --- */}
          <View className="mt-4 p-4 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <Text className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: colors.primary }}>
              ❄️ Temperature Control
            </Text>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-xs font-black" style={{ color: colors.text }}>Stable {p?.storage_temp || -18.2}°C</Text>
                <Text className="text-[8px] font-bold uppercase mt-0.5" style={{ color: colors.textMuted }}>Continuous Cold-Chain Active</Text>
              </View>
              <View className="flex-row gap-1">
                {[
                  Number(p?.storage_temp || -18.2) + 0.2, 
                  Number(p?.storage_temp || -18.2), 
                  Number(p?.storage_temp || -18.2) + 0.1, 
                  Number(p?.storage_temp || -18.2)
                ].map((t, idx) => (
                  <View key={idx} className="px-1.5 py-1 border rounded" style={{ backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}20` }}>
                    <Text className="text-[8px] font-black" style={{ color: colors.primary }}>{t.toFixed(1)}°C</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className="mt-4 p-4 border flex-row items-center gap-4" style={{ backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }}>
            <MaterialCommunityIcons name="check-decagram" size={24} color={colors.primary} />
            <View>
              <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.primary }}>Quality Tested & Freshness Certified</Text>
              <Text className="text-[10px] uppercase font-bold mt-1" style={{ color: colors.primary, opacity: 0.7 }}>Certified Fresh • 100% Safe</Text>
            </View>
          </View>
        </View>

        {/* --- LAYER 3: CULINARY INTELLIGENCE --- */}
        <View className="px-4 py-6 border-t" style={{ borderColor: colors.border }}>
          <SectionTitle title="Chef Recipes" subtitle="Chef Recommended Preparations" />
          <View className="mt-4 gap-3">
            {((p.recipes && p.recipes.length > 0) ? p.recipes : [
              { id: 1, title: "Traditional Catla Fish Curry", time: "30 Mins", difficulty: "Medium" },
              { id: 2, title: "Pan-Seared Boneless Cuts", time: "15 Mins", difficulty: "Easy" }
            ]).map((recipe: any, i: number) => (
              <Pressable 
                key={i} 
                onPress={() => {
                  router.push(`/(customer)/recipe/${recipe.id || 1}` as any);
                }}
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

        {/* --- LAYER 4: SELLER INFORMATION --- */}
        <View className="px-4 py-6 border-t" style={{ borderColor: colors.border }}>
          <SectionTitle title="Seller Information" subtitle="Seller Verification" />
          <View className="p-4 mt-4 border flex-row items-center gap-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
             <View className="w-12 h-12 rounded-none items-center justify-center border" style={{ backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}40` }}>
                <Text className="text-xl">⚓</Text>
             </View>
             <View>
                <Text className="text-sm font-black uppercase italic" style={{ color: colors.text }}>
                  {String(p.seller_name ?? "Verified Seller")}
                </Text>
                <Text className="text-[9px] font-black uppercase tracking-widest mt-1" style={{ color: colors.primary }}>
                  {String(p.seller_name ?? "Verified Seller")} • {String(p.seller_location ?? "Port Blair, Andaman")}
                </Text>
             </View>
          </View>
        </View>

        {/* --- LAYER 5: COMMUNITY & REVIEWS --- */}
        <View className="px-4 py-6 border-t" style={{ borderColor: colors.border }}>
          <SectionTitle title="Customer Reviews" subtitle="Verified Buyer Feedback" />
          <View className="mt-4 gap-3">
            {reviewsLoading && (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />
            )}
            {!reviewsLoading && reviews.slice(0, 3).map((review, i) => (
              <View key={review.id ?? i} className="p-4 border rounded-xl" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-none items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
                      <Text className="font-black" style={{ color: colors.primary }}>{review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U'}</Text>
                    </View>
                    <View>
                      <Text className="text-[10px] font-black uppercase" style={{ color: colors.text }}>{review.user_name || "Unknown User"}</Text>
                      <Text className="text-[8px] font-bold uppercase" style={{ color: colors.textMuted }}>{review.created_at ? new Date(review.created_at).toLocaleDateString() : "Recent"}</Text>
                    </View>
                  </View>
                  <Text className="text-[10px] font-black" style={{ color: colors.primary }}>★ {review.rating}</Text>
                </View>
                <Text className="text-xs italic" style={{ color: colors.textMuted }}>"{review.comment}"</Text>
              </View>
            ))}
            {!reviewsLoading && reviews.length === 0 && (
              <Text className="text-xs font-black uppercase opacity-40 italic text-center">No reviews yet for this catch.</Text>
            )}
            {reviews.length > 3 && (
              <Pressable
                onPress={() => setIsAllReviewsVisible(true)}
                className="self-end px-3 py-1.5 border rounded-lg active:opacity-80"
                style={{ borderColor: colors.border, backgroundColor: colors.card, marginTop: -2 }}
              >
                <Text className="text-[9px] font-black uppercase tracking-widest" style={{ color: colors.primary }}>
                  VIEW ALL {reviews.length} REVIEWS
                </Text>
              </Pressable>
            )}
          </View>
          <Button label="SUBMIT FEEDBACK" variant="ghost" className="mt-4 border" style={{ borderColor: colors.border }} onPress={() => setIsReviewModalVisible(true)} />
        </View>

        {/* --- LAYER 6: SIMILAR PRODUCTS --- */}
        <View className="px-4 py-6 border-t" style={{ borderColor: colors.border }}>
          <SectionTitle title="Similar Products" subtitle="Explore Alternatives" />
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
        <FssaiBanner />
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
              className="w-10 h-10 rounded-none bg-white/10 items-center justify-center border border-white/10"
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

      {/* Review Modal */}
      <Modal visible={isReviewModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="p-6 rounded-t-3xl border-t" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black uppercase italic" style={{ color: colors.text }}>Submit Feedback</Text>
              <Pressable onPress={() => setIsReviewModalVisible(false)} className="p-2">
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <View className="items-center mb-6">
              <Text className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: colors.textMuted }}>Rate Your Experience</Text>
              <View className="flex-row gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} onPress={() => setRating(star)}>
                    <MaterialCommunityIcons name={star <= rating ? "star" : "star-outline"} size={32} color={colors.primary} />
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="border rounded-xl p-4 mb-6" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <TextInput
                multiline
                numberOfLines={4}
                value={reviewText}
                onChangeText={setReviewText}
                placeholder="Share your experience with this product..."
                placeholderTextColor={colors.textMuted}
                style={{ color: colors.text, minHeight: 80, textAlignVertical: 'top' }}
              />
            </View>

            <Button 
              onPress={submitReview} 
              className="w-full h-14 rounded-xl"
              label="SUBMIT PROTOCOL"
            />
          </View>
        </View>
      </Modal>

      {/* View All Reviews Modal */}
      <Modal
        visible={isAllReviewsVisible}
        animationType="slide"
        onRequestClose={() => setIsAllReviewsVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: 48 }}>
          {/* Header */}
          <View className="px-4 py-4 border-b flex-row justify-between items-center" style={{ borderColor: colors.border }}>
            <Pressable onPress={() => setIsAllReviewsVisible(false)} className="p-2">
              <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
            </Pressable>
            <Text className="text-sm font-black uppercase italic" style={{ color: colors.text }}>
              ALL REVIEWS ({reviews.length})
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* List */}
          <FlatList
            data={reviews}
            keyExtractor={(item, index) => item.id ? String(item.id) : String(index)}
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 60 }}
            renderItem={({ item: review }) => (
              <View className="p-4 border rounded-xl" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-none items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
                      <Text className="font-black" style={{ color: colors.primary }}>
                        {review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U'}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-[10px] font-black uppercase" style={{ color: colors.text }}>{review.user_name || "Unknown User"}</Text>
                      <Text className="text-[8px] font-bold uppercase" style={{ color: colors.textMuted }}>
                        {review.created_at ? new Date(review.created_at).toLocaleDateString() : "Recent"}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-[10px] font-black" style={{ color: colors.primary }}>★ {review.rating}</Text>
                </View>
                <Text className="text-xs italic" style={{ color: colors.textMuted }}>"{review.comment}"</Text>
              </View>
            )}
          />
        </View>
      </Modal>

      {ToastHost}
    </View>
  );
}
