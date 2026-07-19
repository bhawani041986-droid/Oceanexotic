/**
 * useGoogleAuth.ts
 *
 * PATH A — Standalone APK / Custom Dev Client (NATIVE GOOGLE AUTH):
 *   Uses @react-native-google-signin/google-signin.
 *   → Opens native Android/iOS Google Account Picker bottom-sheet directly over the app.
 *   → NO browser window or external tab opens at all.
 *
 * PATH B — Expo Go (Development Fallback):
 *   Uses WebBrowser.openAuthSessionAsync with a clean Supabase OAuth URL.
 *   → Opens an in-app Chrome Custom Tab.
 *   → NO skip_http_redirect parameter is used (prevents ERR_QUIC_PROTOCOL_ERROR).
 */

import { useState } from 'react';
import { Platform } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';
import { setAuthToken, setAuthUser } from '@/lib/storage';
import { toAuthUser, getPostLoginRoute } from '@/lib/auth/roles';
import { FULL_API_URL } from '@/config/api';

// Required to complete auth session redirect in browser tabs
WebBrowser.maybeCompleteAuthSession();

const SUPABASE_URL = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1OTY4NzQsImV4cCI6MjA5NjE3Mjg3NH0.hZ1WiT_8CX4O85mWVhtpFLrGxCGSSTPL1sS-Q6z5L9g';
const WEB_CLIENT_ID = '843916088941-9kbsr70p54u5ob8spu816grl17bq3enq.apps.googleusercontent.com';

// Try loading native Google Sign-In module (available in standalone APK build)
let GoogleSignin: any = null;
let statusCodes: any = {};

if (Platform.OS !== 'web') {
  try {
    const mod = require('@react-native-google-signin/google-signin');
    GoogleSignin = mod.GoogleSignin;
    statusCodes = mod.statusCodes ?? {};
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: true,
    });
    console.log('[GoogleAuth] Native Google Sign-In module loaded ✓');
  } catch {
    console.log('[GoogleAuth] Native Google Sign-In unavailable in Expo Go — using in-app browser tab fallback');
  }
}

async function exchangeIdTokenWithSupabase(idToken: string): Promise<string> {
  const res = await axios.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=id_token`,
    { provider: 'google', id_token: idToken },
    { headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' } }
  );
  const token = res.data?.access_token;
  if (!token) throw new Error('No access_token returned from Supabase');
  return token;
}

async function syncOAuthUser(supabaseToken: string) {
  const res = await axios.post(`${FULL_API_URL}/auth/sync-oauth`, { access_token: supabaseToken });
  if (!res.data?.success) throw new Error(res.data?.message || 'Failed to sync OAuth user with server');
  return res.data;
}

export function useGoogleAuth() {
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (Platform.OS === 'web') {
      toast('Please sign in via the website.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // ── PATH A: Native Google Account Picker (Production APK) ──
      // Opens native Android/iOS account selector popup sheet inside the app.
      // Zero browser windows.
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

        toast('Could not get Google credentials. Please try again.', 'error');
        return;
      }

      // ── PATH B: In-App Browser Tab (Expo Go Fallback) ──
      // Build clean Supabase OAuth URL (WITHOUT skip_http_redirect=true)
      const redirectUri = Linking.createURL('oauth-callback');

      const authUrl =
        `${SUPABASE_URL}/auth/v1/authorize` +
        `?provider=google` +
        `&redirect_to=${encodeURIComponent(redirectUri)}`;

      console.log('[GoogleAuth] Opening OAuth session:', authUrl);

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri, {
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
        const queryIndex = result.url.indexOf('?');
        let accessToken: string | null = null;

        if (hashIndex !== -1) {
          const params = new URLSearchParams(result.url.substring(hashIndex + 1));
          accessToken = params.get('access_token');
        }
        if (!accessToken && queryIndex !== -1) {
          const params = new URLSearchParams(result.url.substring(queryIndex + 1));
          accessToken = params.get('access_token');
        }

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

        toast('Could not retrieve access token.', 'error');
        return;
      }

      toast('Google sign in did not complete.', 'error');

    } catch (err: any) {
      console.error('[GoogleAuth] Error:', err);

      if (err.code === statusCodes?.SIGN_IN_CANCELLED) {
        toast('Sign in was cancelled.', 'error');
      } else if (err.code === statusCodes?.IN_PROGRESS) {
        toast('Sign in already in progress.', 'error');
      } else if (err.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        toast('Google Play Services not available on this device.', 'error');
      } else {
        const message = err.response?.data?.message || err.message || 'Google sign in failed.';
        toast(message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { handleGoogleSignIn, isGoogleLoading: isLoading };
}
