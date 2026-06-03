import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import api from "@/services/api";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import { userService } from "@/services/userService";

function UserIcon({ color }: { color: string }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
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

export default function SellerProfileScreen() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();

  const primaryColor = "#7C3AED"; 
  const borderColor = "rgba(124, 58, 237, 0.25)";
  const bgCard = "rgba(15, 23, 42, 0.6)";

  const [isLoading, setIsLoading] = useState(true);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const sellerId = user?.id ? (user.id.startsWith("SEL-") ? user.id : `SEL-${user.id}`) : 'SEL-001';

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

  const fetchSellerStats = async () => {
    try {
      const [prodRes, orderRes] = await Promise.all([
        api.get("/seller/products.php"),
        api.get(`/seller/orders.php`, { params: { seller_id: sellerId } })
      ]);

      if (Array.isArray(prodRes.data)) {
        const myProds = prodRes.data.filter((p: any) => p.seller_id === sellerId || p.sellerId === sellerId);
        setProductCount(myProds.length);
      }
      if (Array.isArray(orderRes.data)) {
        setOrderCount(orderRes.data.length);
      }
    } catch (e) {
      console.error("Telemetry fetch failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerStats();
  }, [user]);

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: async () => {
            await authService.logout();
            logout();
            router.replace("/login");
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#020617]">
      {/* Top Header */}
      <View 
        className="h-14 flex-row items-center px-4 border-b bg-slate-950"
        style={{ borderColor: borderColor }}
      >
        <Text className="text-sm font-black uppercase text-white tracking-widest ml-1 italic">
          Seller Account Profile
        </Text>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Profile Card */}
        <View 
          className="p-5 rounded-[24px] border mb-5 items-center"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          {/* Avatar Icon / Photo */}
          <Pressable 
            onPress={handlePickImage} 
            disabled={uploadingAvatar}
            className="w-20 h-20 rounded-full items-center justify-center border-2 mb-4 bg-slate-900 overflow-hidden relative active:scale-95"
            style={{ borderColor: borderColor }}
          >
            {uploadingAvatar ? (
              <ActivityIndicator color={primaryColor} size="small" />
            ) : user?.avatar ? (
              <Image
                source={{ uri: resolveMediaUrl(user.avatar) }}
                className="w-full h-full"
                contentFit="cover"
              />
            ) : (
              <UserIcon color={primaryColor} />
            )}
            <View className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 items-center justify-center">
              <Text className="text-[7px] font-black text-white uppercase tracking-widest">EDIT</Text>
            </View>
          </Pressable>

          <Text className="text-lg font-black text-white uppercase italic tracking-tight">
            {user?.name || "Merchant Node"}
          </Text>
          <Text className="text-[7.5px] font-black uppercase tracking-[0.2em] text-[#7C3AED]/70 mt-1">
            Registered Seller Account
          </Text>
        </View>

        {/* Telemetry Stats */}
        <View className="flex-row justify-between mb-5">
          <View 
            className="w-[48%] p-4 rounded-2xl border items-center justify-center bg-white/5"
            style={{ borderColor: borderColor }}
          >
            {isLoading ? (
              <ActivityIndicator color={primaryColor} />
            ) : (
              <Text className="text-2xl font-black text-white italic tracking-tighter">{productCount}</Text>
            )}
            <Text className="text-[7.5px] font-black uppercase tracking-widest text-slate-400 mt-1">
              Commissioned Products
            </Text>
          </View>

          <View 
            className="w-[48%] p-4 rounded-2xl border items-center justify-center bg-white/5"
            style={{ borderColor: borderColor }}
          >
            {isLoading ? (
              <ActivityIndicator color={primaryColor} />
            ) : (
              <Text className="text-2xl font-black text-[#7C3AED] italic tracking-tighter">{orderCount}</Text>
            )}
            <Text className="text-[7.5px] font-black uppercase tracking-widest text-slate-400 mt-1">
              Total Order Manifests
            </Text>
          </View>
        </View>

        {/* Identity Node details */}
        <View 
          className="p-5 rounded-[24px] border mb-6 space-y-4"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          <View className="flex-row items-center space-x-2 border-b border-white/5 pb-3">
            <ShieldIcon color={primaryColor} />
            <Text className="text-xs font-black uppercase text-white tracking-wider">
              Account Details
            </Text>
          </View>

          <View className="space-y-3">
            <View>
              <Text className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Unique Identifier</Text>
              <View className="h-10 border rounded-xl bg-slate-950/80 px-3 justify-center" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <Text className="text-[10px] font-bold text-slate-400 select-all">{sellerId}</Text>
              </View>
            </View>

            <View>
              <Text className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email Endpoint</Text>
              <View className="h-10 border rounded-xl bg-slate-950/80 px-3 justify-center" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <Text className="text-[10px] font-bold text-slate-400">{user?.email || "N/A"}</Text>
              </View>
            </View>

            <View>
              <Text className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Role Registry</Text>
              <View className="h-10 border rounded-xl bg-slate-955/80 px-3 justify-center" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <Text className="text-[10px] font-black text-[#7C3AED] uppercase tracking-widest">SELLER NODE</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Command Control Panel */}
        <View 
          className="p-5 rounded-[24px] border mb-6 space-y-4"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          <View className="flex-row items-center space-x-2 border-b border-white/5 pb-3">
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <Path d="M12 6v6l4 2" />
            </Svg>
            <Text className="text-xs font-black uppercase text-white tracking-wider ml-2">
              Control Panel Directives
            </Text>
          </View>

          <View className="space-y-2">
            {[
              {
                label: "Financial Command",
                desc: "Earnings, Yield Balance & Settlements",
                route: "/(seller)/earnings",
                icon: (
                  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </Svg>
                )
              },
              {
                label: "Document Verification",
                desc: "Integrity Verification & License Uploads",
                route: "/(seller)/verification",
                icon: (
                  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <Path d="M14 2v6h6" />
                    <Path d="M16 13H8M16 17H8M10 9H8" />
                  </Svg>
                )
              },
              {
                label: "Logistics Fleet Command",
                desc: "Vessel Dispatch & Cold-Chain Telemetry",
                route: "/(seller)/fleet",
                icon: (
                  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </Svg>
                )
              },
              {
                label: "Transmission Signals",
                desc: "Real-time Comms & Fleet Dispatch Chat",
                route: "/(seller)/chat",
                icon: (
                  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </Svg>
                )
              },
              {
                label: "Reputation Ledger",
                desc: "Buyer Commendations & Star Feedback",
                route: "/(seller)/reviews",
                icon: (
                  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </Svg>
                )
              },
              {
                label: "Incentive Promotions",
                desc: "Commission Discount Codes & Coupons",
                route: "/(seller)/promotions",
                icon: (
                  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <Path d="M7 7h.01" />
                  </Svg>
                )
              },
              {
                label: "Hub Preferences Calibration",
                desc: "Node Biography & Regional Options",
                route: "/(seller)/settings",
                icon: (
                  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Circle cx="12" cy="12" r="3" />
                    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </Svg>
                )
              }
            ].map((item, index) => (
              <Pressable
                key={index}
                onPress={() => router.push(item.route as any)}
                className="flex-row items-center p-3 rounded-xl border border-white/5 bg-slate-950/40 active:bg-slate-900/60"
              >
                <View className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 items-center justify-center mr-3">
                  {item.icon}
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-white uppercase tracking-wider italic">
                    {item.label}
                  </Text>
                  <Text className="text-[8px] font-bold text-slate-400 mt-0.5">
                    {item.desc}
                  </Text>
                </View>
                <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M9 18l6-6-6-6" />
                </Svg>
              </Pressable>
            ))}
          </View>
        </View>

        {/* LOGOUT BUTTON */}
        <Pressable
          onPress={handleLogout}
          className="w-full h-12 rounded-xl border border-rose-500/20 bg-rose-500/10 active:bg-rose-500/20 items-center justify-center"
        >
          <Text className="text-xs font-black text-rose-500 uppercase tracking-widest">
            Log Out
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
