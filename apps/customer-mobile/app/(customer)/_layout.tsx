import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { CustomerTabBar } from "@/components/customer/CustomerTabBar";
import { CustomerHeader } from "@/components/customer/CustomerHeader";

export default function CustomerLayout() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "customer") {
      router.replace("/login");
    }
  }, [isHydrated, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated, fetchSettings]);

  if (!isHydrated || !isAuthenticated || !user || user.role !== "customer") {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#7C3AED" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <CustomerHeader />
      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="home" />
          <Stack.Screen name="products" />
          <Stack.Screen name="orders" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="cart" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="orders/[id]" />
          <Stack.Screen name="checkout" />
        </Stack>
      </View>
      <CustomerTabBar />
    </View>
  );
}
