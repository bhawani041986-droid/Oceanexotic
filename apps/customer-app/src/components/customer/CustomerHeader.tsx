import { useState } from "react";
import { View, Text, Pressable, TextInput, Modal } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";
import { Image } from "expo-image";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useToast } from "@/components/ui/Toast";
import { useThemeColors } from "@/hooks/useThemeColors";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import { LanguageSelector } from "@/components/LanguageSelector";

interface CustomerHeaderProps {
  showSearch?: boolean;
}

const MenuIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 12h18" />
    <Path d="M3 6h12" />
    <Path d="M3 18h16" />
  </Svg>
);

const CartIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="9" cy="21" r="1" />
    <Circle cx="20" cy="21" r="1" />
    <Path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </Svg>
);

const NotificationIcon = ({ color = "#F8FAFC" }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

export function CustomerHeader({ showSearch = true }: CustomerHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const cartCount = useCartStore((s) => s.itemCount());
  const theme = useSettingsStore((s) => s.theme);
  const { toast, ToastHost } = useToast();
  const [search, setSearch] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const colors = useThemeColors();
  const primaryColor = colors.primary;

  const getRgba = (hex: string, alpha: number) => {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const onSearch = () => {
    router.push({
      pathname: "/products",
      params: search.trim() ? { search: search.trim() } : {},
    });
  };

  const navigateTo = (href: string) => {
    setIsMenuOpen(false);
    router.push(href as any);
  };

  const handleNotificationPress = () => {
    router.push("/notifications");
  };

  return (
    <SafeAreaView edges={["top"]} className="border-b" style={{ backgroundColor: colors.bg, borderBottomColor: colors.border }}>
      <View className="px-3 pb-2 pt-1">
        <View className="flex-row items-center justify-between h-11">
          <View className="flex-row items-center gap-2.5">
            <Pressable 
              onPress={() => setIsMenuOpen(true)} 
              className="h-9 w-9 items-center justify-center rounded-xl border active:opacity-70"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card
              }}
            >
              <MenuIcon color={primaryColor} />
            </Pressable>
            <Pressable onPress={() => router.push("/home")} className="justify-center">
              <Logo size="sm" style={{ width: 128, height: 32 }} />
            </Pressable>
          </View>
          <View className="flex-row items-center gap-2">
            <LanguageSelector />
            <Pressable
              onPress={handleNotificationPress}
              className="relative h-9 w-9 items-center justify-center rounded-full border active:opacity-70"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card
              }}
            >
              <NotificationIcon color={colors.text} />
              {/* Subtle active notification beacon */}
              <View 
                className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border" 
                style={{ 
                  backgroundColor: primaryColor,
                  borderColor: colors.card
                }} 
              />
            </Pressable>

            <Pressable
              onPress={() => router.push("/cart")}
              className="relative h-9 w-9 items-center justify-center rounded-full border active:opacity-70"
              style={{
                borderColor: getRgba(primaryColor, 0.3),
                backgroundColor: getRgba(primaryColor, 0.1)
              }}
            >
              <CartIcon color={primaryColor} />
              {cartCount > 0 ? (
                <View 
                  className="absolute -right-1 -top-1 min-w-[16px] h-4 rounded-full px-1 items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Text className="text-center text-[8px] font-black text-white">{cartCount}</Text>
                </View>
              ) : null}
            </Pressable>

            <Pressable
              onPress={() => router.push("/profile")}
              className="h-9 w-9 rounded-full border overflow-hidden items-center justify-center active:opacity-70"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card
              }}
            >
              <Image 
                source={{ uri: resolveMediaUrl(user?.avatar) || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80" }} 
                className="h-full w-full rounded-full"
                contentFit="cover"
              />
            </Pressable>
          </View>
        </View>

        {showSearch && pathname !== "/login" ? (
          <View className="mt-2">
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={onSearch}
              placeholder="Search harvests..."
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              className="h-10 rounded-xl border px-4 text-xs"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
                color: colors.text
              }}
            />
            <Text 
              className="mt-1 text-[8px] font-black uppercase tracking-widest"
              style={{ color: colors.textMuted }}
            >
              Port Blair • Live Delivery Hub
            </Text>
          </View>
        ) : null}

        {/* Removed HOME, MARKET, ORDERS Menu list below search bar */}
      </View>

      {/* Slide-out Left Navigation Drawer */}
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
            className="w-[280px] h-full border-r p-5 pt-12 gap-6 relative shadow-2xl justify-between"
            style={{
              backgroundColor: colors.bgAlt,
              borderRightColor: colors.border
            }}
          >
            <View className="gap-6">
              <View className="flex-row items-center justify-between">
                <Logo size="sm" style={{ width: 128, height: 32 }} />
                <Pressable 
                  onPress={() => setIsMenuOpen(false)} 
                  className="h-7 w-7 rounded-full border items-center justify-center active:opacity-70"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.card
                  }}
                >
                  <Text className="text-[10px] font-black" style={{ color: colors.textMuted }}>✕</Text>
                </Pressable>
              </View>

              <View 
                className="rounded-xl p-3 flex-row items-center gap-2 border"
                style={{
                  borderColor: getRgba(primaryColor, 0.2),
                  backgroundColor: getRgba(primaryColor, 0.05)
                }}
              >
                <View className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <View className="flex-1">
                  <Text className="text-[8px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>Local Delivery Hub</Text>
                  <Text className="text-[10px] font-bold" style={{ color: colors.text }} numberOfLines={1}>{user?.email ?? "Guest Mode"}</Text>
                </View>
              </View>

              <View className="gap-2">
                {[
                  { label: "Home", href: "/home" },
                  { label: "Fresh Catch Market", href: "/products" },
                  { label: "Recipes", href: "/recipe" },
                  { label: "My Orders", href: "/orders" },
                  { label: "My Profile", href: "/profile" },
                  { label: "Active Cart", href: "/cart" }
                ].map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Pressable 
                      key={item.href} 
                      onPress={() => navigateTo(item.href)} 
                      className="flex-row items-center px-4 py-3 rounded-xl border"
                      style={active ? {
                        borderColor: getRgba(primaryColor, 0.2),
                        backgroundColor: getRgba(primaryColor, 0.1)
                      } : {
                        borderColor: colors.border,
                        backgroundColor: colors.card
                      }}
                    >
                      <Text 
                        className="text-xs font-black uppercase tracking-wider"
                        style={{ color: active ? primaryColor : colors.text }}
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
                <Text className="text-xs font-black uppercase tracking-widest text-red-500">Sign Out</Text>
              </Pressable>
              <Text className="text-[7px] font-black text-center uppercase tracking-widest" style={{ color: colors.textMuted }}>OceanExotic Mobile App v1.4</Text>
            </View>
          </View>
        </View>
      </Modal>
      {ToastHost}
    </SafeAreaView>
  );
}

