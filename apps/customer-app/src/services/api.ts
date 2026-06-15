import axios from "axios";
import { router } from "expo-router";
import { FULL_API_URL } from "@/config/api";
import { clearAuthStorage, getAuthToken } from "@/lib/storage";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";

const api = axios.create({
  baseURL: FULL_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Attach current selected language in headers for server-side translation
  try {
    const currentLang = useSettingsStore.getState().language || "en";
    config.headers["Accept-Language"] = currentLang;
  } catch (err) {
    console.error("Failed to attach Accept-Language header:", err);
  }

  // Strip leading slash if URL is relative to prevent Axios discarding the path of baseURL
  if (config.url && config.url.startsWith("/")) {
    config.url = config.url.substring(1);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error.config?.url ?? "";
    const isAuthEndpoint =
      url.includes("/auth/login") || url.includes("/auth/register");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      await clearAuthStorage();
      useAuthStore.getState().logout();
      router.replace("/login");
    }
    return Promise.reject(error);
  }
);

export default api;
