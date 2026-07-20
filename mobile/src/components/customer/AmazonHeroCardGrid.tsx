import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import { useSettingsStore, DEFAULT_AMAZON_HERO_CARDS, AmazonHeroCardConfig } from "@/store/settingsStore";
import type { Product } from "@/services/productService";

interface AmazonHeroCardGridProps {
  products?: Product[];
}

export function AmazonHeroCardGrid({ products = [] }: AmazonHeroCardGridProps) {
  const router = useRouter();
  const settingsCards = useSettingsStore((s) => s.amazonHeroCards);
  const cardsData: AmazonHeroCardConfig[] = (settingsCards && settingsCards.length > 0 ? settingsCards : DEFAULT_AMAZON_HERO_CARDS).filter((c: AmazonHeroCardConfig) => c.active !== false);

  const screenWidth = Dimensions.get("window").width;
  const cardWidth = Math.min(screenWidth * 0.85, 330);
  const snapInterval = cardWidth + 10;

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const isUserInteracting = useRef(false);

  // Auto-Play Snap Carousel Engine (4-second interval)
  useEffect(() => {
    if (cardsData.length <= 1) return;

    const timer = setInterval(() => {
      if (!isUserInteracting.current && scrollViewRef.current) {
        const nextIndex = (activeIndex + 1) % cardsData.length;
        setActiveIndex(nextIndex);
        scrollViewRef.current.scrollTo({
          x: nextIndex * snapInterval,
          animated: true,
        });
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [activeIndex, cardsData.length, snapInterval]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / snapInterval);
    if (index !== activeIndex && index >= 0 && index < cardsData.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={{ marginVertical: 4 }}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => { isUserInteracting.current = true; }}
        onScrollEndDrag={() => {
          setTimeout(() => { isUserInteracting.current = false; }, 3000);
        }}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
      >
        {cardsData.map((card, cIdx) => (
          <View
            key={card.id || `card-${cIdx}`}
            style={{
              width: cardWidth,
              backgroundColor: card.themeColor || "#0d5c3a",
              borderRadius: 18,
              padding: 10,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.22)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {/* Card Header with Live Telemetry Pulse Badge */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6 }}>
                {/* Glowing Live Pulse Indicator */}
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#ef4444", shadowColor: "#ef4444", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 4 }} />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "900",
                    color: "#FFFFFF",
                    letterSpacing: -0.2,
                  }}
                  numberOfLines={1}
                >
                  {card.title}
                </Text>
              </View>
              {card.badge ? (
                <View
                  style={{
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                    borderRadius: 8,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.35)",
                  }}
                >
                  <Text style={{ fontSize: 8.5, fontWeight: "900", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {card.badge}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* 2x2 Product Grid Container (Zero Blank Space Design) */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 6 }}>
              {(card.items || []).slice(0, 4).map((item, idx) => {
                // Calculate discount percent if oldPrice is present
                let discountTag: string | null = null;
                if (item.oldPrice && item.price) {
                  const pNum = parseFloat(item.price.replace(/[^0-9.]/g, ""));
                  const oNum = parseFloat(item.oldPrice.replace(/[^0-9.]/g, ""));
                  if (oNum > pNum) {
                    const pct = Math.round(((oNum - pNum) / oNum) * 100);
                    if (pct > 0) discountTag = `${pct}% OFF`;
                  }
                }

                return (
                  <Pressable
                    key={idx}
                    onPress={() =>
                      router.push({
                        pathname: "/products",
                        params: { search: item.query || item.name },
                      })
                    }
                    style={{
                      width: "48.5%",
                      backgroundColor: "#FFFFFF",
                      borderRadius: 14,
                      padding: 6,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 3,
                      elevation: 3,
                      position: "relative",
                    }}
                  >
                    {/* Discount Tag Badge */}
                    {discountTag && (
                      <View style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        zIndex: 10,
                        backgroundColor: "#ef4444",
                        paddingHorizontal: 4,
                        paddingVertical: 1.5,
                        borderRadius: 5,
                      }}>
                        <Text style={{ fontSize: 7, fontWeight: "900", color: "#ffffff" }}>
                          {discountTag}
                        </Text>
                      </View>
                    )}

                    <View style={{ width: "100%", aspectRatio: 1.15, borderRadius: 10, overflow: "hidden", backgroundColor: "#f8fafc" }}>
                      <Image
                        source={{ uri: resolveMediaUrl(item.image) }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 10.5,
                        fontWeight: "800",
                        color: "#0f172a",
                        marginTop: 4,
                      }}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    
                    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 3, marginTop: 1 }}>
                      <Text
                        style={{
                          fontSize: 11.5,
                          fontWeight: "900",
                          color: "#0284c7",
                        }}
                      >
                        {item.price}
                      </Text>
                      {item.oldPrice && (
                        <Text
                          style={{
                            fontSize: 8.5,
                            fontWeight: "700",
                            color: "#94a3b8",
                            textDecorationLine: "line-through",
                          }}
                        >
                          {item.oldPrice}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Bottom See More Action Line */}
            <Pressable
              onPress={() => router.push("/products")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: "800", color: card.accentColor || "#FFFFFF" }}>
                Explore all deals & products
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={13} color={card.accentColor || "#FFFFFF"} />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {/* Horizontal Carousel Progress Dots */}
      {cardsData.length > 1 && (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 6 }}>
          {cardsData.map((_, idx) => (
            <View
              key={idx}
              style={{
                height: 3.5,
                width: activeIndex === idx ? 16 : 5,
                borderRadius: 2,
                backgroundColor: activeIndex === idx ? "#06b6d4" : "rgba(255, 255, 255, 0.25)",
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
