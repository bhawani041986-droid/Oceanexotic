import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { SellerHeader } from "@/components/seller/SellerHeader";
import { SellerTabBar } from "@/components/seller/SellerTabBar";

export default function SellerLayout() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "seller") {
      router.replace("/login");
    }
  }, [isHydrated, isAuthenticated, user, router]);

  if (!isHydrated || !isAuthenticated || !user || user.role !== "seller") {
    return (
      <View className="flex-1 items-center justify-center bg-[#020617]">
        <ActivityIndicator color="#7C3AED" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: "#020617" }}>
      <SellerHeader />
      <View className="flex-1 pt-16 pb-20">
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="inventory" />
          <Stack.Screen name="product-new" />
          <Stack.Screen name="product-edit" />
          <Stack.Screen name="orders" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="earnings" />
          <Stack.Screen name="withdrawals" />
          <Stack.Screen name="verification" />
          <Stack.Screen name="fleet" />
          <Stack.Screen name="shipping" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="reviews" />
          <Stack.Screen name="promotions" />
          <Stack.Screen name="settings" />
        </Stack>
      </View>
      <SellerTabBar />
    </View>
  );
}
