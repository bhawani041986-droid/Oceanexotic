import { useState } from"react";
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
import { Logo } from"@/components/ui/Logo";

const BG_IMAGE ="https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=2000";

export default function ForgotPasswordScreen() {
 const router = useRouter();
 const { toast, ToastHost } = useToast();

 const [email, setEmail] = useState("");
 const [isLoading, setIsLoading] = useState(false);
 const [isSent, setIsSent] = useState(false);

 const handleReset = async () => {
 if (!email) {
 toast("Please enter your email","error");
 return;
 }

 setIsLoading(true);
 // Simulate API call
 setTimeout(() => {
 setIsLoading(false);
 setIsSent(true);
 toast("Reset link sent!","success");
 }, 1500);
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
 RESET PASSWORD
 </Text>
 <Text className="text-[11px] font-medium text-slate-400 text-center mt-1 px-4 leading-relaxed">
 Enter your registered email address to receive a password reset link.
 </Text>
 </View>
 </View>

 <View className="bg-white/5 border border-white/10 p-6 space-y-4">
 {!isSent ? (
 <>
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

 <Button
 label={isLoading ?"SENDING..." :"SEND RESET LINK"}
 loading={isLoading}
 onPress={handleReset}
 className="mt-4"
 />
 </>
 ) : (
 <View className="py-4 items-center">
 <Text className="text-sm font-bold text-emerald-400 text-center mb-4">
 ✓ Link sent to {email}
 </Text>
 <Text className="text-[11px] text-slate-400 text-center mb-6">
 Please check your inbox and follow the instructions to reset your password.
 </Text>
 <Button
 label="BACK TO LOGIN"
 onPress={() => router.replace("/login")}
 className="w-full"
 />
 </View>
 )}

 {!isSent && (
 <Pressable onPress={() => router.replace("/login")} className="mt-2 py-2 items-center">
 <Text className="text-[10px] font-bold text-white uppercase tracking-widest">
 REMEMBERED? <Text className="text-primary">LOGIN</Text>
 </Text>
 </Pressable>
 )}
 </View>
 </View>
 </ScrollView>
 </KeyboardAvoidingView>
 {ToastHost}
 </View>
 );
}
