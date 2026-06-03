import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, RefreshControl, TextInput, Pressable, ActivityIndicator } from "react-native";
import Svg, { Path, Circle, Rect, Line } from "react-native-svg";
import { useAuthStore } from "@/store/authStore";
import { useAgentStore, MOODS } from "@/store/agentStore";
import { FULL_API_URL } from "@/config/api";
import axios from "axios";

// Custom UI Icons matching Lucide
function CalendarIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <Line x1="16" y1="2" x2="16" y2="6" />
      <Line x1="8" y1="2" x2="8" y2="6" />
      <Line x1="3" y1="10" x2="21" y2="10" />
    </Svg>
  );
}

function ShieldCheckIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <Path d="m9 11 2 2 4-4" />
    </Svg>
  );
}

function SearchIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="11" cy="11" r="8" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
}

function MapPinIcon({ color }: { color: string }) {
  return (
    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <Circle cx="12" cy="10" r="3" />
    </Svg>
  );
}

export default function AgentHistoryScreen() {
  const user = useAuthStore((s) => s.user);
  const currentMood = useAgentStore((s) => s.currentMood);
  const mood = MOODS[currentMood];
  const isLight = currentMood === "DAYLIGHT";

  const [allMissions, setAllMissions] = useState<any[]>([]);
  const [filteredMissions, setFilteredMissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [syncError, setSyncError] = useState<string | null>(null);

  const fetchMissions = async () => {
    if (!user) return;
    try {
      setSyncError(null);
      const url = `${FULL_API_URL}/agent/orders.php?agent_id=${encodeURIComponent(user.name)}`;
      const res = await axios.get(url);
      
      if (Array.isArray(res.data)) {
        // Filter only completed DELIVERED orders
        const completed = res.data.filter((m: any) => m.status === "DELIVERED");
        setAllMissions(completed);
        setFilteredMissions(completed);
      } else {
        setAllMissions([]);
        setFilteredMissions([]);
      }
    } catch (err) {
      console.error(err);
      setSyncError("History Registry Handshake Failed.");
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

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text) {
      setFilteredMissions(allMissions);
      return;
    }
    const cleanText = text.toLowerCase();
    const filtered = allMissions.filter(
      (m) =>
        m.id.toLowerCase().includes(cleanText) ||
        m.customer.toLowerCase().includes(cleanText) ||
        m.location.toLowerCase().includes(cleanText)
    );
    setFilteredMissions(filtered);
  };

  const totalCargoUnits = allMissions.reduce((acc, m) => {
    const itemsCount = Array.isArray(m.items) ? m.items.length : 1;
    return acc + itemsCount;
  }, 0);

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: mood.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={mood.primary} />
      }
    >
      {/* Title */}
      <View className="mb-6">
        <Text 
          className="text-2xl font-black italic tracking-tighter uppercase"
          style={{ color: mood.text }}
        >
          Mission Log Ledger
        </Text>
        <Text className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-500">
          Sovereign Operations History Archive
        </Text>
      </View>

      {/* Stats Board */}
      <View 
        className="p-5 rounded-[24px] border flex-row justify-between items-center mb-6"
        style={{
          backgroundColor: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.03)",
          borderColor: mood.border,
        }}
      >
        <View className="items-center flex-1">
          <Text className="text-[7px] font-black text-slate-400 uppercase tracking-widest text-center">
            MISSIONS COMPLETED
          </Text>
          <Text className="text-2xl font-black italic mt-1" style={{ color: mood.primary }}>
            {allMissions.length}
          </Text>
        </View>

        <View className="w-[1px] h-10 bg-white/5 mx-4" />

        <View className="items-center flex-1">
          <Text className="text-[7px] font-black text-slate-400 uppercase tracking-widest text-center">
            CARGO DELIVERED
          </Text>
          <Text className="text-2xl font-black italic mt-1" style={{ color: mood.text }}>
            {totalCargoUnits} UNITS
          </Text>
        </View>

        <View className="w-[1px] h-10 bg-white/5 mx-4" />

        <View className="items-center flex-1">
          <Text className="text-[7px] font-black text-slate-400 uppercase tracking-widest text-center">
            SAFETY INDEX
          </Text>
          <Text className="text-2xl font-black italic mt-1 text-emerald-500">
            100%
          </Text>
        </View>
      </View>

      {/* Search Input */}
      <View 
        className="flex-row items-center px-4 h-11 border rounded-2xl mb-6"
        style={{
          backgroundColor: isLight ? "#FFFFFF" : "rgba(0,0,0,0.2)",
          borderColor: mood.border
        }}
      >
        <SearchIcon color={isLight ? "#94A3B8" : "rgba(255,255,255,0.4)"} />
        <TextInput
          placeholder="SEARCH REGISTRY..."
          placeholderTextColor={isLight ? "#94A3B8" : "rgba(255,255,255,0.3)"}
          value={searchQuery}
          onChangeText={handleSearch}
          className="flex-1 ml-3 text-[10px] font-bold uppercase tracking-wider h-full"
          style={{ color: mood.text }}
        />
      </View>

      {syncError && (
        <Text className="mb-4 text-center text-[10px] font-bold text-red-500 uppercase tracking-wider">
          ⚠️ {syncError}
        </Text>
      )}

      {/* History List */}
      {isLoading ? (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator color={mood.primary} />
          <Text className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-4 animate-pulse">
            Loading Operation Ledger...
          </Text>
        </View>
      ) : filteredMissions.length === 0 ? (
        <View 
          className="py-16 border border-dashed rounded-[24px] items-center justify-center space-y-4"
          style={{ borderColor: mood.border, backgroundColor: "rgba(255,255,255,0.01)" }}
        >
          <Text className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
            {searchQuery ? "No matching records found" : "No completed missions in archive"}
          </Text>
        </View>
      ) : (
        <View className="space-y-4">
          {filteredMissions.map((mission) => (
            <View
              key={mission.id}
              className="p-5 rounded-[24px] border relative overflow-hidden"
              style={{
                backgroundColor: isLight ? "#F8FAFC" : "rgba(255, 255, 255, 0.03)",
                borderColor: mood.border,
              }}
            >
              {/* Card top */}
              <View className="flex-row justify-between items-start mb-4">
                <View className="space-y-1">
                  <Text className="text-lg font-black italic tracking-tighter" style={{ color: mood.text }}>
                    {mission.id}
                  </Text>
                  <Text className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                    CONSIGNEE: {mission.customer}
                  </Text>
                </View>

                {/* Delivered Badge */}
                <View 
                  className="flex-row items-center px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20"
                >
                  <ShieldCheckIcon color="#10B981" />
                  <Text className="text-[6.5px] font-black text-emerald-500 uppercase tracking-widest ml-1">
                    DELIVERED SECURE
                  </Text>
                </View>
              </View>

              {/* Delivery Node location details */}
              <View 
                className="flex-row items-center space-x-3 p-3 rounded-xl border mb-4"
                style={{
                  backgroundColor: isLight ? "#E2E8F0" : "rgba(0, 0, 0, 0.2)",
                  borderColor: mood.border,
                }}
              >
                <MapPinIcon color={mood.primary} />
                <View className="flex-1 space-y-0.5">
                  <Text className="text-[6px] font-black text-slate-400 uppercase tracking-widest">
                    Drop-off Node
                  </Text>
                  <Text className="text-[8.5px] font-bold uppercase leading-tight" style={{ color: mood.text }}>
                    {mission.location}
                  </Text>
                </View>
              </View>

              {/* Timestamp block */}
              <View className="flex-row justify-between items-center border-t border-white/5 pt-3">
                <View className="flex-row items-center space-x-2">
                  <CalendarIcon color={isLight ? "#94A3B8" : "rgba(255,255,255,0.4)"} />
                  <Text className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                    {new Date(mission.time).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' })}
                  </Text>
                </View>
                <Text className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                  Transit: {mission.agent_details.method || "STANDARD"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
