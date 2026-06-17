import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, Pressable, Alert, Image, ActivityIndicator } from "react-native";
import Svg, { Path, Line, Rect } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/store/authStore";
import { useAgentStore, MOODS } from "@/store/agentStore";
import api from "@/services/api";

function AttachIcon({ color }: { color: string }) {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </Svg>
  );
}

function MonitorIcon({ color }: { color: string }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <Line x1="8" y1="21" x2="16" y2="21" />
      <Line x1="12" y1="17" x2="12" y2="21" />
    </Svg>
  );
}

function SendIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Line x1="22" y1="2" x2="11" y2="13" />
      <Path d="M22 2 15 22 11 13 2 9 22 2z" />
    </Svg>
  );
}

export default function AgentSupportScreen() {
  const user = useAuthStore((s) => s.user);
  const currentMood = useAgentStore((s) => s.currentMood);
  const mood = MOODS[currentMood];
  const isLight = currentMood === "DAYLIGHT";

  // Format ID for agent
  const agentId = user?.id ? (user.id.startsWith("FLEET-") ? user.id : `FLEET-${user.id}`) : 'FLEET-001';

  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConv, setLoadingConv] = useState(true);

  const scrollViewRef = useRef<ScrollView>(null);

  async function createDefaultSupportConversation() {
    if (!agentId) return;
    try {
      const res = await api.post(`/chat/create_conversation`, {
        participant_1: agentId,
        participant_2: 'ADM-001'
      });
      if (res.status === 200 || res.status === 201) {
        fetchConversations();
      }
    } catch (err) {
      console.error("Auto-create support conversation failed:", err);
    }
  }

  const fetchConversations = async () => {
    try {
      const res = await api.get(`/chat/get_conversations`, {
        params: { user_id: agentId, t: Date.now() }
      });
      if (Array.isArray(res.data)) {
        if (res.data.length > 0) {
          setActiveConv(res.data[0]); // Auto-select the first conversation to match the old UI perfectly
        } else if (agentId) {
          createDefaultSupportConversation();
        }
      }
    } catch (err) {
      console.error("Conversations fetch failure:", err);
    } finally {
      setLoadingConv(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await api.get(`/chat/get_messages`, {
        params: { conversation_id: convId, t: Date.now() }
      });
      if (Array.isArray(res.data)) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error("Messages fetch failure:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [agentId]);

  // Polling for active chat
  useEffect(() => {
    if (!activeConv) return;
    fetchMessages(activeConv.id);
    const interval = setInterval(() => {
      fetchMessages(activeConv.id);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeConv]);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !activeConv) return;
    setSending(true);
    const toSend = inputText.trim();
    setInputText("");

    try {
      const res = await api.post(`/chat/send_message`, {
        conversation_id: activeConv.id,
        sender_id: agentId,
        message_text: toSend
      });
      if (res.data?.status === "success") {
        fetchMessages(activeConv.id);
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
        sender_id: agentId
      });
    } catch (err) {
      console.error("Delete message error:", err);
      if (activeConv) fetchMessages(activeConv.id);
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (uploadRes.data?.url && activeConv) {
        const res = await api.post(`/chat/send_message`, {
          conversation_id: activeConv.id,
          sender_id: agentId,
          message_text: '',
          message_type: 'IMAGE',
          attachment_url: uploadRes.data.url
        });
        if (res.data?.status === "success") {
          fetchMessages(activeConv.id);
        }
      } else {
        Alert.alert("Upload Failed", "Could not upload the image.");
      }
    } catch (err) {
      console.error("Upload image error:", err);
      Alert.alert("Error", "Failed to upload image.");
    } finally {
      setSending(false);
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
      uploadAndSendImage(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : undefined} 
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      style={{ backgroundColor: mood.bg }}
    >
      <View className="flex-1 px-4 py-4">
        {/* Header */}
        <View className="mb-6 flex-row items-center border-b pb-4 justify-between" style={{ borderColor: mood.border }}>
          <View className="flex-row items-center">
            {activeConv?.other_party_avatar ? (
              <Image 
                source={{ uri: activeConv.other_party_avatar }} 
                className="w-12 h-12 rounded-xl mr-3 bg-slate-800"
                style={{ borderWidth: 1, borderColor: mood.primary }}
              />
            ) : (
              <View className="w-12 h-12 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: mood.primary + "20" }}>
                <MonitorIcon color={mood.primary} />
              </View>
            )}
            <View>
              <Text className="text-xl font-black italic tracking-tighter uppercase" style={{ color: mood.text }}>
                {activeConv ? activeConv.other_party_name : "Secure Comms"}
              </Text>
              <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                {activeConv ? activeConv.other_party_role : "Direct Uplink to Command"}
              </Text>
            </View>
          </View>
          {loadingConv && <ActivityIndicator color={mood.primary} />}
        </View>

        {/* Chat Log */}
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 mb-4"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => {
            const isMe = msg.sender_id === agentId;

            // Optional generic system message logic if needed based on metadata/sender
            if (msg.message_type === 'SYSTEM' || msg.sender_id === 'system') {
              return (
                <View key={msg.id} className="items-center my-4">
                  <View className="px-3 py-1.5 rounded-full border border-dashed" style={{ borderColor: mood.border, backgroundColor: mood.text + "05" }}>
                    <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {msg.message_text}
                    </Text>
                  </View>
                </View>
              );
            }

            return (
              <Pressable 
                key={msg.id} 
                onLongPress={() => {
                  Alert.alert(
                    "Delete Message",
                    "Are you sure you want to completely erase this communication from the registry?",
                    [
                      { text: "Cancel", style: "cancel" },
                      { 
                        text: "Erase", 
                        style: "destructive", 
                        onPress: () => handleDeleteMessage(msg.id) 
                      }
                    ]
                  );
                }}
                className={`mb-4 max-w-[80%] ${isMe ? "self-end" : "self-start"}`}
              >
                <View 
                  className={`p-3.5 rounded-2xl border`}
                  style={{
                    backgroundColor: isMe ? mood.primary + "20" : isLight ? "#F1F5F9" : "rgba(255,255,255,0.05)",
                    borderColor: isMe ? mood.primary + "40" : mood.border,
                    borderBottomRightRadius: isMe ? 4 : 16,
                    borderBottomLeftRadius: !isMe ? 4 : 16,
                  }}
                >
                  {!isMe && (
                    <Text className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: mood.primary }}>
                      {activeConv?.other_party_role || "HQ COMMAND"}
                    </Text>
                  )}
                  {msg.message_type === 'IMAGE' && msg.attachment_url ? (
                    <View className="mb-2 rounded-xl overflow-hidden bg-slate-800" style={{ width: 180, height: 130 }}>
                      <Image 
                        source={{ uri: msg.attachment_url }} 
                        style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                      />
                    </View>
                  ) : null}
                  {msg.message_text ? (
                    <Text className="text-[12px] font-medium leading-relaxed" style={{ color: mood.text }}>
                      {msg.message_text}
                    </Text>
                  ) : null}
                </View>
                <Text className={`text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1.5 ${isMe ? "text-right" : "text-left"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Input Area */}
        <View 
          className="flex-row items-center p-2 rounded-2xl border"
          style={{
            backgroundColor: isLight ? "#FFFFFF" : "rgba(0,0,0,0.2)",
            borderColor: mood.border
          }}
        >
          <Pressable
            onPress={handleAttachImage}
            disabled={sending}
            className="p-2.5 mr-1 rounded-full bg-white/5 border border-white/5 active:scale-95"
          >
            <AttachIcon color={mood.primary} />
          </Pressable>
          <TextInput
            className="flex-1 max-h-[100px] min-h-[44px] px-3 pt-3 pb-3 text-[13px] font-medium"
            style={{ color: mood.text }}
            placeholder="Transmit secure message..."
            placeholderTextColor={isLight ? "#94A3B8" : "rgba(255,255,255,0.3)"}
            multiline
            value={inputText}
            onChangeText={setInputText}
          />
          <Pressable 
            onPress={handleSend}
            disabled={sending || !inputText.trim()}
            className="w-11 h-11 rounded-xl items-center justify-center ml-2 active:scale-95"
            style={{ backgroundColor: mood.primary, opacity: (sending || !inputText.trim()) ? 0.5 : 1 }}
          >
            {sending ? (
              <ActivityIndicator color={isLight ? "#FFFFFF" : "#020617"} size="small" />
            ) : (
              <SendIcon color={isLight ? "#FFFFFF" : "#020617"} />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
