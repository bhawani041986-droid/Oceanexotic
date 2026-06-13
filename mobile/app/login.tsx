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
import i18n from "@/lib/i18n";
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

const BG_IMAGE =
  "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=2000";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { language } = useSettingsStore();
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
        if (user.role !== "customer") {
          const message = "This mobile app is for customers only. Use the web dashboard for seller, agent, or admin access.";
          toast(message, "error");
          setSubmitError(message);
          return;
        }
        login(user);
        const destination = getPostLoginRoute(user.role);
        toast(`Welcome back, ${user.name}! Transitioning to your dashboard...`, "success");
        setTimeout(() => {
          router.replace(destination as never);
        }, 100);
        return;
      }
      const message =
        result.message || "Authentication failed. Check your credentials.";
      toast(message, "error");
      setSubmitError(message);
    } catch (err) {
      let message = "Connection failed with maritime registry.";
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          message = String(err.response.data.message);
        } else if (err.code === "ERR_NETWORK") {
          message =
            Platform.OS === "web"
              ? "Cannot reach API. Start XAMPP on port 8081."
              : `Cannot reach API at ${FULL_API_URL}. Phone and PC must be on same Wi‑Fi; set EXPO_PUBLIC_API_URL to your PC IP in mobile/.env`;
        }
      }
      toast(message, "error");
      setSubmitError(message);
    }
  };

  return (
    <View className="relative flex-1 bg-background">
      <Image source={{ uri: BG_IMAGE }} className="absolute inset-0 h-full w-full opacity-20" contentFit="cover" />
      <LinearGradient
        colors={["rgba(2,6,23,0.2)", "#020617", "#020617"]}
        className="absolute inset-0"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-12"
          keyboardShouldPersistTaps="handled"
        >
          <View className="absolute top-2 right-0 z-50">
             <LanguageSelector />
          </View>
          <View className="mx-auto w-full max-w-[480px]">
            <View className="mb-12 items-center space-y-4">
              <Link href="/" asChild>
                <Pressable className="items-center">
                  <Logo size="md" />
                </Pressable>
              </Link>
              <View className="items-center gap-1">
                <Text className="text-2xl font-bold tracking-tight text-foreground">
                  {i18n.t("login_title") || "Admiral Login"}
                </Text>
                <Text className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  {i18n.t("login_subtitle") || "Access the Global Seafood Network"}
                </Text>
                {__DEV__ && Platform.OS !== "web" ? (
                  <Text className="mt-2 max-w-xs text-center text-[9px] text-muted-foreground/80">
                    API: {FULL_API_URL}
                  </Text>
                ) : null}
              </View>
            </View>

            <View className="rounded-[28px] border border-white/10 bg-white/5 p-1">
              <View className="rounded-[26px] bg-card p-8 md:p-10">
                <View className="gap-6">
                  <View className="gap-2">
                    <Text className="ml-1 text-[10px] font-black uppercase tracking-widest text-foreground">
                      Fleet Identity (Email)
                    </Text>
                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="name@oceanexotic.com"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          error={errors.email?.message}
                        />
                      )}
                    />
                  </View>

                  <View className="gap-2">
                    <View className="ml-1 flex-row items-center justify-between">
                      <Text className="text-[10px] font-black uppercase tracking-widest text-foreground">
                        Secret Key
                      </Text>
                      <Link href={"/forgot-password" as never} asChild>
                        <Pressable>
                          <Text className="text-[10px] font-bold text-primary">RECOVER KEY</Text>
                        </Pressable>
                      </Link>
                    </View>
                    <Controller
                      control={control}
                      name="password"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="••••••••"
                          secureTextEntry
                          autoComplete="password"
                          error={errors.password?.message}
                        />
                      )}
                    />
                  </View>
                </View>

                {submitError ? (
                  <Text className="mt-4 text-center text-[10px] font-bold text-danger">
                    {submitError}
                  </Text>
                ) : null}

                <View className="mt-8 gap-8">
                  <Button
                    label={loginMutation.isPending ? "AUTHENTICATING..." : "INITIATE SESSION"}
                    loading={loginMutation.isPending}
                    onPress={() => void handleSubmit(onSubmit)()}
                  />

                  <Text className="text-center text-[11px] font-medium text-muted-foreground">
                    New to the fleet?{" "}
                    <Link href={"/register" as never} asChild>
                      <Pressable>
                        <Text className="font-bold text-foreground">REGISTER ACCOUNT</Text>
                      </Pressable>
                    </Link>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {ToastHost}
    </View>
  );
}
