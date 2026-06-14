import React, { useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  Pressable, 
  ActivityIndicator 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Send, ArrowLeft, MoreVertical, Paperclip } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { useChatEngine } from "@/hooks/useChatEngine";

export default function ChatMessageScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuthStore();
  const { id, name, role } = useLocalSearchParams<{ id: string; name: string; role: string }>();
  
  const currentUserId = user?.id || "USR-001";
  const activeChatId = parseInt(id || "0");

  const {
    messages,
    isLoading,
    setActiveChat,
    handleSendMessage,
  } = useChatEngine(currentUserId);

  const [text, setText] = React.useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (activeChatId) {
      setActiveChat(activeChatId);
    }
  }, [activeChatId]);

  const onSend = () => {
    if (!text.trim()) return;
    handleSendMessage(text);
    setText("");
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender_id === currentUserId;
    return (
      <View className={cn("mb-4 flex-row", isMe ? "justify-end" : "justify-start")}>
        <View 
          className={cn(
            "max-w-[80%] px-4 py-3", 
            isMe ? "rounded-2xl rounded-tr-sm" : "rounded-2xl rounded-tl-sm"
          )}
          style={{ 
            backgroundColor: isMe ? colors.primary : colors.card,
            borderWidth: isMe ? 0 : 1,
            borderColor: colors.border
          }}
        >
          <Text style={{ color: isMe ? "#FFFFFF" : colors.text, fontSize: 14 }}>
            {item.message_text}
          </Text>
          <Text 
            className="text-[9px] font-black uppercase mt-2 text-right opacity-50"
            style={{ color: isMe ? "#FFFFFF" : colors.text }}
          >
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <View 
        className="h-20 flex-row items-center justify-between px-4 pt-8 border-b"
        style={{ backgroundColor: colors.card, borderBottomColor: colors.border }}
      >
        <View className="flex-row items-center flex-1">
          <Pressable onPress={() => router.back()} className="mr-3 p-2">
            <ArrowLeft color={colors.text} size={24} />
          </Pressable>
          <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: colors.border }}>
            <Text className="text-xl">{role === 'SELLER' ? "🚢" : "🌊"}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-black uppercase italic" style={{ color: colors.text }}>
              {name || `Terminal #${id}`}
            </Text>
            <Text className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#22C55E" }}>
              ● Secure Link Active
            </Text>
          </View>
        </View>
        <Pressable className="p-2">
          <MoreVertical color={colors.text} size={24} />
        </Pressable>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
            inverted
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input Bar */}
        <View 
          className="flex-row items-end p-4 border-t gap-2"
          style={{ backgroundColor: colors.card, borderTopColor: colors.border }}
        >
          <Pressable className="p-3 items-center justify-center rounded-xl" style={{ backgroundColor: colors.border }}>
            <Paperclip color={colors.textMuted} size={20} />
          </Pressable>
          
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            multiline
            className="flex-1 px-4 py-3 min-h-[44px] max-h-32 text-sm rounded-2xl"
            style={{ 
              backgroundColor: colors.bg, 
              color: colors.text,
              borderWidth: 1,
              borderColor: colors.border
            }}
          />

          <Pressable 
            onPress={onSend}
            className="w-12 h-12 rounded-2xl items-center justify-center"
            style={{ 
              backgroundColor: text.trim() ? colors.primary : colors.border,
              opacity: text.trim() ? 1 : 0.7
            }}
          >
            <Send color={text.trim() ? "#FFFFFF" : colors.textMuted} size={20} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
