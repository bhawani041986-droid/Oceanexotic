import api from "./api";
import { setAuthToken, setAuthUser, clearAuthStorage } from "@/lib/storage";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: LoginUser;
  message?: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login.php", credentials);
    const data = response.data;

    if (data.success && data.token && data.user) {
      await setAuthToken(data.token);
      await setAuthUser(data.user);
    }

    return data;
  },

  logout: async () => {
    await clearAuthStorage();
  },
};
