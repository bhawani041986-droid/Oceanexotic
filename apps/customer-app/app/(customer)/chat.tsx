import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { t } from "@/lib/i18n";

function AttachIcon({ color }: { color: string }) {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </Svg>
  );
}

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

  const primaryColor = '#00D1FF';
  const borderColor = 'rgba(0, 209, 255, 0.25)';
  const bgCard = "rgba(15, 23, 42, 0.6)";

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

  async function createDefaultSupportConversation() {
    if (!customerId) return;
    try {
      const res = await api.post(`/chat/create_conversation`, {
        participant_1: customerId,
        participant_2: 'ADM-001'
      });
      if (res.status === 200 || res.status === 201) {
        fetchConversations();
      }
    } catch (err) {
      console.error("Auto-create support conversation failed:", err);
    }
  }

  async function fetchConversations() {
    try {
      const res = await api.get(`/chat/get_conversations`, {
        params: { user_id: customerId, t: Date.now() }
      });
      if (Array.isArray(res.data)) {
        setConversations(res.data);
        if (res.data.length === 0 && customerId && (customerId.startsWith('USR-') || customerId === 'USR-001')) {
          createDefaultSupportConversation();
        }
      }
    } catch (err) {
      console.error("Conversations fetch failure:", err);
    } finally {
      setLoadingConv(false);
    }
  }

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

  const handleDeleteMessage = async (msgId: number) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
    try {
      await api.post(`/chat/delete_message`, {
        message_id: msgId,
        sender_id: customerId
      });
      fetchConversations();
    } catch (err) {
      console.error("Delete message error:", err);
      if (activeConv) fetchMessages(activeConv.id, false);
    }
  };

  const handleAttachImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      uploadAndSendImage(selectedAsset.uri);
    }
  };

  const uploadAndSendImage = async (uri: string) => {
    setSending(true);
    try {
      const filename = uri.split('/').pop() || 'upload.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename,
        type: type,
      } as any);

      const uploadRes = await api.post(`/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (uploadRes.data?.url && activeConv) {
        const res = await api.post(`/chat/send_message`, {
          conversation_id: activeConv.id,
          sender_id: customerId,
          message_text: '',
          message_type: 'IMAGE',
          attachment_url: uploadRes.data.url
        });

        if (res.data?.status === "success") {
          fetchMessages(activeConv.id, false);
          fetchConversations();
        }
      } else {
        Alert.alert("Upload Failed", "Could not upload the image. Please try again.");
      }
    } catch (err) {
      console.error("Upload image error:", err);
      Alert.alert("Error", "Failed to upload image.");
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
            {activeConv ? activeConv.other_party_name : "Chat Messages"}
          </Text>
          <Text className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">
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
          <Text className="text-xs font-black text-white uppercase tracking-tight italic ml-1 mb-4">
            {t('active_chats') || "Active Chats"}
          </Text>

          {loadingConv ? (
            <ActivityIndicator color={primaryColor} className="py-12" />
          ) : conversations.length === 0 ? (
            <View className="py-16 items-center justify-center opacity-30 border border-white/5 rounded-2xl bg-slate-900/20">
              <Text className="text-[10px] font-bold text-white uppercase tracking-widest italic">
                {t('no_active_chats_found') || "No active chats found"}
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
                    {conv.last_message || "Start chatting..."}
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
                const isMe = m.sender_id === customerId;
                return (
                  <Pressable 
                    key={m.id}
                    onLongPress={() => {
                      Alert.alert(
                        "Delete Message",
                        "Are you sure you want to delete this message?",
                        [
                          { text: "Cancel", style: "cancel" },
                          { 
                            text: "Delete", 
                            style: "destructive", 
                            onPress: () => handleDeleteMessage(m.id) 
                          }
                        ]
                      );
                    }}
                    className={`mb-3 max-w-[80%] rounded-2xl p-3.5 border ${
                      isMe 
                        ? "align-self-end bg-[#7C3AED]/15 border-[#7C3AED]/35 ml-auto" 
                        : "align-self-start bg-slate-900 border-white/5 mr-auto"
                    }`}
                  >
                    {m.message_type === 'IMAGE' && m.attachment_url ? (
                      <View className="mb-2 rounded-xl overflow-hidden bg-slate-800" style={{ width: 200, height: 150 }}>
                        <Image 
                          source={{ uri: m.attachment_url }} 
                          style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                        />
                      </View>
                    ) : null}
                    {m.message_text ? (
                      <Text className="text-[10px] font-medium text-slate-100">
                        {m.message_text}
                      </Text>
                    ) : null}
                    <Text className={`text-[6px] font-black text-slate-500 uppercase mt-1.5 ${isMe ? "text-right" : "text-left"}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          {/* Chat input box */}
          <View 
            className="h-16 border-t bg-slate-950 flex-row items-center px-4"
            style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
          >
            <Pressable
              onPress={handleAttachImage}
              disabled={sending}
              className="p-2 mr-1 rounded-full bg-white/5 border border-white/5 active:scale-95"
            >
              <AttachIcon color={primaryColor} />
            </Pressable>
            <TextInput
              value={msgText}
              onChangeText={setMsgText}
              placeholder="Type a message..."
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
