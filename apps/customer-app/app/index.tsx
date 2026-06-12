import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/authStore";
import { getPostLoginRoute, toAuthUser } from "@/lib/auth/roles";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useLogin } from "@/hooks/useLogin";
import { useThemeColors } from "@/hooks/useThemeColors";

const BG_IMAGE = "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=2000";

export default function WelcomeOnboardingScreen() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated, login } = useAuthStore();
  const { toast, ToastHost } = useToast();
  const loginMutation = useLogin();
  const colors = useThemeColors();
  const [isGuestAuthenticating, setIsGuestAuthenticating] = useState(false);
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    // Safety net: Force display welcome layout if storage hydration is delayed or uncalled on browser storage
    const timer = setTimeout(() => {
      setForceShow(true);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  const activeHydration = isHydrated || forceShow;

  useEffect(() => {
    if (!activeHydration) return;

    if (isAuthenticated && user) {
      router.replace(getPostLoginRoute(user.role) as never);
    }
  }, [activeHydration, isAuthenticated, user, router]);

  const handleGuestAccess = async () => {
    if (isGuestAuthenticating) return;
    setIsGuestAuthenticating(true);
    toast("Logging in as Guest...", "success");
    try {
      const result = await loginMutation.mutateAsync({
        email: "john@gmail.com",
        password: "ocean123",
      });

      if (result.success && result.user && result.token) {
        const authUser = toAuthUser(result.user);
        login(authUser);
        const destination = getPostLoginRoute(authUser.role);
        toast(`Welcome, Guest!`, "success");
        setTimeout(() => {
          router.replace(destination as never);
        }, 100);
      } else {
        toast(result.message || "Failed to secure guest clearance.", "error");
      }
    } catch (err) {
      toast("Connection to live harbor registry disrupted.", "error");
    } finally {
      setIsGuestAuthenticating(false);
    }
  };

  if (!activeHydration) {
    return (
      <View className="flex-1 items-center justify-center bg-[#020617]">
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  // If already authenticated, show loading spinner while redirecting
  if (isAuthenticated && user) {
    return (
      <View className="flex-1 items-center justify-center bg-[#020617]">
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View className="relative flex-1 bg-[#020617]">
      {/* Immersive Ocean Background */}
      <Image source={{ uri: BG_IMAGE }} className="absolute inset-0 h-full w-full opacity-25" contentFit="cover" />
      
      {/* Dynamic themed gradient mapping */}
      <LinearGradient
        colors={[colors.primary + "14", "#020617", "#020617"]}
        className="absolute inset-0"
      />

      <View className="flex-1 justify-between px-6 py-16">
        {/* Brand header */}
        <View className="items-center mt-12">
          <Logo size="md" />
        </View>

        {/* Core welcome graphics */}
        <View className="items-center my-auto space-y-6">
          <View className="rounded-[32px] border border-white/10 bg-white/5 p-1 max-w-[340px]">
            <View className="rounded-[30px] bg-[#020617]/90 px-6 py-8 items-center border border-white/5 shadow-2xl">
              <Text className="text-[36px] font-black italic text-center tracking-tight text-white leading-none">
                HARBOR <Text style={{ color: colors.primary }}>SYNC</Text>
              </Text>
              <Text className="mt-3 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: colors.primary }}>
                Vibrant Port Blair Fish Exchange
              </Text>
              <Text className="mt-4 text-[11px] text-slate-400 font-medium text-center leading-relaxed">
                Connect directly with the active fishing fleets of Andaman. Fresh catches delivered straight from source to table within hours of berthing.
              </Text>
            </View>
          </View>
        </View>

        {/* Buttons / Actions */}
        <View className="gap-4 w-full max-w-[400px] mx-auto">
          {/* Initiate Session */}
          <Button
            label="INITIATE SESSION"
            onPress={() => router.push("/login")}
            style={{ backgroundColor: colors.primary }}
          />

          {/* Quick Guest Access */}
          <Pressable
            onPress={handleGuestAccess}
            disabled={isGuestAuthenticating}
            className="h-14 items-center justify-center rounded-full border border-white/15 bg-white/5 active:bg-white/10"
          >
            {isGuestAuthenticating ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text className="text-[10px] font-black uppercase tracking-widest text-white">
                EXPLORE AS GUEST
              </Text>
            )}
          </Pressable>

          {/* Register Identity */}
          <Pressable
            onPress={() => router.push("/register" as never)}
            className="items-center mt-2"
          >
            <Text className="text-[11px] font-medium text-slate-400">
              New to the fleet? <Text className="font-bold text-white underline">REGISTER FLEET IDENTITY</Text>
            </Text>
          </Pressable>
        </View>
      </View>

      {ToastHost}
    </View>
  );
}
