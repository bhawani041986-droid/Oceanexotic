import { useState } from "react";
import api from "@/services/api";
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

import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { FULL_API_URL } from "@/config/api";
import { useSettingsStore } from "@/store/settingsStore";
import { Ionicons } from "@expo/vector-icons";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Logo } from "@/components/ui/Logo";
import { useEffect } from "react";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { toast, ToastHost } = useToast();
  
  const { customerAssets } = useSettingsStore();
  const heroImage = customerAssets?.mobileHero || customerAssets?.hero || "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=2000";

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSent, setIsSent] = useState(false);

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

  const handleResetPassword = async () => {
    setErrorMsg("");
    if (!email) {
      setErrorMsg("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/forgot-password.php", {
        email,
        role: "CUSTOMER",
      });

      if (response.data.success) {
        setIsSent(true);
        toast("Password reset instructions sent to your email.", "success");
      } else {
        setErrorMsg(response.data.message || "Failed to send reset link");
      }
    } catch (err: any) {
      let message = "Connection failed. Please check your internet connection.";
      if (err.response?.data?.message) {
        message = String(err.response.data.message);
      } else if (err.code === "ERR_NETWORK") {
        message = `Cannot reach API at ${FULL_API_URL}. Ensure PC and phone are on same network.`;
      }
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#020B14]">
      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={Platform.OS === "android" ? 24 : 0} className="flex-1">
        <ScrollView contentContainerClassName="flex-grow pb-12" keyboardShouldPersistTaps="handled" bounces={false}>
          
          <View className="w-full h-64 relative overflow-hidden">
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
            <Animated.View style={{ opacity: fadeAnim }} className="absolute inset-0 items-center justify-center z-20 pb-12" pointerEvents="none">
              <Logo size="md" />
            </Animated.View>
          </View>

          {/* Absolute Language Switcher */}
          <View className="absolute top-12 right-4 z-50">
            <LanguageSelector showText={true} />
          </View>

          <View className="px-6 -mt-16 z-10 w-full max-w-[480px] mx-auto">

            <View className="bg-[#030F1A] border border-[#0c3150] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <View className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#06b6d4] rounded-tl-3xl opacity-50" />
              <View className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#06b6d4] rounded-br-3xl opacity-50" />

              <View className="mb-6">
                <Text className="text-2xl font-bold text-white tracking-tight">Reset Password</Text>
                <Text className="text-sm text-slate-400 mt-1">
                  {isSent 
                    ? "Check your email for instructions" 
                    : "Enter your email to receive a recovery link"}
                </Text>
              </View>

              {!isSent ? (
                <View className="space-y-4">
                  <View className="border border-[#1a3852] bg-[#020912] rounded-xl flex-row items-center px-4 h-14">
                    <Ionicons name="mail-outline" size={20} color="#06b6d4" />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email Address"
                      placeholderTextColor="#475569"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      className="flex-1 ml-3 text-white text-[13px] h-full"
                    />
                  </View>

                  {errorMsg ? (
                    <Text className="text-center text-[10px] font-bold text-red-400">{errorMsg}</Text>
                  ) : null}

                  <Pressable
                    disabled={isLoading || !email}
                    onPress={handleResetPassword}
                    className={`mt-4 rounded-xl h-14 items-center justify-center shadow-lg overflow-hidden ${
                      !email ? "opacity-50" : "opacity-100"
                    }`}
                  >
                    <LinearGradient 
                      colors={["#ef4444", "#dc2626"]} 
                      className="absolute inset-0"
                    />
                    <Text className="text-white font-bold text-[14px] uppercase tracking-widest">
                      {isLoading ? "Sending..." : "Send Reset Link"}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View className="py-8 items-center justify-center space-y-4">
                  <View className="w-16 h-16 rounded-full bg-[#06b6d4]/10 items-center justify-center mb-4">
                    <Ionicons name="mail-outline" size={32} color="#06b6d4" />
                  </View>
                  <Text className="text-white text-center font-medium">
                    We've sent a password reset link to <Text className="font-bold text-[#06b6d4]">{email}</Text>. Please check your inbox and spam folder.
                  </Text>
                </View>
              )}

              <View className="mt-8 pt-4 border-t border-[#1a3852] flex-row justify-center">
                <Link href={"/login" as never} asChild>
                  <Pressable className="flex-row items-center gap-2">
                    <Ionicons name="arrow-back-outline" size={14} color="#06b6d4" />
                    <Text className="font-bold text-[#06b6d4]">Back to Login</Text>
                  </Pressable>
                </Link>
              </View>

            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {ToastHost}
    </View>
  );
}
