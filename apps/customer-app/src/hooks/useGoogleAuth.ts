import { Platform, Alert } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';
import { setAuthToken, setAuthUser } from '@/lib/storage';
import { toAuthUser, getPostLoginRoute } from '@/lib/auth/roles';
import { FULL_API_URL } from '@/config/api';

// Configure Google Sign-In globally with the correct Web Client ID
GoogleSignin.configure({
  webClientId: '843916088941-cn34sa328ckaf2g3vu6r8gv40qkb18oi.apps.googleusercontent.com',
  offlineAccess: true,
});

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
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      
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
        // Handle noSavedCredentialFound or other types natively so we can debug!
        Alert.alert("Google Sign In", `Response returned: ${response.type}`);
      }
    } catch (err: any) {
      console.error("Google login failed:", err);
      // Natively pop up the EXACT string error code Google returned to help debug
      const responseError = err.response?.data ? JSON.stringify(err.response.data) : null;
      const exactError = responseError || (err.code ? `Code: ${err.code}` : err.message);
      Alert.alert("Google Error", `Details: ${exactError}`);
      
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        toast("Login cancelled", "error");
      } else if (err.code === statusCodes.IN_PROGRESS) {
        toast("Login already in progress", "error");
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        toast("Play services not available or outdated", "error");
      } else {
        toast("Google login failed. Try again.", "error");
      }
    }
  };

  return { handleGoogleSignIn };
}
