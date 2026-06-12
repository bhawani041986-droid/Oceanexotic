import { resolveApiBaseUrl } from "./api";

/** Web app serves static assets from project root on XAMPP */
const WEB_ORIGIN = resolveApiBaseUrl().replace(/\/api\/?$/, "");

export function assetUrl(path: string): string {
  if (path.startsWith("http")) return path;
  
  // On XAMPP (Apache), static assets in public/ are accessed via /public/ prefix
  let cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (
    cleanPath.startsWith("/uploads/") ||
    cleanPath.startsWith("/ICONS/") ||
    cleanPath.startsWith("/brand/") ||
    cleanPath.includes("logo.svg")
  ) {
    cleanPath = `/public${cleanPath}`;
  }
  
  return `${WEB_ORIGIN}${cleanPath}`;
}

