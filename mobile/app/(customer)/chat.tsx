import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle, Polygon } from "react-native-svg";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useThemeColors } from "@/hooks/useThemeColors";
import { SectionTitle } from "@/components/customer/SectionTitle";
import { ChamferedBox } from "@/components/ui/ChamferedBox";

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

function SendIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="m22 2-7 20-4-9-9-4Z" />
      <Path d="M22 2 11 13" />
    </Svg>
  );
}

export default function CustomerChatScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const colors = useThemeColors();

  const primaryColor = colors.primary;
  const borderColor = colors.border;
  const bgCard = colors.card;

  const customerId = user?.id || 'USR-001';

  const [loadingConv, setLoadingConv] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);

  // Messages states
  const [messages, setMessages] = useState<any[]>([]);
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const fetchConversations = async () => {
    try {
      const res = await api.get(`/chat/get_conversations`, {
        params: { user_id: customerId, t: Date.now() }
      });
      if (Array.isArray(res.data)) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error("Conversations fetch failure:", err);
    } finally {
      setLoadingConv(false);
    }
  };

  const fetchMessages = async (convId: string, showLoader = false) => {
    if (showLoader) setLoadingMsgs(true);
    try {
      const res = await api.get(`/chat/get_messages`, {
        params: { conversation_id: convId, t: Date.now() }
      });
      if (Array.isArray(res.data)) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error("Messages fetch failure:", err);
    } finally {
      if (showLoader) setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [customerId]);

  // Real-time polling every 3 seconds when viewing active chat stream
  useEffect(() => {
    if (!activeConv) return;

    fetchMessages(activeConv.id, true);

    const interval = setInterval(() => {
      fetchMessages(activeConv.id, false);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeConv]);

  // Scroll to bottom when messages load
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!msgText.trim() || !activeConv) return;

    setSending(true);
    const toSend = msgText;
    setMsgText("");

    try {
      const res = await api.post(`/chat/send_message`, {
        conversation_id: activeConv.id,
        sender_id: customerId,
        message_text: toSend
      });

      if (res.data?.status === "success") {
        // Optimistically update list or refresh instantly
        fetchMessages(activeConv.id, false);
        fetchConversations();
      }
    } catch (err) {
      console.error("Message send failure:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      className="flex-1" style={{ backgroundColor: colors.bg }}
    >
      {/* Header */}
      <View 
        className="h-16 flex-row items-center px-4 border-b" 
        style={{ borderColor: colors.border, backgroundColor: colors.bg }}
      >
        {activeConv ? (
          <Pressable 
            onPress={() => {
              setActiveConv(null);
              setMessages([]);
              fetchConversations();
            }} 
            className="p-2 mr-2 rounded-none bg-white/5 border border-white/5 active:scale-95 relative overflow-hidden"
          >
            <Svg width={4} height={4} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 4,0 0,4" fill={colors.bg} /></Svg>
            <Svg width={4} height={4} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="4,4 0,4 4,0" fill={colors.bg} /></Svg>
            <BackIcon color="white" />
          </Pressable>
        ) : (
          <Pressable 
            onPress={() => router.back()} 
            className="p-2 mr-2 rounded-none bg-white/5 border border-white/5 active:scale-95 relative overflow-hidden"
          >
            <Svg width={4} height={4} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 4,0 0,4" fill={colors.bg} /></Svg>
            <Svg width={4} height={4} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="4,4 0,4 4,0" fill={colors.bg} /></Svg>
            <BackIcon color="white" />
          </Pressable>
        )}
        <View>
          <Text className="text-xs font-black uppercase tracking-widest italic" style={{ color: colors.text }}>
            {activeConv ? activeConv.other_party_name : "Chat Messages"}
          </Text>
          <Text className="text-[7px] font-bold uppercase tracking-widest" style={{ color: colors.primary }}>
            {activeConv ? `${activeConv.other_party_role.toUpperCase()} PORT` : "Support Team"}
          </Text>
        </View>
      </View>

      {/* Main chat interface */}
      {!activeConv ? (
        // Master list
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        >
          <View className="mb-4">
            <SectionTitle 
              title="Active Chats" 
              subtitle="DIRECT MESSAGES TO SELLER HARBORS & RIDER FLEETS" 
            />
          </View>

          {loadingConv ? (
            <ActivityIndicator color={primaryColor} className="py-12" />
          ) : conversations.length === 0 ? (
            <View className="py-16 items-center justify-center opacity-30 border border-white/5 rounded-none bg-slate-900/20 relative overflow-hidden">
              <Svg width={12} height={12} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 12,0 0,12" fill="#020617" /></Svg>
              <Svg width={12} height={12} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="12,12 0,12 12,0" fill="#020617" /></Svg>
              <Text className="text-[10px] font-bold text-white uppercase tracking-widest italic">
                No active chats found
              </Text>
            </View>
          ) : (
            conversations.map((conv) => (
              <ChamferedBox
                key={conv.id}
                fillColor={colors.card}
                strokeColor={colors.border}
                bevelSize={10}
                className="mb-3"
              >
                <Pressable
                  onPress={() => setActiveConv(conv)}
                  className="p-4 flex-row justify-between items-center active:opacity-85"
                >
                  <View className="flex-1 pr-3">
                    <View className="flex-row items-center gap-2 mb-1">
                      <View className="w-2 h-2 rounded-none" style={{ backgroundColor: colors.primary }} />
                      <Text className="text-[11px] font-black uppercase tracking-wider italic" style={{ color: colors.text }}>
                        {conv.other_party_name}
                      </Text>
                      <Text className="text-[6.5px] font-black uppercase" style={{ color: colors.accent }}>
                        {conv.other_party_role}
                      </Text>
                    </View>
                    <Text className="text-[9.5px] font-medium" style={{ color: colors.textMuted }} numberOfLines={1}>
                      {conv.last_message || "Start chatting..."}
                    </Text>
                  </View>

                  <Text className="text-[7.5px] font-black uppercase" style={{ color: colors.textMuted }}>
                    {conv.time}
                  </Text>
                </Pressable>
              </ChamferedBox>
            ))
          )}
        </ScrollView>
      ) : (
        // Detail Chat view
        <View className="flex-1">
          <ScrollView 
            ref={scrollViewRef}
            className="flex-1 px-4 py-4"
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            {loadingMsgs && messages.length === 0 ? (
              <ActivityIndicator color={primaryColor} className="py-12" />
            ) : (
              messages.map((m) => {
                const isMe = m.sender_id === customerId;
                return (
                  <View key={m.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', marginBottom: 12 }}>
                    <ChamferedBox
                      fillColor={isMe ? 'rgba(124, 58, 237, 0.12)' : colors.card}
                      strokeColor={isMe ? 'rgba(124, 58, 237, 0.35)' : colors.border}
                      bevelSize={8}
                    >
                      <View className="p-3">
                        <Text className="text-[10px] font-medium" style={{ color: colors.text }}>
                          {m.message_text}
                        </Text>
                        <Text className="text-[6px] font-black uppercase mt-1.5 text-right" style={{ color: colors.textMuted }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </ChamferedBox>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Chat input box */}
          <View 
            className="h-16 border-t bg-slate-950 flex-row items-center px-4"
            style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
          >
            <View className="flex-1 h-10 relative overflow-hidden">
              <TextInput
                value={msgText}
                onChangeText={setMsgText}
                placeholder="Type a message..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                onSubmitEditing={handleSendMessage}
                className="w-full h-full border rounded-none bg-slate-900/50 px-3 text-xs font-bold text-white uppercase tracking-wider"
                style={{ borderColor: borderColor }}
              />
              <Svg width={6} height={6} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 6,0 0,6" fill="#020617" /></Svg>
              <Svg width={6} height={6} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="6,6 0,6 6,0" fill="#020617" /></Svg>
            </View>
            <Pressable
              onPress={handleSendMessage}
              disabled={sending || !msgText.trim()}
              className="w-10 h-10 rounded-none bg-[#7C3AED] items-center justify-center ml-2.5 active:bg-[#6D28D9] relative overflow-hidden"
            >
              <Svg width={4} height={4} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 4,0 0,4" fill="#020617" /></Svg>
              <Svg width={4} height={4} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="4,4 0,4 4,0" fill="#020617" /></Svg>
              {sending ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <SendIcon color="white" />
              )}
            </Pressable>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
