import { useState } from 'react';
import { Platform, Alert } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';
import { setAuthToken, setAuthUser } from '@/lib/storage';
import { toAuthUser, getPostLoginRoute } from '@/lib/auth/roles';
import { FULL_API_URL } from '@/config/api';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

// Needed for the in-app browser session to close cleanly after OAuth redirect
WebBrowser.maybeCompleteAuthSession();

// Detect if we are running inside Expo Go (store client)
// executionEnvironment === 'storeClient' means Expo Go
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Lazily load the native module only on real builds — avoids crash in Expo Go
let GoogleSignin: any = null;
let statusCodes: any = {};

if (!isExpoGo && Platform.OS !== 'web') {
  try {
    const mod = require('@react-native-google-signin/google-signin');
    GoogleSignin = mod.GoogleSignin;
    statusCodes = mod.statusCodes ?? {};

    GoogleSignin.configure({
      // Replace with your actual web client ID from Google Cloud Console
      webClientId: '843916088941-9kbsr70p54u5ob8spu816grl17bq3enq.apps.googleusercontent.com',
      offlineAccess: true,
    });
  } catch (e) {
    console.warn('[GoogleAuth] Native module not available:', e);
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
      // ── PATH A: Native Google Sign-In (Production APK / AAB) ──────────────
      if (!isExpoGo && GoogleSignin) {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn();

        if (response.type === 'cancelled') {
          toast('Sign in was cancelled.', 'error');
          return;
        }

        if (response.type !== 'success' || !response.data?.idToken) {
          toast('Could not get Google credentials. Please try again.', 'error');
          return;
        }

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

      // ── PATH B: Expo Go fallback — in-app browser session ─────────────────
      // This path only runs inside Expo Go during development testing.
      // The in-app WebBrowser session stays INSIDE the app — it does NOT open
      // the system browser. When auth completes, the redirect URL brings the
      // user back to the oauth-callback screen automatically.
      const redirectUrl = Linking.createURL('oauth-callback');
      const proxyUrl = `https://oceanexotic.com/mobile-auth?expoUrl=${encodeURIComponent(redirectUrl)}`;
      const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(proxyUrl)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl, {
        showInRecents: false,
        createTask: false,          // Android: keeps session in same task, no new tab
        preferEphemeralSession: true, // iOS: no cookie carryover, cleaner UX
      });

      if (result.type === 'cancel' || result.type === 'dismiss') {
        toast('Sign in was cancelled.', 'error');
        return;
      }

      if (result.type !== 'success' || !result.url) {
        toast('Something went wrong during sign in. Please try again.', 'error');
        return;
      }

      // Parse access_token from the hash fragment in the redirect URL
      const hashIndex = result.url.indexOf('#');
      if (hashIndex === -1) {
        toast('Invalid response from Google. Please try again.', 'error');
        return;
      }

      const params = new URLSearchParams(result.url.substring(hashIndex + 1));
      const accessToken = params.get('access_token');

      if (!accessToken) {
        toast('Could not retrieve your sign-in token. Please try again.', 'error');
        return;
      }

      const { token, user } = await syncOAuthUser(accessToken);
      const authUser = toAuthUser(user);
      await setAuthToken(token);
      await setAuthUser(authUser);
      login(authUser);

      toast(`Welcome, ${authUser.name}! 👋`, 'success');
      router.replace(getPostLoginRoute(authUser.role) as never);

    } catch (err: any) {
      console.error('[GoogleAuth] Error:', err);

      // Handle known native error codes gracefully
      if (err.code === statusCodes?.SIGN_IN_CANCELLED) {
        toast('Sign in was cancelled.', 'error');
      } else if (err.code === statusCodes?.IN_PROGRESS) {
        toast('A sign in is already in progress. Please wait.', 'error');
      } else if (err.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        toast('Google Play Services is not available on this device.', 'error');
      } else {
        // Show a clean human-readable message — no raw JSON alerts
        const message = err.response?.data?.message || err.message || 'Google sign in failed. Please try again.';
        toast(message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { handleGoogleSignIn, isGoogleLoading: isLoading };
}
