import React, { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Bell } from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";
import { useThemeColors } from "@/hooks/useThemeColors";
import { FULL_API_URL } from "@/config/api";

export default function NotificationsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuthStore();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, mock notifications as the dedicated notification API might be part of the web view.
    // In production, fetch from `${FULL_API_URL}/notifications?user_id=${user?.id}`
    setTimeout(() => {
      setNotifications([]);
      setLoading(false);
    }, 500);
  }, [user?.id]);

  const renderItem = ({ item }: { item: any }) => (
    <View 
      className="p-4 border-b flex-row gap-3"
      style={{ borderBottomColor: colors.border, backgroundColor: item.is_read ? colors.bg : colors.card }}
    >
      <View className="mt-1">
        <Bell size={20} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold" style={{ color: colors.text }}>{item.title}</Text>
        <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>{item.message}</Text>
        <Text className="text-[10px] mt-2 font-bold uppercase" style={{ color: colors.textMuted }}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
    </View>
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
