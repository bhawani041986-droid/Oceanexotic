import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import { FULL_API_URL } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNotificationStore } from "@/store/notificationStore";

export default function NotificationsScreen() {
  const { t } = useTranslation();

  const colors = useThemeColors();
  const currentLanguage = useSettingsStore((s) => s.language);
  const { user } = useAuthStore();
  const { setUnreadCount } = useNotificationStore();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = user?.id || "USR-1001";
      try {
        const res = await fetch(`${FULL_API_URL}/api/customer/notifications?userId=${userId}`);
        const result = await res.json();
        if (result.status === "success") {
          const readBroadcastsStr = await AsyncStorage.getItem('ocean_read_broadcasts');
          const readBroadcasts = readBroadcastsStr ? JSON.parse(readBroadcastsStr) : [];
          const deletedBroadcastsStr = await AsyncStorage.getItem('ocean_deleted_broadcasts');
          const deletedBroadcasts = deletedBroadcastsStr ? JSON.parse(deletedBroadcastsStr) : [];
          
          const filtered = result.data.filter((n: any) => !deletedBroadcasts.includes(n.id));
          const withLocalReadState = filtered.map((n: any) => 
            n.id.startsWith('SIG-') && readBroadcasts.includes(n.id) ? { ...n, read: true } : n
          );
          
          setNotifications(withLocalReadState);
          setUnreadCount(withLocalReadState.filter((n: any) => !n.read).length);
        }
      } catch (error) {
        console.warn("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user?.id, setUnreadCount]);

  const handleNotificationClick = async (id: string) => {
    const notif = notifications.find(n => n.id === id);
    if (!notif || notif.read) return;

    // UI Update
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);

    // DB / Local Update
    if (id.startsWith('SIG-')) {
      const readBroadcastsStr = await AsyncStorage.getItem('ocean_read_broadcasts');
      const readBroadcasts = readBroadcastsStr ? JSON.parse(readBroadcastsStr) : [];
      await AsyncStorage.setItem('ocean_read_broadcasts', JSON.stringify(Array.from(new Set([...readBroadcasts, id]))));
    }

    try {
      await fetch(`${FULL_API_URL}/api/customer/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MARK_READ', notificationId: id })
      });
    } catch (e) { console.warn(e); }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'ORDER': return 'boat-outline';
      case 'PROMO': return 'flash-outline';
      case 'SYSTEM': return 'information-circle-outline';
      default: return 'water-outline';
    }
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
    >
      <Text
        className="text-2xl font-black uppercase mb-6"
        style={{ color: colors.text }}
      >
        {t('notifications')}
      </Text>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : notifications.length === 0 ? (
        <View className="items-center justify-center p-8 opacity-50 mt-10">
          <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
          <Text className="text-sm font-black uppercase text-center mt-4 tracking-widest" style={{ color: colors.textMuted }}>
            No pending notifications
          </Text>
        </View>
      ) : (
        <View className="gap-4">
          {notifications.map((notif) => (
            <Pressable
              key={notif.id}
              onPress={() => handleNotificationClick(notif.id)}
              className="flex-row p-4 rounded-none border"
              style={{
                backgroundColor: !notif.read ? colors.primary + "10" : colors.card,
                borderColor: !notif.read ? colors.primary + "30" : colors.border,
              }}
            >
              <View
                className="w-10 h-10 rounded-none items-center justify-center mr-4 border"
                style={{
                  backgroundColor: !notif.read ? colors.primary + "20" : colors.bgAlt,
                  borderColor: !notif.read ? colors.primary + "40" : colors.border,
                }}
              >
                <Ionicons
                  name={getIconForType(notif.type) as any}
                  size={20}
                  color={!notif.read ? colors.primary : colors.textMuted}
                />
              </View>
              <View className="flex-1">
                <View className="flex-row justify-between items-start mb-1">
                  <Text
                    className="text-sm font-bold uppercase tracking-wide flex-1 mr-2"
                    style={{ color: colors.text }}
                  >
                    {notif.title}
                  </Text>
                  <Text
                    className="text-[10px] font-bold"
                    style={{ color: colors.textMuted }}
                  >
                    {notif.time}
                  </Text>
                </View>
                <Text
                  className="text-xs leading-relaxed"
                  style={{ color: colors.textMuted }}
                >
                  {notif.message}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
