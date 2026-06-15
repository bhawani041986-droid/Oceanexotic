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

interface VideoItem {
  id: number;
  product_id: string;
  video_url: string;
  thumbnail_url?: string;
  title: string;
  sort_order: number;
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

export function OceanReelsFeed() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  
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
    toast(`${product.name} added from Ocean Reels!`, "success");
  };

  if (loading) {
    return (
      <View className="py-6 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (videos.length === 0) return null;

  return (
    <View className="w-full py-6 border-t border-b my-4" style={{ borderColor: `${colors.border}20`, backgroundColor: colors.bg }}>
      <View className="px-4 mb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-black uppercase italic tracking-tighter" style={{ color: colors.text }}>
              Ocean <Text style={{ color: colors.primary }}>Reels</Text>
            </Text>
            <Text className="text-[9px] uppercase tracking-widest font-black" style={{ color: colors.textMuted }}>
              Watch & Shop
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
