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
import { LanguageSelector } from "@/components/LanguageSelector";
import Svg, { Path } from "react-native-svg";

const BG_IMAGE = "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=2000";

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </Svg>
);

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
    <View className="relative flex-1 bg-background">
      {/* Background with Gradient Overlay */}
      <Image source={{ uri: BG_IMAGE }} className="absolute inset-0 h-full w-full opacity-20" contentFit="cover" />
      <LinearGradient colors={["rgba(2,6,23,0.3)", "#020617", "#020617"]} className="absolute inset-0" />

      {/* Language Selector Top Right */}
      <View className="absolute top-12 right-6 z-50">
        <LanguageSelector />
      </View>

      <View className="flex-1 justify-between px-6 py-16">
        {/* Logo and Tagline */}
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
          {/* Google Auth Button */}
          <Pressable 
            onPress={() => toast("Google Cloud Console integration pending...", "info")}
            className="w-full h-14 bg-white rounded-2xl flex-row items-center justify-center gap-3 shadow-lg active:opacity-80"
          >
            <GoogleIcon />
            <Text className="text-[#020617] font-black text-[12px] uppercase tracking-widest">
              Continue with Google
            </Text>
          </Pressable>

          {/* Email Login */}
          <Button
            label="CONTINUE WITH EMAIL"
            onPress={() => router.push("/login")}
            style={{ backgroundColor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)", borderWidth: 1 }}
          />

          {/* Quick Guest Access */}
          <Pressable
            onPress={handleGuestAccess}
            disabled={isGuestAuthenticating}
            className="mt-2 items-center justify-center"
          >
            {isGuestAuthenticating ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 underline">
                EXPLORE AS GUEST
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      {ToastHost}
    </View>
  );
}
