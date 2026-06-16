import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { setAuthToken, setAuthUser } from "@/lib/storage";
import { toAuthUser } from "@/lib/auth/roles";
import { View, ActivityIndicator } from "react-native";

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const { token, user } = useLocalSearchParams<{ token?: string; user?: string }>();
  const { login } = useAuthStore();

  useEffect(() => {
    if (token && user) {
      try {
        // useLocalSearchParams already decodes the URI components in expo-router, 
        // but if it was double-encoded, we handle both safely.
        let parsedUser;
        try {
          parsedUser = JSON.parse(decodeURIComponent(user));
        } catch {
          parsedUser = JSON.parse(user);
        }

        const authUser = toAuthUser(parsedUser);
        
        setAuthToken(token).then(() => {
          return setAuthUser(authUser);
        }).then(() => {
          login(authUser);
          router.replace("/home");
        }).catch((err) => {
          console.error("Storage error:", err);
          alert("Session storage failed. Please login again.");
          router.replace("/login");
        });
      } catch (err) {
        console.error("Parse error:", err);
        alert("OAuth parsing failed. Please login manually.");
        router.replace("/login");
      }
    } else {
      router.replace("/login");
    }
  }, [token, user, login, router]);

  return (
    <View style={{ flex: 1, backgroundColor: "#020617", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#00D1FF" />
    </View>
  );
}
