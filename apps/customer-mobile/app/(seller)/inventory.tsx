import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl, TextInput, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { useAuthStore } from "@/store/authStore";
import { productService, type Product } from "@/services/productService";
import api from "@/services/api";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import { cn } from "@/lib/utils";

// Custom UI Icons matching Hardened HUD
function PlusIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12h14" />
      <Path d="M12 5v14" />
    </Svg>
  );
}

function SearchIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="11" cy="11" r="8" />
      <Path d="m21 21-4.3-4.3" />
    </Svg>
  );
}

function EditIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 20h9" />
      <Path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Svg>
  );
}

function TrashIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 6h18" />
      <Path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <Path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </Svg>
  );
}

function AnchorIcon({ color }: { color: string }) {
  return (
    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="5" r="3" />
      <Path d="M12 22V8" />
      <Path d="M5 12H2a10 10 0 0 0 20 0h-3" />
    </Svg>
  );
}

const CATEGORIES = ["ALL", "SEAWATER FISH", "FRESHWATER FISH", "PRAWNS & SHRIMPS", "CRABS & LOBSTERS", "STEAKS & FILLETS", "EXOTIC CATCH", "READY TO COOK", "COASTAL DRY FISH"];

export default function SellerInventoryScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const primaryColor = "#7C3AED"; 
  const borderColor = "rgba(124, 58, 237, 0.25)";
  const bgCard = "rgba(15, 23, 42, 0.6)";

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const sellerId = user?.id ? (user.id.startsWith("SEL-") ? user.id : `SEL-${user.id}`) : 'SEL-001';

  const fetchInventory = async () => {
    try {
      const data = await productService.fetchAll();
      // Filter products belonging to current seller
      const sellerProducts = data.filter((p: any) => p.seller_id === sellerId || p.sellerId === sellerId);
      setProducts(sellerProducts);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to sync with Product Database.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInventory();
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to permanently delete product ${id}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              // Call DELETE on api/seller/products.php?id=...
              await api.delete(`/seller/products.php`, { params: { id } });
              Alert.alert("Success", "Product deleted successfully.");
              fetchInventory();
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to delete product. Please retry.");
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <View className="flex-1 bg-[#020617]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
        }
      >
        {/* Header Title */}
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-black italic uppercase tracking-tight text-white">
              Harbor Registry
            </Text>
            <Text className="text-[8px] font-black uppercase tracking-[0.2em] text-[#7C3AED]/70 mt-0.5">
              Manage Inventory Stock • {products.length} Items
            </Text>
          </View>

          {/* New Harvest Button */}
          <Pressable
            onPress={() => router.push("/(seller)/product-new")}
            className="flex-row items-center bg-[#7C3AED] px-4 py-2.5 rounded-xl active:opacity-80"
            style={{
              shadowColor: primaryColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 4
            }}
          >
            <PlusIcon color="#FFFFFF" />
            <Text className="text-[9px] font-black text-white uppercase tracking-widest ml-1">
              New Harvest
            </Text>
          </Pressable>
        </View>

        {/* Search Input */}
        <View 
          className="flex-row items-center px-3 h-10 border rounded-xl bg-slate-900/50 mb-4"
          style={{ borderColor: borderColor }}
        >
          <SearchIcon color="rgba(255,255,255,0.4)" />
          <TextInput
            placeholder="Search Registry..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            className="flex-1 ml-2 text-xs font-black text-white uppercase tracking-wider"
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCorrect={false}
          />
          {searchTerm.length > 0 && (
            <Pressable onPress={() => setSearchTerm("")}>
              <Text className="text-slate-400 text-xs font-black px-1">✕</Text>
            </Pressable>
          )}
        </View>

        {/* Categories Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row mb-6 pb-2"
          contentContainerStyle={{ gap: 8 }}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border",
                  active ? "bg-[#7C3AED] border-[#7C3AED]" : "bg-white/5 border-white/10"
                )}
              >
                <Text className="text-[7.5px] font-black text-white uppercase tracking-wider">
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Product Items */}
        {isLoading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator color={primaryColor} size="large" />
            <Text className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-4 animate-pulse">
              Syncing Product Database...
            </Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View 
            className="py-20 border border-dashed rounded-[24px] items-center justify-center space-y-4"
            style={{ borderColor: borderColor, backgroundColor: "rgba(255,255,255,0.01)" }}
          >
            <Text className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              No Registered Harvests
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {filteredProducts.map((p) => (
              <View
                key={p.id}
                className="p-4 rounded-[20px] border flex-row items-center"
                style={{ backgroundColor: bgCard, borderColor: borderColor }}
              >
                {/* Product Image */}
                <Image
                  source={{ uri: resolveMediaUrl(p.image_url) || "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80" }}
                  className="w-16 h-16 rounded-xl mr-4 bg-slate-900 border border-white/10"
                  resizeMode="cover"
                />

                {/* Details */}
                <View className="flex-1 justify-center space-y-1">
                  <View className="flex-row items-center flex-wrap gap-1">
                    <Text className="text-[7px] font-black text-[#7C3AED] uppercase tracking-widest border border-[#7C3AED]/30 px-1 py-0.5 rounded leading-none">
                      {p.category || "GENERAL"}
                    </Text>
                    <Text className="text-[6px] font-black text-slate-400 uppercase tracking-wider bg-white/5 border border-white/10 px-1 py-0.5 rounded leading-none">
                      {p.id}
                    </Text>
                  </View>

                  <Text className="text-sm font-black text-white uppercase tracking-tight italic" numberOfLines={1}>
                    {p.name}
                  </Text>

                  {/* Node details */}
                  <View className="flex-row items-center space-x-1.5 opacity-60">
                    <AnchorIcon color="rgba(255,255,255,0.6)" />
                    <Text className="text-[7.5px] font-bold text-slate-300 uppercase tracking-wider max-w-[120px]" numberOfLines={1}>
                      {(p as any).harbor_node || "Port Blair Harbor"}
                    </Text>
                  </View>

                  {/* Stock & Price */}
                  <View className="flex-row items-center space-x-4 pt-0.5">
                    <View>
                      <Text className="text-[6.5px] font-black text-slate-500 uppercase tracking-widest">STOCK</Text>
                      <Text className="text-[10px] font-black text-white italic tracking-tighter">
                        {p.stock ?? 0} {p.unit ?? "KG"}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-[6.5px] font-black text-slate-500 uppercase tracking-widest">PRICE</Text>
                      <Text className="text-[10px] font-black text-emerald-400 italic tracking-tighter">
                        ₹{Number(p.price).toLocaleString()}/{(p.unit ?? "KG").toLowerCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* CRUD Controls */}
                <View className="space-y-2 ml-2 pl-2 border-l border-white/5">
                  <Pressable
                    onPress={() => router.push({ pathname: "/(seller)/product-edit", params: { id: p.id } } as any)}
                    className="h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 active:bg-white/15"
                  >
                    <EditIcon color="#FFFFFF" />
                  </Pressable>

                  <Pressable
                    onPress={() => handleDelete(p.id)}
                    className="h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20 active:bg-rose-500/20"
                  >
                    <TrashIcon color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
