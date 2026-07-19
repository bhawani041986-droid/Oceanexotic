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
import api from "@/services/api";
import { setAuthToken, setAuthUser } from "@/lib/storage";

import { loginSchema, type LoginFormValues } from "@/lib/validation/loginSchema";
import { useAuthStore } from "@/store/authStore";
import { FULL_PHP_BASE_URL } from "@/config/api";
import { useLogin } from "@/hooks/useLogin";
import { getPostLoginRoute, toAuthUser } from "@/lib/auth/roles";
import { useToast } from "@/components/ui/Toast";
import { FULL_API_URL } from "@/config/api";
import { useSettingsStore } from "@/store/settingsStore";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/lib/i18n";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
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
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = useAuthStore();
  const loginMutation = useLogin();
  const { toast, ToastHost } = useToast();
  const { handleGoogleSignIn, isGoogleLoading } = useGoogleAuth();
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

  return (
    <View className="flex-1 bg-[#020B14]">
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
                { icon: <Ionicons name="fish-outline" size={20} color="#06b6d4" />, title: t('wild_sustainable') || "WILD & SUSTAINABLE", desc: t('sourcing') || "SOURCING" },
                { icon: <Ionicons name="snow-outline" size={20} color="#06b6d4" />, title: t('cold_chain') || "COLD CHAIN", desc: t('freshness') || "FRESHNESS" },
                { icon: <Ionicons name="time-outline" size={20} color="#06b6d4" />, title: t('live_tracking') || "LIVE TRACKING", desc: t('your_order') || "YOUR ORDER" },
                { icon: <Ionicons name="shield-checkmark-outline" size={20} color="#06b6d4" />, title: t('secure_payment') || "SECURE PAYMENT", desc: t('secure_payment_desc') || "100% SAFE" },
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
                <Text className="text-2xl font-bold text-white tracking-tight">{t('welcome_back') || "Welcome Back!"}</Text>
                <Text className="text-sm text-slate-400 mt-1">{t('login_subtitle') || "Login to continue your fresh journey"}</Text>
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
                        placeholder={t('email_or_phone') || "Email or Phone Number"}
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
                        placeholder={t('password_placeholder') || "Password"}
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
                      <Text className="text-[12px] font-semibold text-[#06b6d4]">{t('forgot') || "Forgot?"}</Text>
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
                    {loginMutation.isPending ? (t('logging_in') || "Logging In...") : (t('login') || "Login")}
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
                  disabled={isGoogleLoading}
                  className={`w-full h-14 bg-[#0a1929] border border-[#1a3852] rounded-xl flex-row items-center justify-center gap-3 ${
                    isGoogleLoading ? 'opacity-60' : 'active:opacity-80'
                  }`}
                >
                  {isGoogleLoading ? (
                    <>
                      <Ionicons name="sync-outline" size={18} color="#06b6d4" />
                      <Text className="text-[#06b6d4] font-semibold text-[13px] tracking-wide">
                        Signing you in…
                      </Text>
                    </>
                  ) : (
                    <>
                      <GoogleIcon />
                      <Text className="text-white font-semibold text-[13px] tracking-wide">
                        {t('continue_with_google') || "Continue with Google"}
                      </Text>
                    </>
                  )}
                </Pressable>

                {/* Sign Up Link */}
                <Text className="text-center text-[12px] text-slate-400 mt-4">
                  {t('dont_have_account') || "Don't have an account?"}{" "}
                  <Link href={"/register" as never} asChild>
                    <Pressable><Text className="font-bold text-[#06b6d4]">{t('sign_up') || "Sign Up"}</Text></Pressable>
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
