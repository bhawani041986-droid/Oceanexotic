import axios from "axios";
import { router } from "expo-router";
import { FULL_API_URL } from "@/config/api";
import { clearAuthStorage, getAuthToken } from "@/lib/storage";
import { useAuthStore } from "@/store/authStore";

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
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error.config?.url ?? "";
    const isAuthEndpoint =
      url.includes("/auth/login.php") || url.includes("/auth/register.php");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      await clearAuthStorage();
      useAuthStore.getState().logout();
      router.replace("/login");
    }
    return Promise.reject(error);
  }
);

export default api;
