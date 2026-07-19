/**
 * useGoogleAuth.ts
 *
 * ARCHITECTURE:
 *
 * PATH A — Standalone APK / AAB (production build or custom dev client):
 *   @react-native-google-signin/google-signin is natively linked.
 *   → Shows the native Android Google Account picker sheet directly inside the app.
 *   → No browser opens at all.
 *
 * PATH B — Expo Go (development):
 *   The native Google Sign-In module is NOT available in stock Expo Go.
 *   → We use expo-auth-session with the Expo auth proxy (https://auth.expo.io).
 *   → This opens an IN-APP Chrome Custom Tab (NOT the full external Chrome browser).
 *   → After Google login, it redirects back to the app via the app scheme automatically.
 *
 * WHY the old code opened the external browser:
 *   Linking.createURL() in Expo Go returns exp://... URLs.
 *   Android cannot register exp:// as a Custom Tab intent scheme, so it
 *   falls back to opening full Chrome. The fix is to use AuthSession with
 *   the official Expo proxy which handles this correctly.
 */

import { useState } from 'react';
import { Platform } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';
import { setAuthToken, setAuthUser } from '@/lib/storage';
import { toAuthUser, getPostLoginRoute } from '@/lib/auth/roles';
import { FULL_API_URL } from '@/config/api';

// Required to close the in-app browser when the redirect URI fires
WebBrowser.maybeCompleteAuthSession();

const SUPABASE_URL = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1OTY4NzQsImV4cCI6MjA5NjE3Mjg3NH0.hZ1WiT_8CX4O85mWVhtpFLrGxCGSSTPL1sS-Q6z5L9g';
const WEB_CLIENT_ID = '843916088941-9kbsr70p54u5ob8spu816grl17bq3enq.apps.googleusercontent.com';

// Try to load the native module — it will be null in Expo Go
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
    console.log('[GoogleAuth] Expo Go detected — using AuthSession fallback');
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
  if (!res.data?.success) throw new Error(res.data?.message || 'Failed to sync OAuth user with backend');
  return res.data;
}

async function completeAuthFlow(
  supabaseToken: string,
  login: (user: any) => void,
  router: any,
  toast: any
) {
  const { token, user } = await syncOAuthUser(supabaseToken);
  const authUser = toAuthUser(user);
  await setAuthToken(token);
  await setAuthUser(authUser);
  login(authUser);
  toast(`Welcome, ${authUser.name}! 👋`, 'success');
  router.replace(getPostLoginRoute(authUser.role) as never);
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
      // ── PATH A: Native Google Account Picker (Production APK / Custom Dev Client) ──
      // Shows the native Google account selection sheet directly inside the app.
      // No browser or Custom Tab is opened.
      if (GoogleSignin) {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn();

        if (response.type === 'cancelled') {
          toast('Sign in was cancelled.', 'error');
          return;
        }

        if (response.type === 'success' && response.data?.idToken) {
          const supabaseToken = await exchangeIdTokenWithSupabase(response.data.idToken);
          await completeAuthFlow(supabaseToken, login, router, toast);
          return;
        }

        toast('Could not get Google credentials. Please try again.', 'error');
        return;
      }

      // ── PATH B: Expo AuthSession (Expo Go / Environments without native module) ──
      // Uses expo-auth-session which handles the in-app Chrome Custom Tab correctly
      // via the Expo auth proxy. This does NOT open the external Chrome browser.
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'oceanexotic',
        path: 'oauth-callback',
      });

      const discovery = {
        authorizationEndpoint: `${SUPABASE_URL}/auth/v1/authorize`,
      };

      const authRequest = new AuthSession.AuthRequest({
        clientId: 'supabase',
        responseType: AuthSession.ResponseType.Token,
        redirectUri,
        scopes: ['openid', 'profile', 'email'],
        extraParams: {
          provider: 'google',
        },
      });

      const result = await authRequest.promptAsync(discovery, {
        createTask: false,
        preferEphemeralSession: true,
      });

      if (result.type === 'cancel' || result.type === 'dismiss') {
        toast('Sign in was cancelled.', 'error');
        return;
      }

      if (result.type === 'success') {
        // AuthSession passes the token back through params or hash
        const accessToken =
          result.params?.access_token ||
          (result.authentication as any)?.accessToken;

        if (accessToken) {
          await completeAuthFlow(accessToken, login, router, toast);
          return;
        }
      }

      // Last resort: parse url directly if available
      if (result.type === 'error') {
        const msg = result.error?.message || 'Google Sign-In failed.';
        toast(msg, 'error');
      } else {
        toast('Could not complete Google Sign-In. Please try again.', 'error');
      }

    } catch (err: any) {
      console.error('[GoogleAuth] Error:', err);

      if (err.code === statusCodes?.SIGN_IN_CANCELLED) {
        toast('Sign in was cancelled.', 'error');
      } else if (err.code === statusCodes?.IN_PROGRESS) {
        toast('Sign in already in progress.', 'error');
      } else if (err.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        toast('Google Play Services not available on this device.', 'error');
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
