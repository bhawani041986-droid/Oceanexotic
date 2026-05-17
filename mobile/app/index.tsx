import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { getPostLoginRoute } from "@/lib/auth/roles";

/** Bootstrap: send users to /login or role home (never shares URL with /home). */
export default function Index() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    if (isAuthenticated && user) {
      router.replace(getPostLoginRoute(user.role) as never);
    } else {
      router.replace("/login");
    }
  }, [isHydrated, isAuthenticated, user, router]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator color="#7C3AED" size="large" />
    </View>
  );
}
