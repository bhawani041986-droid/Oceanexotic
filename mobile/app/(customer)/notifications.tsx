import React, { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Bell } from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";
import { useThemeColors } from "@/hooks/useThemeColors";
import { FULL_API_URL } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNotificationStore } from "@/store/notificationStore";

export default function NotificationsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
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

  const renderItem = ({ item }: { item: any }) => (
    <Pressable 
      onPress={() => handleNotificationClick(item.id)}
      className="p-4 border-b flex-row gap-3"
      style={{ borderBottomColor: colors.border, backgroundColor: item.read ? colors.bg : colors.card }}
    >
      <View className="mt-1">
        <Bell size={20} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold" style={{ color: colors.text }}>{item.title}</Text>
        <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>{item.message}</Text>
        <Text className="text-[10px] mt-2 font-bold uppercase" style={{ color: colors.textMuted }}>
          {item.time}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View 
        className="h-16 flex-row items-center px-4 border-b"
        style={{ backgroundColor: colors.card, borderBottomColor: colors.border }}
      >
        <Pressable onPress={() => router.back()} className="mr-3 p-2">
          <ArrowLeft color={colors.text} size={24} />
        </Pressable>
        <Text className="text-lg font-black uppercase italic" style={{ color: colors.text }}>
          Notifications
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8 opacity-50">
          <Bell size={48} color={colors.textMuted} />
          <Text className="text-sm font-black uppercase text-center mt-4 tracking-widest" style={{ color: colors.textMuted }}>
            No pending notifications
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}
