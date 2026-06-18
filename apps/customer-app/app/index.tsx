import { useEffect, useState } from"react";
import { View, Text, ActivityIndicator, Pressable, Platform } from"react-native";
import { useRouter } from"expo-router";
import { Image } from"expo-image";
import { LinearGradient } from"expo-linear-gradient";
import { useAuthStore } from"@/store/authStore";
import { getPostLoginRoute, toAuthUser } from"@/lib/auth/roles";
import { Logo } from"@/components/ui/Logo";
import { Button } from"@/components/ui/Button";
import { useToast } from"@/components/ui/Toast";
import { useLogin } from"@/hooks/useLogin";
import { useThemeColors } from"@/hooks/useThemeColors";
import { LanguageSelector } from"@/components/LanguageSelector";
import Svg, { Path } from"react-native-svg";
import * as WebBrowser from"expo-web-browser";
import * as Linking from"expo-linking";
import { setAuthToken, setAuthUser } from"@/lib/storage";
import { useTranslation } from"@/lib/i18n";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import axios from 'axios';

WebBrowser.maybeCompleteAuthSession();

GoogleSignin.configure({
 webClientId: '863954093381-1hli8gae6lmjh6g2nsrr711fddtcb316.apps.googleusercontent.com',
 offlineAccess: true,
});
const BG_IMAGE ="https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=2000";

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
 const { t } = useTranslation();
 const [isGuestAuthenticating, setIsGuestAuthenticating] = useState(false);
 const [forceShow, setForceShow] = useState(false);

 useEffect(() => {
 WebBrowser.warmUpAsync();
 return () => {
 WebBrowser.coolDownAsync();
 };
 }, []);

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
 toast("Logging in as Guest...","success");
 try {
 const result = await loginMutation.mutateAsync({
 email:"john@gmail.com",
 password:"ocean123",
 });

 if (result.success && result.user && result.token) {
 const authUser = toAuthUser(result.user);
 login(authUser);
 const destination = getPostLoginRoute(authUser.role);
 toast(`Welcome, Guest!`,"success");
 setTimeout(() => {
 router.replace(destination as never);
 }, 100);
 } else {
 toast(result.message ||"Failed to sign in as guest.","error");
 }
 } catch (err) {
 toast("Unable to connect. Please check your internet connection.","error");
 } finally {
 setIsGuestAuthenticating(false);
 }
 };

 const handleGoogleSignIn = async () => {
 if (Platform.OS === 'web') {
 toast("Native Google Sign-In is active. Use the web app for web login.","error");
 return;
 }
 
 try {
 await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
 const response = await GoogleSignin.signIn();
 
 if (response.type === 'success' && response.data?.idToken) {
 const idToken = response.data.idToken;
 const SUPABASE_URL ="https://kyqmhibffbwoqlpdplfu.supabase.co";
 // IMPORTANT: Use the PUBLIC anon key here — not service_role. 
 const SUPABASE_ANON_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1OTY4NzQsImV4cCI6MjA5NjE3Mjg3NH0.h4n0LxfWBRbEwrLKFxoUGJYmylLHVGVH3TWKOH7E-M4";

 // Exchange Google ID token for Supabase Session natively
 const sbResponse = await axios.post(
 `${SUPABASE_URL}/auth/v1/token?grant_type=id_token`,
 {
 provider:"google",
 id_token: idToken,
 },
 {
 headers: {"apikey": SUPABASE_ANON_KEY,"Content-Type":"application/json",
 },
 }
 );

 const supabaseToken = sbResponse.data.access_token;
 
 if (supabaseToken) {
 // Sync with Next.js backend — use live domain for production
 const apiBase ="https://oceanexotic.com/api";
 const syncResponse = await axios.post(`${apiBase}/auth/sync-oauth`, {
 access_token: supabaseToken
 });
 
 if (syncResponse.data.success) {
 const { token, user } = syncResponse.data;
 const authUser = toAuthUser(user);
 await setAuthToken(token);
 await setAuthUser(authUser);
 login(authUser);
 router.replace("/home");
 toast(`Welcome back, ${authUser.name}!`,"success");
 } else {
 throw new Error(syncResponse.data.message ||"Failed to sync OAuth user");
 }
 }
 } else if (response.type === 'cancelled') {
 toast("Login cancelled","error");
 }
 } catch (err: any) {
 console.error("Google login failed:", err);
 if (err.code === statusCodes.SIGN_IN_CANCELLED) {
 toast("Login cancelled","error");
 } else if (err.code === statusCodes.IN_PROGRESS) {
 toast("Login already in progress","error");
 } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
 toast("Play services not available or outdated","error");
 } else {
 toast("Google login failed. Try again.","error");
 }
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
 <LinearGradient colors={["rgba(2,6,23,0.3)","#020617","#020617"]} className="absolute inset-0" />

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
 <View className="-[32px] border border-white/10 bg-white/5 p-1 max-w-[340px]">
 <View className="-[30px] bg-[#020617]/90 px-6 py-8 items-center border border-white/5 shadow-2xl">
 <Text className="text-[36px] font-black italic text-center tracking-tight text-white leading-none">
 {t('harbor_sync') ||"HARBOR SYNC"}
 </Text>
 <Text className="mt-3 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: colors.primary }}>
 {t('vibrant_port_blair_fish_exchange') ||"Vibrant Port Blair Fish Exchange"}
 </Text>
 <Text className="mt-4 text-[11px] text-slate-400 font-medium text-center leading-relaxed">
 {t('connect_directly_with_fleets') ||"Connect directly with the active fishing fleets of Andaman. Fresh catches delivered straight from source to table within hours of berthing."}
 </Text>
 </View>
 </View>
 </View>

 {/* Buttons / Actions */}
 <View className="gap-4 w-full max-w-[400px] mx-auto">
 {/* Google Auth Button */}
 <Pressable 
 onPress={handleGoogleSignIn}
 className="w-full h-14 bg-white flex-row items-center justify-center gap-3 shadow-lg active:opacity-80"
 >
 <GoogleIcon />
 <Text className="text-[#020617] font-black text-[12px] uppercase tracking-widest">
 {t('continue_with_google') ||"Continue with Google"}
 </Text>
 </Pressable>

 {/* Email Login */}
 <Button
 label={t('continue_with_email') ||"CONTINUE WITH EMAIL"}
 onPress={() => router.push("/login")}
 style={{ backgroundColor:"rgba(255,255,255,0.1)", borderColor:"rgba(255,255,255,0.2)", borderWidth: 1 }}
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
 {t('explore_as_guest') ||"EXPLORE AS GUEST"}
 </Text>
 )}
 </Pressable>
 </View>
 </View>

 {ToastHost}
 </View>
 );
}
