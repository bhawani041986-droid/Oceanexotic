import React from "react";
import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import type { Product } from "@/services/productService";

interface AmazonHeroCardGridProps {
  products?: Product[];
}

export function AmazonHeroCardGrid({ products = [] }: AmazonHeroCardGridProps) {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  const cardWidth = Math.min(screenWidth * 0.84, 340);

  // Curate 4 vibrant deal cards matching Amazon layout
  const cardsData = [
    {
      id: "card-1",
      title: "Continue Shopping Deals",
      bgGradient: "#0d5c3a", // Amazon Green
      accentColor: "#10B981",
      badge: "Exclusive",
      items: [
        { name: "Surmai Steaks", price: "₹1,899", image: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&q=80", query: "Surmai" },
        { name: "King Jumbo Prawns", price: "₹6,989", image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80", query: "Prawn" },
        { name: "Seawater Crabs", price: "₹2,799", image: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80", query: "Crab" },
        { name: "Red Snapper Fillet", price: "₹798", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80", query: "Snapper" },
      ]
    },
    {
      id: "card-2",
      title: "Today's Fresh Landed Catch",
      bgGradient: "#034873", // Amazon Blue
      accentColor: "#38BDF8",
      badge: "Landed Today",
      items: [
        { name: "Black Pomfret", price: "₹1,299", image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80", query: "Pomfret" },
        { name: "Cleaned Squid", price: "₹798", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80", query: "Squid" },
        { name: "Rock Lobster", price: "₹2,450", image: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80", query: "Lobster" },
        { name: "Yellowfin Tuna", price: "₹890", image: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&q=80", query: "Tuna" },
      ]
    },
    {
      id: "card-3",
      title: "Chef's Ready-to-Cook Specials",
      bgGradient: "#7c1d1d", // Amazon Crimson/Red
      accentColor: "#F43F5E",
      badge: "Quick Cook",
      items: [
        { name: "Fish Fry Cut", price: "₹450", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80", query: "Fry" },
        { name: "Prawn Biryani Cut", price: "₹850", image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80", query: "Prawn" },
        { name: "Grill Steaks", price: "₹1,150", image: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&q=80", query: "Steak" },
        { name: "Crab Lollipop", price: "₹650", image: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80", query: "Crab" },
      ]
    },
    {
      id: "card-4",
      title: "Flash Discounted Seafood",
      bgGradient: "#581c87", // Amazon Violet
      accentColor: "#C084FC",
      badge: "30% OFF",
      items: [
        { name: "Tiger Prawns", price: "₹990", image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80", query: "Tiger" },
        { name: "Silver Pomfret", price: "₹1,450", image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80", query: "Pomfret" },
        { name: "Anjal Slices", price: "₹1,120", image: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&q=80", query: "Anjal" },
        { name: "Asian Sea Bass", price: "₹780", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80", query: "Bass" },
      ]
    }
  ];

  return (
    <View style={{ marginVertical: 8 }}>
      <ScrollView
        horizontal
        pagingEnabled={false}
        snapToInterval={cardWidth + 12}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, gap: 12 }}
      >
        {cardsData.map((card) => (
          <View
            key={card.id}
            style={{
              width: cardWidth,
              backgroundColor: card.bgGradient,
              borderRadius: 20,
              padding: 14,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.15)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            {/* Card Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "900",
                  color: "#FFFFFF",
                  flex: 1,
                  letterSpacing: -0.3,
                }}
                numberOfLines={1}
              >
                {card.title}
              </Text>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 10,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.25)",
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: "900", color: "#FFFFFF", textTransform: "uppercase" }}>
                  {card.badge}
                </Text>
              </View>
            </View>

            {/* 2x2 Product Grid Container */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 }}>
              {card.items.map((item, idx) => (
                <Pressable
                  key={idx}
                  onPress={() =>
                    router.push({
                      pathname: "/products",
                      params: { search: item.query },
                    })
                  }
                  style={{
                    width: "48%",
                    backgroundColor: "#FFFFFF",
                    borderRadius: 14,
                    padding: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <View style={{ width: "100%", aspectRatio: 1, borderRadius: 10, overflow: "hidden", backgroundColor: "#f8fafc" }}>
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
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "900",
                      color: "#0284c7",
                      marginTop: 2,
                    }}
                  >
                    {item.price}
                  </Text>
                </Pressable>
              ))}
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
              <Text style={{ fontSize: 11, fontWeight: "800", color: card.accentColor }}>
                See all deals & products
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={14} color={card.accentColor} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
