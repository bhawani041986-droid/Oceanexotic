import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { CustomerTabBar } from "@/components/customer/CustomerTabBar";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function CustomerLayout() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const colors = useThemeColors();

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
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <CustomerHeader />
      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="home" />
          <Stack.Screen name="products" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="orders" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="cart" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="recipe/index" />
          <Stack.Screen name="recipe/[id]" />
          <Stack.Screen name="orders/[id]" />
          <Stack.Screen name="checkout" />
        </Stack>
      </View>
      <CustomerTabBar />
    </View>
  );
}
