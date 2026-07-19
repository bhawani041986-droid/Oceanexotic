import { useState } from 'react';
import { Platform } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';
import { setAuthToken, setAuthUser } from '@/lib/storage';
import { toAuthUser, getPostLoginRoute } from '@/lib/auth/roles';
import { FULL_API_URL } from '@/config/api';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Complete auth session handling for in-app browser modals
WebBrowser.maybeCompleteAuthSession();

// Try initializing the native Google Sign-In module
let GoogleSignin: any = null;
let statusCodes: any = {};

if (Platform.OS !== 'web') {
  try {
    const mod = require('@react-native-google-signin/google-signin');
    GoogleSignin = mod.GoogleSignin;
    statusCodes = mod.statusCodes ?? {};

    GoogleSignin.configure({
      webClientId: '843916088941-9kbsr70p54u5ob8spu816grl17bq3enq.apps.googleusercontent.com',
      offlineAccess: true,
    });
  } catch (e) {
    console.log('[GoogleAuth] Native Google Sign-In module not present (Expo Go mode)');
  }
}

const SUPABASE_URL = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1OTY4NzQsImV4cCI6MjA5NjE3Mjg3NH0.hZ1WiT_8CX4O85mWVhtpFLrGxCGSSTPL1sS-Q6z5L9g';

async function exchangeIdTokenWithSupabase(idToken: string): Promise<string> {
  const res = await axios.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=id_token`,
    { provider: 'google', id_token: idToken },
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
  const token = res.data?.access_token;
  if (!token) throw new Error('No access_token returned from Supabase');
  return token;
}

async function syncOAuthUser(supabaseToken: string) {
  const res = await axios.post(`${FULL_API_URL}/auth/sync-oauth`, {
    access_token: supabaseToken,
  });
  if (!res.data?.success) {
    throw new Error(res.data?.message || 'Failed to sync OAuth user with backend');
  }
  return res.data;
}

export function useGoogleAuth() {
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (Platform.OS === 'web') {
      toast('Please use the web app for browser login.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // ── PATH 1: NATIVE GOOGLE ACCOUNT PICKER (Standalone APK / Custom Dev Client) ──
      if (GoogleSignin) {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn();

        if (response.type === 'cancelled') {
          toast('Sign in was cancelled.', 'error');
          return;
        }

        if (response.type === 'success' && response.data?.idToken) {
          const supabaseToken = await exchangeIdTokenWithSupabase(response.data.idToken);
          const { token, user } = await syncOAuthUser(supabaseToken);

          const authUser = toAuthUser(user);
          await setAuthToken(token);
          await setAuthUser(authUser);
          login(authUser);

          toast(`Welcome, ${authUser.name}! 👋`, 'success');
          router.replace(getPostLoginRoute(authUser.role) as never);
          return;
        }
      }

      // ── PATH 2: IN-APP BROWSER MODAL (Expo Go Fallback) ──
      // Uses openAuthSessionAsync which opens an IN-APP MODAL inside the app (not external Chrome/Safari)
      const redirectUrl = Linking.createURL('oauth-callback');
      const proxyUrl = `https://oceanexotic.com/mobile-auth?expoUrl=${encodeURIComponent(redirectUrl)}`;
      const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(proxyUrl)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl, {
        showInRecents: false,
        createTask: false,
        preferEphemeralSession: true,
      });

      if (result.type === 'cancel' || result.type === 'dismiss') {
        toast('Sign in was cancelled.', 'error');
        return;
      }

      if (result.type === 'success' && result.url) {
        const hashIndex = result.url.indexOf('#');
        if (hashIndex !== -1) {
          const params = new URLSearchParams(result.url.substring(hashIndex + 1));
          const accessToken = params.get('access_token');

          if (accessToken) {
            const { token, user } = await syncOAuthUser(accessToken);
            const authUser = toAuthUser(user);
            await setAuthToken(token);
            await setAuthUser(authUser);
            login(authUser);

            toast(`Welcome, ${authUser.name}! 👋`, 'success');
            router.replace(getPostLoginRoute(authUser.role) as never);
            return;
          }
        }
      }

      toast('Could not complete Google Sign-In. Please try again.', 'error');

    } catch (err: any) {
      console.error('[GoogleAuth] Error:', err);

      if (err.code === statusCodes?.SIGN_IN_CANCELLED) {
        toast('Sign in was cancelled.', 'error');
      } else if (err.code === statusCodes?.IN_PROGRESS) {
        toast('Sign in already in progress.', 'error');
      } else if (err.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        toast('Google Play Services not available.', 'error');
      } else {
        const message = err.response?.data?.message || err.message || 'Google sign in failed. Please try again.';
        toast(message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { handleGoogleSignIn, isGoogleLoading: isLoading };
}
