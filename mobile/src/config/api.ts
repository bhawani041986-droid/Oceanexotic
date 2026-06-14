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
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const extraUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;

  if (Platform.OS === "web") {
    const browserHost = typeof window !== "undefined" && window.location.hostname 
      ? window.location.hostname 
      : "localhost";
    const resolvedHost = browserHost === "localhost" ? "127.0.0.1" : browserHost;
    return `http://${resolvedHost}:3000/api`;
  }

  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl.replace(/\/$/, "");
  }

  const lanHost = getExpoDevMachineHost();
  if (lanHost) {
    return buildApiUrl(lanHost);
  }

  // Android emulator → host machine
  if (Platform.OS === "android" && !Constants.isDevice) {
    return buildApiUrl("10.0.2.2");
  }

  return (envUrl ?? extraUrl ?? buildApiUrl("127.0.0.1")).replace(/\/$/, "");
}

export const FULL_API_URL = resolveApiBaseUrl();
