import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

export async function removeAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function setAuthUser(user: object): Promise<void> {
  await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export async function removeAuthUser(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_USER_KEY);
}

export async function clearAuthStorage(): Promise<void> {
  await Promise.all([removeAuthToken(), removeAuthUser()]);
}

/** Web localStorage parity for axios interceptors during Expo Web dev */
export function getWebOrigin(): string | undefined {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.origin;
  }
  return undefined;
}
