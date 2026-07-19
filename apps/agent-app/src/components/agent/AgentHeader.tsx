import { useState, useEffect } from "react";
import { View, Text, Pressable, Modal, Alert } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useRouter, usePathname } from "expo-router";
import { Image } from "expo-image";
import { useAgentStore, MOODS } from "@/store/agentStore";
import { useAuthStore } from "@/store/authStore";
import { Logo } from "@/components/ui/Logo";
import { useToast } from "@/components/ui/Toast";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import { FULL_API_URL } from "@/config/api";

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

export function AgentHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const currentMood = useAgentStore((s) => s.currentMood);
  const { user, logout } = useAuthStore();
  const { toast, ToastHost } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mood = MOODS[currentMood];
  const isLight = currentMood === "DAYLIGHT";

  const getRgba = (hex: string, alpha: number) => {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${FULL_API_URL}/customer/notifications?userId=${user.id}`);
      const result = await res.json();
      if (result.status === "success" && result.data) {
        setNotificationsList(result.data);
        setUnreadCount(result.data.filter((n: any) => !n.read).length);
      }
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleNotificationPress = () => {
    if (notificationsList.length === 0) {
      Alert.alert("Alerts Radar", "No active notifications.");
      return;
    }

    const displayList = notificationsList.slice(0, 3).map((n, i) => `${i + 1}. [${n.read ? 'READ' : 'NEW'}] ${n.title}\n   ${n.message}`).join("\n\n");
    
    Alert.alert(
      "Alerts Radar",
      `Active Notifications (${unreadCount} Unread):\n\n${displayList}\n\n${notificationsList.length > 3 ? `...and ${notificationsList.length - 3} more.` : ""}`,
      [
        {
          text: "Mark All Read",
          onPress: async () => {
            if (!user?.id) return;
            try {
              await fetch(`${FULL_API_URL}/customer/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'MARK_ALL_READ', userId: user.id })
              });
              fetchNotifications();
              toast("All notifications marked as read", "success");
            } catch (err) {}
          }
        },
        {
          text: "Dismiss",
          style: "cancel"
        }
      ]
    );
  };

  const navigateTo = (href: string) => {
    setIsMenuOpen(false);
    router.push(href as any);
  };

  return (
    <View 
      className="z-50 h-16 flex-row items-center justify-between px-4 border-b"
      style={{
        backgroundColor: isLight ? "#F8FAFCF0" : "rgba(2, 6, 23, 0.9)",
        borderColor: mood.border,
      }}
    >
      <View className="flex-row items-center space-x-2">
        {/* 3-line Menu Button */}
        <Pressable 
          onPress={() => setIsMenuOpen(true)} 
          className="h-9 w-9 items-center justify-center rounded-none border active:opacity-70"
          style={{
            borderColor: mood.border,
            backgroundColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.05)"
          }}
        >
          <MenuIcon color={mood.primary} />
        </Pressable>

        {/* Signal Active pulsing indicator */}
        <View className="flex-row items-center space-x-1.5 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-none">
          <View 
            className="w-5 h-5 rounded-none flex items-center justify-center"
            style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}
          >
            <View 
              className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" 
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
              className="text-[10px] font-black uppercase tracking-[0.1em] leading-none"
              style={{ color: mood.primary }}
            >
              Active
            </Text>
            <Text 
              className="text-[9px] font-bold opacity-60 uppercase tracking-[0.05em] mt-0.5 max-w-[60px]"
              style={{ color: mood.text }}
              numberOfLines={1}
            >
              {user?.name || "Operator"}
            </Text>
          </View>
        </View>
      </View>

      {/* Mini logo in center */}
      <View className="flex-1 items-center justify-center pr-2">
        <Logo 
          size="sm" 
          style={{ width: 144, height: 40 }} 
          primaryColor={mood.primary}
          secondaryColor={mood.primary}
          accentColor={currentMood === "DAYLIGHT" ? "#F97316" : "#FF007F"}
          backgroundColor={isLight ? "#F8FAFC" : "#020617"}
          textColor={mood.text}
          subtext="AGENT"
        />
      </View>

      {/* Right controls: Bell and Profile */}
      <View className="flex-row items-center space-x-2">
        <Pressable
          onPress={handleNotificationPress}
          className="relative h-9 w-9 items-center justify-center rounded-none border active:opacity-70"
          style={{
            borderColor: mood.border,
            backgroundColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.05)"
          }}
        >
          <NotificationIcon color={mood.text} />
          {unreadCount > 0 && (
            <View 
              className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-none" 
              style={{ 
                backgroundColor: mood.primary,
                borderColor: isLight ? "#F8FAFC" : "#020617"
              }} 
            />
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push("/(agent)/profile")}
          className="h-9 w-9 rounded-none border overflow-hidden items-center justify-center active:opacity-70"
          style={{
            borderColor: mood.border,
            backgroundColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.05)"
          }}
        >
          <Image 
            source={{ uri: resolveMediaUrl(user?.avatar) || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80" }} 
            className="h-full w-full rounded-none"
            contentFit="cover"
          />
        </Pressable>
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
              backgroundColor: isLight ? "#F1F5F9" : "#020617",
              borderRightColor: mood.border
            }}
          >
            <View className="gap-6">
              <View className="flex-row items-center justify-between">
                <Logo 
                  size="sm" 
                  style={{ width: 144, height: 40 }} 
                  primaryColor={mood.primary}
                  secondaryColor={mood.primary}
                  accentColor={currentMood === "DAYLIGHT" ? "#F97316" : "#FF007F"}
                  backgroundColor={isLight ? "#F1F5F9" : "#020617"}
                  textColor={mood.text}
                  subtext="AGENT"
                />
                <Pressable 
                  onPress={() => setIsMenuOpen(false)} 
                  className="h-7 w-7 rounded-none border items-center justify-center active:opacity-70"
                  style={{
                    borderColor: mood.border,
                    backgroundColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.05)"
                  }}
                >
                  <Text className="text-[10px] font-black" style={{ color: mood.text }}>✕</Text>
                </Pressable>
              </View>

              <View 
                className="rounded-none p-3 flex-row items-center gap-2 border"
                style={{
                  borderColor: getRgba(mood.primary, 0.2),
                  backgroundColor: getRgba(mood.primary, 0.05)
                }}
              >
                <View className="h-2.5 w-2.5 rounded-none bg-emerald-500" />
                <View className="flex-1">
                  <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: mood.primary }}>Active Operator Node</Text>
                  <Text className="text-[10px] font-bold" style={{ color: mood.text }} numberOfLines={1}>{user?.email ?? "Guest Operator"}</Text>
                </View>
              </View>

              <View className="gap-2">
                {[
                  { label: "Missions Dashboard", href: "/(agent)/dashboard" },
                  { label: "Live Trace Map", href: "/(agent)/tracking" },
                  { label: "Mission History", href: "/(agent)/history" },
                  { label: "Operator Profile", href: "/(agent)/profile" },
                  { label: "Secure Chat", href: "/(agent)/chat" }
                ].map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Pressable 
                      key={item.href} 
                      onPress={() => navigateTo(item.href)} 
                      className="flex-row items-center px-4 py-3 rounded-none border"
                      style={active ? {
                        borderColor: getRgba(mood.primary, 0.2),
                        backgroundColor: getRgba(mood.primary, 0.1)
                      } : {
                        borderColor: mood.border,
                        backgroundColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.03)"
                      }}
                    >
                      <Text 
                        className="text-xs font-black uppercase tracking-wider"
                        style={{ color: active ? mood.primary : mood.text }}
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
                className="w-full py-4 rounded-none border border-red-500/20 bg-red-500/10 items-center active:bg-red-500/20"
              >
                <Text className="text-xs font-black uppercase tracking-widest text-red-500">Terminate Session</Text>
              </Pressable>
              <Text className="text-[10px] font-black text-center uppercase tracking-widest" style={{ color: mood.text, opacity: 0.4 }}>OceanExotic Operator Protocol v1.4</Text>
            </View>
          </View>
        </View>
      </Modal>
      {ToastHost}
    </View>
  );
}

