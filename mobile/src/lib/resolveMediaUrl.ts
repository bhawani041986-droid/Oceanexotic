import { assetUrl } from "@/config/assets";
import { resolveApiBaseUrl } from "@/config/api";

/** Sync CMS / settings image paths with XAMPP asset root (same as web). */
export function resolveMediaUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("blob:")) return "";

  // If it's a base64-encoded image data URI, return it directly to render natively
  if (trimmed.startsWith("data:")) return trimmed;

  let resolved = trimmed;

  // If the URL is absolute and contains localhost / 127.0.0.1, swap it with dynamic LAN host
  if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
    const apiBase = resolveApiBaseUrl();
    const hostMatch = apiBase.match(/^https?:\/\/[^\/]+/);
    const dynamicHost = hostMatch ? hostMatch[0] : "http://localhost:8081";
    
    if (resolved.includes("localhost:8081")) {
      resolved = resolved.replace(/https?:\/\/localhost:8081/g, dynamicHost);
    } else if (resolved.includes("127.0.0.1:8081")) {
      resolved = resolved.replace(/https?:\/\/127.0.0.1:8081/g, dynamicHost);
    }
    return resolved;
  }

  return assetUrl(trimmed);
}
