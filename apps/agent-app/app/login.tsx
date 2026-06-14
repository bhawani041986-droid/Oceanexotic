import { useState } from "react";
import axios from "axios";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/validation/loginSchema";
import { useAuthStore } from "@/store/authStore";
import { useLogin } from "@/hooks/useLogin";
import { getPostLoginRoute, toAuthUser } from "@/lib/auth/roles";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { FULL_API_URL } from "@/config/api";
import { Logo } from "@/components/ui/Logo";

const BG_IMAGE = "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=2000";

export default function AgentLoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const loginMutation = useLogin();
  const { toast, ToastHost } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setSubmitError(null);
    try {
      const result = await loginMutation.mutateAsync(data);

      if (result.success && result.user && result.token) {
        const user = toAuthUser(result.user);
        if (user.role !== "agent") {
          const message = "Access Denied: Only Agents can access this terminal.";
          toast(message, "error");
          setSubmitError(message);
          return;
        }
        login(user);
        const destination = getPostLoginRoute(user.role);
        toast(`Welcome back, Agent ${user.name}!`, "success");
        setTimeout(() => { router.replace(destination as never); }, 100);
        return;
      }
      const message = result.message || "Authentication failed. Check your credentials.";
      toast(message, "error");
      setSubmitError(message);
    } catch (err) {
      let message = "Connection failed with maritime registry.";
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) message = String(err.response.data.message);
        else if (err.code === "ERR_NETWORK") message = "Network Error: Cannot reach API.";
      }
      toast(message, "error");
      setSubmitError(message);
    }
  };

  return (
    <View className="relative flex-1 bg-background">
      <Image source={{ uri: BG_IMAGE }} className="absolute inset-0 h-full w-full opacity-20" contentFit="cover" />
      <LinearGradient colors={["rgba(2,6,23,0.5)", "#020617", "#020617"]} className="absolute inset-0" />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerClassName="flex-grow px-6 py-12" keyboardShouldPersistTaps="handled" bounces={false}>
          <View className="mx-auto w-full max-w-[400px] mt-auto mb-auto">
            <View className="mb-10 items-center space-y-4">
              <Link href="/" asChild>
                <Pressable className="items-center"><Logo size="md" /></Pressable>
              </Link>
              <View className="items-center gap-1 mt-4">
                <Text className="text-2xl font-black tracking-widest text-indigo-400 uppercase text-center">
                  Agent Terminal
                </Text>
                <Text className="text-[10px] font-bold tracking-widest text-slate-500 uppercase text-center mt-1">
                  Logistics & Delivery Portal
                </Text>
              </View>
            </View>

            <View className="gap-4 w-full">
              <View className="rounded-3xl bg-white/5 border border-indigo-400/20 p-6 space-y-4">
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Agent Fleet Identity (Email)"
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
                        placeholder="Security Key"
                        secureTextEntry
                        autoComplete="password"
                        error={errors.password?.message}
                      />
                    )}
                  />
                </View>

                {submitError ? (
                  <Text className="text-center text-[10px] font-bold text-red-400">{submitError}</Text>
                ) : null}

                <Button
                  label={loginMutation.isPending ? "AUTHENTICATING..." : "AUTHORIZE ACCESS"}
                  loading={loginMutation.isPending}
                  onPress={() => void handleSubmit(onSubmit)()}
                  className="mt-2"
                  style={{ backgroundColor: "#818cf8" }}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {ToastHost}
    </View>
  );
}
