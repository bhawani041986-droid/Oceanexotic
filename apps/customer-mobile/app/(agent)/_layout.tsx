import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { useAgentStore, MOODS } from "@/store/agentStore";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentTabBar } from "@/components/agent/AgentTabBar";

export default function AgentLayout() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const currentMood = useAgentStore((s) => s.currentMood);
  const mood = MOODS[currentMood];

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "agent") {
      router.replace("/login");
    }
  }, [isHydrated, isAuthenticated, user, router]);

  if (!isHydrated || !isAuthenticated || !user || user.role !== "agent") {
    return (
      <View className="flex-1 items-center justify-center bg-[#020617]">
        <ActivityIndicator color="#00D1FF" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: mood.bg }}>
      <AgentHeader />
      <View className="flex-1 pt-16 pb-20">
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="tracking" />
          <Stack.Screen name="history" />
          <Stack.Screen name="profile" />
        </Stack>
      </View>
      <AgentTabBar />
    </View>
  );
}
