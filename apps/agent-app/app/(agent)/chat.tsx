import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, Pressable, Alert, Image, ActivityIndicator, Modal } from "react-native";
import Svg, { Path, Line, Rect, Circle } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { WebView } from "react-native-webview";
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

function VideoIcon({ color }: { color: string }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="m22 8-6 4 6 4V8Z" />
      <Rect x="2" y="6" width="14" height="12" rx="2" ry="2" />
    </Svg>
  );
}

function FileTextIcon({ color }: { color: string }) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <Path d="M14 2v6h6" />
      <Line x1="16" y1="13" x2="8" y2="13" />
      <Line x1="16" y1="17" x2="8" y2="17" />
      <Line x1="10" y1="9" x2="8" y2="9" />
    </Svg>
  );
}

function ArrowLeftIcon({ color }: { color: string }) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="m12 19-7-7 7-7" />
      <Path d="M19 12H5" />
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
  
  const [convList, setConvList] = useState<any[]>([]);
  const [newChatModal, setNewChatModal] = useState(false);
  const [newChatTarget, setNewChatTarget] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

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
        setConvList(res.data);
        if (res.data.length === 0 && agentId) {
          createDefaultSupportConversation();
        }
      }
    } catch (err) {
      console.error("Conversations fetch failure:", err);
    } finally {
      setLoadingConv(false);
    }
  };

  const startNewChat = async () => {
    if (!newChatTarget.trim()) return;
    try {
      const res = await api.post(`/chat/create_conversation`, {
        participant_1: agentId,
        participant_2: newChatTarget.trim()
      });
      if (res.status === 200 || res.status === 201) {
        setNewChatModal(false);
        setNewChatTarget("");
        fetchConversations();
      }
    } catch (err) {
      Alert.alert("Error", "Could not start conversation with " + newChatTarget);
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
      fetchConversations(); // Also refresh conv list
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
    Alert.alert(
      "Attach File",
      "Choose attachment type",
      [
        { text: "Photo", onPress: async () => {
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
        }},
        { text: "Document / PDF", onPress: async () => {
            try {
              const res = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf'],
                copyToCacheDirectory: true,
              });
              if (!res.canceled && res.assets && res.assets.length > 0) {
                uploadAndSendImage(res.assets[0].uri);
              }
            } catch (err) {
              console.error("Document pick error", err);
            }
        }},
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleInitiateVideoCall = async () => {
    if (!activeConv) return;
    try {
      const roomID = `room_${activeConv.id}_${Date.now()}`;
      await api.post(`/chat/video_call/start`, {
        room_id: roomID,
        caller_id: agentId,
        conversation_id: activeConv.id
      });
      // Web will handle it on their end via polling. We just join the room:
      const fullUrl = api.defaults.baseURL?.replace('/api', '') || "https://oceanexotic.com";
      setVideoUrl(`${fullUrl}/agent/video-room?room=${roomID}&user=${agentId}`);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not establish video uplink.");
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
        {/* VIEW ROUTING */}
        {!activeConv ? (
          /* CHAT LIST VIEW */
          <View className="flex-1">
            <View className="mb-6 flex-row items-center justify-between border-b pb-4" style={{ borderColor: mood.border }}>
              <View>
                <Text className="text-xl font-black italic tracking-tighter uppercase" style={{ color: mood.text }}>Secure Comms</Text>
                <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Active Uplinks</Text>
              </View>
              <Pressable 
                onPress={() => setNewChatModal(true)}
                className="w-10 h-10 rounded-none items-center justify-center border"
                style={{ backgroundColor: mood.primary + "20", borderColor: mood.primary }}
              >
                <Text className="text-lg font-black" style={{ color: mood.primary }}>+</Text>
              </Pressable>
            </View>
            
            {loadingConv ? <ActivityIndicator color={mood.primary} className="mt-10" /> : (
              <ScrollView className="flex-1">
                {convList.map(conv => (
                  <Pressable 
                    key={conv.id} 
                    onPress={() => setActiveConv(conv)}
                    className="flex-row items-center p-4 mb-3 border rounded-none"
                    style={{ backgroundColor: "rgba(0,0,0,0.2)", borderColor: mood.border }}
                  >
                    {conv.other_party_avatar ? (
                      <Image source={{ uri: conv.other_party_avatar }} className="w-10 h-10 rounded-none mr-3 bg-slate-800" style={{ borderWidth: 1, borderColor: mood.primary }} />
                    ) : (
                      <View className="w-10 h-10 rounded-none items-center justify-center mr-3" style={{ backgroundColor: mood.primary + "20" }}>
                        <MonitorIcon color={mood.primary} />
                      </View>
                    )}
                    <View className="flex-1">
                      <View className="flex-row justify-between items-center">
                        <Text className="font-bold text-sm uppercase" style={{ color: mood.text }}>{conv.other_party_name}</Text>
                        <Text className="text-[10px] font-bold text-slate-500">{conv.time}</Text>
                      </View>
                      <Text className="text-[11px] font-medium mt-1 truncate text-slate-400" numberOfLines={1}>{conv.last_message}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          /* ACTIVE CHAT VIEW */
          <View className="flex-1 flex flex-col">
            <View className="mb-6 flex-row items-center border-b pb-4 justify-between" style={{ borderColor: mood.border }}>
              <View className="flex-row items-center flex-1">
                <Pressable onPress={() => setActiveConv(null)} className="mr-3 p-2 rounded-none border border-white/5 bg-white/5 active:scale-95">
                  <ArrowLeftIcon color={mood.text} />
                </Pressable>
                {activeConv?.other_party_avatar ? (
                  <Image 
                    source={{ uri: activeConv.other_party_avatar }} 
                    className="w-10 h-10 rounded-none mr-3 bg-slate-800"
                    style={{ borderWidth: 1, borderColor: mood.primary }}
                  />
                ) : (
                  <View className="w-10 h-10 rounded-none items-center justify-center mr-3" style={{ backgroundColor: mood.primary + "20" }}>
                    <MonitorIcon color={mood.primary} />
                  </View>
                )}
                <View className="flex-1 mr-2">
                  <Text className="text-lg font-black italic tracking-tighter uppercase" style={{ color: mood.text }} numberOfLines={1}>
                    {activeConv.other_party_name}
                  </Text>
                  <View className="flex-row items-center gap-1.5 mt-0.5">
                    <View className={`w-1.5 h-1.5 rounded-none ${activeConv.online ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                    <Text className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                      {activeConv.online ? 'Online' : 'Offline'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <Pressable 
                onPress={handleInitiateVideoCall}
                className="w-10 h-10 rounded-none items-center justify-center border active:scale-95 transition-transform"
                style={{ backgroundColor: mood.primary + "15", borderColor: mood.primary + "50" }}
              >
                <VideoIcon color={mood.primary} />
              </Pressable>
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
                  <View className="px-3 py-1.5 rounded-none border border-dashed" style={{ borderColor: mood.border, backgroundColor: mood.text + "05" }}>
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
                  className={`p-3.5 rounded-none border`}
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
                  {(msg.message_type === 'IMAGE' || msg.message_type === 'PDF') && msg.attachment_url ? (
                    msg.message_type === 'IMAGE' ? (
                      <View className="mb-2 rounded-none overflow-hidden bg-slate-800 border" style={{ width: 180, height: 130, borderColor: mood.border }}>
                        <Image 
                          source={{ uri: msg.attachment_url }} 
                          style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                        />
                      </View>
                    ) : (
                      <Pressable className="mb-2 p-3 border rounded-none flex-row items-center gap-3 bg-black/20" style={{ borderColor: mood.border }}>
                        <FileTextIcon color={mood.primary} />
                        <View>
                          <Text className="text-[10px] font-bold uppercase text-white">Document Attachment</Text>
                          <Text className="text-[8px] font-bold text-slate-400">PDF FORMAT</Text>
                        </View>
                      </Pressable>
                    )
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
          className="flex-row items-center p-2 rounded-none border"
          style={{
            backgroundColor: isLight ? "#FFFFFF" : "rgba(0,0,0,0.2)",
            borderColor: mood.border
          }}
        >
          <Pressable
            onPress={handleAttachImage}
            disabled={sending}
            className="p-2.5 mr-1 rounded-none bg-white/5 border border-white/5 active:scale-95"
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
            className="w-11 h-11 rounded-none items-center justify-center ml-2 active:scale-95"
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
        )}
      </View>

      {/* NEW CHAT MODAL */}
      <Modal visible={newChatModal} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center p-6" style={{ backgroundColor: 'rgba(2,6,23,0.95)' }}>
          <View className="w-full p-6 border rounded-none" style={{ backgroundColor: '#0F172A', borderColor: mood.primary }}>
            <Text className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: mood.primary }}>Initiate Secure Uplink</Text>
            <Text className="text-xs font-bold text-slate-400 mb-2">Enter Target ID (e.g. ADM-001 or SELLER-10)</Text>
            <TextInput
              value={newChatTarget}
              onChangeText={setNewChatTarget}
              placeholder="TARGET ID"
              placeholderTextColor="rgba(255,255,255,0.2)"
              className="border p-3 rounded-none text-white font-bold mb-6"
              style={{ borderColor: mood.border, backgroundColor: 'rgba(255,255,255,0.05)' }}
            />
            <View className="flex-row gap-4">
              <Pressable onPress={() => setNewChatModal(false)} className="flex-1 p-3 border rounded-none items-center" style={{ borderColor: mood.border }}>
                <Text className="text-white font-bold text-[10px] uppercase tracking-widest">Abort</Text>
              </Pressable>
              <Pressable onPress={startNewChat} className="flex-1 p-3 rounded-none items-center" style={{ backgroundColor: mood.primary }}>
                <Text className="text-[#0F172A] font-black text-[10px] uppercase tracking-widest">Initiate</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* VIDEO CALL MODAL */}
      <Modal visible={!!videoUrl} animationType="slide">
        <View className="flex-1 bg-[#0F172A]">
          <View className="h-[60px] flex-row items-center justify-between px-4 border-b border-white/10" style={{ backgroundColor: '#1E293B' }}>
            <Text className="text-[12px] font-black uppercase tracking-widest text-[#2ECC71]">
              <View className="w-2 h-2 rounded-full bg-[#2ECC71] inline-block mr-2 animate-pulse"/> SECURE VIDEO UPLINK
            </Text>
            <Pressable onPress={() => setVideoUrl(null)} className="p-2 border border-red-500/30 bg-red-500/10 rounded-none">
              <Text className="text-red-500 font-bold text-[10px] uppercase tracking-widest">Disconnect</Text>
            </Pressable>
          </View>
          {videoUrl && (
            <WebView 
              source={{ uri: videoUrl }} 
              className="flex-1"
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled={true}
              onMessage={(event) => {
                if (event.nativeEvent.data === 'CLOSE_VIDEO') {
                  setVideoUrl(null);
                }
              }}
            />
          )}
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}
