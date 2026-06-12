import { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, Platform, BackHandler, Linking } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { useAuthStore } from "@/store/authStore";
import { getAuthToken, clearAuthStorage } from "@/lib/storage";
import { FULL_WEB_ADMIN_URL, FULL_PHP_BASE_URL } from "@/config/api";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useThemeColors } from "@/hooks/useThemeColors";
import Svg, { Path } from "react-native-svg";

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { path } = useLocalSearchParams<{ path?: string }>();
  const webViewRef = useRef<WebView>(null);
  const colors = useThemeColors();
  const { user, logout } = useAuthStore();
  
  const [token, setToken] = useState<string | null>(null);
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  const lastSyncedPathRef = useRef<string | null>(null);

  // Keep initial URL constant to prevent resetting WebView on state-triggered re-renders
  const [initialUrl] = useState(() => {
    const initialPath = path ? (path.startsWith("/") ? path : `/${path}`) : "/admin/dashboard";
    return `${FULL_WEB_ADMIN_URL}${initialPath}`;
  });

  // Retrieve JWT session token on mount
  useEffect(() => {
    getAuthToken()
      .then((t) => {
        setToken(t);
        setIsTokenLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to retrieve auth token", err);
        setIsTokenLoaded(true);
      });
  }, []);

  // Handle Android hardware back press to navigate back inside the WebView history
  useEffect(() => {
    const handleBackPress = () => {
      if (webViewRef.current && canGoBack) {
        webViewRef.current.goBack();
        return true; // prevent default behavior (exiting the screen)
      }
      return false; // allow default behavior
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => {
      subscription.remove();
    };
  }, [canGoBack]);

  // Dynamically navigate to a new path inside the WebView when deep links or router updates occur
  useEffect(() => {
    if (path && webViewRef.current) {
      // Skip if the path update was initiated by the WebView itself
      if (path === lastSyncedPathRef.current) {
        return;
      }

      const targetUrl = `${FULL_WEB_ADMIN_URL}${path.startsWith("/") ? path : `/${path}`}`;
      const cleanPath = path.split('?')[0].split('#')[0].replace(/\/$/, "");

      webViewRef.current.injectJavaScript(`
        var currentPath = window.location.pathname.replace(/\\/$/, "");
        var targetPath = '${cleanPath}'.replace(/\\/$/, "");
        if (currentPath !== targetPath) {
          window.location.href = '${targetUrl}';
        }
      `);
    }
  }, [path]);

  // Gracefully handle native logout and cleanup
  const handleNativeLogout = async () => {
    logout();
    await clearAuthStorage();
    router.replace("/login");
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorDetails(null);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  // Sync active web path back to native expo-router params
  const syncWebPathToNative = (url: string) => {
    try {
      if (url.startsWith(FULL_WEB_ADMIN_URL)) {
        let relativePath = url.substring(FULL_WEB_ADMIN_URL.length);
        if (!relativePath.startsWith("/")) {
          relativePath = "/" + relativePath;
        }
        if (path !== relativePath) {
          lastSyncedPathRef.current = relativePath;
          router.setParams({ path: relativePath });
        }
      } else {
        // Fallback for different hostnames (e.g. localhost, 127.0.0.1)
        const match = url.match(/(\/admin\/.*)/);
        if (match && match[1]) {
          const relativePath = match[1];
          if (path !== relativePath) {
            lastSyncedPathRef.current = relativePath;
            router.setParams({ path: relativePath });
          }
        }
      }
    } catch (e) {
      console.warn("Failed to sync web path to native:", e);
    }
  };

  // Skip webview implementation on web platform to avoid crashes and run native iframe fallback
  if (Platform.OS === "web") {
    const adminUrl = path ? `${FULL_WEB_ADMIN_URL}${path.startsWith("/") ? path : `/${path}`}` : `${FULL_WEB_ADMIN_URL}/admin/dashboard`;
    return (
      <View className="flex-1 bg-[#020617]">
        <iframe
          src={adminUrl}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Admin Web View"
        />
      </View>
    );
  }

  if (!isTokenLoaded || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-[#020617]">
        <ActivityIndicator color="#00D1FF" size="large" />
      </View>
    );
  }

  // Pre-load script to sync Zustand state and JWT auth token with Next.js localStorage
  const injectedJS = `
    (function() {
      try {
        const user = ${JSON.stringify(user)};
        const token = ${JSON.stringify(token)};
        const authState = {
          state: {
            user: user,
            isAuthenticated: true,
            isLoading: false,
            isHydrated: true
          },
          version: 0
        };
        window.localStorage.setItem('oceanexotic-auth', JSON.stringify(authState));
        window.localStorage.setItem('auth_token', token);
      } catch (e) {
        console.error('Handshake Sync Error:', e);
      }
    })();
    true;
  `;

  return (
    <View className="flex-1 bg-[#020617] relative">
      {/* WebView Container */}
      {!hasError && (
        <WebView
          ref={webViewRef}
          source={{ uri: initialUrl }}
          injectedJavaScriptBeforeContentLoaded={injectedJS}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsBackForwardNavigationGestures={true} // swipe to go back/forward on iOS
          setSupportMultipleWindows={false} // force links with target="_blank" to open in same WebView
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => {
            setIsLoading(false);
            setHasLoadedOnce(true);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn("WebView load error: ", nativeEvent);
            setHasError(true);
            setErrorDetails(nativeEvent.description || "Connection timed out");
            setIsLoading(false);
          }}
          onShouldStartLoadWithRequest={(request) => {
            const url = request.url;
            
            // 1. Intercept logout / web login redirects
            const isWebLogin = url.includes("/login") && !url.includes("/admin/login");
            if (isWebLogin) {
              void handleNativeLogout();
              return false; // prevent load
            }

            // 2. Intercept document uploads/payout PDFs/database files on port 8081 or under uploads
            const isBackendFile = url.includes("8081") || url.includes("/uploads/") || url.includes("/api/");
            if (isBackendFile) {
              // Rewrite localhost:8081 or 127.0.0.1:8081 to the resolved FULL_PHP_BASE_URL
              let rewrittenFileUrl = url;
              if (url.includes("localhost:8081") || url.includes("127.0.0.1:8081")) {
                rewrittenFileUrl = url
                  .replace("http://localhost:8081/FISH_MARKET", FULL_PHP_BASE_URL)
                  .replace("http://127.0.0.1:8081/FISH_MARKET", FULL_PHP_BASE_URL)
                  .replace("http://localhost:8081", FULL_PHP_BASE_URL)
                  .replace("http://127.0.0.1:8081", FULL_PHP_BASE_URL);
              }
              Linking.openURL(rewrittenFileUrl).catch((err) => console.error("Failed to open document URL", err));
              return false; // stop WebView loading, delegate to system browser
            }

            // 3. Rewrite and redirect local admin links if they use localhost:3000 instead of Metro IP
            const isLocalhostAdmin = url.startsWith("http://localhost:3000") || url.startsWith("http://127.0.0.1:3000");
            if (isLocalhostAdmin && FULL_WEB_ADMIN_URL !== "http://localhost:3000" && FULL_WEB_ADMIN_URL !== "http://127.0.0.1:3000") {
              const rewrittenAdminUrl = url
                .replace("http://localhost:3000", FULL_WEB_ADMIN_URL)
                .replace("http://127.0.0.1:3000", FULL_WEB_ADMIN_URL);
              webViewRef.current?.injectJavaScript(`window.location.href = '${rewrittenAdminUrl}';`);
              return false; // stop current load, load rewritten
            }

            // 4. Intercept external links
            const isLocalWebAdmin = url.includes(":3000") || url.startsWith(FULL_WEB_ADMIN_URL);
            if (!isLocalWebAdmin && (url.startsWith("http:") || url.startsWith("https:"))) {
              Linking.openURL(url).catch((err) => console.error("Failed to open external link", err));
              return false; // stop WebView loading, delegate to system browser
            }

            return true; // allow loading inside WebView
          }}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
            syncWebPathToNative(navState.url);

            // Double check for web logout / redirect to login page
            const isRedirectedToLogin = 
              navState.url.includes("/login") && 
              !navState.url.includes("/admin/login");
            
            if (isRedirectedToLogin) {
              webViewRef.current?.stopLoading();
              void handleNativeLogout();
            }
          }}
          style={{ flex: 1, backgroundColor: "#020617" }}
        />
      )}

      {/* Premium Loader Overlay */}
      {isLoading && !hasLoadedOnce && !hasError && (
        <View className="absolute inset-0 bg-[#020617] items-center justify-center z-50">
          <Logo size="md" />
          <ActivityIndicator color="#00D1FF" size="large" className="mt-8" />
          <Text className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#00D1FF] animate-pulse">
            SECURE COMMAND LINK INITIATING...
          </Text>
        </View>
      )}

      {/* Premium Custom Themed Error Screen */}
      {hasError && (
        <View className="absolute inset-0 bg-[#020617] px-6 py-12 justify-between z-50">
          {/* Top Header Decoration */}
          <View className="items-center mt-6">
            <Logo size="sm" />
          </View>

          {/* Central Diagnostic Information */}
          <View className="items-center my-auto space-y-6">
            <View className="rounded-[32px] border border-danger/20 bg-danger/5 p-1 max-w-[360px]">
              <View className="rounded-[30px] bg-[#020617]/95 px-6 py-8 items-center border border-danger/10 shadow-2xl">
                {/* Visual Alert Badge */}
                <View className="w-12 h-12 rounded-full bg-danger/10 border border-danger/35 items-center justify-center mb-4">
                  <Text className="text-xl font-bold text-danger">⚠️</Text>
                </View>
                <Text className="text-[20px] font-black italic text-center tracking-tight text-white leading-none">
                  COMMAND LINK <Text className="text-danger">OFFLINE</Text>
                </Text>
                <Text className="mt-2 text-[8px] font-black uppercase tracking-widest text-center text-danger/80">
                  Node Connection Failure
                </Text>
                <Text className="mt-4 text-[11px] text-slate-400 font-medium text-center leading-relaxed">
                  Failed to establish a secure websocket/HTTP link with the administration node. Please ensure that the Next.js admin server is active on your host machine or verify your physical device network connection.
                </Text>

                {/* Console Debug Box */}
                <View className="w-full mt-6 p-4 rounded-xl border border-white/5 bg-white/5">
                  <Text className="text-[8px] font-mono text-slate-500 uppercase tracking-wider mb-2">Diagnostic Logs:</Text>
                  <Text className="text-[9px] font-mono text-danger/80 leading-normal">
                    Target: {initialUrl}
                  </Text>
                  <Text className="text-[9px] font-mono text-slate-400 leading-normal mt-1">
                    Details: {errorDetails || "Connection refused by host"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Control Interface Buttons */}
          <View className="gap-4 w-full max-w-[400px] mx-auto">
            <Button
              label="RETRY CONNECTION"
              onPress={handleRetry}
              style={{ backgroundColor: "#00D1FF" }}
            />
            <Button
              label="TERMINATE SESSION"
              variant="ghost"
              onPress={handleNativeLogout}
            />
          </View>
        </View>
      )}
    </View>
  );
}
