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
import { useAuthStore } from "@/store/authStore";
import { setAuthToken, setAuthUser } from "@/lib/storage";
import { getPostLoginRoute, toAuthUser } from "@/lib/auth/roles";

export default function RegisterScreen() {
  const router = useRouter();
  const { toast, ToastHost } = useToast();
  const { login } = useAuthStore();
  
  // Dynamic Hero Image
  const { customerAssets } = useSettingsStore();
  const heroImage = customerAssets?.mobileHero || customerAssets?.hero || "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=2000";

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referral, setReferral] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleRegister = async () => {
    setErrorMsg("");
    if (!name || !mobile || !email || !password || !confirmPassword) {
      setErrorMsg("Please fill all required fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/register.php", {
        name,
        email,
        phone: mobile,
        password,
        referral_code: referral,
        role: "CUSTOMER",
      });

      if (response.data.success && response.data.token && response.data.user) {
        toast("Account created! Check your email for login details.", "success");
        
        // Auto-login logic
        const authUser = toAuthUser(response.data.user);
        await setAuthToken(response.data.token);
        await setAuthUser(authUser);
        login(authUser);

        setTimeout(() => {
          const destination = getPostLoginRoute(authUser.role);
          router.replace(destination as never);
        }, 1500);
      } else {
        setErrorMsg(response.data.message || "Registration failed");
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

  const isSubmitDisabled = !name || !mobile || !email || !password || !confirmPassword;

  return (
    <View className="flex-1 bg-[#020B14]">
      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={Platform.OS === "android" ? 24 : 0} className="flex-1">
        <ScrollView contentContainerClassName="flex-grow pb-12" keyboardShouldPersistTaps="handled" bounces={false}>
          
          {/* Hero Image Area with Glow */}
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
            
            {/* Absolute Language Switcher */}
            <View className="absolute top-12 right-4 z-50">
              <LanguageSelector showText={true} />
            </View>

            {/* Animated Project Logo */}
            <Animated.View style={{ opacity: fadeAnim }} className="absolute inset-0 items-center justify-center z-20 pb-12">
              <Logo size="md" />
            </Animated.View>
          </View>

          <View className="px-6 -mt-16 z-10 w-full max-w-[480px] mx-auto">

            {/* Registration Form Panel */}
            <View className="bg-[#030F1A] border border-[#0c3150] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <View className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#06b6d4] rounded-tl-3xl opacity-50" />
              <View className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#06b6d4] rounded-br-3xl opacity-50" />

              <View className="mb-6">
                <Text className="text-2xl font-bold text-white tracking-tight">Create Account</Text>
                <Text className="text-sm text-slate-400 mt-1">Join the OceanExotic fleet today</Text>
              </View>

              <View className="space-y-4">
                
                {/* Full Name */}
                <View className="border border-[#1a3852] bg-[#020912] rounded-xl flex-row items-center px-4 h-14">
                  <Ionicons name="person-outline" size={20} color="#06b6d4" />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Full Name"
                    placeholderTextColor="#475569"
                    autoCapitalize="words"
                    className="flex-1 ml-3 text-white text-[13px] h-full"
                  />
                </View>

                {/* Mobile Number */}
                <View className="border border-[#1a3852] bg-[#020912] rounded-xl flex-row items-center px-4 h-14">
                  <Ionicons name="call-outline" size={20} color="#06b6d4" />
                  <TextInput
                    value={mobile}
                    onChangeText={setMobile}
                    placeholder="Mobile Number (+91...)"
                    placeholderTextColor="#475569"
                    keyboardType="phone-pad"
                    className="flex-1 ml-3 text-white text-[13px] h-full"
                  />
                </View>

                {/* Email Address */}
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

                {/* Password */}
                <View className="border border-[#1a3852] bg-[#020912] rounded-xl flex-row items-center px-4 h-14">
                  <Ionicons name="lock-closed-outline" size={20} color="#06b6d4" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor="#475569"
                    secureTextEntry={!showPassword}
                    className="flex-1 ml-3 text-white text-[13px] h-full"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2">
                    {showPassword ? <Ionicons name="eye-off-outline" size={16} color="#64748b" /> : <Ionicons name="eye-outline" size={16} color="#64748b" />}
                  </Pressable>
                </View>

                {/* Confirm Password */}
                <View className="border border-[#1a3852] bg-[#020912] rounded-xl flex-row items-center px-4 h-14">
                  <Ionicons name="lock-closed-outline" size={20} color="#06b6d4" />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm Password"
                    placeholderTextColor="#475569"
                    secureTextEntry={!showConfirmPassword}
                    className="flex-1 ml-3 text-white text-[13px] h-full"
                  />
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-2">
                    {showConfirmPassword ? <Ionicons name="eye-off-outline" size={16} color="#64748b" /> : <Ionicons name="eye-outline" size={16} color="#64748b" />}
                  </Pressable>
                </View>

                {/* Referral Code */}
                <View className="border border-[#1a3852] bg-[#020912] rounded-xl flex-row items-center px-4 h-14">
                  <Ionicons name="pricetag-outline" size={20} color="#06b6d4" />
                  <TextInput
                    value={referral}
                    onChangeText={setReferral}
                    placeholder="Referral Code (Optional)"
                    placeholderTextColor="#475569"
                    autoCapitalize="characters"
                    className="flex-1 ml-3 text-white text-[13px] h-full"
                  />
                </View>

                {errorMsg ? (
                  <Text className="text-center text-[10px] font-bold text-red-400">{errorMsg}</Text>
                ) : null}

                {/* Register Button */}
                <Pressable
                  disabled={isLoading || isSubmitDisabled}
                  onPress={handleRegister}
                  className={`mt-4 rounded-xl h-14 items-center justify-center shadow-lg overflow-hidden ${
                    isSubmitDisabled ? "opacity-50" : "opacity-100"
                  }`}
                >
                  <LinearGradient 
                    colors={["#ef4444", "#dc2626"]} 
                    className="absolute inset-0"
                  />
                  <Text className="text-white font-bold text-[14px] uppercase tracking-widest">
                    {isLoading ? "Creating..." : "Register"}
                  </Text>
                </Pressable>

                <Text className="text-center text-[12px] text-slate-400 mt-4">
                  Already have an account?{" "}
                  <Link href={"/login" as never} asChild>
                    <Pressable><Text className="font-bold text-[#06b6d4]">Login</Text></Pressable>
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
