import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, Pressable, Alert, Image } from "react-native";
import Svg, { Path, Circle, Polyline, Line, Rect } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/store/authStore";
import { useAgentStore, MOODS } from "@/store/agentStore";

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

const INITIAL_MESSAGES = [
  { id: "1", text: "OceanExotic Secure Comms Channel initialized.", sender: "system", timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: "2", text: "HQ: All sectors clear. Awaiting dispatch.", sender: "admin", timestamp: new Date(Date.now() - 3000000).toISOString() },
];

export default function AgentSupportScreen() {
  const user = useAuthStore((s) => s.user);
  const currentMood = useAgentStore((s) => s.currentMood);
  const mood = MOODS[currentMood];
  const isLight = currentMood === "DAYLIGHT";

  const [messages, setMessages] = useState<any[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "agent",
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, newMessage]);
    setInputText("");

    // Simulate HQ reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "HQ: Message received. Logged in central registry.",
        sender: "admin",
        timestamp: new Date().toISOString()
      }]);
    }, 1500);
  };

  const handleDeleteMessage = (msgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
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
      
      const newMsg = {
        id: Date.now().toString(),
        text: "",
        sender: "agent",
        timestamp: new Date().toISOString(),
        message_type: "IMAGE",
        attachment_url: selectedAsset.uri
      };
      setMessages(prev => [...prev, newMsg]);

      // Mock HQ response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: "HQ: Encrypted visual log received and stored.",
          sender: "admin",
          timestamp: new Date().toISOString()
        }]);
      }, 1500);
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
        <View className="mb-6 flex-row items-center border-b pb-4" style={{ borderColor: mood.border }}>
          <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: mood.primary + "20" }}>
            <MonitorIcon color={mood.primary} />
          </View>
          <View>
            <Text className="text-xl font-black italic tracking-tighter uppercase" style={{ color: mood.text }}>
              Secure Comms
            </Text>
            <Text className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-500">
              Direct Uplink to Command Center
            </Text>
          </View>
        </View>

        {/* Chat Log */}
        <ScrollView 
          className="flex-1 mb-4"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => {
            const isMe = msg.sender === "agent";
            const isSystem = msg.sender === "system";

            if (isSystem) {
              return (
                <View key={msg.id} className="items-center my-4">
                  <View className="px-3 py-1 rounded-full border border-dashed" style={{ borderColor: mood.border, backgroundColor: mood.text + "05" }}>
                    <Text className="text-[7px] font-black uppercase tracking-widest text-slate-400">
                      {msg.text}
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
                    "Are you sure you want to delete this message?",
                    [
                      { text: "Cancel", style: "cancel" },
                      { 
                        text: "Delete", 
                        style: "destructive", 
                        onPress: () => handleDeleteMessage(msg.id) 
                      }
                    ]
                  );
                }}
                className={`mb-4 max-w-[80%] ${isMe ? "self-end" : "self-start"}`}
              >
                <View 
                  className={`p-3 rounded-2xl border`}
                  style={{
                    backgroundColor: isMe ? mood.primary + "20" : isLight ? "#F1F5F9" : "rgba(255,255,255,0.05)",
                    borderColor: isMe ? mood.primary + "40" : mood.border,
                    borderBottomRightRadius: isMe ? 4 : 16,
                    borderBottomLeftRadius: !isMe ? 4 : 16,
                  }}
                >
                  {!isMe && (
                    <Text className="text-[8px] font-black uppercase tracking-widest mb-1" style={{ color: mood.primary }}>
                      HQ COMMAND
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
                  {msg.text ? (
                    <Text className="text-[11px] font-medium leading-relaxed" style={{ color: mood.text }}>
                      {msg.text}
                    </Text>
                  ) : null}
                </View>
                <Text className={`text-[7px] font-black uppercase tracking-widest text-slate-500 mt-1 ${isMe ? "text-right" : "text-left"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            className="p-2 mr-1 rounded-full bg-white/5 border border-white/5 active:scale-95"
          >
            <AttachIcon color={mood.primary} />
          </Pressable>
          <TextInput
            className="flex-1 max-h-[100px] min-h-[40px] px-3 pt-3 pb-3 text-[12px] font-medium"
            style={{ color: mood.text }}
            placeholder="Transmit secure message..."
            placeholderTextColor={isLight ? "#94A3B8" : "rgba(255,255,255,0.3)"}
            multiline
            value={inputText}
            onChangeText={setInputText}
          />
          <Pressable 
            onPress={handleSend}
            className="w-10 h-10 rounded-xl items-center justify-center ml-2 mb-[2px] active:scale-95"
            style={{ backgroundColor: mood.primary }}
          >
            <SendIcon color={isLight ? "#FFFFFF" : "#020617"} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
