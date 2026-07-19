import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { setAuthToken, setAuthUser } from "@/lib/storage";
import { toAuthUser, getPostLoginRoute } from "@/lib/auth/roles";
import { View, ActivityIndicator, Text } from "react-native";

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const { token, user } = useLocalSearchParams<{ token?: string; user?: string }>();
  const { login } = useAuthStore();

  useEffect(() => {
    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));
        const authUser = toAuthUser(parsedUser);

        setAuthToken(token).then(() => {
          return setAuthUser(authUser);
        }).then(() => {
          login(authUser);
          // Role-aware redirect — not hardcoded to /home
          const destination = getPostLoginRoute(authUser.role);
          router.replace(destination as never);
        }).catch((err) => {
          console.error("Storage error:", err);
          router.replace("/login");
        });
      } catch (err) {
        console.error("Parse error:", err);
        router.replace("/login");
      }
    } else {
      // No token/user params — go back to login
      router.replace("/login");
    }
  }, [token, user, login, router]);

  return (
    <View style={{ flex: 1, backgroundColor: "#020617", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <ActivityIndicator size="large" color="#06b6d4" />
      <Text style={{ color: "#94a3b8", fontSize: 13, fontWeight: "600" }}>
        Signing you in…
      </Text>
    </View>
  );
}
