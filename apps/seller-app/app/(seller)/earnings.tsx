import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle, Rect } from "react-native-svg";

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

function WalletIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 12V7H5a2 2 0 0 1 0-4h14V2" />
      <Path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <Path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
    </Svg>
  );
}

function TrendingIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="m23 6-9.5 9.5-5-5L1 18" />
      <Path d="M17 6h6v6" />
    </Svg>
  );
}

function BarChartIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Line x1="18" y1="20" x2="18" y2="10" />
      <Line x1="12" y1="20" x2="12" y2="4" />
      <Line x1="6" y1="20" x2="6" y2="14" />
    </Svg>
  );
}

// Simple Svg lines component helper since react-native-svg doesn't export Line by default under custom wrapper in some ts envs
function Line({ x1, y1, x2, y2 }: { x1: string; y1: string; x2: string; y2: string }) {
  return <Path d={`M${x1} ${y1} L${x2} ${y2}`} />;
}

const SETTLEMENT_HISTORY = [
  { id: "ST-8821", date: "May 08, 2026", amount: "₹1,42,050.00", status: "COMPLETED", method: "OceanWire" },
  { id: "ST-8815", date: "May 01, 2026", amount: "₹2,84,000.00", status: "COMPLETED", method: "OceanWire" },
  { id: "ST-8790", date: "April 24, 2026", amount: "₹98,020.00", status: "COMPLETED", method: "Direct Transfer" },
];

export default function SellerEarningsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const primaryColor = "#7C3AED";
  const borderColor = "rgba(124, 58, 237, 0.25)";
  const bgCard = "rgba(15, 23, 42, 0.6)";

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
              Financial Command
            </Text>
            <Text className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">
              Capital Systemty telemetry
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Balances Card */}
        <View 
          className="p-5 rounded-[24px] border mb-5 relative overflow-hidden"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          <View className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full -mr-10 -mt-10 blur-2xl" />
          <View className="space-y-4">
            <View>
              <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-[0.25em] italic">
                Capital Systemty
              </Text>
              <Text className="text-3xl font-black text-white italic tracking-tighter mt-1">
                ₹8,64,250.50
              </Text>
            </View>

            <View className="flex-row gap-3 pt-2">
              <Pressable
                onPress={() => router.push("/(seller)/withdrawals")}
                className="flex-1 h-12 bg-[#7C3AED] active:bg-[#6D28D9] rounded-xl items-center justify-center shadow-lg"
                style={{ shadowColor: primaryColor, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 }}
              >
                <Text className="text-[10px] font-black text-white uppercase tracking-widest italic">
                  Initiate Settlement
                </Text>
              </Pressable>
            </View>

            <View className="h-px bg-white/5 my-2" />

            <View className="flex-row justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
              <View>
                <Text className="text-[7px] font-black text-slate-400 uppercase tracking-widest italic">
                  Pending Payout
                </Text>
                <Text className="text-sm font-black text-[#7C3AED] mt-0.5">
                  ₹1,24,000.00
                </Text>
              </View>
              <Text className="text-[7px] font-black text-slate-500 uppercase tracking-widest italic">
                Auto-Transit: May 15
              </Text>
            </View>
          </View>
        </View>

        {/* Pulse Chart / Growth Card */}
        <View 
          className="p-5 rounded-[24px] border mb-5"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-xs font-black text-white uppercase tracking-tight italic">
                Earnings Pulse
              </Text>
              <Text className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                Monthly Growth Analysis
              </Text>
            </View>
            <View className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              <Text className="text-[8px] font-black text-emerald-500 italic">+24%</Text>
            </View>
          </View>

          {/* Simple simulated bar chart using Native Views */}
          <View className="h-16 flex-row items-end justify-between px-2 pt-2">
            {[30, 45, 25, 60, 40, 75, 55, 90, 65, 80].map((h, i) => (
              <View 
                key={i} 
                className="w-[7%] bg-[#7C3AED]/20 rounded-t-sm"
                style={{ 
                  height: `${h}%`,
                  backgroundColor: i === 7 ? primaryColor : "rgba(124, 58, 237, 0.25)" 
                }} 
              />
            ))}
          </View>

          <View className="flex-row justify-between mt-3 pt-3 border-t border-white/5">
            <View>
              <Text className="text-[7.5px] font-black text-slate-500 uppercase">Period Yield</Text>
              <Text className="text-base font-black text-white italic tracking-tight mt-0.5">₹12.45L</Text>
            </View>
            <View className="items-end">
              <Text className="text-[7.5px] font-black text-slate-500 uppercase">Prior</Text>
              <Text className="text-xs font-black text-slate-400 italic tracking-tight mt-0.5">₹10.04L</Text>
            </View>
          </View>
        </View>

        {/* Stats Matrix Grid */}
        <View className="flex-row flex-wrap justify-between mb-5 gap-y-3">
          {[
            { label: "Avg. Sale Value", value: "₹14,250", icon: <RupeeIcon color="#7C3AED" />, trend: "+4.2%" },
            { label: "Commissions", value: "842", icon: <BarChartIcon color="#7C3AED" />, trend: "+12%" },
            { label: "Fees Incurred", value: "₹42,050", icon: <WalletIcon color="#7C3AED" />, trend: "-2.1%" },
            { label: "Growth Index", value: "8.4", icon: <TrendingIcon color="#7C3AED" />, trend: "OPTIMAL" }
          ].map((item, index) => (
            <View 
              key={index} 
              className="w-[48%] p-4 rounded-2xl border bg-slate-950/40"
              style={{ borderColor: borderColor }}
            >
              <View className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 items-center justify-center mb-2">
                {item.icon}
              </View>
              <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest italic opacity-70">
                {item.label}
              </Text>
              <Text className="text-base font-black text-white italic tracking-tight mt-0.5">
                {item.value}
              </Text>
              <Text className="text-[7px] font-black text-emerald-500 uppercase tracking-widest mt-1">
                {item.trend}
              </Text>
            </View>
          ))}
        </View>

        {/* History Settlement Ledger */}
        <View className="space-y-3">
          <View className="flex-row justify-between items-center px-1 mb-2">
            <View>
              <Text className="text-xs font-black text-white uppercase tracking-tight italic">
                Settlement Registry
              </Text>
              <Text className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                Global Financial Transfers
              </Text>
            </View>
          </View>

          {SETTLEMENT_HISTORY.map((settlement) => (
            <View 
              key={settlement.id} 
              className="p-4 rounded-2xl border"
              style={{ backgroundColor: bgCard, borderColor: borderColor }}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Settlement Node</Text>
                  <Text className="text-xs font-black text-white mt-0.5">{settlement.id}</Text>
                </View>
                <View className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  <Text className="text-[7.5px] font-black text-emerald-500 uppercase">{settlement.status}</Text>
                </View>
              </View>

              <View className="flex-row justify-between bg-white/5 p-2 rounded-lg border border-white/5">
                <View>
                  <Text className="text-[7px] font-black text-slate-500 uppercase">Execution</Text>
                  <Text className="text-[9px] font-bold text-slate-300">{settlement.date}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-[7px] font-black text-slate-500 uppercase">Net Yield</Text>
                  <Text className="text-[9px] font-black text-[#7C3AED]">{settlement.amount}</Text>
                </View>
              </View>

              <Text className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest mt-2 ml-1">
                via {settlement.method}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
