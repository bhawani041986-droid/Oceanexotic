import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

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

export default function SellerChatScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const primaryColor = "#7C3AED";
  const borderColor = "rgba(124, 58, 237, 0.25)";
  const bgCard = "rgba(15, 23, 42, 0.6)";

  const sellerId = user?.id ? (user.id.startsWith("SEL-") ? user.id : `SEL-${user.id}`) : 'SEL-001';

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
        params: { user_id: sellerId, t: Date.now() }
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
  }, [sellerId]);

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
        sender_id: sellerId,
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
      className="flex-1 bg-[#020617]"
    >
      {/* Header */}
      <View 
        className="h-16 flex-row items-center px-4 border-b bg-slate-950"
        style={{ borderColor: borderColor }}
      >
        {activeConv ? (
          <Pressable 
            onPress={() => {
              setActiveConv(null);
              setMessages([]);
              fetchConversations();
            }} 
            className="p-2 mr-2 rounded-full bg-white/5 border border-white/5 active:scale-95"
          >
            <BackIcon color="white" />
          </Pressable>
        ) : (
          <Pressable 
            onPress={() => router.back()} 
            className="p-2 mr-2 rounded-full bg-white/5 border border-white/5 active:scale-95"
          >
            <BackIcon color="white" />
          </Pressable>
        )}
        <View>
          <Text className="text-xs font-black uppercase text-white tracking-widest italic">
            {activeConv ? activeConv.other_party_name : "Sovereign Transmission Signals"}
          </Text>
          <Text className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">
            {activeConv ? `${activeConv.other_party_role.toUpperCase()} PORT` : "Fleet Comm-Link Terminal"}
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
          <Text className="text-xs font-black text-white uppercase tracking-tight italic ml-1 mb-4">
            Active Comm Streams
          </Text>

          {loadingConv ? (
            <ActivityIndicator color={primaryColor} className="py-12" />
          ) : conversations.length === 0 ? (
            <View className="py-16 items-center justify-center opacity-30 border border-white/5 rounded-2xl bg-slate-900/20">
              <Text className="text-[10px] font-bold text-white uppercase tracking-widest italic">
                No signals registered in grid
              </Text>
            </View>
          ) : (
            conversations.map((conv) => (
              <Pressable
                key={conv.id}
                onPress={() => setActiveConv(conv)}
                className="p-4 rounded-2xl border mb-3 bg-slate-950/40 flex-row justify-between items-center active:bg-slate-900/50"
                style={{ borderColor: borderColor }}
              >
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center gap-2 mb-1">
                    <View className="w-2 h-2 rounded-full bg-emerald-500" />
                    <Text className="text-[11px] font-black text-white uppercase tracking-wider italic">
                      {conv.other_party_name}
                    </Text>
                    <Text className="text-[6.5px] font-black text-[#7C3AED] uppercase">
                      {conv.other_party_role}
                    </Text>
                  </View>
                  <Text className="text-[9.5px] font-medium text-slate-400" numberOfLines={1}>
                    {conv.last_message || "Initialize protocol handshake..."}
                  </Text>
                </View>

                <Text className="text-[7.5px] font-black text-slate-500 uppercase">
                  {conv.time}
                </Text>
              </Pressable>
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
                const isMe = m.sender_id === sellerId;
                return (
                  <View 
                    key={m.id}
                    className={`mb-3 max-w-[80%] rounded-2xl p-3.5 border ${
                      isMe 
                        ? "align-self-end bg-[#7C3AED]/15 border-[#7C3AED]/35 ml-auto" 
                        : "align-self-start bg-slate-900 border-white/5 mr-auto"
                    }`}
                  >
                    <Text className="text-[10px] font-medium text-slate-100">
                      {m.message_text}
                    </Text>
                    <Text className="text-[6px] font-black text-slate-500 uppercase mt-1.5 text-right">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
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
            <TextInput
              value={msgText}
              onChangeText={setMsgText}
              placeholder="Transmit signal code..."
              placeholderTextColor="rgba(255,255,255,0.2)"
              onSubmitEditing={handleSendMessage}
              className="flex-1 h-10 border rounded-xl bg-slate-900/50 px-3 text-xs font-bold text-white uppercase tracking-wider"
              style={{ borderColor: borderColor }}
            />
            <Pressable
              onPress={handleSendMessage}
              disabled={sending || !msgText.trim()}
              className="w-10 h-10 rounded-xl bg-[#7C3AED] items-center justify-center ml-2.5 active:bg-[#6D28D9]"
            >
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
