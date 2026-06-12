import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
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

function ThermometerIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </Svg>
  );
}

function MapIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z" />
      <Path d="M9 4v13" />
      <Path d="M15 7v13" />
    </Svg>
  );
}

export default function SellerShippingScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const primaryColor = "#7C3AED";
  const borderColor = "rgba(124, 58, 237, 0.25)";
  const bgCard = "rgba(15, 23, 42, 0.6)";

  const sellerId = user?.id ? (user.id.startsWith("SEL-") ? user.id : `SEL-${user.id}`) : 'SEL-001';

  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState<any[]>([]);
  const [filter, setFilter] = useState("ACTIVE"); // ACTIVE, DELIVERED, ALL

  const fetchShipments = async () => {
    try {
      const res = await api.get(`/seller/orders`, {
        params: { seller_id: sellerId, t: Date.now() }
      });
      if (Array.isArray(res.data)) {
        // Map and include simulated temperature telemetry matching active state
        const mapped = res.data.map((o: any) => {
          let temp = -18.0;
          if (o.status === "DELIVERED") temp = 4.2;
          else if (o.status === "PREPARING" || o.status === "PLACED") temp = -2.0;
          return {
            ...o,
            temp
          };
        });
        setShipments(mapped);
      }
    } catch (err) {
      console.error("Shipping logs retrieval failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [sellerId]);

  const filteredShipments = shipments.filter((s) => {
    if (filter === "ACTIVE") {
      return s.status === "SHIPPED" || s.status === "IN_TRANSIT" || s.status === "PREPARING" || s.status === "PROCESSING";
    }
    if (filter === "DELIVERED") {
      return s.status === "DELIVERED";
    }
    return true;
  });

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
            Logistics Shipping Registry
          </Text>
          <Text className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">
            Fulfillment and Vessel Dispatch Matrix
          </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Filter Strip */}
        <View className="flex-row bg-slate-950/50 rounded-xl p-0.5 border mb-5" style={{ borderColor: borderColor }}>
          {[
            { id: "ACTIVE", label: "ACTIVE SHIPMENTS" },
            { id: "DELIVERED", label: "DELIVERED" },
            { id: "ALL", label: "ALL LEDGERS" }
          ].map((btn) => {
            const active = filter === btn.id;
            return (
              <Pressable
                key={btn.id}
                onPress={() => setFilter(btn.id)}
                className={`flex-1 py-2.5 rounded-lg items-center ${active ? "bg-[#7C3AED]" : ""}`}
              >
                <Text className="text-[7.5px] font-black text-white uppercase tracking-widest">{btn.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Shipments List */}
        <View className="space-y-4">
          {loading ? (
            <ActivityIndicator color={primaryColor} className="py-12" />
          ) : filteredShipments.length === 0 ? (
            <View className="py-16 items-center justify-center opacity-30 border border-white/5 rounded-2xl bg-slate-900/20">
              <Text className="text-[10px] font-bold text-white uppercase tracking-widest italic">
                No shipping manifests found in directory
              </Text>
            </View>
          ) : (
            filteredShipments.map((ship) => {
              const isShipped = ship.status === "SHIPPED" || ship.status === "IN_TRANSIT";
              const isDelivered = ship.status === "DELIVERED";
              return (
                <View 
                  key={ship.id}
                  className="p-5 rounded-[24px] border"
                  style={{ backgroundColor: bgCard, borderColor: borderColor }}
                >
                  <View className="flex-row justify-between items-start mb-4 border-b border-white/5 pb-3">
                    <View>
                      <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">
                        {ship.shipping_method || "STANDARD DELIVERY"}
                      </Text>
                      <Text className="text-base font-black text-white italic mt-0.5">{ship.id}</Text>
                    </View>
                    <View 
                      className={`px-2.5 py-0.5 rounded border ${
                        isDelivered 
                          ? "bg-emerald-500/10 border-emerald-500/20" 
                          : isShipped 
                          ? "bg-[#7C3AED]/10 border-[#7C3AED]/20" 
                          : "bg-slate-500/10 border-slate-500/20"
                      }`}
                    >
                      <Text className={`text-[7.5px] font-black uppercase ${
                        isDelivered 
                          ? "text-emerald-500" 
                          : isShipped 
                          ? "text-[#7C3AED]" 
                          : "text-slate-400"
                      }`}>
                        {ship.status}
                      </Text>
                    </View>
                  </View>

                  <View className="space-y-3">
                    {/* Destination Address */}
                    <View>
                      <Text className="text-[7px] font-black text-slate-500 uppercase tracking-widest">
                        DELIVERY ENDPOINT NODE
                      </Text>
                      <Text className="text-[10px] font-bold text-slate-300 mt-1">
                        {ship.delivery_address}
                      </Text>
                    </View>

                    {/* Cold Chain & Temperature info if shipped/delivered */}
                    {(isShipped || isDelivered) && (
                      <View className="flex-row justify-between gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                        <View>
                          <View className="flex-row items-center gap-1">
                            <ThermometerIcon color={primaryColor} />
                            <Text className="text-[7px] font-black text-slate-400 uppercase">COLD-CHAIN PULSE</Text>
                          </View>
                          <Text className="text-[11px] font-black text-white italic mt-1">
                            {ship.temp}°C
                          </Text>
                        </View>
                        <View className="items-end justify-center">
                          <Text className="text-[7px] font-black text-slate-500 uppercase">EST. LOGISTICS</Text>
                          <Text className="text-[10px] font-bold text-slate-300">
                            {ship.estimated_delivery || "18 MINS"}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Agent Details */}
                    {ship.delivery_agent_name && (
                      <View className="flex-row justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                        <View>
                          <Text className="text-[7px] font-black text-slate-500 uppercase">LOGISTICS AGENT</Text>
                          <Text className="text-[9px] font-bold text-slate-300 uppercase mt-0.5">
                            {ship.delivery_agent_name}
                          </Text>
                        </View>
                        {ship.delivery_agent_phone && (
                          <View className="items-end">
                            <Text className="text-[7px] font-black text-slate-500 uppercase">COMMS PORT</Text>
                            <Text className="text-[9px] font-bold text-slate-300 mt-0.5">
                              {ship.delivery_agent_phone}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Action tracker button */}
                    {isShipped && (
                      <Pressable
                        onPress={() => router.push({ pathname: "/(seller)/fleet" })}
                        className="h-10 border border-purple-500/20 bg-purple-500/5 active:bg-purple-500/10 rounded-xl items-center justify-center flex-row gap-1.5 mt-2"
                      >
                        <MapIcon color={primaryColor} />
                        <Text className="text-[8px] font-black text-white uppercase tracking-widest">
                          Track Live Vessel Telemetry
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
