import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Platform, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle, Path, Rect, Line } from "react-native-svg";
import { useAuthStore } from "@/store/authStore";
import { useAgentStore, MOODS, type TacticalMood } from "@/store/agentStore";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import { userService } from "@/services/userService";

// Custom UI Icons matching Lucide
function UserIcon({ color }: { color: string }) {
  return (
    <Svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

function PowerIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <Line x1="12" y1="2" x2="12" y2="12" />
    </Svg>
  );
}

function ShieldAlertIcon({ color }: { color: string }) {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <Line x1="12" y1="9" x2="12" y2="13" />
      <Line x1="12" y1="17" x2="12.01" y2="17" />
    </Svg>
  );
}

export default function AgentProfileScreen() {
  const router = useRouter();
  const { logout, user, updateUser } = useAuthStore();
  const { currentMood, setMood } = useAgentStore();
  const mood = MOODS[currentMood];
  const isLight = currentMood === "DAYLIGHT";

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handlePickImage = async () => {
    if (!user?.id) return;
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Camera roll access is required to upload a profile photo.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        setUploadingAvatar(true);
        try {
          const res = await userService.uploadAvatar(user.id, selectedUri);
          if (res.success) {
            updateUser({
              avatar: res.avatar_url,
            });
            Alert.alert("Success", "Profile photo updated successfully.");
          } else {
            Alert.alert("Upload Failed", "Failed to update profile photo.");
          }
        } catch (err: any) {
          const errMsg = err?.response?.data?.error || "Failed to update profile photo.";
          Alert.alert("Error", errMsg);
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (err) {
      console.error("Image pick error:", err);
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const moodsList: { key: TacticalMood; label: string; primary: string; desc: string }[] = [
    {
      key: "SENTINEL",
      label: "NEON SENTINEL",
      primary: "#00D1FF",
      desc: "Tactical HUD View with neon cyan interface telemetry lines."
    },
    {
      key: "MIDNIGHT",
      label: "MIDNIGHT STEALTH",
      primary: "#EF4444",
      desc: "Low-light night radar with neon crimson red interface lines."
    },
    {
      key: "DAYLIGHT",
      label: "DAYLIGHT COMMAND",
      primary: "#F97316",
      desc: "High-contrast daylight layout with tactical orange nodes."
    }
  ];

  return (
    <ScrollView
      className="flex-grow"
      style={{ backgroundColor: mood.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
    >
      {/* Title */}
      <View className="mb-6">
        <Text 
          className="text-2xl font-black italic tracking-tighter uppercase"
          style={{ color: mood.text }}
        >
          Fleet Agent Profile
        </Text>
        <Text className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-500">
          Operator Registry & UI Controls
        </Text>
      </View>

      {/* Profile Card */}
      <View
        className="p-5 rounded-[24px] border flex-row items-center mb-6"
        style={{
          backgroundColor: isLight ? "#F8FAFC" : "rgba(255, 255, 255, 0.03)",
          borderColor: mood.border,
        }}
      >
        <Pressable 
          onPress={handlePickImage} 
          disabled={uploadingAvatar}
          className="w-16 h-16 rounded-[20px] items-center justify-center border mr-4 overflow-hidden relative active:scale-95"
          style={{
            backgroundColor: isLight ? "#E2E8F0" : "rgba(255,255,255,0.02)",
            borderColor: mood.border
          }}
        >
          {uploadingAvatar ? (
            <ActivityIndicator color={mood.primary} size="small" />
          ) : user?.avatar ? (
            <Image
              source={{ uri: resolveMediaUrl(user.avatar) }}
              className="w-full h-full"
              contentFit="cover"
            />
          ) : (
            <UserIcon color={mood.primary} />
          )}
          <View className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 items-center justify-center">
            <Text className="text-[7px] font-black text-white uppercase tracking-widest">EDIT</Text>
          </View>
        </Pressable>

        <View className="flex-1 space-y-1">
          <Text className="text-lg font-black uppercase tracking-tight" style={{ color: mood.text }}>
            {user?.name || "INS-AGENT"}
          </Text>
          <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            {user?.email || "agent@oceanfresh.com"}
          </Text>
          <View className="flex-row items-center mt-1">
            <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            <Text className="text-[7.5px] font-black text-emerald-500 uppercase tracking-widest">
              ROLE: SOVEREIGN AGENT
            </Text>
          </View>
        </View>
      </View>

      {/* Environmental Controls */}
      <Text className="mb-4 text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">
        ENVIRONMENT THEME SETTINGS
      </Text>

      <View className="space-y-3 mb-8">
        {moodsList.map((m) => {
          const selected = currentMood === m.key;
          return (
            <Pressable
              key={m.key}
              onPress={() => setMood(m.key)}
              className="p-4 rounded-2xl border flex-row items-center justify-between"
              style={{
                backgroundColor: selected
                  ? isLight
                    ? "#FFF7ED"
                    : "rgba(255, 255, 255, 0.01)"
                  : "transparent",
                borderColor: selected ? m.primary : mood.border,
                borderWidth: selected ? 2 : 1
              }}
            >
              <View className="flex-1 mr-4 space-y-1">
                <Text
                  className="text-xs font-black tracking-wider"
                  style={{ color: selected ? m.primary : mood.text }}
                >
                  {m.label}
                </Text>
                <Text className="text-[8px] font-medium leading-normal text-slate-400">
                  {m.desc}
                </Text>
              </View>

              <View 
                className="w-5 h-5 rounded-full border items-center justify-center"
                style={{ borderColor: selected ? m.primary : mood.border }}
              >
                {selected && (
                  <View 
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: m.primary }}
                  />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Security notice block */}
      <View 
        className="p-4 rounded-2xl border flex-row items-start space-x-3 mb-8"
        style={{
          backgroundColor: isLight ? "#FFF1F2" : "rgba(239, 68, 68, 0.05)",
          borderColor: isLight ? "#FECDD3" : "rgba(239, 68, 68, 0.2)"
        }}
      >
        <ShieldAlertIcon color="#EF4444" />
        <View className="flex-1 space-y-1">
          <Text className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-none">
            SECURE TERMINATION PROTOCOL
          </Text>
          <Text className="text-[8px] leading-relaxed text-red-500/80">
            Terminating your session clears your secure local cache of registry nodes, active missions, and credentials. Ensure all transit signals are complete.
          </Text>
        </View>
      </View>

      {/* Logout button */}
      <Pressable
        onPress={handleLogout}
        className="h-12 w-full rounded-2xl border-2 flex-row items-center justify-center space-x-2"
        style={{
          borderColor: "#EF4444",
          backgroundColor: isLight ? "#FFF1F2" : "rgba(239, 68, 68, 0.03)"
        }}
      >
        <PowerIcon color="#EF4444" />
        <Text className="text-[10px] font-black text-red-500 uppercase tracking-widest">
          TERMINATE ACTIVE SESSION
        </Text>
      </Pressable>
    </ScrollView>
  );
}
