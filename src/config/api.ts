export const API_BASE_URL = "/api";
export const FULL_API_URL = "/api"; // Routing all client requests through Next.js proxy/rewrite
export const BRIDGE_URL = "http://127.0.0.1:8081/FISH_MARKET/database/query_bridge.php";

export function getPhpServerUrl(): string {
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:8081`;
  }
  return "http://127.0.0.1:8081";
}

export const PHP_SERVER_URL = getPhpServerUrl();


