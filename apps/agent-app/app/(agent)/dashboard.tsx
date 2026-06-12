import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, RefreshControl, Pressable, ActivityIndicator, Linking } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { useAuthStore } from "@/store/authStore";
import { useAgentStore, MOODS } from "@/store/agentStore";
import { FULL_API_URL } from "@/config/api";
import axios from "axios";
import { cn } from "@/lib/utils";

// Custom UI Icons matching Lucide
function TruckIcon({ color }: { color: string }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M10 17h4V5H2v12h3" />
      <Path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" />
      <Circle cx="7.5" cy="17.5" r="2.5" />
      <Circle cx="16.5" cy="17.5" r="2.5" />
    </Svg>
  );
}

function NavigationIcon({ color }: { color: string }) {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 11l19-9-9 19-2-8-8-2z" />
    </Svg>
  );
}

function ShieldCheckIcon({ color }: { color: string }) {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <Path d="m9 11 2 2 4-4" />
    </Svg>
  );
}

function SignalIcon({ color }: { color: string }) {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 20V4" />
    </Svg>
  );
}

function MapPinIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <Circle cx="12" cy="10" r="3" />
    </Svg>
  );
}

function ZapIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </Svg>
  );
}

function MapIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 6l6-3 8 3 4-3v15l-4 3-8-3-6 3V6z" />
      <Path d="M9 3v15M17 6v15" />
    </Svg>
  );
}

export default function AgentDashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const currentMood = useAgentStore((s) => s.currentMood);
  const mood = MOODS[currentMood];
  const isLight = currentMood === "DAYLIGHT";

  const [missions, setMissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const fetchMissions = async () => {
    if (!user) return;
    try {
      setSyncError(null);
      // Pass the agent's name to fetch assignments
      const url = `${FULL_API_URL}/agent/orders?agent_id=${encodeURIComponent(user.name)}`;
      const res = await axios.get(url);
      
      if (Array.isArray(res.data)) {
        // Filter out completed DELIVERED orders
        const active = res.data.filter((m: any) => m.status !== "DELIVERED" && m.status !== "CANCELLED");
        setMissions(active);
      } else {
        setMissions([]);
      }
    } catch (err) {
      console.error(err);
      setSyncError("Mission Control Sync Failed. Check network registry.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMissions();
  };

  const handleNavigate = (destination: string) => {
    const formattedAddress = encodeURIComponent(destination);
    const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${formattedAddress}&travelmode=driving`;
    Linking.openURL(mapUrl).catch(() => {
      alert("Could not open navigation map app.");
    });
  };

  const stats = [
    { 
      label: "Active Missions", 
      value: missions.length.toString(), 
      icon: <NavigationIcon color={mood.primary} /> 
    },
    { 
      label: "Fleet Readiness", 
      value: "OPTIMAL", 
      icon: <ShieldCheckIcon color="#10B981" /> 
    },
    { 
      label: "Signal Strength", 
      value: "100%", 
      icon: <SignalIcon color={mood.primary} /> 
    },
  ];

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: mood.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={mood.primary} />
      }
    >
      {/* Operator Title Badge */}
      <View className="mb-6 flex-row items-center justify-between">
        <View className="space-y-1">
          <Text 
            className="text-2xl font-black italic tracking-tighter uppercase"
            style={{ color: mood.text }}
          >
            Fleet Agent Hub
          </Text>
          <Text className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-500">
            Operator: {user?.name || "INS-AGENT"} • SEA-COMMAND ACTIVE
          </Text>
        </View>

        <View 
          className="flex-row items-center p-3 rounded-2xl border"
          style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: mood.border }}
        >
          <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
          <Text className="text-[8px] font-black uppercase tracking-wider" style={{ color: mood.text }}>
            Registry Live
          </Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="flex-row justify-between mb-8 space-x-2">
        {stats.map((stat, i) => (
          <View
            key={i}
            className="flex-1 p-4 rounded-2xl border items-center space-y-2"
            style={{
              backgroundColor: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.03)",
              borderColor: mood.border,
            }}
          >
            {stat.icon}
            <Text className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest text-center">
              {stat.label}
            </Text>
            <Text
              className="text-base font-black italic tracking-tighter text-center"
              style={{ color: mood.text }}
            >
              {stat.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Mission Queue Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center space-x-2">
          <TruckIcon color={mood.primary} />
          <Text className="text-sm font-black uppercase italic tracking-tight" style={{ color: mood.text }}>
            Active Mission Queue
          </Text>
        </View>
        <View 
          className="px-2.5 py-1 rounded-full border"
          style={{ backgroundColor: isLight ? "#E2E8F0" : "rgba(255,255,255,0.05)", borderColor: mood.border }}
        >
          <Text className="text-[7.5px] font-black uppercase tracking-widest" style={{ color: mood.primary }}>
            {missions.length} ASSIGNMENTS
          </Text>
        </View>
      </View>

      {syncError && (
        <Text className="mb-4 text-center text-[10px] font-bold text-red-500 uppercase tracking-wider">
          ⚠️ {syncError}
        </Text>
      )}

      {/* Assignment List */}
      {isLoading ? (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator color={mood.primary} />
          <Text className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-4 animate-pulse">
            Synchronizing with Registry...
          </Text>
        </View>
      ) : missions.length === 0 ? (
        <View 
          className="py-16 border border-dashed rounded-[24px] items-center justify-center space-y-4"
          style={{ borderColor: mood.border, backgroundColor: "rgba(255,255,255,0.01)" }}
        >
          <Text className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
            No Active Missions Assigned
          </Text>
        </View>
      ) : (
        <View className="space-y-4">
          {missions.map((mission) => (
            <View
              key={mission.id}
              className="p-5 rounded-[24px] border relative overflow-hidden"
              style={{
                backgroundColor: isLight ? "#F8FAFC" : "rgba(255, 255, 255, 0.03)",
                borderColor: mood.border,
              }}
            >
              <View className="flex-row justify-between items-start mb-4">
                <View className="space-y-1">
                  <View className="flex-row items-center space-x-2">
                    <Text className="text-lg font-black italic tracking-tighter" style={{ color: mood.text }}>
                      {mission.id}
                    </Text>
                    {mission.urgency === "HIGH" && (
                      <View className="bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30">
                        <Text className="text-[6.5px] font-black text-red-500 uppercase tracking-widest">
                          URGENT
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                    CONSIGNEE: {mission.customer}
                  </Text>
                </View>
                <Text className="text-[8px] font-black italic" style={{ color: mood.primary }}>
                  {mission.time}
                </Text>
              </View>

              {/* Destination address card */}
              <View 
                className="flex-row items-center space-x-3 p-3 rounded-xl border mb-5"
                style={{
                  backgroundColor: isLight ? "#E2E8F0" : "rgba(0, 0, 0, 0.2)",
                  borderColor: mood.border,
                }}
              >
                <MapPinIcon color={mood.primary} />
                <View className="flex-1 space-y-0.5">
                  <Text className="text-[6px] font-black text-slate-400 uppercase tracking-widest">
                    Destination Node
                  </Text>
                  <Text className="text-[9px] font-bold uppercase leading-tight" style={{ color: mood.text }}>
                    {mission.location}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-2">
                <Pressable
                  onPress={() => router.push({ pathname: "/(agent)/tracking", params: { order_id: mission.id } } as any)}
                  className="flex-1 h-10 rounded-xl flex-row items-center justify-center space-x-1.5"
                  style={{
                    backgroundColor: mood.primary,
                    shadowColor: mood.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 5,
                    elevation: 3,
                  }}
                >
                  <ZapIcon color="#FFFFFF" />
                  <Text className="text-[8.5px] font-black text-white uppercase tracking-widest">
                    START TRACKING
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleNavigate(mission.location)}
                  className="flex-1 h-10 rounded-xl border flex-row items-center justify-center space-x-1.5"
                  style={{
                    borderColor: isLight ? "#CBD5E1" : "rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <MapIcon color={mood.primary} />
                  <Text className="text-[8.5px] font-black uppercase tracking-widest" style={{ color: mood.text }}>
                    NAVIGATE
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
