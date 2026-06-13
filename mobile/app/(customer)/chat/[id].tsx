import React, { useState, useEffect, useRef } from "react";
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
import { FULL_API_URL } from "@/config/api";
import { supabase } from "@/lib/supabase";
import { Send, ArrowLeft, MoreVertical, Paperclip } from "lucide-react-native";
import { cn } from "@/lib/utils";

export default function ChatMessageScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuthStore();
  const { id, name, role } = useLocalSearchParams<{ id: string; name: string; role: string }>();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  
  const currentUserId = user?.id || "USR-001";
  const activeChat = parseInt(id || "0");

  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${FULL_API_URL}/chat/get_messages?conversation_id=${activeChat}&t=${Date.now()}`);
        const data = await res.json();
        // Reverse data for inverted FlatList
        setMessages(Array.isArray(data) ? data.reverse() : []);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Supabase Realtime Subscription
    const channel = supabase
      .channel(`chat_messages:conversation_id=eq.${activeChat}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${activeChat}` },
        (payload) => {
          if (payload.new.sender_id !== currentUserId) {
            setMessages((prev) => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat]);

  const handleSend = async () => {
    if (!text.trim() || !activeChat) return;

    const textToSend = text;
    setText("");

    // Optimistic UI Update
    const tempMsg = {
      id: Date.now(),
      conversation_id: activeChat,
      sender_id: currentUserId,
      message_text: textToSend,
      is_read: 0,
      created_at: new Date().toISOString()
    };
    
    setMessages((prev) => [tempMsg, ...prev]);

    try {
      // 1. Insert into chat_messages
      const { error: msgError } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: activeChat,
          sender_id: currentUserId,
          message_text: textToSend,
          is_read: 0
        }]);
        
      if (msgError) throw msgError;

      // 2. Update conversation last message timestamp
      await supabase
        .from('chat_conversations')
        .update({
          last_message_text: textToSend,
          last_message_time: new Date().toISOString()
        })
        .eq('id', activeChat);

    } catch (err) {
      console.error("Failed to send message", err);
    }
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
            <Text className="text-[9px] font-black uppercase tracking-widest" style={{ color: colors.success }}>
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
        {loading ? (
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
            onPress={handleSend}
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
