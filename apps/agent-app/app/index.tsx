import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/authStore";
import { getPostLoginRoute } from "@/lib/auth/roles";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

const BG_IMAGE = "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=2000";

export default function AgentSplash() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setForceShow(true); }, 750);
    return () => clearTimeout(timer);
  }, []);

  const activeHydration = isHydrated || forceShow;

  useEffect(() => {
    if (!activeHydration) return;
    if (isAuthenticated && user) {
      router.replace(getPostLoginRoute(user.role) as never);
    }
  }, [activeHydration, isAuthenticated, user, router]);

  if (!activeHydration || (isAuthenticated && user)) {
    return (
      <View className="flex-1 items-center justify-center bg-[#020617]">
        <ActivityIndicator color="#818cf8" size="large" />
      </View>
    );
  }

  return (
    <View className="relative flex-1 bg-[#020617]">
      <Image source={{ uri: BG_IMAGE }} className="absolute inset-0 h-full w-full opacity-20" contentFit="cover" />
      <LinearGradient colors={["rgba(129,140,248,0.1)", "#020617", "#020617"]} className="absolute inset-0" />

      <View className="flex-1 justify-between px-6 py-16">
        <View className="items-center mt-12"><Logo size="md" /></View>

        <View className="items-center my-auto space-y-6">
          <View className="rounded-[32px] border border-indigo-400/20 bg-white/5 p-1 max-w-[340px]">
            <View className="rounded-[30px] bg-[#020617]/90 px-6 py-8 items-center border border-white/5 shadow-2xl">
              <Text className="text-[36px] font-black italic text-center tracking-tight text-white leading-none">
                AGENT <Text className="text-indigo-400">SYNC</Text>
              </Text>
              <Text className="mt-3 text-[10px] font-black uppercase tracking-widest text-center text-indigo-400">
                Logistics & Delivery Terminal
              </Text>
              <Text className="mt-4 text-[11px] text-slate-400 font-medium text-center leading-relaxed">
                Connect directly with the active fleet and process customer deliveries securely from port to table.
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-4 w-full max-w-[400px] mx-auto">
          <Button
            label="AUTHORIZE ACCESS"
            onPress={() => router.push("/login")}
            style={{ backgroundColor: "#818cf8" }}
          />
        </View>
      </View>
    </View>
  );
}
