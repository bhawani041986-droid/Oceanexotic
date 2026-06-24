import { Platform, Alert } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';
import { setAuthToken, setAuthUser } from '@/lib/storage';
import { toAuthUser, getPostLoginRoute } from '@/lib/auth/roles';
import { FULL_API_URL } from '@/config/api';
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import Constants, { ExecutionEnvironment } from "expo-constants";

WebBrowser.maybeCompleteAuthSession();

// Conditionally require GoogleSignin so Expo Go does not crash
let GoogleSigninNative: any = null;
let NativeStatusCodes: any = {};
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (!isExpoGo && Platform.OS !== "web") {
  try {
    const GoogleAuthModule = require("@react-native-google-signin/google-signin");
    GoogleSigninNative = GoogleAuthModule.GoogleSignin;
    NativeStatusCodes = GoogleAuthModule.statusCodes || {};
    
    GoogleSigninNative.configure({
      webClientId: '843916088941-9kbsr70p54u5ob8spu816grl17bq3enq.apps.googleusercontent.com',
      offlineAccess: true,
    });
  } catch (err) {
    console.warn("Failed to initialize GoogleSignin:", err);
  }
}

export function useGoogleAuth() {
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAuthStore();

  const handleGoogleSignIn = async () => {
    if (Platform.OS === 'web') {
      toast("Native Google Sign-In is active. Use the web app for web login.", "error");
      return;
    }
    
    try {
      if (isExpoGo || !GoogleSigninNative) {
        // EXPO GO FALLBACK
        const redirectUrl = Linking.createURL("oauth-callback");
        const proxyUrl = `https://oceanexotic.com/mobile-auth?expoUrl=${encodeURIComponent(redirectUrl)}`;
        const authUrl = `https://kyqmhibffbwoqlpdplfu.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(proxyUrl)}`;
        
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
        
        if (result.type === "success" && result.url) {
          const hashIndex = result.url.indexOf('#');
          if (hashIndex !== -1) {
            const hash = result.url.substring(hashIndex + 1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            
            if (accessToken) {
              const syncResponse = await axios.post(`${FULL_API_URL}/auth/sync-oauth`, { access_token: accessToken });
              if (syncResponse.data.success) {
                const { token, user } = syncResponse.data;
                const authUser = toAuthUser(user);
                await setAuthToken(token);
                await setAuthUser(authUser);
                login(authUser);
                router.replace(getPostLoginRoute(authUser.role) as never);
                toast(`Welcome back, ${authUser.name}!`, "success");
              } else {
                toast(syncResponse.data.message || "Failed to sync OAuth token.", "error");
              }
            }
          }
        } else if (result.type === 'cancel' || result.type === 'dismiss') {
          toast("Login cancelled", "error");
        }
        return;
      }

      // TRUE NATIVE FLOW
      await GoogleSigninNative.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSigninNative.signIn();
      
      if (response.type === 'success' && response.data?.idToken) {
        const idToken = response.data.idToken;
        const SUPABASE_URL = "https://kyqmhibffbwoqlpdplfu.supabase.co";
        const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs";

        const sbResponse = await axios.post(
          `${SUPABASE_URL}/auth/v1/token?grant_type=id_token`,
          {
            provider: "google",
            id_token: idToken,
          },
          {
            headers: { 
              "apikey": SUPABASE_ANON_KEY,
              "Content-Type": "application/json",
            },
          }
        );

        const supabaseToken = sbResponse.data.access_token;
        
        if (supabaseToken) {
          const syncResponse = await axios.post(`${FULL_API_URL}/auth/sync-oauth`, {
            access_token: supabaseToken
          });
          
          if (syncResponse.data.success) {
            const { token, user } = syncResponse.data;
            const authUser = toAuthUser(user);
            await setAuthToken(token);
            await setAuthUser(authUser);
            login(authUser);
            
            const destination = getPostLoginRoute(authUser.role);
            router.replace(destination as never);
            toast(`Welcome back, ${authUser.name}!`, "success");
          } else {
            throw new Error(syncResponse.data.message || "Failed to sync OAuth user");
          }
        }
      } else if (response.type === 'cancelled') {
        toast("Login cancelled", "error");
      } else {
        Alert.alert("Google Sign In", `Response returned: ${response.type}`);
      }
    } catch (err: any) {
      console.error("Google login failed:", err);
      const responseError = err.response?.data ? JSON.stringify(err.response.data) : null;
      const exactError = responseError || (err.code ? `Code: ${err.code}` : err.message);
      Alert.alert("Google Error", `Details: ${exactError}`);
      
      if (err.code === NativeStatusCodes.SIGN_IN_CANCELLED) {
        toast("Login cancelled", "error");
      } else if (err.code === NativeStatusCodes.IN_PROGRESS) {
        toast("Login already in progress", "error");
      } else if (err.code === NativeStatusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        toast("Play services not available or outdated", "error");
      } else {
        toast("Google login failed. Try again.", "error");
      }
    }
  };

  return { handleGoogleSignIn };
}
