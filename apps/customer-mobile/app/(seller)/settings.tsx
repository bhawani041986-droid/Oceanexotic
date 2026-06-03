import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, Switch } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { useAuthStore } from "@/store/authStore";

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

function ShieldIcon({ color }: { color: string }) {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

export default function SellerSettingsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const primaryColor = "#7C3AED";
  const borderColor = "rgba(124, 58, 237, 0.25)";
  const bgCard = "rgba(15, 23, 42, 0.6)";

  const sellerId = user?.id ? (user.id.startsWith("SEL-") ? user.id : `SEL-${user.id}`) : 'SEL-001';

  const [hubName, setHubName] = useState(user?.name ? `${user.name} Hub` : "Global Seafoods Alpha");
  const [bio, setBio] = useState("Premium maritime sourcing. Cold-chain verified logistics.");
  const [multiCurrency, setMultiCurrency] = useState(true);
  const [globalAlerts, setGlobalAlerts] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert("Success", "Store settings saved successfully.");
    }, 1000);
  };

  return (
    <View className="flex-1 bg-[#020617]">
      {/* Header */}
      <View 
        className="h-16 flex-row items-center px-4 border-b bg-slate-950"
        style={{ borderColor: borderColor }}
      >
        <Pressable 
          onPress={() => router.back()} 
          className="p-2 mr-2 rounded-full bg-white/5 border border-white/5 active:scale-95"
        >
          <BackIcon color="white" />
        </Pressable>
        <View>
          <Text className="text-xs font-black uppercase text-white tracking-widest italic">
            Store Settings
          </Text>
          <Text className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">
            Manage seller store options
          </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Identity block */}
        <View 
          className="p-5 rounded-[24px] border mb-5 space-y-4"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          <Text className="text-xs font-black text-white uppercase tracking-tight italic border-b border-white/5 pb-2.5">
            Store Profile
          </Text>

          <View className="space-y-3">
            <View>
              <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Hub Name
              </Text>
              <TextInput
                value={hubName}
                onChangeText={setHubName}
                className="h-11 border rounded-xl bg-slate-900/50 px-3 text-xs font-bold text-white uppercase tracking-wider"
                style={{ borderColor: borderColor }}
              />
            </View>

            <View>
              <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Merchant Unique ID (Read Only)
              </Text>
              <TextInput
                value={sellerId}
                editable={false}
                className="h-11 border rounded-xl bg-slate-900/50 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}
              />
            </View>

            <View>
              <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                About Store
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                className="border rounded-xl bg-slate-900/50 p-3 text-xs font-bold text-white uppercase tracking-wider h-20"
                style={{ borderColor: borderColor, textAlignVertical: "top" }}
              />
            </View>
          </View>
        </View>

        {/* Calibration Toggles */}
        <View 
          className="p-5 rounded-[24px] border mb-5 space-y-4"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          <Text className="text-xs font-black text-white uppercase tracking-tight italic border-b border-white/5 pb-2.5">
            Preferences
          </Text>

          <View className="space-y-4">
            <View className="flex-row justify-between items-center bg-white/5 p-3.5 rounded-xl border border-white/5">
              <View className="flex-1 pr-3">
                <Text className="text-[10px] font-black text-white uppercase tracking-wider italic">
                  Multi-Currency Yields
                </Text>
                <Text className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  Accept foreign trade values
                </Text>
              </View>
              <Switch 
                value={multiCurrency}
                onValueChange={setMultiCurrency}
                trackColor={{ false: "#1E293B", true: "#7C3AED" }}
                thumbColor={multiCurrency ? "#FFFFFF" : "#64748B"}
              />
            </View>

            <View className="flex-row justify-between items-center bg-white/5 p-3.5 rounded-xl border border-white/5">
              <View className="flex-1 pr-3">
                <Text className="text-[10px] font-black text-white uppercase tracking-wider italic">
                  Global Signal Alerts
                </Text>
                <Text className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  Real-time trade soundscapes
                </Text>
              </View>
              <Switch 
                value={globalAlerts}
                onValueChange={setGlobalAlerts}
                trackColor={{ false: "#1E293B", true: "#7C3AED" }}
                thumbColor={globalAlerts ? "#FFFFFF" : "#64748B"}
              />
            </View>
          </View>
        </View>

        {/* Security / Hardening block */}
        <View className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex-row items-center gap-3 mb-6">
          <View className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center">
            <ShieldIcon color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-black text-white uppercase tracking-wider italic">
              Verified Merchant Account
            </Text>
            <Text className="text-[7.5px] font-black text-[#10B981] uppercase tracking-widest mt-0.5">
              Securely Authenticated
            </Text>
          </View>
        </View>

        {/* Commit Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={saving}
          className="w-full h-12 bg-[#7C3AED] active:bg-[#6D28D9] rounded-xl items-center justify-center shadow-lg flex-row"
          style={{ shadowColor: primaryColor, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 }}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-[10px] font-black text-white uppercase tracking-widest italic">
              Save Settings
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
