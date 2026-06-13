import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useThemeColors } from "@/hooks/useThemeColors";
import { FULL_API_URL } from "@/config/api";
import Svg, { Path, Circle } from "react-native-svg";

export default function ChatInboxScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuthStore();
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const currentUserId = user?.id || "USR-001";
        const res = await fetch(`${FULL_API_URL}/chat/get_conversations?user_id=${currentUserId}&t=${Date.now()}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setConversations(data);
        }
      } catch (err) {
        console.error("Failed to load conversations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user?.id]);

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.id, name: item.other_party_name, role: item.other_party_role } } as never)}
      className="flex-row items-center p-4 border-b active:opacity-70"
      style={{ borderBottomColor: colors.border }}
    >
      <View 
        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
        style={{ backgroundColor: colors.border }}
      >
        <Text className="text-2xl">{item.other_party_role === 'SELLER' ? "🚢" : "🌊"}</Text>
      </View>
      <View className="flex-1 justify-center">
        <View className="flex-row justify-between items-center">
          <Text className="text-sm font-black uppercase italic" style={{ color: colors.text }}>
            {item.other_party_name || "Unknown"}
          </Text>
          <Text className="text-[9px] font-black" style={{ color: colors.textMuted }}>
            {item.time}
          </Text>
        </View>
        <Text 
          className="text-[10px] mt-1" 
          numberOfLines={1}
          style={{ color: colors.textMuted }}
        >
          {item.last_message || "No messages yet"}
        </Text>
      </View>
      {item.unread_count > 0 && (
        <View 
          className="ml-3 px-2 py-0.5 rounded-full"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-[10px] font-black text-white">{item.unread_count}</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="px-4 pt-4 pb-2 border-b" style={{ borderBottomColor: colors.border }}>
        <Text className="text-2xl font-black uppercase italic tracking-tighter" style={{ color: colors.text }}>
          Messages
        </Text>
        <Text className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: colors.textMuted }}>
          Secure Communication Hub
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : conversations.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-sm font-black uppercase text-center" style={{ color: colors.textMuted }}>
            No active conversations
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}
