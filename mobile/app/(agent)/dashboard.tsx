import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, RefreshControl, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useThemeColors } from "@/hooks/useThemeColors";
import { FULL_API_URL } from "@/config/api";
import { Truck, MapPin, Navigation, CheckCircle2, Zap } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function AgentDashboard() {
  const { user } = useAuthStore();
  const colors = useThemeColors();
  const router = useRouter();
  
  const [missions, setMissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMissions = async () => {
    setIsLoading(true);
    try {
      const agentId = user?.id?.replace("AGN-", "") || "7";
      const res = await fetch(`${FULL_API_URL}/agent/orders?agent_id=${agentId}`);
      if (res.ok) {
        const data = await res.json();
        const active = data.filter((m: any) => m.status !== 'DELIVERED');
        setMissions(active);
      }
    } catch (error) {
      console.error("Failed to fetch missions", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  return (
    <SafeAreaView edges={["top"]} className="flex-1" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <View className="px-5 pt-4 pb-6 border-b" style={{ borderBottomColor: colors.border }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-black italic uppercase tracking-tighter" style={{ color: colors.text }}>
              Fleet Agent Hub
            </Text>
            <Text className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>
              Operator: {user?.id || "AGENT-742"} • SEA-COMMAND ACTIVE
            </Text>
          </View>
          <View className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse border-2" style={{ borderColor: colors.bg }} />
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchMissions} tintColor={colors.primary} />}
      >
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Truck color={colors.primary} size={20} />
            <Text className="text-lg font-black uppercase italic tracking-tight" style={{ color: colors.text }}>
              Active Queue
            </Text>
          </View>
          <View className="px-3 py-1 rounded-full border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <Text className="text-[9px] font-black uppercase tracking-widest" style={{ color: colors.text }}>
              {missions.length} Assignments
            </Text>
          </View>
        </View>

        {missions.length === 0 && !isLoading ? (
          <View className="py-20 items-center justify-center rounded-3xl border border-dashed" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
            <CheckCircle2 color={colors.textMuted} size={48} opacity={0.3} className="mb-4" />
            <Text className="text-[10px] font-black uppercase tracking-widest text-center" style={{ color: colors.textMuted }}>
              No Active Missions Assigned to your Hub
            </Text>
          </View>
        ) : (
          missions.map((mission) => (
            <View 
              key={mission.id} 
              className="mb-4 rounded-[28px] p-6 border"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <View className="flex-row justify-between items-start mb-4">
                <View>
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-xl font-black italic tracking-tighter uppercase" style={{ color: colors.text }}>
                      {mission.id}
                    </Text>
                    {mission.urgency === "HIGH" && (
                      <View className="px-1.5 py-0.5 rounded-sm bg-red-500/20 border border-red-500/30">
                        <Text className="text-[8px] font-black uppercase text-red-500">URGENT</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-[9px] font-black uppercase tracking-[0.1em]" style={{ color: colors.textMuted }}>
                    CONSIGNEE: {mission.customer}
                  </Text>
                </View>
                <Text className="text-[10px] font-black uppercase tracking-widest italic" style={{ color: colors.primary }}>
                  {mission.time}
                </Text>
              </View>

              <View className="p-4 rounded-2xl mb-5 flex-row items-center gap-3" style={{ backgroundColor: colors.bgAlt, borderColor: colors.border, borderWidth: 1 }}>
                <MapPin color={colors.textMuted} size={20} />
                <View className="flex-1">
                  <Text className="text-[8px] font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>
                    Destination Node
                  </Text>
                  <Text className="text-xs font-bold uppercase" style={{ color: colors.text }}>
                    {mission.location}
                  </Text>
                </View>
              </View>

              <Pressable 
                onPress={() => router.push(`/chat?recipientId=${mission.customer}` as never)}
                className="w-full h-14 rounded-2xl flex-row items-center justify-center gap-2"
                style={{ backgroundColor: colors.primary }}
              >
                <Navigation color="#FFFFFF" size={16} />
                <Text className="text-[10px] font-black uppercase tracking-widest text-white">
                  Message Consignee
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
