import { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useRouter, usePathname } from "expo-router";
import { Image } from "expo-image";
import { useAuthStore } from "@/store/authStore";
import { Logo } from "@/components/ui/Logo";
import { useToast } from "@/components/ui/Toast";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import { cn } from "@/lib/utils";

const MenuIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 12h18" />
    <Path d="M3 6h12" />
    <Path d="M3 18h16" />
  </Svg>
);

const NotificationIcon = ({ color = "#F8FAFC" }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

export function SellerHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { toast, ToastHost } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const primaryColor = "#7C3AED"; // Purple theme for Seller
  const borderColor = "rgba(124, 58, 237, 0.25)";
  const textColor = "#F8FAFC";

  const getRgba = (hex: string, alpha: number) => {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const handleNotificationPress = () => {
    toast("Sovereign Registry Node: All channels synchronized.", "success");
  };

  const navigateTo = (href: string) => {
    setIsMenuOpen(false);
    router.push(href as any);
  };

  return (
    <View 
      className="absolute top-0 left-0 right-0 z-50 h-16 flex-row items-center justify-between px-4 border-b bg-background/90"
      style={{
        borderColor: borderColor,
        paddingTop: 12,
      }}
    >
      <View className="flex-row items-center space-x-2">
        {/* Menu Toggle */}
        <Pressable 
          onPress={() => setIsMenuOpen(true)} 
          className="h-9 w-9 items-center justify-center rounded-xl border active:opacity-70 bg-white/5"
          style={{ borderColor: borderColor }}
        >
          <MenuIcon color={primaryColor} />
        </Pressable>

        {/* Pulse Indicator */}
        <View className="flex-row items-center space-x-1.5 bg-white/5 px-2 py-1 rounded-lg">
          <View 
            className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}
          >
            <View 
              className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" 
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 3,
              }}
            />
          </View>
          
          <View className="flex-col justify-center">
            <Text 
              className="text-[8px] font-black uppercase tracking-[0.1em] leading-none"
              style={{ color: primaryColor }}
            >
              Merchant
            </Text>
            <Text 
              className="text-[7px] font-bold opacity-60 uppercase tracking-[0.05em] mt-0.5 max-w-[60px]"
              style={{ color: textColor }}
              numberOfLines={1}
            >
              {user?.name || "Seller Node"}
            </Text>
          </View>
        </View>
      </View>

      {/* Center Logo */}
      <View className="flex-1 items-center justify-center pr-2">
        <Logo size="sm" style={{ width: 100, height: 26 }} />
      </View>

      {/* Right Controls */}
      <View className="flex-row items-center space-x-2">
        <Pressable
          onPress={handleNotificationPress}
          className="relative h-9 w-9 items-center justify-center rounded-full border active:opacity-70 bg-white/05"
          style={{ borderColor: borderColor }}
        >
          <NotificationIcon color={textColor} />
          <View 
            className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary"
            style={{ borderColor: "#020617" }} 
          />
        </Pressable>

        <Pressable
          onPress={() => router.push("/(seller)/profile")}
          className="h-9 w-9 rounded-full border overflow-hidden items-center justify-center active:opacity-70"
          style={{ borderColor: borderColor }}
        >
          <Image 
            source={{ uri: resolveMediaUrl(user?.avatar) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80" }} 
            className="h-full w-full rounded-full"
            contentFit="cover"
          />
        </Pressable>
      </View>

      {/* Slide Drawer */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View className="flex-1 flex-row">
          <Pressable 
            className="absolute inset-0 bg-black/60" 
            onPress={() => setIsMenuOpen(false)} 
          />
          <View 
            className="w-[280px] h-full border-r p-5 pt-12 gap-6 relative shadow-2xl justify-between bg-background"
            style={{ borderRightColor: borderColor }}
          >
            <View className="gap-6">
              <View className="flex-row items-center justify-between">
                <Logo size="sm" style={{ width: 128, height: 32 }} />
                <Pressable 
                  onPress={() => setIsMenuOpen(false)} 
                  className="h-7 w-7 rounded-full border items-center justify-center active:opacity-70 bg-white/5"
                  style={{ borderColor: borderColor }}
                >
                  <Text className="text-[10px] font-black text-foreground">✕</Text>
                </Pressable>
              </View>

              <View 
                className="rounded-xl p-3 flex-row items-center gap-2 border bg-white/5"
                style={{ borderColor: getRgba(primaryColor, 0.2) }}
              >
                <View className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <View className="flex-1">
                  <Text className="text-[8px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>Active Merchant Node</Text>
                  <Text className="text-[10px] font-bold text-foreground" numberOfLines={1}>{user?.email ?? "Guest Merchant"}</Text>
                </View>
              </View>

              <View className="gap-2">
                {[
                  { label: "Fleet Dashboard", href: "/(seller)/dashboard" },
                  { label: "Harbor Registry", href: "/(seller)/inventory" },
                  { label: "Commission Line", href: "/(seller)/orders" },
                  { label: "Merchant Settings", href: "/(seller)/profile" }
                ].map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Pressable 
                      key={item.href} 
                      onPress={() => navigateTo(item.href)} 
                      className="flex-row items-center px-4 py-3 rounded-xl border bg-white/5"
                      style={active ? {
                        borderColor: getRgba(primaryColor, 0.4),
                        backgroundColor: getRgba(primaryColor, 0.15)
                      } : {
                        borderColor: borderColor,
                      }}
                    >
                      <Text 
                        className="text-xs font-black uppercase tracking-wider text-foreground"
                        style={active ? { color: primaryColor } : {}}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="gap-2 pb-6">
              <Pressable 
                onPress={() => {
                  setIsMenuOpen(false);
                  logout();
                  router.replace("/login");
                }}
                className="w-full py-4 rounded-xl border border-red-500/20 bg-red-500/10 items-center active:bg-red-500/20"
              >
                <Text className="text-xs font-black uppercase tracking-widest text-red-500">Deauthorize Node</Text>
              </Pressable>
              <Text className="text-[7px] font-black text-center uppercase tracking-widest text-muted-foreground opacity-40">OceanExotic Seller Protocol v1.0</Text>
            </View>
          </View>
        </View>
      </Modal>
      {ToastHost}
    </View>
  );
}
