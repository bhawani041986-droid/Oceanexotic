import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, RefreshControl, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { useAuthStore } from "@/store/authStore";
import { FULL_API_URL } from "@/config/api";
import axios from "axios";
import { cn } from "@/lib/utils";

// Custom UI Icons matching Hardened HUD
function TrendingUpIcon({ color }: { color: string }) {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="m22 7-8.5 8.5-5-5L2 17" />
      <Path d="M16 7h6v6" />
    </Svg>
  );
}

function PackageIcon({ color }: { color: string }) {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <Path d="m3.3 7 8.7 5 8.7-5" />
      <Path d="M12 22V12" />
    </Svg>
  );
}

function UsersIcon({ color }: { color: string }) {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}

function ActivityIcon({ color }: { color: string }) {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </Svg>
  );
}

function ClockIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Path d="M12 6v6l4 2" />
    </Svg>
  );
}

function RefreshIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <Path d="M3 3v5h5" />
      <Path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <Path d="M16 16h5v5" />
    </Svg>
  );
}

export default function SellerDashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  
  const primaryColor = "#7C3AED"; // purple accent
  const borderColor = "rgba(124, 58, 237, 0.25)";
  const bgCard = "rgba(15, 23, 42, 0.6)";

  const [stats, setStats] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("monthly");

  const sellerId = user?.id ? (user.id.startsWith("SEL-") ? user.id : `SEL-${user.id}`) : 'SEL-001';

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Try to fetch stats and dynamic orders
      const statsUrl = `${FULL_API_URL}/orders/seller_stats`;
      const ordersUrl = `${FULL_API_URL}/seller/orders?seller_id=${encodeURIComponent(sellerId)}`;
      
      const [statsRes, ordersRes] = await Promise.all([
        axios.get(statsUrl).catch(() => null),
        axios.get(ordersUrl).catch(() => null)
      ]);

      let statsData = statsRes?.data;
      let ordersData = ordersRes?.data;

      // Map statistics
      const mappedStats = [
        {
          label: "Total Revenue",
          value: statsData?.revenue ? `₹${statsData.revenue.toLocaleString()}` : "₹42,650",
          growth: `+${statsData?.growth ?? 12.5}%`,
          icon: <TrendingUpIcon color={primaryColor} />,
          trend: "up"
        },
        {
          label: "Active Harvests",
          value: statsData?.activeProducts ? String(statsData.activeProducts) : "84",
          growth: `+${statsData?.newProducts ?? 4}`,
          icon: <PackageIcon color={primaryColor} />,
          trend: "up"
        },
        {
          label: "Global Reach",
          value: statsData?.customers ? statsData.customers.toLocaleString() : "1,240",
          growth: `+${statsData?.customerGrowth ?? 18}%`,
          icon: <UsersIcon color={primaryColor} />,
          trend: "up"
        },
        {
          label: "Fleet Perf.",
          value: statsData?.performance ? `${statsData.performance}%` : "98.2%",
          growth: statsData?.perfTrend ? `${statsData.perfTrend > 0 ? '+' : ''}${statsData.perfTrend}%` : "-0.4%",
          icon: <ActivityIcon color={primaryColor} />,
          trend: (statsData?.perfTrend ?? -0.4) >= 0 ? "up" : "down"
        }
      ];

      setStats(mappedStats);

      // Map orders
      if (Array.isArray(ordersData)) {
        setRecentOrders(ordersData.slice(0, 5));
      } else if (statsData?.recentOrders) {
        setRecentOrders(statsData.recentOrders);
      } else {
        setRecentOrders([]);
      }

    } catch (err) {
      console.error(err);
      setError("Dashboard telemetry disconnected.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const chartHeights = activeTab === "monthly" 
    ? [45, 60, 40, 75, 55, 90, 65, 80, 50, 70, 85, 100]
    : [25, 45, 75, 90, 60, 40, 85];
  const chartLabels = activeTab === "monthly"
    ? ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]
    : ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <ScrollView
      className="flex-1 bg-[#020617]"
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
      }
    >
      {/* Page Title Header */}
      <View className="mb-6 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-black italic uppercase tracking-tight text-white">
            Fleet Dashboard
          </Text>
          <Text className="text-[8px] font-black uppercase tracking-[0.2em] text-[#7C3AED]/70 mt-0.5">
            Command Center • ID: {sellerId}
          </Text>
        </View>

        <Pressable 
          onPress={onRefresh}
          className="h-8 w-8 items-center justify-center rounded-xl border bg-white/5 active:opacity-75"
          style={{ borderColor: borderColor }}
        >
          <RefreshIcon color={primaryColor} />
        </Pressable>
      </View>

      {/* Grid of stats */}
      <View className="flex-row flex-wrap justify-between mb-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <View 
              key={i} 
              className="w-[48%] p-3 rounded-2xl border bg-white/5 mb-3 items-center justify-center h-24"
              style={{ borderColor: borderColor }}
            >
              <ActivityIndicator color={primaryColor} />
            </View>
          ))
        ) : (
          stats.map((stat, i) => (
            <View
              key={i}
              className="w-[48%] p-3.5 rounded-2xl border mb-3 relative overflow-hidden"
              style={{
                backgroundColor: bgCard,
                borderColor: borderColor,
              }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                  {stat.icon}
                </View>
                <Text 
                  className={cn(
                    "text-[7px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-full",
                    stat.trend === "up" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                  )}
                >
                  {stat.growth}
                </Text>
              </View>
              <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none">
                {stat.label}
              </Text>
              <Text className="text-lg font-black text-white italic tracking-tighter mt-1 leading-none">
                {stat.value}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Revenue Dynamics Visualization */}
      <View 
        className="p-4 rounded-[24px] border mb-6"
        style={{ backgroundColor: bgCard, borderColor: borderColor }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-xs font-black uppercase text-white tracking-wider">
              Revenue Dynamics
            </Text>
            <Text className="text-[7px] font-black uppercase text-slate-500 tracking-widest mt-0.5">
              Global Settlement Analysis
            </Text>
          </View>
          
          <View className="flex-row bg-white/5 rounded-lg p-0.5 border border-white/10">
            <Pressable 
              onPress={() => setActiveTab("weekly")}
              className={cn("px-2.5 py-1 rounded-md", activeTab === "weekly" && "bg-[#7C3AED]")}
            >
              <Text className="text-[7px] font-black text-white uppercase tracking-wider">Weekly</Text>
            </Pressable>
            <Pressable 
              onPress={() => setActiveTab("monthly")}
              className={cn("px-2.5 py-1 rounded-md", activeTab === "monthly" && "bg-[#7C3AED]")}
            >
              <Text className="text-[7px] font-black text-white uppercase tracking-wider">Monthly</Text>
            </Pressable>
          </View>
        </View>

        {/* Custom Bar Chart */}
        <View className="h-32 flex-row items-end justify-between px-2 pt-4 relative">
          {chartHeights.map((h, idx) => (
            <View key={idx} className="flex-1 items-center justify-end h-full">
              <View 
                className="w-2.5 bg-[#7C3AED]/20 border border-[#7C3AED]/40 rounded-t-sm justify-end relative overflow-hidden" 
                style={{ height: `${h}%` }}
              >
                <View 
                  className="absolute bottom-0 left-0 right-0 bg-[#7C3AED] rounded-t-sm"
                  style={{ height: "60%" }}
                />
              </View>
              <Text className="text-[6.5px] font-black text-slate-500 uppercase mt-1">
                {chartLabels[idx]}
              </Text>
            </View>
          ))}
          
          {/* Grid Overlay lines (Absolute) */}
          <View className="absolute left-0 right-0 top-1/4 h-[0.5px] bg-white/5 pointer-events-none" />
          <View className="absolute left-0 right-0 top-2/4 h-[0.5px] bg-white/5 pointer-events-none" />
          <View className="absolute left-0 right-0 top-3/4 h-[0.5px] bg-white/5 pointer-events-none" />
        </View>
      </View>

      {/* Top Harvest Lines Performance */}
      <View 
        className="p-4 rounded-[24px] border mb-6"
        style={{ backgroundColor: bgCard, borderColor: borderColor }}
      >
        <Text className="text-xs font-black uppercase text-white tracking-wider mb-1">
          Top Harvest Lines
        </Text>
        <Text className="text-[7.5px] font-black uppercase text-slate-500 tracking-widest mb-4">
          Quantity Distributed by Class
        </Text>

        {[
          { name: "Andaman Mud Crab", sales: "1,240kg", share: 85, color: "#7C3AED" },
          { name: "Swaraj Dweep Reef Cod", sales: "840kg", share: 65, color: "#3B82F6" },
          { name: "Neil Island Squids", sales: "620kg", share: 45, color: "#10B981" },
          { name: "Port Blair Prawns", sales: "480kg", share: 30, color: "#F59E0B" }
        ].map((item, idx) => (
          <View key={idx} className="mb-3">
            <View className="flex-row justify-between items-end mb-1">
              <Text className="text-[10px] font-bold text-white uppercase tracking-tight">{item.name}</Text>
              <Text className="text-[7px] font-black text-slate-400 uppercase tracking-wider">{item.sales}</Text>
            </View>
            <View className="h-1.5 w-full bg-white/5 border border-white/10 rounded-full overflow-hidden">
              <View 
                className="h-full rounded-full" 
                style={{ 
                  width: `${item.share}%`, 
                  backgroundColor: item.color,
                  shadowColor: item.color,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 3
                }} 
              />
            </View>
          </View>
        ))}
      </View>

      {/* Recent Commissions */}
      <View className="space-y-3">
        <View className="flex-row items-center justify-between mb-1">
          <View>
            <Text className="text-sm font-black uppercase italic tracking-tight text-white">
              Recent Orders
            </Text>
            <Text className="text-[7.5px] font-black uppercase text-[#7C3AED]/70 tracking-widest mt-0.5">
              Active Registry Handshakes
            </Text>
          </View>
          <Pressable onPress={() => router.push("/(seller)/orders")}>
            <Text className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
              View All
            </Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View className="py-8 items-center justify-center">
            <ActivityIndicator color={primaryColor} />
          </View>
        ) : recentOrders.length === 0 ? (
          <View 
            className="py-12 border border-dashed rounded-[20px] items-center justify-center"
            style={{ borderColor: borderColor, backgroundColor: "rgba(255,255,255,0.01)" }}
          >
            <Text className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
              No Pending Fleet Logistics
            </Text>
          </View>
        ) : (
          recentOrders.map((order, idx) => (
            <View
              key={idx}
              className="p-4 rounded-[20px] border"
              style={{ backgroundColor: bgCard, borderColor: borderColor }}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-xs font-black text-white italic tracking-tighter">
                    {order.id}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <ClockIcon color="rgba(255,255,255,0.4)" />
                    <Text className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      {order.created_at || order.date || "Just now"}
                    </Text>
                  </View>
                </View>

                <View 
                  className={cn(
                    "px-2 py-0.5 rounded border text-[7px] font-black uppercase tracking-wider",
                    order.status === "DELIVERED" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                    order.status === "SHIPPED" && "bg-blue-500/10 border-blue-500/30 text-blue-400",
                    order.status === "PENDING" && "bg-rose-500/10 border-rose-500/30 text-rose-400",
                    order.status !== "DELIVERED" && order.status !== "SHIPPED" && order.status !== "PENDING" && "bg-slate-500/10 border-slate-500/30 text-slate-400"
                  )}
                >
                  <Text className="text-[7px] font-black">{order.status}</Text>
                </View>
              </View>

              <View className="py-2 border-y border-white/5 mb-3 flex-row justify-between items-center">
                <View>
                  <Text className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Consignee</Text>
                  <Text className="text-[10px] font-bold text-white mt-0.5">{order.customer_name || order.customer}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Total Settlement</Text>
                  <Text className="text-[10px] font-bold text-[#7C3AED] mt-0.5">
                    {typeof order.total_amount === 'number' ? `₹${order.total_amount.toLocaleString()}` : order.total || "₹0"}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => router.push({ pathname: "/(seller)/orders", params: { order_id: order.id } } as any)}
                className="w-full py-2.5 rounded-xl border border-[#7C3AED]/20 bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 items-center active:bg-[#7C3AED]/30"
              >
                <Text className="text-[8px] font-black uppercase tracking-widest text-[#7C3AED]">
                  {order.status === "PENDING" ? "Initialize Vessel Dispatch" : "Monitor Logistics"}
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
