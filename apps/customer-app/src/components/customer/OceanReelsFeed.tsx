import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCartStore } from "@/store/cartStore";
import { useProducts } from "@/hooks/useProducts";
import { useToast } from "@/components/ui/Toast";
import { useThemeColors } from "@/hooks/useThemeColors";
import api from "@/services/api";
import { t } from "@/lib/i18n";
import Svg, { Path } from "react-native-svg";

interface VideoItem {
  id: number;
  product_id: string;
  video_url: string;
  thumbnail_url?: string;
  title: string;
  sort_order: number;
  description?: string;
}

interface OceanReelsFeedProps {
  variant?: "feed" | "pip" | "grid-card" | "banner";
  videoId?: number;
}

function ActiveReelVideo({ videoUrl, isMuted }: { videoUrl: string; isMuted: boolean }) {
  const player = useVideoPlayer(videoUrl, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.muted = isMuted;
    playerInstance.play();
  });

  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  return (
    <VideoView
      style={StyleSheet.absoluteFill}
      player={player}
      nativeControls={false}
      contentFit="cover"
    />
  );
}

export function OceanReelsFeed({ variant = "feed", videoId }: OceanReelsFeedProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPipOpen, setIsPipOpen] = useState(false);
  
  const colors = useThemeColors();
  const cart = useCartStore();
  const { toast } = useToast();
  const { data: allProducts } = useProducts();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data } = await api.get<{ status: string; content: VideoItem[] }>("/marketplace/videos");
        if (data.status === "success") {
          setVideos(data.content || []);
        }
      } catch (err) {
        console.error("Failed to fetch videos for reels:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handleAddToCart = (product: any) => {
    if (!product) return;
    cart.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image_url || product.image || "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400",
      sellerId: product.seller_id || "OCEAN",
    });
    toast(`${product.name} ${t('added_from_reels') || "added from Ocean Reels!"}`, "success");
  };

  if (loading) {
    if (variant === "grid-card" || variant === "pip") return null;
    return (
      <View className="py-6 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (videos.length === 0) return null;

  // ── OPTION 1: INLINE GRID CARD ──────────────────────────────────────────────
  if (variant === "grid-card") {
    const vid = videoId ? videos.find((v) => v.id === videoId) : videos[0];
    if (!vid) return null;
    const product = allProducts?.find((p) => p.id === vid.product_id);
    const isActive = activeVideoId === vid.id;
    
    // For local layout tracking
    const w = 170;
    const h = 258;

    return (
      <Pressable
        onPress={() => setActiveVideoId(isActive ? null : vid.id)}
        className="w-[48%] relative overflow-hidden"
        style={{ minHeight: 250 }}
      >
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Path
            d={`M16,0 L${w},0 L${w},${h - 16} L${w - 16},${h} L0,${h} L0,16 Z`}
            fill={colors.card}
            stroke={colors.border}
            strokeWidth="1"
          />
        </Svg>
        <View 
          className="relative overflow-hidden w-full"
          style={{ aspectRatio: 1, backgroundColor: "rgba(0,0,0,0.8)" }}
        >
          {isActive ? (
            <ActiveReelVideo videoUrl={vid.video_url} isMuted={isMuted} />
          ) : (
            <Image
              source={{ uri: vid.thumbnail_url || "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400" }}
              className="w-full h-full opacity-90"
              contentFit="cover"
            />
          )}
          <View className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 pointer-events-none" />

          <View className="absolute left-2 top-2 rounded bg-red-500/90 px-2 py-0.5 z-20">
            <Text className="text-[7px] font-black uppercase text-white">
              PROMO REEL
            </Text>
          </View>

          {/* Mute toggle button on card */}
          {isActive && (
            <Pressable 
              onPress={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full z-20"
            >
              <MaterialCommunityIcons
                name={isMuted ? "volume-mute" : "volume-high"}
                size={12}
                color="white"
              />
            </Pressable>
          )}

          {!isActive && (
            <View className="absolute inset-0 items-center justify-center pointer-events-none">
              <View className="w-8 h-8 rounded-full items-center justify-center bg-white/20 border border-white/40">
                <MaterialCommunityIcons name="play" size={16} color="white" style={{ marginLeft: 2 }} />
              </View>
            </View>
          )}
        </View>

        <View className="gap-2 p-3" style={{ minHeight: 90 }}>
          <Text className="text-[8px] font-black uppercase text-emerald-500">
            {t('watch_and_shop') || "Watch & Shop"}
          </Text>
          <Text
            className="text-xs font-black uppercase italic text-foreground"
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            {vid.title}
          </Text>
          {product && (
            <View className="flex-row items-center justify-between mt-auto">
              <Text className="text-sm font-black italic text-foreground" style={{ color: colors.text }}>
                ₹{product.price}
              </Text>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                className="rounded-xl px-3 py-2"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-[9px] font-black uppercase text-white">
                  SHOP
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* High-Tech Beveled Corner Overlays */}
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

  // ── OPTION 1.5: HORIZONTAL BANNER CARD ──────────────────────────────────────
  if (variant === "banner") {
    const vid = videoId ? videos.find((v) => v.id === videoId) : videos.find((v) => v.description === "banner") || videos[0];
    if (!vid) return null;
    const product = allProducts?.find((p) => p.id === vid.product_id);
    const isActive = activeVideoId === vid.id;

    return (
      <Pressable
        onPress={() => setActiveVideoId(isActive ? null : vid.id)}
        className="w-full my-4 flex-row overflow-hidden border rounded-2xl"
        style={{ height: 144, backgroundColor: colors.card, borderColor: colors.border }}
      >
        {/* Left Side: Video Preview */}
        <View className="relative h-full bg-black overflow-hidden" style={{ width: 81 }}>
          {isActive ? (
            <ActiveReelVideo videoUrl={vid.video_url} isMuted={isMuted} />
          ) : (
            <Image
              source={{ uri: vid.thumbnail_url || "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400" }}
              className="w-full h-full opacity-90"
              contentFit="cover"
            />
          )}
          <View className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 pointer-events-none" />
          
          <View className="absolute left-1.5 top-1.5 rounded bg-red-500/95 px-1 py-0.5 z-20">
            <Text className="text-[6px] font-black uppercase text-white tracking-widest">
              PROMO
            </Text>
          </View>

          {isActive && (
            <Pressable 
              onPress={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full z-20"
            >
              <MaterialCommunityIcons
                name={isMuted ? "volume-mute" : "volume-high"}
                size={10}
                color="white"
              />
            </Pressable>
          )}

          {!isActive && (
            <View className="absolute inset-0 items-center justify-center pointer-events-none">
              <View className="w-6 h-6 rounded-full items-center justify-center bg-white/20 border border-white/40">
                <MaterialCommunityIcons name="play" size={12} color="white" style={{ marginLeft: 1 }} />
              </View>
            </View>
          )}
        </View>

        {/* Right Side: Product Details & CTA */}
        <View className="flex-1 p-3 justify-between" style={{ backgroundColor: `${colors.bg}10` }}>
          <View className="space-y-1">
            <Text className="text-[8px] font-black uppercase tracking-widest" style={{ color: colors.primary }}>
              Featured Ocean Ad
            </Text>
            <Text
              className="text-sm font-black uppercase italic"
              style={{ color: colors.text }}
              numberOfLines={1}
            >
              {vid.title}
            </Text>
            <Text
              className="text-[10px] opacity-75 font-semibold"
              style={{ color: colors.textMuted }}
              numberOfLines={2}
            >
              {vid.description || "Fresh premium catch sourced directly from local harbors. 100% traceable cold-chain delivery."}
            </Text>
          </View>

          <View className="flex-row items-center justify-between pt-1 border-t" style={{ borderColor: `${colors.border}20` }}>
            <View>
              {product ? (
                <Text className="text-sm font-black italic" style={{ color: colors.text }}>
                  ₹{product.price}
                  <Text className="text-[8px] font-normal opacity-40">/kg</Text>
                </Text>
              ) : (
                <Text className="text-[8px] font-black uppercase" style={{ color: colors.textMuted }}>
                  Direct Harbor Catch
                </Text>
              )}
            </View>
            {product && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                className="flex-row items-center rounded-lg px-2.5 py-1.5"
                style={{ backgroundColor: colors.primary }}
              >
                <MaterialCommunityIcons name="cart-plus" size={10} color="white" style={{ marginRight: 4 }} />
                <Text className="text-[8px] font-black uppercase text-white">
                  SHOP NOW
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    );
  }

  // ── OPTION 2: FLOATING CORNER BUBBLE ────────────────────────────────────────
  if (variant === "pip") {
    const vid = videoId ? videos.find((v) => v.id === videoId) : videos[0];
    if (!vid) return null;
    const product = allProducts?.find((p) => p.id === vid.product_id);

    return (
      <View style={{ position: 'absolute', bottom: 110, right: 16, zIndex: 999, alignItems: 'flex-end' }}>
        {isPipOpen && (
          <View 
            className="rounded-2xl border bg-black shadow-2xl mb-3 overflow-hidden" 
            style={{ width: 140, height: 240, borderColor: colors.border }}
          >
            <ActiveReelVideo videoUrl={vid.video_url} isMuted={isMuted} />
            <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            {/* Close & Mute buttons */}
            <Pressable 
              onPress={() => setIsPipOpen(false)}
              className="absolute top-2 left-2 p-1.5 bg-black/40 rounded-full"
            >
              <MaterialCommunityIcons name="close" size={14} color="white" />
            </Pressable>
            <Pressable 
              onPress={() => setIsMuted(!isMuted)}
              className="absolute top-2 right-2 p-1.5 bg-black/40 rounded-full"
            >
              <MaterialCommunityIcons name={isMuted ? "volume-mute" : "volume-high"} size={14} color="white" />
            </Pressable>

            <View className="absolute bottom-0 left-0 right-0 p-2">
              <Text className="text-white font-bold text-[9px] truncate mb-0.5">{vid.title}</Text>
              {product && (
                <View className="flex-row items-center justify-between">
                  <Text className="font-bold text-[9px]" style={{ color: colors.primary }}>₹{product.price}</Text>
                  <Pressable 
                    onPress={() => handleAddToCart(product)} 
                    className="px-2 py-0.5 rounded bg-primary"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-[8px] font-bold text-white">SHOP</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Pulsing Bubble */}
        <Pressable 
          onPress={() => setIsPipOpen(!isPipOpen)}
          className="w-16 h-16 rounded-full border-2 overflow-hidden shadow-lg items-center justify-center p-0.5 bg-black"
          style={{ borderColor: colors.primary }}
        >
          <View className="w-full h-full rounded-full overflow-hidden relative">
            <Image 
              source={{ uri: vid.thumbnail_url || "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400" }} 
              className="w-full h-full"
              contentFit="cover"
            />
            <View className="absolute inset-0 bg-black/20 items-center justify-center">
              <View className="w-6 h-6 rounded-full items-center justify-center bg-primary/95" style={{ backgroundColor: colors.primary }}>
                <MaterialCommunityIcons name="play" size={14} color="white" style={{ marginLeft: 2 }} />
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    );
  }

  // ── STANDARD LAYOUT: CAROUSEL FEED ──────────────────────────────────────────
  return (
    <View className="w-full py-6 border-t border-b my-4" style={{ borderColor: `${colors.border}20`, backgroundColor: colors.bg }}>
      <View className="px-4 mb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-black uppercase italic tracking-tighter" style={{ color: colors.text }}>
              {t('ocean') || "Ocean"} <Text style={{ color: colors.primary }}>{t('reels') || "Reels"}</Text>
            </Text>
            <Text className="text-[9px] uppercase tracking-widest font-black" style={{ color: colors.textMuted }}>
              {t('watch_and_shop') || "Watch & Shop"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        className="flex-row"
      >
        {videos.map((vid) => {
          const product = allProducts?.find((p) => p.id === vid.product_id);
          const isActive = activeVideoId === vid.id;

          return (
            <Pressable
              key={vid.id}
              onPress={() => setActiveVideoId(isActive ? null : vid.id)}
              className="relative rounded-[16px] overflow-hidden bg-black shadow-md border"
              style={{
                width: 120,
                height: 200,
                borderColor: isActive ? colors.primary : "rgba(255,255,255,0.1)",
              }}
            >
              {/* Video Player or Thumbnail */}
              {isActive ? (
                <ActiveReelVideo videoUrl={vid.video_url} isMuted={isMuted} />
              ) : (
                <Image
                  source={{
                    uri: vid.thumbnail_url || "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400",
                  }}
                  className="w-full h-full"
                  contentFit="cover"
                  style={{ opacity: 0.8 }}
                />
              )}

              {/* Gradient overlay for text readability */}
              <View className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none" />

              {/* Static Play Icon Overlay */}
              {!isActive && (
                <View className="absolute inset-0 items-center justify-center pointer-events-none">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center border"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      borderColor: "rgba(255, 255, 255, 0.4)",
                    }}
                  >
                    <MaterialCommunityIcons name="play" size={16} color="white" style={{ marginLeft: 2 }} />
                  </View>
                </View>
              )}

              {/* Bottom text overlays & CTA */}
              <View className="absolute bottom-0 left-0 right-0 p-2 flex-col justify-end">
                <Text
                  className="text-white font-bold text-[9px] leading-tight mb-1"
                  numberOfLines={2}
                  style={{ textShadowColor: "rgba(0,0,0,0.8)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}
                >
                  {vid.title}
                </Text>
                {product && (
                  <View className="flex-row items-center justify-between mt-1">
                    <Text className="font-black text-[10px]" style={{ color: colors.primary }}>
                      ₹{product.price}
                    </Text>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="h-6 w-6 rounded-full items-center justify-center shadow-lg"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <MaterialCommunityIcons name="cart-plus" size={12} color="white" />
                    </Pressable>
                  </View>
                )}
              </View>

              {/* Mute/Unmute Overlay Toggle */}
              {isActive && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full"
                >
                  <MaterialCommunityIcons
                    name={isMuted ? "volume-mute" : "volume-high"}
                    size={14}
                    color="white"
                  />
                </Pressable>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

