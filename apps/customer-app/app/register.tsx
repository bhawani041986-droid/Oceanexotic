import { useState } from"react";
import axios from"axios";
import {
 View,
 Text,
 KeyboardAvoidingView,
 Platform,
 ScrollView,
 Pressable,
} from"react-native";
import { Image } from"expo-image";
import { LinearGradient } from"expo-linear-gradient";
import { useRouter } from"expo-router";
import { Input } from"@/components/ui/Input";
import { Button } from"@/components/ui/Button";
import { useToast } from"@/components/ui/Toast";
import { FULL_API_URL } from"@/config/api";
import { Logo } from"@/components/ui/Logo";
import { useTranslation } from"@/lib/i18n";
import { useThemeColors } from"@/hooks/useThemeColors";

const BG_IMAGE ="https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=2000";

export default function RegisterScreen() {
 const router = useRouter();
 const { toast, ToastHost } = useToast();
 const colors = useThemeColors();
 const { t } = useTranslation();

 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [isLoading, setIsLoading] = useState(false);
 const [errorMsg, setErrorMsg] = useState("");

 const handleRegister = async () => {
 setErrorMsg("");
 if (!name || !email || !password) {
 setErrorMsg("Please fill all fields");
 return;
 }

 setIsLoading(true);
 try {
 const response = await axios.post(`${FULL_API_URL}/auth/register.php`, {
 name,
 email,
 password,
 role:"CUSTOMER",
 });

 if (response.data.success) {
 toast("Registration successful! Please login.","success");
 setTimeout(() => {
 router.replace("/login");
 }, 1500);
 } else {
 setErrorMsg(response.data.message ||"Registration failed");
 }
 } catch (err: any) {
 let message ="Connection failed. Please check your internet connection.";
 if (axios.isAxiosError(err)) {
 if (err.response?.data?.message) {
 message = String(err.response.data.message);
 } else if (err.code ==="ERR_NETWORK") {
 message = `Cannot reach API at ${FULL_API_URL}. Ensure PC and phone are on same network.`;
 }
 }
 setErrorMsg(message);
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <View className="relative flex-1 bg-background">
 <Image source={{ uri: BG_IMAGE }} className="absolute inset-0 h-full w-full opacity-20" contentFit="cover" />
 <LinearGradient colors={["rgba(2,6,23,0.3)","#020617","#020617"]} className="absolute inset-0" />

 <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={Platform.OS ==="android" ? 24 : 0} className="flex-1">
 <ScrollView contentContainerClassName="flex-grow px-6 py-12" keyboardShouldPersistTaps="handled" bounces={false}>
 <View className="mx-auto w-full max-w-[400px] mt-auto mb-auto">
 <View className="mb-10 items-center space-y-4">
 <View className="items-center">
 <Logo size="md" />
 </View>
 <View className="items-center gap-1 mt-4">
 <Text className="text-2xl font-black tracking-tight text-white text-center">
 CREATE ACCOUNT
 </Text>
 <Text className="text-[11px] font-medium text-slate-400 text-center mt-1 px-4 leading-relaxed">
 Join the OceanExotic fleet today.
 </Text>
 </View>
 </View>

 <View className="bg-white/5 border border-white/10 p-6 space-y-4">
 <View>
 <Text className="text-[10px] font-black uppercase tracking-widest text-white mb-2 ml-1">Full Name</Text>
 <Input
 value={name}
 onChangeText={setName}
 placeholder="John Doe"
 autoCapitalize="words"
 />
 </View>
 
 <View>
 <Text className="text-[10px] font-black uppercase tracking-widest text-white mb-2 ml-1">Email Address</Text>
 <Input
 value={email}
 onChangeText={setEmail}
 placeholder="john@example.com"
 keyboardType="email-address"
 autoCapitalize="none"
 />
 </View>

 <View>
 <Text className="text-[10px] font-black uppercase tracking-widest text-white mb-2 ml-1">Password</Text>
 <Input
 value={password}
 onChangeText={setPassword}
 placeholder="Min 6 characters"
 isPassword
 />
 </View>

 {errorMsg ? (
 <Text className="text-center text-[10px] font-bold text-red-400">{errorMsg}</Text>
 ) : null}

 <Button
 label={isLoading ?"CREATING..." :"REGISTER ACCOUNT"}
 loading={isLoading}
 onPress={handleRegister}
 className="mt-4"
 />

 <Pressable onPress={() => router.replace("/login")} className="mt-2 py-2 items-center">
 <Text className="text-[10px] font-bold text-white uppercase tracking-widest">
 ALREADY HAVE AN ACCOUNT? <Text className="text-primary">LOGIN</Text>
 </Text>
 </Pressable>
 </View>
 </View>
 </ScrollView>
 </KeyboardAvoidingView>
 {ToastHost}
 </View>
 );
}
