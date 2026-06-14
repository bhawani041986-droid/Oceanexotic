import { useState } from "react";
import axios from "axios";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSettingsStore } from "@/store/settingsStore";
import { loginSchema, type LoginFormValues } from "@/lib/validation/loginSchema";
import { useAuthStore } from "@/store/authStore";
import { useLogin } from "@/hooks/useLogin";
import { getPostLoginRoute, toAuthUser } from "@/lib/auth/roles";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { FULL_API_URL } from "@/config/api";
import { Logo } from "@/components/ui/Logo";
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

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const currentLanguage = useSettingsStore((s) => s.language); // re-render on language change
  const loginMutation = useLogin();
  const { toast, ToastHost } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

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
      let message = "Connection failed with maritime registry.";
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

  const handleGoogleSignIn = () => {
    toast("Google Cloud Console integration pending...");
  };

  return (
    <View className="relative flex-1 bg-background">
      <Image source={{ uri: BG_IMAGE }} className="absolute inset-0 h-full w-full opacity-20" contentFit="cover" />
      <LinearGradient colors={["rgba(2,6,23,0.3)", "#020617", "#020617"]} className="absolute inset-0" />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12" keyboardShouldPersistTaps="handled">
          <View className="absolute top-2 right-0 z-50"><LanguageSelector /></View>
          <View className="mx-auto w-full max-w-[400px]">
            <View className="mb-10 items-center space-y-4">
              <Link href="/" asChild>
                <Pressable className="items-center"><Logo size="md" /></Pressable>
              </Link>
              <View className="items-center gap-1 mt-4">
                <Text className="text-2xl font-black tracking-tight text-white text-center">
                  Welcome to OceanExotic
                </Text>
                <Text className="text-[11px] font-medium text-slate-400 text-center mt-1 px-4 leading-relaxed">
                  Log in to access fresh catches and live market deliveries.
                </Text>
              </View>
            </View>

            <View className="gap-4 w-full">
              {/* Google Auth Button */}
              <Pressable 
                onPress={handleGoogleSignIn}
                className="w-full h-14 bg-white rounded-2xl flex-row items-center justify-center gap-3 shadow-lg active:opacity-80"
              >
                <GoogleIcon />
                <Text className="text-[#020617] font-black text-[12px] uppercase tracking-widest">
                  Continue with Google
                </Text>
              </Pressable>

              <View className="flex-row items-center justify-between my-2">
                <View className="flex-1 h-[1px] bg-white/10" />
                <Text className="text-[9px] font-black uppercase text-slate-500 tracking-widest mx-4">or use email</Text>
                <View className="flex-1 h-[1px] bg-white/10" />
              </View>

              {/* Email Form */}
              <View className="rounded-3xl bg-white/5 border border-white/10 p-6 space-y-4">
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Email Address"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      error={errors.email?.message}
                    />
                  )}
                />
                <View>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Password"
                        secureTextEntry
                        autoComplete="password"
                        error={errors.password?.message}
                      />
                    )}
                  />
                  <View className="flex-row justify-end mt-2">
                    <Link href={"/forgot-password" as never} asChild>
                      <Pressable><Text className="text-[10px] font-bold text-primary">FORGOT PASSWORD?</Text></Pressable>
                    </Link>
                  </View>
                </View>

                {submitError ? (
                  <Text className="text-center text-[10px] font-bold text-red-400">{submitError}</Text>
                ) : null}

                <Button
                  label={loginMutation.isPending ? "AUTHENTICATING..." : "SIGN IN"}
                  loading={loginMutation.isPending}
                  onPress={() => void handleSubmit(onSubmit)()}
                  className="mt-2"
                />
              </View>

              <Text className="text-center text-[11px] font-medium text-slate-400 mt-4">
                New to the fleet?{" "}
                <Link href={"/register" as never} asChild>
                  <Pressable><Text className="font-bold text-white underline">REGISTER ACCOUNT</Text></Pressable>
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {ToastHost}
    </View>
  );
}
