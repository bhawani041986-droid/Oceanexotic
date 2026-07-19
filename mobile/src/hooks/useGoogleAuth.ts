/**
 * useGoogleAuth.ts
 *
 * PATH A — Standalone APK / Custom Dev Client:
 *   @react-native-google-signin is natively linked.
 *   → Native Android Google Account picker. No browser opens at all.
 *
 * PATH B — Expo Go (development only):
 *   Native module is not available.
 *   → We build a correct Supabase OAuth URL and open it with
 *     WebBrowser.openAuthSessionAsync which uses an in-app Chrome Custom Tab.
 *   → IMPORTANT: We DO NOT use AuthSession.AuthRequest because it
 *     injects wrong OAuth2 PKCE params (clientId="supabase") that
 *     cause Google's 400 "malformed request" error.
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

// Required — closes the in-app browser when our redirect URI fires
WebBrowser.maybeCompleteAuthSession();

const SUPABASE_URL = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1OTY4NzQsImV4cCI6MjA5NjE3Mjg3NH0.hZ1WiT_8CX4O85mWVhtpFLrGxCGSSTPL1sS-Q6z5L9g';

// Try to load the native Google Sign-In module — null in Expo Go
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
    console.log('[GoogleAuth] Native Google Sign-In module loaded ✓');
  } catch {
    console.log('[GoogleAuth] Expo Go — will use in-app browser tab fallback');
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
  if (!res.data?.success) throw new Error(res.data?.message || 'Failed to sync OAuth user');
  return res.data;
}

export function useGoogleAuth() {
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (Platform.OS === 'web') {
      toast('Please use the website for browser sign-in.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // ── PATH A: Native Google Account Picker (Production APK / Custom Dev Client) ──
      // Shows the native Android/iOS Google account selection sheet inside the app.
      // Absolutely no browser opens.
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

      // ── PATH B: In-App Chrome Custom Tab (Expo Go fallback) ──
      // 
      // KEY: We build the Supabase OAuth URL manually.
      // We do NOT use AuthSession.AuthRequest because it adds OAuth2 PKCE
      // parameters (clientId, code_challenge, etc.) that Supabase forwards
      // to Google verbatim — causing Google's 400 "malformed request" error.
      //
      // The correct Supabase OAuth format is simply:
      //   /auth/v1/authorize?provider=google&redirect_to=APP_REDIRECT_URI
      // Supabase then handles Google's OAuth internally with its own client ID.

      // Build the redirect URI using the app's registered scheme
      const redirectUri = Linking.createURL('oauth-callback');

      // Correct Supabase OAuth URL format — no extra PKCE params
      const authUrl =
        `${SUPABASE_URL}/auth/v1/authorize` +
        `?provider=google` +
        `&redirect_to=${encodeURIComponent(redirectUri)}` +
        `&skip_http_redirect=true`;

      console.log('[GoogleAuth] Opening Supabase OAuth URL:', authUrl);
      console.log('[GoogleAuth] Redirect URI:', redirectUri);

      // openAuthSessionAsync opens a Chrome Custom Tab (in-app modal, not external Chrome)
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri, {
        showInRecents: false,
        createTask: false,          // Android: same task, not a new Chrome window
        preferEphemeralSession: true,
      });

      console.log('[GoogleAuth] WebBrowser result:', result.type);

      if (result.type === 'cancel' || result.type === 'dismiss') {
        toast('Sign in was cancelled.', 'error');
        return;
      }

      if (result.type === 'success' && result.url) {
        console.log('[GoogleAuth] Redirect URL received:', result.url);

        // Supabase returns the access_token in the URL fragment (#access_token=...)
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

        toast('Could not retrieve sign-in token. Please try again.', 'error');
        return;
      }

      toast('Google sign in did not complete. Please try again.', 'error');

    } catch (err: any) {
      console.error('[GoogleAuth] Error:', err);

      if (err.code === statusCodes?.SIGN_IN_CANCELLED) {
        toast('Sign in was cancelled.', 'error');
      } else if (err.code === statusCodes?.IN_PROGRESS) {
        toast('Sign in already in progress.', 'error');
      } else if (err.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        toast('Google Play Services is not available on this device.', 'error');
      } else {
        const message =
          err.response?.data?.message ||
          err.message ||
          'Google sign in failed. Please try again.';
        toast(message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { handleGoogleSignIn, isGoogleLoading: isLoading };
}
