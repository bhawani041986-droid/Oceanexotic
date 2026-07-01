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
  const [adminContacts, setAdminContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{ roomId: string; callerName: string } | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const processedInvites = useRef<Set<string>>(new Set());

  // Fetch admin contacts for the New Chat picker
  const fetchAdminContacts = async () => {
    setLoadingContacts(true);
    try {
      const res = await api.get(`/admin/get_users`);
      if (Array.isArray(res.data)) {
        // Only show admins — agents should only start chats with admins
        const admins = res.data.filter((u: any) => u.role === 'Admin' || u.role === 'admin' || u.id === 'ADM-001');
        setAdminContacts(admins.length > 0 ? admins : [{ id: 'ADM-001', name: 'OceanExotic Support', role: 'Admin', avatar_url: null }]);
      }
    } catch {
      // Fallback to default support admin
      setAdminContacts([{ id: 'ADM-001', name: 'OceanExotic Support', role: 'Admin', avatar_url: null }]);
    } finally {
      setLoadingContacts(false);
    }
  };

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

        // Detect incoming video call invite from admin
        // Admin sends a chat message: [VIDEO_CALL_INVITE]:roomID
        const callConv = res.data.find((c: any) =>
          c.unread_count > 0 &&
          c.last_message &&
          c.last_message_sender_id !== agentId &&
          c.last_message.includes('[VIDEO_CALL_INVITE]:')
        );
        if (callConv) {
          const roomId = callConv.last_message.replace('[VIDEO_CALL_INVITE]:', '').trim();
          if (!processedInvites.current.has(roomId)) {
            processedInvites.current.add(roomId);
            setIncomingCall({ roomId, callerName: callConv.other_party_name || 'Admin' });
          }
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
        // Pass user_id so backend marks incoming messages as read
        params: { conversation_id: convId, user_id: agentId, t: Date.now() }
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
      fetchConversations();
    }, 3000);
    return () => clearInterval(interval);
  }, [activeConv]);

  // Background polling for incoming calls even when on conv list (no activeConv)
  useEffect(() => {
    if (activeConv) return; // already handled above
    const interval = setInterval(() => {
      fetchConversations();
    }, 4000);
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
          message_text: '📎 Attachment',  // Bug 3 fix: non-blank so conv list shows something
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

  // Video call — agent is receive-only, admin initiates by sending [VIDEO_CALL_INVITE]:roomID
  const handleIncomingCall = (roomId: string) => {
    const fullUrl = api.defaults.baseURL?.replace('/api', '') || "https://oceanexotic.com";
    setVideoUrl(`${fullUrl}/agent/video-room?room=${roomId}&user=${agentId}`);
    setIncomingCall(null);
  };

  const handleDeclineCall = () => {
    setIncomingCall(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                    style={{
                      backgroundColor: conv.unread_count > 0 ? mood.primary + '10' : 'rgba(0,0,0,0.2)',
                      borderColor: conv.unread_count > 0 ? mood.primary + '60' : mood.border
                    }}
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
                        <View className="flex-row items-center gap-2">
                          {conv.unread_count > 0 && (
                            <View style={{ backgroundColor: mood.primary, borderRadius: 99, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                              <Text style={{ color: isLight ? '#FFFFFF' : '#020617', fontSize: 9, fontWeight: '900' }}>{conv.unread_count}</Text>
                            </View>
                          )}
                          <Text className="text-[10px] font-bold text-slate-500">{conv.time}</Text>
                        </View>
                      </View>
                      <Text
                        className="text-[11px] mt-1 truncate"
                        style={{ color: conv.unread_count > 0 ? mood.text : '#94A3B8', fontWeight: conv.unread_count > 0 ? '700' : '500' }}
                        numberOfLines={1}
                      >{conv.last_message}</Text>
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
              
              {/* Video call — receive only, admin initiates */}
              <View
                style={{
                  width: 40, height: 40,
                  borderRadius: 0,
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.08)',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  opacity: 0.45,
                }}
              >
                <VideoIcon color={mood.primary} />
              </View>
            </View>

        {/* Chat Log */}
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 mb-4"
          contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
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
          {/* Empty state */}
          {messages.length === 0 && (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
              <Text style={{ fontSize: 28, marginBottom: 10 }}>💬</Text>
              <Text style={{ color: '#475569', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center' }}>
                No messages yet
              </Text>
              <Text style={{ color: '#475569', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', marginTop: 2 }}>
                Say hello!
              </Text>
            </View>
          )}
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

      {/* NEW CHAT MODAL — Admin Contact Picker */}
      <Modal
        visible={newChatModal}
        animationType="slide"
        transparent
        onShow={fetchAdminContacts}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(2,6,23,0.9)' }}>
          <View style={{ backgroundColor: '#0F172A', borderTopWidth: 1, borderColor: mood.primary, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24, maxHeight: '70%' }}>
            <View className="flex-row items-center justify-between mb-5">
              <View>
                <Text style={{ color: mood.primary, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 }}>New Conversation</Text>
                <Text style={{ color: '#475569', fontSize: 10, fontWeight: '600', marginTop: 2 }}>Select a contact to message</Text>
              </View>
              <Pressable onPress={() => { setNewChatModal(false); setNewChatTarget(''); }} style={{ padding: 8, borderRadius: 0, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 11 }}>✕</Text>
              </Pressable>
            </View>

            {loadingContacts ? (
              <ActivityIndicator color={mood.primary} style={{ marginVertical: 24 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {adminContacts.map(contact => (
                  <Pressable
                    key={contact.id}
                    onPress={() => { setNewChatTarget(contact.id); }}
                    style={{
                      flexDirection: 'row', alignItems: 'center',
                      padding: 14, marginBottom: 8, borderWidth: 1,
                      borderRadius: 0,
                      borderColor: newChatTarget === contact.id ? mood.primary : 'rgba(255,255,255,0.08)',
                      backgroundColor: newChatTarget === contact.id ? mood.primary + '18' : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <View style={{ width: 36, height: 36, borderRadius: 0, backgroundColor: mood.primary + '22', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: mood.primary + '40' }}>
                      <MonitorIcon color={mood.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#F1F5F9', fontSize: 13, fontWeight: '700' }}>{contact.name}</Text>
                      <Text style={{ color: '#475569', fontSize: 10, fontWeight: '600', marginTop: 1 }}>{contact.role} · {contact.id}</Text>
                    </View>
                    {newChatTarget === contact.id && (
                      <View style={{ width: 20, height: 20, borderRadius: 99, backgroundColor: mood.primary, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#020617', fontSize: 11, fontWeight: '900' }}>✓</Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Pressable onPress={() => { setNewChatModal(false); setNewChatTarget(''); }} style={{ flex: 1, padding: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center' }}>
                <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5 }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={startNewChat}
                disabled={!newChatTarget}
                style={{ flex: 1, padding: 13, backgroundColor: newChatTarget ? mood.primary : '#1E293B', alignItems: 'center', opacity: newChatTarget ? 1 : 0.5 }}
              >
                <Text style={{ color: newChatTarget ? (isLight ? '#FFFFFF' : '#020617') : '#475569', fontWeight: '900', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5 }}>Start Chat</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* INCOMING VIDEO CALL OVERLAY — triggered when admin sends [VIDEO_CALL_INVITE]:roomId */}
      <Modal visible={!!incomingCall} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(2,6,23,0.92)', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <View style={{ width: '100%', backgroundColor: '#0F172A', borderWidth: 1, borderColor: mood.primary, borderRadius: 0, padding: 28, alignItems: 'center' }}>
            {/* Pulsing ring */}
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: mood.primary + '20', borderWidth: 2, borderColor: mood.primary + '60', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <VideoIcon color={mood.primary} />
            </View>
            <Text style={{ color: mood.primary, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 6 }}>Incoming Video Call</Text>
            <Text style={{ color: '#F1F5F9', fontSize: 17, fontWeight: '800', marginBottom: 4, textAlign: 'center' }}>{incomingCall?.callerName}</Text>
            <Text style={{ color: '#475569', fontSize: 11, fontWeight: '600', marginBottom: 28, textAlign: 'center' }}>is calling you...</Text>
            <View style={{ flexDirection: 'row', gap: 14, width: '100%' }}>
              <Pressable
                onPress={handleDeclineCall}
                style={{ flex: 1, padding: 14, borderWidth: 1, borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center', borderRadius: 0 }}
              >
                <Text style={{ color: '#EF4444', fontWeight: '900', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5 }}>Decline</Text>
              </Pressable>
              <Pressable
                onPress={() => incomingCall && handleIncomingCall(incomingCall.roomId)}
                style={{ flex: 1, padding: 14, backgroundColor: mood.primary, alignItems: 'center', borderRadius: 0 }}
              >
                <Text style={{ color: '#020617', fontWeight: '900', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5 }}>Accept</Text>
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
