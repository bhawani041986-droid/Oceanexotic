import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, Modal } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

function RupeeIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </Svg>
  );
}

function ClockIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Path d="M12 6v6l4 2" />
    </Svg>
  );
}

function TrendingIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="m23 6-9.5 9.5-5-5L1 18" />
      <Path d="M17 6h6v6" />
    </Svg>
  );
}

function ShieldIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 6L9 17l-5-5" />
    </Svg>
  );
}

export default function SellerWithdrawalsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const primaryColor = "#7C3AED";
  const borderColor = "rgba(124, 58, 237, 0.25)";
  const bgCard = "rgba(15, 23, 42, 0.6)";

  const sellerId = user?.id ? (user.id.startsWith("SEL-") ? user.id : `SEL-${user.id}`) : 'SEL-001';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [bankNode, setBankNode] = useState("Maritime Bank Alpha (....8821)");
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const bankOptions = [
    "Maritime Bank Alpha (....8821)",
    "Global Trade Node (....4240)"
  ];

  const fetchData = async () => {
    try {
      const [wRes, sRes] = await Promise.all([
        api.get(`/seller/get_withdrawals.php`, { params: { seller_id: sellerId, t: Date.now() } }),
        api.get(`/seller/get_stats.php`, { params: { seller_id: sellerId, t: Date.now() } })
      ]);
      if (Array.isArray(wRes.data)) setWithdrawals(wRes.data);
      if (Array.isArray(sRes.data)) setStats(sRes.data);
    } catch (err) {
      console.error("Telemetry fetch failure:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid transfer amount.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/seller/create_withdrawal.php`, {
        seller_id: sellerId,
        amount: Number(amount),
        bank_node: bankNode
      });
      
      if (res.status === 200 || res.status === 201) {
        Alert.alert("Success", "Settlement directive committed successfully.");
        setAmount("");
        fetchData();
      } else {
        Alert.alert("Error", "Failed to commit settlement.");
      }
    } catch (err) {
      console.error("Settlement interruption:", err);
      Alert.alert("Error", "Settlement registry handshake timed out.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sellerId]);

  return (
    <View className="flex-1 bg-[#020617]">
      {/* Header */}
      <View 
        className="h-16 flex-row items-center px-4 border-b bg-slate-950"
        style={{ borderColor: borderColor }}
      >
        <Pressable 
          onPress={() => router.back()} 
          className="p-2 mr-2 rounded-full bg-white/5 border border-white/5 active:scale-95"
        >
          <BackIcon color="white" />
        </Pressable>
        <View>
          <Text className="text-xs font-black uppercase text-white tracking-widest italic">
            Settlement Command
          </Text>
          <Text className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">
            Liquidate Global Maritime Yields
          </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Yield Dynamics Stats */}
        <View className="flex-row flex-wrap justify-between gap-y-3 mb-5">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <View 
                key={i} 
                className="w-[48%] h-24 rounded-2xl bg-white/5 animate-pulse" 
              />
            ))
          ) : (
            stats.map((stat) => (
              <View 
                key={stat.label} 
                className="w-[48%] p-4 rounded-2xl border bg-slate-950/40"
                style={{ borderColor: borderColor }}
              >
                <View className="flex-row justify-between items-center mb-2">
                  <View className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 items-center justify-center">
                    {stat.icon_type === 'rupee' && <RupeeIcon color="#7C3AED" />}
                    {stat.icon_type === 'clock' && <ClockIcon color="#EAB308" />}
                    {stat.icon_type === 'trending' && <TrendingIcon color="#22C55E" />}
                    {stat.icon_type === 'shield' && <ShieldIcon color="#7C3AED" />}
                  </View>
                  <View className="bg-white/5 px-1.5 py-0.5 rounded">
                    <Text className="text-[6px] font-black text-slate-400">{stat.trend}</Text>
                  </View>
                </View>
                <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  {stat.label}
                </Text>
                <Text className="text-base font-black text-white italic tracking-tight mt-1">
                  {stat.value}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Withdrawal Form */}
        <View 
          className="p-5 rounded-[24px] border mb-6"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          <Text className="text-xs font-black text-white uppercase tracking-tight italic mb-1">
            New Settlement Directive
          </Text>
          <Text className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest mb-4">
            Commission a new yield transfer
          </Text>

          <View className="space-y-4">
            <View>
              <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Transfer Amount
              </Text>
              <View className="relative justify-center">
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  keyboardType="numeric"
                  className="h-12 border rounded-xl bg-slate-950/80 px-3 pl-10 text-sm font-black text-white"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                />
                <View className="absolute left-3.5">
                  <RupeeIcon color="#7C3AED" />
                </View>
              </View>
            </View>

            <View>
              <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Destination Node
              </Text>
              <Pressable
                onPress={() => setIsPickerVisible(true)}
                className="h-12 border rounded-xl bg-slate-950/80 px-4 flex-row items-center justify-between"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}
              >
                <Text className="text-[10px] font-bold text-slate-300">
                  {bankNode}
                </Text>
                <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M6 9l6 6 6-6" />
                </Svg>
              </Pressable>
            </View>

            <Pressable
              onPress={handleWithdraw}
              disabled={submitting}
              className="w-full h-12 bg-[#7C3AED] active:bg-[#6D28D9] rounded-xl items-center justify-center flex-row gap-2 mt-2 shadow-lg"
              style={{ shadowColor: primaryColor, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 }}
            >
              {submitting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Text className="text-[10px] font-black text-white uppercase tracking-widest italic">
                    Commit Withdrawal
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {/* Ledger logs */}
        <View className="space-y-3">
          <Text className="text-xs font-black text-white uppercase tracking-tight italic ml-1">
            Settlement Ledger
          </Text>

          {withdrawals.length === 0 && !loading && (
            <View className="py-12 items-center justify-center opacity-30 border border-white/5 rounded-2xl bg-slate-900/20">
              <Text className="text-[10px] font-bold text-white uppercase tracking-widest italic">
                No directives found in ledger
              </Text>
            </View>
          )}

          {withdrawals.map((wth) => (
            <View 
              key={wth.id}
              className="p-4 rounded-2xl border"
              style={{ backgroundColor: bgCard, borderColor: borderColor }}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Directive ID</Text>
                  <Text className="text-xs font-black text-white mt-0.5 uppercase">{wth.id}</Text>
                </View>
                <View className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  <Text className="text-[7.5px] font-black text-emerald-500 uppercase">{wth.status}</Text>
                </View>
              </View>

              <View className="flex-row justify-between bg-white/5 p-2 rounded-lg border border-white/5">
                <View>
                  <Text className="text-[7px] font-black text-slate-500 uppercase">Execution</Text>
                  <Text className="text-[9px] font-bold text-slate-300">{wth.date}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-[7px] font-black text-slate-500 uppercase">Amount</Text>
                  <Text className="text-[9px] font-black text-[#7C3AED]">{wth.amount}</Text>
                </View>
              </View>

              <Text className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest mt-2 ml-1 italic">
                Recipient: {wth.node}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Destination Picker Modal */}
      <Modal
        visible={isPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <Pressable 
          onPress={() => setIsPickerVisible(false)} 
          className="flex-1 bg-black/70 justify-center p-6"
        >
          <View className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
            <Text className="text-xs font-black text-white uppercase tracking-widest mb-2 italic">
              Select Destination Node
            </Text>
            {bankOptions.map((opt) => (
              <Pressable
                key={opt}
                onPress={() => {
                  setBankNode(opt);
                  setIsPickerVisible(false);
                }}
                className="p-3.5 rounded-xl border border-white/5 bg-slate-900/50 flex-row justify-between items-center active:bg-slate-900"
              >
                <Text className="text-[10px] font-bold text-white">{opt}</Text>
                {bankNode === opt && <CheckIcon color="#7C3AED" />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
