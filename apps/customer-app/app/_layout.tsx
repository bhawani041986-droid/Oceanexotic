import "../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, Inter_400Regular, Inter_700Bold, Inter_900Black } from "@expo-google-fonts/inter";
import { useEffect } from "react";
import { Platform, LogBox } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AppProviders } from "@/providers/AppProviders";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "react-native-css-interop";

// Suppress keep awake dev error overlays
LogBox.ignoreLogs(["Unable to activate keep awake"]);
if (typeof global.Promise !== "undefined") {
  const globalPromise = global.Promise as any;
  const originalOnUnhandled = globalPromise._onUnhandled;
  if (typeof originalOnUnhandled === "function") {
    globalPromise._onUnhandled = (id: any, rejection: any) => {
      const message = rejection?.message || String(rejection);
      if (message.includes("keep awake") || message.includes("keepawake")) {
        return;
      }
      originalOnUnhandled(id, rejection);
    };
  }
}

cssInterop(Image, { className: "style" });
cssInterop(LinearGradient, { className: "style" });

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_900Black,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded && Platform.OS !== "web") return null;

  return (
    <AppProviders>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#020617" } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(customer)" options={{ headerShown: false }} />
      </Stack>
    </AppProviders>
  );
}
