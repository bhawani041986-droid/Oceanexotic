import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, Modal } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { useAuthStore } from "@/store/authStore";

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
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
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 6h18" />
      <Path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <Path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </Svg>
  );
}

function GiftIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 12v10H4V12" />
      <Path d="M2 7h20v5H2z" />
      <Path d="M12 22V7" />
      <Path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <Path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </Svg>
  );
}

export default function SellerPromotionsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const primaryColor = "#7C3AED";
  const borderColor = "rgba(124, 58, 237, 0.25)";
  const bgCard = "rgba(15, 23, 42, 0.6)";

  const [promotions, setPromotions] = useState([
    { id: "PRM-4421", title: "Midnight Harvest Sale", code: "MIDNIGHT15", discount: "15%", usage: "124/500", status: "ACTIVE", end: "24h left" },
    { id: "PRM-4422", title: "Oceanic Bundle", code: "FLEET25", discount: "25%", usage: "42/100", status: "SCHEDULED", end: "Starts 2d" },
    { id: "PRM-4423", title: "Saku Special", code: "SAKU10", discount: "10%", usage: "500/500", status: "EXPIRED", end: "Ended" },
  ]);

  // Modal Setup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [limit, setLimit] = useState("");

  const handleCreatePromotion = () => {
    if (!title.trim() || !code.trim() || !discount.trim()) {
      Alert.alert("Input Error", "Please fill in all mandatory fields.");
      return;
    }

    const newPromo = {
      id: `PRM-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      code: code.toUpperCase(),
      discount: discount.includes("%") ? discount : `${discount}%`,
      usage: `0/${limit || "100"}`,
      status: "ACTIVE",
      end: "Active"
    };

    setPromotions([newPromo, ...promotions]);
    setIsModalOpen(false);
    
    // Reset Form
    setTitle("");
    setCode("");
    setDiscount("");
    setLimit("");
    Alert.alert("Success", "Incentive Coupon successfully commissioned.");
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Confirm Decommission",
      "Confirm decommissioning of this trade incentive.",
      [
        { text: "Cancel" },
        { 
          text: "Decommission", 
          onPress: () => {
            setPromotions(promotions.filter(p => p.id !== id));
          } 
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#020617]">
      {/* Header */}
      <View 
        className="h-16 flex-row items-center px-4 border-b bg-slate-950 justify-between"
        style={{ borderColor: borderColor }}
      >
        <View className="flex-row items-center">
          <Pressable 
            onPress={() => router.back()} 
            className="p-2 mr-2 rounded-full bg-white/5 border border-white/5 active:scale-95"
          >
            <BackIcon color="white" />
          </Pressable>
          <View>
            <Text className="text-xs font-black uppercase text-white tracking-widest italic">
              Incentive Command
            </Text>
            <Text className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">
              Commission Global Trade Discounts
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setIsModalOpen(true)}
          className="h-9 px-3 bg-[#7C3AED] active:bg-[#6D28D9] rounded-xl flex-row items-center gap-1.5"
        >
          <PlusIcon color="white" />
          <Text className="text-[9px] font-black text-white uppercase tracking-widest italic">
            Incentive
          </Text>
        </Pressable>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Pulse Stats Strip */}
        <View className="flex-row justify-between mb-5 gap-3">
          {[
            { label: "Active Nodes", value: String(promotions.filter(p => p.status === "ACTIVE").length), change: "Coupons" },
            { label: "Trade Yield", value: "₹4.2L", change: "Incentive Sales" },
            { label: "Fleet Reach", value: "842", change: "Unique Buyers" }
          ].map((item, idx) => (
            <View 
              key={idx} 
              className="flex-1 p-4 rounded-2xl border bg-slate-950/40 relative overflow-hidden"
              style={{ borderColor: borderColor }}
            >
              <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none">
                {item.label}
              </Text>
              <Text className="text-xl font-black text-white italic mt-1.5 tracking-tight">
                {item.value}
              </Text>
              <Text className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-1">
                {item.change}
              </Text>
            </View>
          ))}
        </View>

        {/* Incentive registry */}
        <View className="space-y-4">
          <Text className="text-xs font-black text-white uppercase tracking-tight italic ml-1">
            Incentive Registry Directory
          </Text>

          {promotions.map((promo) => {
            const isActive = promo.status === "ACTIVE";
            const isScheduled = promo.status === "SCHEDULED";
            return (
              <View 
                key={promo.id}
                className="p-5 rounded-[24px] border"
                style={{ backgroundColor: bgCard, borderColor: borderColor }}
              >
                <View className="flex-row justify-between items-start mb-4 border-b border-white/5 pb-3">
                  <View>
                    <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">
                      Incentive Identity • {promo.id}
                    </Text>
                    <Text className="text-sm font-black text-white uppercase italic mt-0.5">
                      {promo.title}
                    </Text>
                  </View>
                  <View 
                    className={`px-2 py-0.5 rounded border ${
                      isActive 
                        ? "bg-emerald-500/10 border-emerald-500/20" 
                        : isScheduled 
                        ? "bg-yellow-500/10 border-yellow-500/20" 
                        : "bg-slate-500/10 border-slate-500/20"
                    }`}
                  >
                    <Text className={`text-[7.5px] font-black uppercase ${
                      isActive 
                        ? "text-emerald-500" 
                        : isScheduled 
                        ? "text-yellow-500" 
                        : "text-slate-400"
                    }`}>
                      {promo.status}
                    </Text>
                  </View>
                </View>

                {/* Values strip */}
                <View className="flex-row justify-between gap-3 mb-4">
                  <View className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5 items-center justify-center">
                    <Text className="text-[7px] font-black text-slate-500 uppercase">SIGNAL CODE</Text>
                    <Text className="text-xs font-black text-[#7C3AED] tracking-widest mt-1">
                      {promo.code}
                    </Text>
                  </View>

                  <View className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5 items-center justify-center">
                    <Text className="text-[7px] font-black text-slate-500 uppercase">YIELD RATIO</Text>
                    <Text className="text-xs font-black text-white mt-1">
                      {promo.discount}
                    </Text>
                  </View>

                  <View className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5 items-center justify-center">
                    <Text className="text-[7px] font-black text-slate-500 uppercase">FLEET USAGE</Text>
                    <Text className="text-xs font-bold text-slate-300 mt-1">
                      {promo.usage}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest">
                    {promo.end}
                  </Text>
                  
                  <Pressable
                    onPress={() => handleDelete(promo.id)}
                    className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 items-center justify-center active:bg-rose-500/20"
                  >
                    <TrashIcon color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Commission Incentive Modal */}
      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-slate-950 border-t border-slate-800 rounded-t-[32px] p-6 space-y-4 max-h-[85%]">
            <View className="flex-row justify-between items-center border-b border-white/5 pb-3">
              <Text className="text-xs font-black text-white uppercase tracking-widest italic">
                Commission Incentive Directive
              </Text>
              <Pressable 
                onPress={() => {
                  setIsModalOpen(false);
                  setTitle("");
                  setCode("");
                  setDiscount("");
                  setLimit("");
                }} 
                className="p-2 bg-white/5 rounded-full"
              >
                <Text className="text-[10px] font-black text-white">✕</Text>
              </Pressable>
            </View>

            <ScrollView className="space-y-4">
              <View>
                <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Incentive Title
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Midnight Catch Special"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  className="h-11 border rounded-xl bg-slate-900/50 px-3 text-xs font-bold text-white uppercase tracking-wider"
                  style={{ borderColor: borderColor }}
                />
              </View>

              <View className="flex-row justify-between">
                <View className="w-[48%]">
                  <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Signal Code
                  </Text>
                  <TextInput
                    value={code}
                    onChangeText={setCode}
                    placeholder="e.g. MIDNIGHT15"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    autoCapitalize="characters"
                    className="h-11 border rounded-xl bg-slate-900/50 px-3 text-xs font-bold text-white tracking-wider"
                    style={{ borderColor: borderColor }}
                  />
                </View>

                <View className="w-[48%]">
                  <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Discount Modifier (%)
                  </Text>
                  <TextInput
                    value={discount}
                    onChangeText={setDiscount}
                    placeholder="e.g. 15"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    keyboardType="numeric"
                    className="h-11 border rounded-xl bg-slate-900/50 px-3 text-xs font-bold text-white tracking-wider"
                    style={{ borderColor: borderColor }}
                  />
                </View>
              </View>

              <View>
                <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Usage Limit Capacity
                </Text>
                <TextInput
                  value={limit}
                  onChangeText={setLimit}
                  placeholder="e.g. 100"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  keyboardType="numeric"
                  className="h-11 border rounded-xl bg-slate-900/50 px-3 text-xs font-bold text-white tracking-wider"
                  style={{ borderColor: borderColor }}
                />
              </View>

              <Pressable
                onPress={handleCreatePromotion}
                className="w-full h-12 bg-[#7C3AED] active:bg-[#6D28D9] rounded-xl items-center justify-center mt-2 shadow-lg flex-row"
                style={{ shadowColor: primaryColor, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 }}
              >
                <Text className="text-[10px] font-black text-white uppercase tracking-widest italic">
                  Commission Incentive
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
