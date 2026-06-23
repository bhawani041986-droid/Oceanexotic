import { useState } from "react";
import axios from "axios";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import Constants, { ExecutionEnvironment } from "expo-constants";

WebBrowser.maybeCompleteAuthSession();

// Conditionally require GoogleSignin so Expo Go does not crash
let GoogleSignin: any = null;
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (!isExpoGo) {
  try {
    GoogleSignin = require("@react-native-google-signin/google-signin").GoogleSignin;
    GoogleSignin.configure({
      webClientId: "843916088941-9kbsr70p54u5ob8spu816grl17bq3enq.apps.googleusercontent.com",
    });
  } catch (e) {
    console.warn("GoogleSignin native module not found");
  }
}

import { loginSchema, type LoginFormValues } from "@/lib/validation/loginSchema";
import { useAuthStore } from "@/store/authStore";
import { useLogin } from "@/hooks/useLogin";
import { getPostLoginRoute, toAuthUser } from "@/lib/auth/roles";
import { useToast } from "@/components/ui/Toast";
import { FULL_API_URL } from "@/config/api";
import { useSettingsStore } from "@/store/settingsStore";
import { LanguageSelector } from "@/components/LanguageSelector";
import { setAuthToken, setAuthUser } from "@/lib/storage";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { Logo } from "@/components/ui/Logo";
import { useEffect } from "react";

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </Svg>
);

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const loginMutation = useLogin();
  const { toast, ToastHost } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Logo pulsing animation
  const fadeAnim = useState(new Animated.Value(0.7))[0];
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.7, duration: 2000, useNativeDriver: true })
      ])
    ).start();
  }, [fadeAnim]);
  
  // Fetch Hero Image from Dynamic Settings
  const { customerAssets } = useSettingsStore();
  const heroImage = customerAssets?.mobileHero || customerAssets?.hero || "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=2000";

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const watchEmail = watch("email");
  const watchPassword = watch("password");
  const isSubmitDisabled = !watchEmail || !watchPassword;

  const onSubmit = async (data: LoginFormValues) => {
    setSubmitError(null);
    try {
      const result = await loginMutation.mutateAsync(data);

      if (result.success && result.user && result.token) {
        const user = toAuthUser(result.user);
        if (user.role && !["customer", "agent", "admin", "seller"].includes(user.role)) {
          const message = "Invalid role assigned. Access denied.";
          toast(message, "error");
          setSubmitError(message);
          return;
        }
        login(user);
        const destination = getPostLoginRoute(user.role);
        toast(`Welcome back, ${user.name}!`, "success");
        setTimeout(() => {
          router.replace(destination as never);
        }, 100);
        return;
      }
      const message = result.message || "Authentication failed. Check your credentials.";
      toast(message, "error");
      setSubmitError(message);
    } catch (err) {
      let message = "Connection failed. Please check your internet connection.";
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          message = String(err.response.data.message);
        } else if (err.code === "ERR_NETWORK") {
          message = Platform.OS === "web"
              ? "Cannot reach API. Ensure Next.js is running."
              : `Cannot reach API at ${FULL_API_URL}. Ensure PC and phone are on same network.`;
        }
      }
      toast(message, "error");
      setSubmitError(message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      if (isExpoGo || !GoogleSignin) {
        // FALLBACK: Use WebBrowser if running inside Expo Go (sandbox) to prevent native crashes
        const redirectUrl = Linking.createURL("oauth-callback");
        // Redirect directly back to the mobile deep link. Supabase will append #access_token=...
        const authUrl = `https://kyqmhibffbwoqlpdplfu.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
        
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
        
        if (result.type === "success" && result.url) {
          // The URL will have a hash fragment like #access_token=XYZ&...
          const hashIndex = result.url.indexOf('#');
          if (hashIndex !== -1) {
            const hash = result.url.substring(hashIndex + 1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            
            if (accessToken) {
              // Send the Supabase access_token to our backend to generate our custom JWT and user object
              const syncResult = await api.post("/auth/sync-oauth", { access_token: accessToken });
              
              if (syncResult.data.success && syncResult.data.token && syncResult.data.user) {
                const parsedUser = syncResult.data.user;
                const authUser = toAuthUser(parsedUser);
                
                await setAuthToken(syncResult.data.token);
                await setAuthUser(authUser);
                login(authUser);
                router.replace("/home");
                toast(`Welcome back, ${authUser.name}!`, "success");
              } else {
                toast(syncResult.data.message || "Failed to sync OAuth token.", "error");
              }
            } else {
               toast("Google sign-in completed but no access token received.", "error");
            }
          } else {
             // In case it comes as a query param
             const parsedUrl = Linking.parse(result.url);
             const { token, user } = parsedUrl.queryParams || {};
             if (token && user) {
               const parsedUser = JSON.parse(decodeURIComponent(user as string));
               const authUser = toAuthUser(parsedUser);
               await setAuthToken(token as string);
               await setAuthUser(authUser);
               login(authUser);
               router.replace("/home");
               toast(`Welcome back, ${authUser.name}!`, "success");
             }
          }
        }
        return;
      }

      // NATIVE FLOW: Use True Native Google Sign-In SDK
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (idToken) {
        // Send the idToken to backend to verify and authenticate
        const result = await api.post("/auth/google.php", {
          idToken,
          role: "CUSTOMER",
        });

        if (result.data.success && result.data.user && result.data.token) {
          const authUser = toAuthUser(result.data.user);
          await setAuthToken(result.data.token);
          await setAuthUser(authUser);
          login(authUser);
          router.replace("/home");
          toast(`Welcome back, ${authUser.name}!`, "success");
        } else {
          toast(result.data.message || "Google authentication failed", "error");
        }
      }
    } catch (err: any) {
      console.error("Google login failed:", err);
      toast(err?.message || "Google login failed. Try again.", "error");
    }
  };

  return (
    <View className="flex-1 bg-[#020B14]">
      {/* Absolute Language Switcher */}
      <View className="absolute top-12 right-4 z-50">
        <LanguageSelector showText={true} />
      </View>

      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={Platform.OS === "android" ? 24 : 0} className="flex-1">
        <ScrollView contentContainerClassName="flex-grow pb-12" keyboardShouldPersistTaps="handled" bounces={false}>
          
          {/* Hero Image Area with Glow */}
          <View className="w-full h-80 relative overflow-hidden">
            {/* Glowing Ring Backplate Effect */}
            <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-4 border-cyan-400 opacity-20 blur-xl" />
            <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-4 border-red-500 opacity-20 blur-xl translate-x-10" />
            
            <Image 
              source={{ uri: heroImage }} 
              className="absolute inset-0 w-full h-full object-cover"
              contentFit="cover"
            />
            
            <LinearGradient 
              colors={["transparent", "#020B14"]} 
              locations={[0.5, 1]}
              className="absolute inset-0"
            />

            {/* Animated Project Logo */}
            <Animated.View style={{ opacity: fadeAnim }} className="absolute inset-0 items-center justify-center z-20 pb-12">
              <Logo size="md" />
            </Animated.View>
          </View>

          <View className="px-6 -mt-6 z-10 w-full max-w-[480px] mx-auto">

            {/* Trust Feature Cards Grid */}
            <View className="grid grid-cols-2 flex-row flex-wrap justify-between gap-y-3 mb-8">
              {[
                { icon: <Ionicons name="fish-outline" size={20} color="#06b6d4" />, title: "WILD & SUSTAINABLE", desc: "SOURCING" },
                { icon: <Ionicons name="snow-outline" size={20} color="#06b6d4" />, title: "COLD CHAIN", desc: "FRESHNESS" },
                { icon: <Ionicons name="time-outline" size={20} color="#06b6d4" />, title: "LIVE TRACKING", desc: "YOUR ORDER" },
                { icon: <Ionicons name="shield-checkmark-outline" size={20} color="#06b6d4" />, title: "SECURE PAYMENT", desc: "100% SAFE" },
              ].map((card, idx) => (
                <View 
                  key={idx} 
                  className="w-[48%] bg-[#041120] border border-[#0c3150] rounded-xl p-3 flex-row items-center gap-3 shadow-lg"
                  style={{
                    borderTopLeftRadius: idx === 0 || idx === 2 ? 24 : 8,
                    borderBottomRightRadius: idx === 1 || idx === 3 ? 24 : 8,
                    borderTopRightRadius: 8,
                    borderBottomLeftRadius: 8,
                  }}
                >
                  <View className="w-8 h-8 rounded-full bg-[#06b6d4]/10 items-center justify-center">
                    {card.icon}
                  </View>
                  <View className="flex-1">
                    <Text className="text-[9px] font-bold text-[#06b6d4] uppercase tracking-wider">{card.title}</Text>
                    <Text className="text-[8px] font-semibold text-slate-300 uppercase tracking-widest">{card.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Welcome Panel inside a container */}
            <View className="bg-[#030F1A] border border-[#0c3150] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              {/* Subtle top left chamfer style via border hack */}
              <View className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#06b6d4] rounded-tl-3xl opacity-50" />
              <View className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#06b6d4] rounded-br-3xl opacity-50" />

              <View className="mb-6">
                <Text className="text-2xl font-bold text-white tracking-tight">Welcome Back!</Text>
                <Text className="text-sm text-slate-400 mt-1">Login to continue your fresh journey</Text>
              </View>

              <View className="space-y-4">
                {/* Email Field */}
                <View className="border border-[#1a3852] bg-[#020912] rounded-xl flex-row items-center px-4 h-14">
                  <Ionicons name="person-outline" size={20} color="#06b6d4" />
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Email or Phone Number"
                        placeholderTextColor="#475569"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        className="flex-1 ml-3 text-white text-[13px] h-full"
                      />
                    )}
                  />
                </View>
                {errors.email?.message && <Text className="text-[10px] text-red-400 px-2 -mt-2">{errors.email.message}</Text>}

                {/* Password Field */}
                <View className="border border-[#1a3852] bg-[#020912] rounded-xl flex-row items-center px-4 h-14">
                  <Ionicons name="lock-closed-outline" size={20} color="#06b6d4" />
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Password"
                        placeholderTextColor="#475569"
                        secureTextEntry={!showPassword}
                        autoComplete="password"
                        className="flex-1 ml-3 text-white text-[13px] h-full"
                      />
                    )}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2">
                    {showPassword ? <Ionicons name="eye-off-outline" size={18} color="#64748b" /> : <Ionicons name="eye-outline" size={18} color="#64748b" />}
                  </Pressable>
                  <Link href={"/forgot-password" as never} asChild>
                    <Pressable className="ml-2">
                      <Text className="text-[12px] font-semibold text-[#06b6d4]">Forgot?</Text>
                    </Pressable>
                  </Link>
                </View>
                {errors.password?.message && <Text className="text-[10px] text-red-400 px-2 -mt-2">{errors.password.message}</Text>}

                {submitError ? (
                  <Text className="text-center text-[10px] font-bold text-red-400">{submitError}</Text>
                ) : null}

                {/* Login Button */}
                <Pressable
                  disabled={loginMutation.isPending || isSubmitDisabled}
                  onPress={() => void handleSubmit(onSubmit)()}
                  className={`mt-2 rounded-xl h-14 items-center justify-center shadow-lg overflow-hidden ${
                    isSubmitDisabled ? "opacity-50" : "opacity-100"
                  }`}
                >
                  <LinearGradient 
                    colors={["#ef4444", "#dc2626"]} 
                    className="absolute inset-0"
                  />
                  <Text className="text-white font-bold text-[14px] uppercase tracking-widest">
                    {loginMutation.isPending ? "Logging In..." : "Login"}
                  </Text>
                </Pressable>

                {/* Divider */}
                <View className="flex-row items-center justify-between my-2">
                  <View className="flex-1 h-[1px] bg-slate-800" />
                  <Text className="text-[10px] font-semibold uppercase text-slate-500 tracking-widest mx-4">OR</Text>
                  <View className="flex-1 h-[1px] bg-slate-800" />
                </View>

                {/* Google Auth Button */}
                <Pressable 
                  onPress={handleGoogleSignIn}
                  className="w-full h-14 bg-[#0a1929] border border-[#1a3852] rounded-xl flex-row items-center justify-center gap-3 active:opacity-80"
                >
                  <GoogleIcon />
                  <Text className="text-white font-semibold text-[13px] tracking-wide">
                    Continue with Google
                  </Text>
                </Pressable>

                {/* Sign Up Link */}
                <Text className="text-center text-[12px] text-slate-400 mt-4">
                  Don't have an account?{" "}
                  <Link href={"/register" as never} asChild>
                    <Pressable><Text className="font-bold text-[#06b6d4]">Sign Up</Text></Pressable>
                  </Link>
                </Text>

              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {ToastHost}
    </View>
  );
}
