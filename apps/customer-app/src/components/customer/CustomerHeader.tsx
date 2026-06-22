import { useState } from "react";
import { View, Text, Pressable, TextInput, Modal } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Circle, Polygon } from "react-native-svg";
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
import { t } from "@/lib/i18n";
import { ChamferedBox } from "@/components/ui/ChamferedBox";

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
  const currentLanguage = useSettingsStore((s) => s.language); // trigger re-render on language change

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
        <View className="flex-row items-center justify-between h-[54px]">
          <View className="flex-row items-center gap-2.5">
            <Pressable 
              onPress={() => setIsMenuOpen(true)} 
              className="h-9 w-9 items-center justify-center rounded-none border active:opacity-70"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card
              }}
            >
              <MenuIcon color={primaryColor} />
              {/* Cut-corner bevel overlays */}
              <Svg width={6} height={6} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}>
                <Polygon points="0,0 6,0 0,6" fill={colors.bg} />
              </Svg>
              <Svg width={6} height={6} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}>
                <Polygon points="6,6 0,6 6,0" fill={colors.bg} />
              </Svg>
            </Pressable>
            <Pressable onPress={() => router.push("/home")} className="justify-center">
              <Logo size="sm" style={{ width: 196, height: 48 }} />
            </Pressable>
          </View>
          <View className="flex-row items-center gap-2">
            <LanguageSelector />
            <Pressable
              onPress={handleNotificationPress}
              className="relative h-9 w-9 items-center justify-center rounded-none border active:opacity-70"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card
              }}
            >
              <NotificationIcon color={colors.text} />
              {/* Subtle active notification beacon */}
              <View 
                className="absolute right-2.5 top-2.5 h-2 w-2 rounded-none border" 
                style={{ 
                  backgroundColor: primaryColor,
                  borderColor: colors.card
                }} 
              />
              {/* Cut-corner bevel overlays */}
              <Svg width={6} height={6} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}>
                <Polygon points="0,0 6,0 0,6" fill={colors.bg} />
              </Svg>
              <Svg width={6} height={6} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}>
                <Polygon points="6,6 0,6 6,0" fill={colors.bg} />
              </Svg>
            </Pressable>

            <Pressable
              onPress={() => router.push("/cart")}
              className="relative h-9 w-9 items-center justify-center rounded-none border active:opacity-70"
              style={{
                borderColor: getRgba(primaryColor, 0.3),
                backgroundColor: getRgba(primaryColor, 0.1)
              }}
            >
              <CartIcon color={primaryColor} />
              {cartCount > 0 ? (
                <View 
                  className="absolute -right-1 -top-1 min-w-[16px] h-4 rounded-none px-1 items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Text className="text-center text-[8px] font-black text-white">{cartCount}</Text>
                </View>
              ) : null}
              {/* Cut-corner bevel overlays */}
              <Svg width={6} height={6} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}>
                <Polygon points="0,0 6,0 0,6" fill={colors.bg} />
              </Svg>
              <Svg width={6} height={6} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}>
                <Polygon points="6,6 0,6 6,0" fill={colors.bg} />
              </Svg>
            </Pressable>

            <Pressable
              onPress={() => router.push("/profile")}
              className="h-9 w-9 rounded-none border overflow-hidden items-center justify-center active:opacity-70"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card
              }}
            >
              <Image 
                source={{ uri: resolveMediaUrl(user?.avatar) || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80" }} 
                className="h-full w-full rounded-none"
                contentFit="cover"
              />
              {/* Cut-corner bevel overlays (rendered above image) */}
              <Svg width={6} height={6} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}>
                <Polygon points="0,0 6,0 0,6" fill={colors.bg} />
              </Svg>
              <Svg width={6} height={6} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}>
                <Polygon points="6,6 0,6 6,0" fill={colors.bg} />
              </Svg>
            </Pressable>
          </View>
        </View>

        {showSearch && pathname !== "/login" && pathname !== "/products" ? (
          <View className="mt-2">
            <View className="relative">
              <TextInput
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={onSearch}
                placeholder="Search products..."
                placeholderTextColor={colors.textMuted}
                returnKeyType="search"
                className="h-10 rounded-none border px-4 text-xs"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  color: colors.text
                }}
              />
              {/* Cut-corner bevel overlays on search bar */}
              <Svg width={8} height={8} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}>
                <Polygon points="0,0 8,0 0,8" fill={colors.bg} />
              </Svg>
              <Svg width={8} height={8} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}>
                <Polygon points="8,8 0,8 8,0" fill={colors.bg} />
              </Svg>
            </View>
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
                <Logo size="sm" style={{ width: 196, height: 48 }} />
                <Pressable 
                  onPress={() => setIsMenuOpen(false)} 
                  className="h-7 w-7 rounded-none border items-center justify-center active:opacity-70"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.card
                  }}
                >
                  <Text className="text-[10px] font-black" style={{ color: colors.textMuted }}>✕</Text>
                </Pressable>
              </View>

              <ChamferedBox 
                fillColor={getRgba(primaryColor, 0.05)}
                strokeColor={getRgba(primaryColor, 0.2)}
                bevelSize={10}
                style={{ minHeight: 50 }}
                contentClassName="p-3 flex-row items-center gap-2"
              >
                <View className="h-2.5 w-2.5 rounded-none bg-emerald-500" />
                <View className="flex-1">
                  <Text className="text-[8px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>Local Delivery Hub</Text>
                  <Text className="text-[10px] font-bold" style={{ color: colors.text }} numberOfLines={1}>{user?.email ?? "Guest Mode"}</Text>
                </View>
              </ChamferedBox>

              <View className="gap-2">
                {[
                  { label: t('home'), href: "/home" },
                  { label: t('fresh_catch_market'), href: "/products" },
                  { label: t('recipes'), href: "/recipe" },
                  { label: t('my_orders'), href: "/orders" },
                  { label: t('my_profile'), href: "/profile" },
                  { label: t('active_cart'), href: "/cart" }
                ].map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <ChamferedBox
                      key={item.href}
                      fillColor={active ? getRgba(primaryColor, 0.1) : colors.card}
                      strokeColor={active ? getRgba(primaryColor, 0.2) : colors.border}
                      bevelSize={10}
                      style={{ minHeight: 44 }}
                    >
                      <Pressable 
                        onPress={() => navigateTo(item.href)} 
                        className="flex-row items-center px-4 py-3 w-full"
                      >
                        <Text 
                          className="text-xs font-black uppercase tracking-wider"
                          style={{ color: active ? primaryColor : colors.text }}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    </ChamferedBox>
                  );
                })}
              </View>
            </View>

            <View className="gap-2 pb-6">
              <ChamferedBox
                fillColor="rgba(239, 68, 68, 0.1)"
                strokeColor="rgba(239, 68, 68, 0.2)"
                bevelSize={12}
                style={{ minHeight: 48 }}
              >
                <Pressable 
                  onPress={() => {
                    setIsMenuOpen(false);
                    logout();
                    router.replace("/login");
                  }}
                  className="w-full py-3.5 items-center justify-center active:bg-red-500/10"
                >
                  <Text className="text-xs font-black uppercase tracking-widest text-red-500">{t('sign_out')}</Text>
                </Pressable>
              </ChamferedBox>
              <Text className="text-[7px] font-black text-center uppercase tracking-widest mt-2" style={{ color: colors.textMuted }}>OceanExotic Mobile App v1.4</Text>
            </View>
          </View>
        </View>
      </Modal>
      {ToastHost}
    </SafeAreaView>
  );
}


