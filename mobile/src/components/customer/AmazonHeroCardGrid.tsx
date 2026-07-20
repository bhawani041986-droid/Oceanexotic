import React, { useState } from "react";
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
  const cardWidth = Math.min(screenWidth * 0.86, 340);
  const snapInterval = cardWidth + 12;

  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / snapInterval);
    if (index !== activeIndex && index >= 0 && index < cardsData.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={{ marginVertical: 8 }}>
      <ScrollView
        horizontal
        pagingEnabled={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 14, gap: 12 }}
      >
        {cardsData.map((card, cIdx) => (
          <View
            key={card.id || `card-${cIdx}`}
            style={{
              width: cardWidth,
              backgroundColor: card.themeColor || "#0d5c3a",
              borderRadius: 22,
              padding: 14,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.2)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* Card Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <View style={{ flex: 1, paddingRight: 6 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "900",
                    color: "#FFFFFF",
                    letterSpacing: -0.3,
                  }}
                  numberOfLines={1}
                >
                  {card.title}
                </Text>
              </View>
              {card.badge ? (
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 10,
                    backgroundColor: "rgba(255, 255, 255, 0.18)",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: "900", color: "#FFFFFF", textTransform: "uppercase" }}>
                    {card.badge}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* 2x2 Product Grid Container */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 }}>
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
                      width: "48%",
                      backgroundColor: "#FFFFFF",
                      borderRadius: 16,
                      padding: 8,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.12,
                      shadowRadius: 5,
                      elevation: 4,
                      position: "relative",
                    }}
                  >
                    {/* Optional Discount Tag Badge */}
                    {discountTag && (
                      <View style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        zIndex: 10,
                        backgroundColor: "#ef4444",
                        paddingHorizontal: 5,
                        paddingVertical: 2,
                        borderRadius: 6,
                      }}>
                        <Text style={{ fontSize: 7.5, fontWeight: "900", color: "#ffffff" }}>
                          {discountTag}
                        </Text>
                      </View>
                    )}

                    <View style={{ width: "100%", aspectRatio: 1, borderRadius: 12, overflow: "hidden", backgroundColor: "#f8fafc" }}>
                      <Image
                        source={{ uri: resolveMediaUrl(item.image) }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "800",
                        color: "#0f172a",
                        marginTop: 6,
                      }}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    
                    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 2 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "900",
                          color: "#0284c7",
                        }}
                      >
                        {item.price}
                      </Text>
                      {item.oldPrice && (
                        <Text
                          style={{
                            fontSize: 9.5,
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

            {/* Bottom See More Bar */}
            <Pressable
              onPress={() => router.push("/products")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "800", color: card.accentColor || "#FFFFFF" }}>
                See all deals & products
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={14} color={card.accentColor || "#FFFFFF"} />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {/* Horizontal Carousel Progress Indicator Dots */}
      {cardsData.length > 1 && (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 }}>
          {cardsData.map((_, idx) => (
            <View
              key={idx}
              style={{
                height: 4,
                width: activeIndex === idx ? 18 : 6,
                borderRadius: 2,
                backgroundColor: activeIndex === idx ? "#06b6d4" : "rgba(255, 255, 255, 0.2)",
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
