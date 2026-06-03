import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Svg, { Path, Circle } from "react-native-svg";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import { FULL_API_URL } from "@/config/api";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import { cn } from "@/lib/utils";
import axios from "axios";

// Icons
function ChevronLeftIcon({ color }: { color: string }) {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="m15 18-6-6 6-6" />
    </Svg>
  );
}

function UploadIcon({ color }: { color: string }) {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <Path d="m17 8-5-5-5 5" />
      <Path d="M12 3v12" />
    </Svg>
  );
}

function PlusIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12h14" />
      <Path d="M12 5v14" />
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

const CUT_TYPES = [
  { id: 'WHOLE', label: 'Whole Fish' },
  { id: 'CURRY_CUT', label: 'Curry Cut' },
  { id: 'STEAK_CUT', label: 'Steak Cut' },
  { id: 'FILLET', label: 'Fillet' },
  { id: 'CLEANED', label: 'Cleaned' }
];

const CATEGORIES = [
  "SEAWATER FISH",
  "FRESHWATER FISH",
  "PRAWNS & SHRIMPS",
  "CRABS & LOBSTERS",
  "STEAKS & FILLETS",
  "EXOTIC CATCH",
  "READY TO COOK",
  "COASTAL DRY FISH"
];

const HARBORS = [
  "Phoenix Bay Harbor",
  "Junglighat Harbor",
  "Swaraj Dweep Harbor",
  "Havelock Docking"
];

export default function SellerEditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const user = useAuthStore((s) => s.user);

  const primaryColor = "#7C3AED"; 
  const borderColor = "rgba(124, 58, 237, 0.25)";
  const bgCard = "rgba(15, 23, 42, 0.6)";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const sellerId = user?.id ? (user.id.startsWith("SEL-") ? user.id : `SEL-${user.id}`) : 'SEL-001';

  const [formData, setFormData] = useState<any>({
    id: "",
    name: "",
    category: "SEAWATER FISH",
    price: "",
    description: "",
    stock: "100",
    unit: "KG",
    image_url: "",
    status: "ACTIVE",
    quality_rank: "VERIFIED",
    is_live_inventory: 1,
    harbor_node: "Phoenix Bay Harbor",
    catch_date: new Date().toISOString().split('T')[0],
    batch_label: "MORNING",
    catch_time: "05:30",
    gallery: "[]",
    nutrition: {
      protein: "20g",
      omega3: "300mg",
      calories: "100 kcal",
      fat: "2g"
    },
    cut_options: []
  });

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      try {
        const res = await api.get("/seller/products.php", { params: { id } });
        if (res.data) {
          const p = res.data;

          // Parse nutrition
          let parsedNutrition = {
            protein: "20g",
            omega3: "300mg",
            calories: "100 kcal",
            fat: "2g"
          };
          if (p.nutrition) {
            try {
              parsedNutrition = typeof p.nutrition === 'string' ? JSON.parse(p.nutrition) : p.nutrition;
            } catch (e) {
              console.error("Failed to parse nutrition", e);
            }
          }

          // Parse cut_options
          let parsedCuts = [];
          if (p.cut_options) {
            try {
              parsedCuts = typeof p.cut_options === 'string' ? JSON.parse(p.cut_options) : p.cut_options;
            } catch (e) {
              console.error("Failed to parse cut_options", e);
            }
          }

          setFormData({
            id: p.id,
            name: p.name || "",
            category: p.category || "SEAWATER FISH",
            price: p.price ? String(p.price) : "",
            description: p.description || "",
            stock: p.stock ? String(p.stock) : "100",
            unit: p.unit || "KG",
            image_url: p.image_url || "",
            status: p.status || "ACTIVE",
            quality_rank: p.quality_rank || "VERIFIED",
            is_live_inventory: p.is_live_inventory !== undefined ? Number(p.is_live_inventory) : 1,
            harbor_node: p.harbor_node || "Phoenix Bay Harbor",
            catch_date: p.catch_date || new Date().toISOString().split('T')[0],
            batch_label: p.batch_label || "MORNING",
            catch_time: p.catch_time || "05:30",
            gallery: p.gallery || "[]",
            nutrition: parsedNutrition,
            cut_options: parsedCuts
          });
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
        Alert.alert("Error", "Could not retrieve harvest details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Required", "Camera roll access is required to upload product imagery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadAsset(result.assets[0].uri);
    }
  };

  const uploadAsset = async (localUri: string) => {
    setIsUploading(true);
    try {
      const filename = localUri.split('/').pop() || 'upload.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      const uploadData = new FormData();
      uploadData.append('file', {
        uri: localUri,
        name: filename,
        type,
      } as any);

      // POST to upload.php
      const res = await axios.post(`${FULL_API_URL}/upload.php`, uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.status === "success" && res.data?.url) {
        setFormData((prev: any) => ({ ...prev, image_url: res.data.url }));
        Alert.alert("Success", "Product image uploaded & registered.");
      } else {
        Alert.alert("Upload Failure", res.data?.message || "Check XAMPP Server.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Upload Failure", "Handshake failed. Start XAMPP on port 8081.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddCut = () => {
    setFormData((prev: any) => ({
      ...prev,
      cut_options: [
        ...prev.cut_options,
        { cut_type: 'STEAK_CUT', price_modifier_percent: 0, price_flat_add: 0, is_available: 1 }
      ]
    }));
  };

  const handleRemoveCut = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      cut_options: prev.cut_options.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.price.trim()) {
      Alert.alert("Error", "Name and Price fields are mandatory.");
      return;
    }

    setIsSaving(true);
    try {
      // PUT request to api/seller/products.php
      const payload = {
        ...formData,
        seller_id: sellerId
      };
      
      const res = await api.put("/seller/products.php", payload);
      
      if (res.data?.status === "success") {
        Alert.alert("Success", "Harvest specifications updated in registry.");
        router.push("/(seller)/inventory");
      } else {
        Alert.alert("Error", res.data?.message || "Registry update failed.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "API request failed. Verify server and connection.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#020617] items-center justify-center">
        <ActivityIndicator color={primaryColor} size="large" />
        <Text className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-4 animate-pulse">
          Fetching Harvest Specs...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#020617]">
      {/* Top Navigation Back Header */}
      <View 
        className="h-14 flex-row items-center px-4 border-b bg-slate-950"
        style={{ borderColor: borderColor }}
      >
        <Pressable 
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 active:opacity-75"
        >
          <ChevronLeftIcon color={primaryColor} />
        </Pressable>
        <Text className="text-sm font-black uppercase text-white tracking-widest ml-3 italic">
          Modify Harvest Specs
        </Text>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* SECTION 01: IDENTITY */}
        <View 
          className="p-4 rounded-[24px] border mb-5 space-y-4"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          <View className="flex-row items-center space-x-2 border-b border-white/5 pb-3">
            <View className="w-6 h-6 rounded-full bg-[#7C3AED]/20 items-center justify-center">
              <Text className="text-[10px] font-black text-[#7C3AED]">01</Text>
            </View>
            <Text className="text-xs font-black uppercase text-white tracking-wider">
              Harvest Identity
            </Text>
          </View>

          <View className="space-y-3">
            <View>
              <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Harvest Name</Text>
              <TextInput
                placeholder="e.g. Surmai / Seer Fish"
                placeholderTextColor="rgba(255,255,255,0.3)"
                className="h-11 border rounded-xl bg-slate-900/50 px-3 text-xs font-bold text-white uppercase tracking-wider"
                style={{ borderColor: borderColor }}
                value={formData.name}
                onChangeText={(text) => setFormData((prev: any) => ({ ...prev, name: text }))}
              />
            </View>

            <View className="flex-row justify-between">
              <View className="w-[48%]">
                <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Price per kg (₹)</Text>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="numeric"
                  className="h-11 border rounded-xl bg-slate-900/50 px-3 text-xs font-bold text-white uppercase tracking-wider"
                  style={{ borderColor: borderColor }}
                  value={formData.price}
                  onChangeText={(text) => setFormData((prev: any) => ({ ...prev, price: text }))}
                />
              </View>
              <View className="w-[48%]">
                <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Stock Level (kg)</Text>
                <TextInput
                  placeholder="100"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="numeric"
                  className="h-11 border rounded-xl bg-slate-900/50 px-3 text-xs font-bold text-white uppercase tracking-wider"
                  style={{ borderColor: borderColor }}
                  value={formData.stock}
                  onChangeText={(text) => setFormData((prev: any) => ({ ...prev, stock: text }))}
                />
              </View>
            </View>

            <View>
              <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Category Registry</Text>
              <View className="border rounded-xl bg-slate-900/50 overflow-hidden" style={{ borderColor: borderColor }}>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, category: e.target.value }))}
                  className="w-full h-11 bg-transparent text-xs font-bold text-white uppercase tracking-widest px-3 outline-none"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </View>
            </View>

            <View>
              <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description</Text>
              <TextInput
                placeholder="Detail the quality, source, and freshness..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                multiline
                numberOfLines={4}
                className="border rounded-xl bg-slate-900/50 p-3 text-xs font-bold text-white uppercase tracking-wider h-20"
                style={{ borderColor: borderColor, textAlignVertical: "top" }}
                value={formData.description}
                onChangeText={(text) => setFormData((prev: any) => ({ ...prev, description: text }))}
              />
            </View>
          </View>
        </View>

        {/* SECTION 02: LIVE TELEMETRY */}
        <View 
          className="p-4 rounded-[24px] border mb-5 space-y-4"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          <View className="flex-row items-center space-x-2 border-b border-white/5 pb-3">
            <View className="w-6 h-6 rounded-full bg-[#7C3AED]/20 items-center justify-center">
              <Text className="text-[10px] font-black text-[#7C3AED]">02</Text>
            </View>
            <Text className="text-xs font-black uppercase text-white tracking-wider">
              Live Telemetry
            </Text>
          </View>

          <View className="space-y-3">
            <View>
              <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Harbor Node</Text>
              <View className="border rounded-xl bg-slate-900/50 overflow-hidden" style={{ borderColor: borderColor }}>
                <select
                  value={formData.harbor_node}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, harbor_node: e.target.value }))}
                  className="w-full h-11 bg-transparent text-xs font-bold text-white uppercase tracking-widest px-3 outline-none"
                >
                  {HARBORS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View className="w-[48%]">
                <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Catch Date</Text>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  className="h-11 border rounded-xl bg-slate-900/50 px-3 text-xs font-bold text-white uppercase tracking-wider"
                  style={{ borderColor: borderColor }}
                  value={formData.catch_date}
                  onChangeText={(text) => setFormData((prev: any) => ({ ...prev, catch_date: text }))}
                />
              </View>
              <View className="w-[48%]">
                <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Catch Time</Text>
                <TextInput
                  placeholder="HH:MM"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  className="h-11 border rounded-xl bg-slate-900/50 px-3 text-xs font-bold text-white uppercase tracking-wider"
                  style={{ borderColor: borderColor }}
                  value={formData.catch_time}
                  onChangeText={(text) => setFormData((prev: any) => ({ ...prev, catch_time: text }))}
                />
              </View>
            </View>

            <View>
              <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Catch Batch</Text>
              <View className="flex-row bg-slate-900/50 rounded-xl p-0.5 border" style={{ borderColor: borderColor }}>
                {["MORNING", "NOON", "NIGHT"].map((batch) => {
                  const active = formData.batch_label === batch;
                  return (
                    <Pressable
                      key={batch}
                      onPress={() => setFormData((prev: any) => ({ ...prev, batch_label: batch }))}
                      className={cn("flex-1 py-2.5 rounded-lg items-center", active && "bg-[#7C3AED]")}
                    >
                      <Text className="text-[7.5px] font-black text-white uppercase tracking-widest">{batch}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* SECTION 03: IMAGE REGISTRY */}
        <View 
          className="p-4 rounded-[24px] border mb-5 space-y-4"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          <View className="flex-row items-center space-x-2 border-b border-white/5 pb-3">
            <View className="w-6 h-6 rounded-full bg-[#7C3AED]/20 items-center justify-center">
              <Text className="text-[10px] font-black text-[#7C3AED]">03</Text>
            </View>
            <Text className="text-xs font-black uppercase text-white tracking-wider">
              Asset Imagery
            </Text>
          </View>

          {formData.image_url ? (
            <View className="relative w-full h-40 border border-white/10 rounded-xl overflow-hidden bg-slate-900">
              <Image 
                source={{ uri: resolveMediaUrl(formData.image_url) }} 
                className="w-full h-full"
                resizeMode="cover"
              />
              <Pressable 
                onPress={() => setFormData((prev: any) => ({ ...prev, image_url: "" }))}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 items-center justify-center border border-white/20 active:opacity-75"
              >
                <Text className="text-[10px] font-black text-white">✕</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={pickImage}
              className="w-full h-32 border border-dashed rounded-xl items-center justify-center bg-white/5 active:opacity-85"
              style={{ borderColor: borderColor }}
            >
              {isUploading ? (
                <ActivityIndicator color={primaryColor} />
              ) : (
                <>
                  <UploadIcon color={primaryColor} />
                  <Text className="text-[8px] font-black uppercase tracking-widest text-[#7C3AED] mt-2">
                    Pick Imagery Node
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        {/* SECTION 04: YIELD & CUT REGISTRY */}
        <View 
          className="p-4 rounded-[24px] border mb-5 space-y-4"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          <View className="flex-row items-center justify-between border-b border-white/5 pb-3">
            <View className="flex-row items-center space-x-2">
              <View className="w-6 h-6 rounded-full bg-[#7C3AED]/20 items-center justify-center">
                <Text className="text-[10px] font-black text-[#7C3AED]">04</Text>
              </View>
              <Text className="text-xs font-black uppercase text-white tracking-wider">
                Yield & Cut Options
              </Text>
            </View>

            <Pressable
              onPress={handleAddCut}
              className="flex-row items-center bg-white/5 border px-2.5 py-1.5 rounded-lg"
              style={{ borderColor: borderColor }}
            >
              <PlusIcon color={primaryColor} />
              <Text className="text-[7.5px] font-black uppercase tracking-wider text-white ml-1">Add Cut</Text>
            </Pressable>
          </View>

          {formData.cut_options.length === 0 ? (
            <Text className="text-[8px] font-black uppercase text-slate-500 tracking-widest text-center py-4">No custom cut modifiers</Text>
          ) : (
            <View className="space-y-3">
              {formData.cut_options.map((cut: any, idx: number) => (
                <View 
                  key={idx} 
                  className="p-3 bg-white/5 border border-white/10 rounded-xl relative flex-row items-center justify-between"
                >
                  <View className="flex-1 space-y-2 pr-3">
                    <View className="border rounded-lg bg-slate-900/50 overflow-hidden" style={{ borderColor: borderColor }}>
                      <select
                        value={cut.cut_type}
                        onChange={(e) => {
                          const newCuts = [...formData.cut_options];
                          newCuts[idx].cut_type = e.target.value;
                          setFormData((prev: any) => ({ ...prev, cut_options: newCuts }));
                        }}
                        className="w-full h-8 bg-transparent text-[10px] font-bold text-white uppercase tracking-widest px-2 outline-none"
                      >
                        {CUT_TYPES.map(ct => <option key={ct.id} value={ct.id}>{ct.label}</option>)}
                      </select>
                    </View>

                    <View className="flex-row space-x-2">
                      <View className="flex-1 relative">
                        <TextInput
                          placeholder="Price modifier %"
                          placeholderTextColor="rgba(255,255,255,0.2)"
                          keyboardType="numeric"
                          className="h-8 border rounded-lg bg-slate-900/50 px-2 text-[10px] font-bold text-white tracking-wider"
                          style={{ borderColor: borderColor }}
                          value={String(cut.price_modifier_percent)}
                          onChangeText={(text) => {
                            const newCuts = [...formData.cut_options];
                            newCuts[idx].price_modifier_percent = Number(text) || 0;
                            setFormData((prev: any) => ({ ...prev, cut_options: newCuts }));
                          }}
                        />
                        <Text className="absolute right-2 top-2 text-[8px] font-black text-slate-500">%</Text>
                      </View>

                      <View className="flex-1 relative">
                        <TextInput
                          placeholder="Flat add (₹)"
                          placeholderTextColor="rgba(255,255,255,0.2)"
                          keyboardType="numeric"
                          className="h-8 border rounded-lg bg-slate-900/50 px-2 text-[10px] font-bold text-white tracking-wider"
                          style={{ borderColor: borderColor }}
                          value={String(cut.price_flat_add)}
                          onChangeText={(text) => {
                            const newCuts = [...formData.cut_options];
                            newCuts[idx].price_flat_add = Number(text) || 0;
                            setFormData((prev: any) => ({ ...prev, cut_options: newCuts }));
                          }}
                        />
                        <Text className="absolute right-2 top-2 text-[8px] font-black text-slate-500">₹</Text>
                      </View>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => handleRemoveCut(idx)}
                    className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 items-center justify-center active:bg-rose-500/20"
                  >
                    <TrashIcon color="#EF4444" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* SECTION 05: QUALITY & NUTRITION */}
        <View 
          className="p-4 rounded-[24px] border mb-6 space-y-4"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          <View className="flex-row items-center space-x-2 border-b border-white/5 pb-3">
            <View className="w-6 h-6 rounded-full bg-[#7C3AED]/20 items-center justify-center">
              <Text className="text-[10px] font-black text-[#7C3AED]">05</Text>
            </View>
            <Text className="text-xs font-black uppercase text-white tracking-wider">
              Governance & Quality
            </Text>
          </View>

          <View className="space-y-3">
            <View>
              <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Rank registry</Text>
              <View className="flex-row bg-slate-900/50 rounded-xl p-0.5 border" style={{ borderColor: borderColor }}>
                {["VERIFIED", "ELITE"].map((rank) => {
                  const active = formData.quality_rank === rank;
                  return (
                    <Pressable
                      key={rank}
                      onPress={() => setFormData((prev: any) => ({ ...prev, quality_rank: rank }))}
                      className={cn("flex-1 py-2.5 rounded-lg items-center", active && "bg-[#7C3AED]")}
                    >
                      <Text className="text-[7.5px] font-black text-white uppercase tracking-widest">{rank}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="border-t border-white/5 pt-3">
              <Text className="text-[9px] font-black text-white uppercase tracking-wider mb-2">Nutrition Indicators</Text>
              
              <View className="flex-row justify-between mb-2">
                <View className="w-[48%]">
                  <Text className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Protein</Text>
                  <TextInput
                    className="h-8 border rounded-lg bg-slate-900/50 px-2 text-[10px] font-bold text-white"
                    style={{ borderColor: borderColor }}
                    value={formData.nutrition.protein}
                    onChangeText={(text) => setFormData((prev: any) => ({ ...prev, nutrition: { ...prev.nutrition, protein: text } }))}
                  />
                </View>
                <View className="w-[48%]">
                  <Text className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Omega-3</Text>
                  <TextInput
                    className="h-8 border rounded-lg bg-slate-900/50 px-2 text-[10px] font-bold text-white"
                    style={{ borderColor: borderColor }}
                    value={formData.nutrition.omega3}
                    onChangeText={(text) => setFormData((prev: any) => ({ ...prev, nutrition: { ...prev.nutrition, omega3: text } }))}
                  />
                </View>
              </View>

              <View className="flex-row justify-between">
                <View className="w-[48%]">
                  <Text className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Calories</Text>
                  <TextInput
                    className="h-8 border rounded-lg bg-slate-900/50 px-2 text-[10px] font-bold text-white"
                    style={{ borderColor: borderColor }}
                    value={formData.nutrition.calories}
                    onChangeText={(text) => setFormData((prev: any) => ({ ...prev, nutrition: { ...prev.nutrition, calories: text } }))}
                  />
                </View>
                <View className="w-[48%]">
                  <Text className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Fat</Text>
                  <TextInput
                    className="h-8 border rounded-lg bg-slate-900/50 px-2 text-[10px] font-bold text-white"
                    style={{ borderColor: borderColor }}
                    value={formData.nutrition.fat}
                    onChangeText={(text) => setFormData((prev: any) => ({ ...prev, nutrition: { ...prev.nutrition, fat: text } }))}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* SUBMIT BUTTON */}
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          className="w-full h-12 rounded-xl bg-[#7C3AED] items-center justify-center active:opacity-90 flex-row"
          style={{
            shadowColor: primaryColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 6
          }}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-xs font-black text-white uppercase tracking-widest">
              Update Harvest specs
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
