import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PATH = "/api";
const DEFAULT_API_PORT = process.env.EXPO_PUBLIC_API_PORT ?? "3000";

/** Expo Go / dev client reports your PC LAN IP here (e.g. 192.168.1.5:8082). */
function getExpoDevMachineHost(): string | null {
  const candidates = [
    Constants.expoConfig?.hostUri,
    (Constants.expoGoConfig as { debuggerHost?: string } | null)?.debuggerHost,
    (Constants.manifest2 as { extra?: { expoClient?: { debuggerHost?: string } } } | null)
      ?.extra?.expoClient?.debuggerHost,
    (Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost,
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    const host = raw.split(":")[0]?.trim();
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return host;
    }
  }
  return null;
}

function buildApiUrl(host: string, port: string = DEFAULT_API_PORT): string {
  return `http://${host}:${port}${API_PATH}`;
}

/**
 * Resolves PHP API base URL:
 * - Web browser → localhost:8081 (XAMPP)
 * - Physical phone (Expo Go) → PC LAN IP from Metro (same machine as Expo)
 * - Override anytime with EXPO_PUBLIC_API_URL in mobile/.env
 */
export function resolveApiBaseUrl(): string {
  // If explicitly requested to use local dev server (e.g. EXPO_PUBLIC_USE_LOCAL_API=true)
  const useLocal = process.env.EXPO_PUBLIC_USE_LOCAL_API === "true";
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (useLocal && envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  if (useLocal) {
    const lanHost = getExpoDevMachineHost();
    if (lanHost) return buildApiUrl(lanHost);
    if (Platform.OS === "android" && !Constants.isDevice) return buildApiUrl("10.0.2.2");
  }

  // Default for all devices, Expo Go, and production: live backend server
  return "https://oceanexotic.com/api";
}

export const FULL_API_URL = resolveApiBaseUrl();

export function resolveWebAdminUrl(): string {
  if (!__DEV__) {
    return "https://oceanexotic.com";
  }

  const envUrl = process.env.EXPO_PUBLIC_WEB_ADMIN_URL?.trim();

  if (Platform.OS === "web") {
    const browserHost = typeof window !== "undefined" && window.location.hostname 
      ? window.location.hostname 
      : "localhost";
    return `http://${browserHost}:3000`;
  }

  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  const lanHost = getExpoDevMachineHost();
  if (lanHost) {
    return `http://${lanHost}:3000`;
  }

  // Android emulator → host machine
  if (Platform.OS === "android" && !Constants.isDevice) {
    return "http://10.0.2.2:3000";
  }

  return "http://127.0.0.1:3000";
}

export const FULL_WEB_ADMIN_URL = resolveWebAdminUrl();

export function resolvePhpBaseUrl(): string {
  const apiUrl = resolveApiBaseUrl();
  // Strip the '/api' suffix (and any trailing slashes)
  return apiUrl.replace(/\/api\/?$/, "");
}

export const FULL_PHP_BASE_URL = resolvePhpBaseUrl();


