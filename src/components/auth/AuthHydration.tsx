"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function AuthHydration() {
  const { login } = useAuthStore();

  useEffect(() => {
    // Check for oauth cookies set by the backend callback
    const matchToken = document.cookie.match(new RegExp('(^| )oauth_token=([^;]+)'));
    const matchUser = document.cookie.match(new RegExp('(^| )oauth_user=([^;]+)'));

    if (matchToken && matchUser) {
      try {
        const token = matchToken[2];
        const userStr = decodeURIComponent(matchUser[2]);
        const user = JSON.parse(userStr);

        // Hydrate local storage and Zustand
        localStorage.setItem("auth_token", token);
        login(user);

        // Delete cookies so they aren't parsed again
        document.cookie = "oauth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "oauth_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } catch (err) {
        console.error("Failed to hydrate OAuth user:", err);
      }
    }
  }, [login]);

  return null;
}
