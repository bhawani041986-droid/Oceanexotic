import { useState, useEffect } from "react";
import { View, Text, Pressable, TextInput, Modal, StyleSheet, ScrollView } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
import { useNotificationStore } from "@/store/notificationStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FULL_API_URL } from "@/config/api";
import { LinearGradient } from "expo-linear-gradient";
import { LocationSelectorModal } from "./LocationSelectorModal";

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
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [activeHubName, setActiveHubName] = useState("Port Blair Live Hub");
  const { unreadCount, setUnreadCount } = useNotificationStore();

  useEffect(() => {
    const loadHub = async () => {
      try {
        const hubStr = await AsyncStorage.getItem('ocean_active_hub');
        if (hubStr) {
          const hub = JSON.parse(hubStr);
          setActiveHubName(hub.name);
        }
      } catch (e) { }
    };
    loadHub();
  }, [isLocationModalOpen]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = user?.id || "USR-1001";
      try {
        const res = await fetch(`${FULL_API_URL}/api/customer/notifications?userId=${userId}`);
        const data = await res.json();
        if (data.status === 'success') {
          const readBroadcastsStr = await AsyncStorage.getItem('ocean_read_broadcasts');
          const readBroadcasts = readBroadcastsStr ? JSON.parse(readBroadcastsStr) : [];
          setUnreadCount(data.data.filter((n: any) => !n.read && !readBroadcasts.includes(n.id)).length);
        }
      } catch (error) {
        console.warn("Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();
  }, [user?.id, setUnreadCount]);

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

  const MENU_ITEMS = [
    { label: "Home", href: "/home", icon: "home" },
    { label: "Shop", href: "/products", icon: "storefront-outline" },
    { label: "Recipes", href: "/recipe", icon: "chef-hat" },
    { label: "Orders", href: "/orders", icon: "clipboard-outline" },
    { label: "Profile", href: "/profile", icon: "account-circle-outline" },
    { label: "Cart", href: "/cart", icon: "cart-outline" },
    { label: "Chat with Us", href: "/chat", icon: "message-outline" },
  ];

  const isItemActive = (href: string) => {
    if (href === "/home") return pathname === "/home" || pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
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
              <Logo size="sm" style={{ width: 144, height: 40 }} />
            </Pressable>
          </View>
          <View className="flex-row items-center gap-[6px]">
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
              {/* Active notification beacon */}
              {unreadCount > 0 && (
                <View 
                  className="absolute right-2.5 top-2.5 h-2 w-2 rounded-none border" 
                  style={{ 
                    backgroundColor: primaryColor,
                    borderColor: colors.card
                  }} 
                />
              )}
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
          <View className="mt-3 gap-3">
            {/* Search Bar - White Pill */}
            <Pressable 
              onPress={onSearch}
              className="flex-row items-center h-[46px] rounded-full px-1 pl-4"
              style={{
                backgroundColor: '#ffffff',
                borderWidth: 1.5,
                borderColor: '#115e59', // teal-800
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 3,
              }}
            >
              <MaterialCommunityIcons name="magnify" size={24} color="#115e59" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={onSearch}
                placeholder="Search seafood products..."
                placeholderTextColor="#64748b"
                returnKeyType="search"
                className="flex-1 ml-2 text-[15px] font-medium"
                style={{ color: '#334155', height: '100%' }}
              />
              <Pressable 
                onPress={onSearch}
                className="h-[38px] w-[38px] rounded-full items-center justify-center bg-[#0f4a5c]"
              >
                <MaterialCommunityIcons name="fish" size={20} color="#ffffff" />
              </Pressable>
            </Pressable>

            {/* Hub Location Bar - Teal Gradient Pill */}
            <Pressable onPress={() => setIsLocationModalOpen(true)}>
              <LinearGradient
                colors={['#4cb8c4', '#3cd3ad']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center h-[42px] rounded-full px-4"
                style={{
                  shadowColor: "#3cd3ad",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 5,
                }}
              >
                <MaterialCommunityIcons name="map-marker" size={18} color="#ffffff" />
                <Text className="flex-1 ml-2 text-[13px] font-bold text-white tracking-wide">
                  {activeHubName} <Text className="font-normal opacity-90">• Active Fishing Zones</Text>
                </Text>
                <View className="w-6 h-6 rounded-full bg-white/20 items-center justify-center">
                  <MaterialCommunityIcons name="chevron-down" size={16} color="#ffffff" />
                </View>
              </LinearGradient>
            </Pressable>
          </View>
        ) : null}

        <LocationSelectorModal 
          visible={isLocationModalOpen} 
          onClose={() => setIsLocationModalOpen(false)} 
          onSelectHub={(hub) => setActiveHubName(hub.name)} 
          colors={colors}
        />

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
            className="w-[300px] h-full border-r relative shadow-2xl"
            style={{
              backgroundColor: "#ffffff",
              borderRightColor: colors.border
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
              <View style={{ width: 300, height: 464, position: 'relative' }}>
                <Image
                  source={require("../../../assets/drawer_menu_mockup.jpg")}
                  style={StyleSheet.absoluteFillObject}
                  contentFit="fill"
                />

                {/* Clickable Overlays */}
                
                {/* Close Button X */}
                <Pressable
                  onPress={() => setIsMenuOpen(false)}
                  style={{ position: 'absolute', top: '3.5%', right: '4%', width: '14%', height: '5.5%' }}
                />

                {/* Local Delivery Hub info (absorbs touches) */}
                <Pressable
                  onPress={() => {}}
                  style={{ position: 'absolute', top: '11.3%', left: '5%', width: '90%', height: '8.8%' }}
                />

                {/* Solid White Masking Container to cover printed JPEG menu buttons */}
                <View 
                  style={{ 
                    position: 'absolute', 
                    top: 98, 
                    left: 0, 
                    width: 300, 
                    height: 330, 
                    backgroundColor: '#ffffff', 
                    paddingHorizontal: 15, 
                    gap: 7, 
                    justifyContent: 'center' 
                  }}
                >
                  {MENU_ITEMS.map((item) => {
                    const active = isItemActive(item.href);
                    return (
                      <Pressable
                        key={item.href}
                        onPress={() => navigateTo(item.href)}
                        style={{
                          width: '100%',
                          height: 32,
                          backgroundColor: active ? "rgba(14, 165, 233, 0.06)" : "#ffffff",
                          borderColor: active ? "rgba(14, 165, 233, 0.15)" : "#f1f5f9",
                          borderWidth: 1.2,
                          borderRadius: 8,
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 10,
                        }}
                      >
                        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: active ? "rgba(14, 165, 233, 0.12)" : "#f1f5f9", justifyContent: 'center', alignItems: 'center' }}>
                          <MaterialCommunityIcons 
                            name={item.icon as any} 
                            size={11} 
                            color={active ? primaryColor : "#64748B"} 
                          />
                        </View>
                        <Text 
                          style={{
                            marginLeft: 8,
                            fontSize: 11,
                            fontWeight: '700',
                            color: active ? primaryColor : "#475569",
                            flex: 1
                          }}
                        >
                          {item.label}
                        </Text>
                        <MaterialCommunityIcons 
                          name="chevron-right" 
                          size={12} 
                          color={active ? primaryColor : "#94A3B8"} 
                        />
                      </Pressable>
                    );
                  })}

                  {/* Sign Out Card */}
                  <Pressable
                    onPress={() => {
                      setIsMenuOpen(false);
                      logout();
                      router.replace("/login");
                    }}
                    style={{
                      width: '100%',
                      height: 32,
                      backgroundColor: "rgba(239, 68, 68, 0.06)",
                      borderColor: "rgba(239, 68, 68, 0.15)",
                      borderWidth: 1.2,
                      borderRadius: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 10,
                    }}
                  >
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "rgba(239, 68, 68, 0.12)", justifyContent: 'center', alignItems: 'center' }}>
                      <MaterialCommunityIcons 
                        name="logout" 
                        size={11} 
                        color="#ef4444" 
                      />
                    </View>
                    <Text 
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        fontWeight: '700',
                        color: "#ef4444",
                        flex: 1
                      }}
                    >
                      Sign Out
                    </Text>
                    <MaterialCommunityIcons 
                      name="chevron-right" 
                      size={12} 
                      color="#ef4444" 
                    />
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {ToastHost}
    </SafeAreaView>
  );
}


