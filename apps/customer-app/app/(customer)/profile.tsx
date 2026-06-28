import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable, Modal, Switch, StyleSheet, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { userService, type UserProfile } from "@/services/userService";
import { orderService } from "@/services/orderService";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import { authService } from "@/services/authService";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { checkoutService, type SavedAddress } from "@/services/checkoutService";
import { cn } from "@/lib/utils";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { assetUrl } from "@/config/assets";
import { useThemeColors } from "@/hooks/useThemeColors";
import { ChamferedBox } from "@/components/ui/ChamferedBox";
import Svg, { Path, Rect, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, Polyline, Line } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

const JETTIES = ["Phoenix Bay Jetty", "Haddo Jetty", "Junglighat Jetty", "Havelock Jetty", "Chatham Jetty"];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const cart = useCartStore();
  const { toast, ToastHost } = useToast();
  const colors = useThemeColors();
  const currentLanguage = useSettingsStore((s) => s.language); // force re-render

  const primaryColor = colors.primary;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());

  // Security Credentials States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Address Vault States
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  // New Address Form Fields
  const [addrType, setAddrType] = useState("HOME");
  const [addrHotel, setAddrHotel] = useState("");
  const [addrRoom, setAddrRoom] = useState("");
  const [addrJetty, setAddrJetty] = useState("Phoenix Bay Jetty");
  const [addrLine, setAddrLine] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrDefault, setAddrDefault] = useState(true);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const [p, orders, addrList] = await Promise.all([
        userService.getProfile(user.id),
        orderService.getCustomerOrders(user.id),
        checkoutService.fetchAddresses(user.id),
      ]);
      setProfile(p);
      setName(p.name || user.name);
      setEmail(p.email || user.email);
      setOrderCount(orders.length);
      setAddresses(addrList);
      updateUser({
        name: p.name || user.name,
        email: p.email || user.email,
        avatar: p.avatar_url,
      });
    } catch (err) {
      console.error("Vault/Profile Sync drift:", err);
      setName(user.name);
      setEmail(user.email);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const save = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await userService.updateProfile({ id: user.id, name, email });
      updateUser({ name, email });
      toast("Profile synchronized", "success");
    } catch {
      toast("Profile sync failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async () => {
    if (!user?.id) return;
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        toast("Permission to access gallery denied", "error");
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
            toast("Profile picture synchronized", "success");
            setAvatarTimestamp(Date.now());
            await loadData();
          } else {
            toast("Upload failed", "error");
          }
        } catch (err: any) {
          const errMsg = err?.response?.data?.error || "Avatar sync failure";
          toast(errMsg, "error");
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (err) {
      console.error("Image pick error:", err);
      toast("Failed to pick image", "error");
    }
  };

  const handleChangePassword = async () => {
    if (!user?.id) return;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast("Please fill all security fields", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("New passwords do not match", "error");
      return;
    }
    setChangingPassword(true);
    try {
      await userService.changePassword({
        userId: user.id,
        currentPassword,
        newPassword,
      });
      toast("Password updated securely", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || "Password synchronization failed";
      toast(errMsg, "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    logout();
    router.replace("/login");
  };

  const handleAddAddress = async () => {
    if (!user?.id) return;
    if (!addrLine || !addrPhone) {
      toast("Address & Phone are required", "error");
      return;
    }

    setAddressLoading(true);
    try {
      await checkoutService.addAddress({
        user_id: user.id,
        type: addrType,
        hotel_name: addrHotel,
        room_no: addrRoom,
        jetty: addrJetty,
        address: addrLine,
        phone: addrPhone,
        is_default: addrDefault ? 1 : 0,
      });
      toast("Address commissioned to vault", "success");
      setAddressModalVisible(false);
      // Reset form fields
      setAddrHotel("");
      setAddrRoom("");
      setAddrLine("");
      setAddrPhone("");
      setAddrType("HOME");
      setAddrDefault(true);
      // Reload address vault list
      const freshList = await checkoutService.fetchAddresses(user.id);
      setAddresses(freshList);
    } catch (err) {
      toast("Commissioning failed", "error");
      console.error(err);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string | number) => {
    if (!user?.id) return;
    try {
      await checkoutService.deleteAddress(id);
      toast("Address decommissioned", "success");
      const freshList = await checkoutService.fetchAddresses(user.id);
      setAddresses(freshList);
    } catch (err) {
      toast("Decommission failure", "error");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <ActivityIndicator color={primaryColor} size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {ToastHost}
      <ScrollView contentContainerClassName="px-4 pb-28 pt-16">
        <Text className="text-[28px] font-black uppercase italic tracking-tight" style={{ color: '#020817' }}>My Profile</Text>
        <Text 
          className="text-[12px] font-black uppercase tracking-[0.2em]" 
          style={{ color: '#64748B' }}
        >
          {profile?.grade || "Customer"}
        </Text>

        {/* Identity Head & Avatar */}
        <ChamferedBox 
          fillColor="#ffffff" 
          strokeColor="rgba(14, 165, 233, 0.25)" 
          bevelSize={16} 
          className="mt-6 shadow-sm"
          style={{ shadowColor: '#0ea5e9', shadowOpacity: 0.1, shadowRadius: 10 }}
        >
          <View className="flex-row items-center p-5">
            <Pressable 
              onPress={handlePickImage} 
              disabled={uploadingAvatar}
              className="relative w-[90px] h-[90px] mr-5"
            >
              <ChamferedBox fillColor="#0891b2" strokeColor="transparent" bevelSize={14} className="w-full h-full p-[2px]">
                <ChamferedBox fillColor="#ffffff" strokeColor="transparent" bevelSize={12} className="w-full h-full overflow-hidden">
                  {uploadingAvatar ? (
                    <ActivityIndicator color={primaryColor} size="small" className="mt-6" />
                  ) : profile?.avatar_url ? (
                    <Image
                      source={{ uri: `${assetUrl(profile.avatar_url)}?t=${avatarTimestamp}` }}
                      className="w-full h-full"
                      contentFit="cover"
                    />
                  ) : (
                    <View className="w-full h-full bg-slate-100 items-center justify-center">
                      <Text className="text-3xl font-black text-cyan-600">{name ? name.charAt(0).toUpperCase() : "M"}</Text>
                    </View>
                  )}
                </ChamferedBox>
              </ChamferedBox>
              
              {/* Camera Badge */}
              <View className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-cyan-600 border-2 border-white items-center justify-center shadow-sm">
                <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <Circle cx="12" cy="13" r="3" />
                </Svg>
              </View>
            </Pressable>

            <View className="flex-1 justify-center">
              <Text className="text-[22px] font-black uppercase text-slate-900 leading-none mb-1">{name || "John Doe"}</Text>
              <View className="flex-row items-center gap-1.5 mt-1">
                <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <Circle cx="12" cy="7" r="4" />
                </Svg>
                <Text className="text-[10px] font-black uppercase text-cyan-600 tracking-widest">{profile?.grade || "Customer"}</Text>
              </View>
            </View>
          </View>
        </ChamferedBox>

        {/* Metrics Row */}
        <View className="mt-4 flex-row gap-3">
          <Pressable
            onPress={() => router.push("/orders")}
            className="flex-1"
          >
            <ChamferedBox fillColor="#ffffff" strokeColor="rgba(14, 165, 233, 0.25)" bevelSize={12} className="p-4 flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-xl bg-teal-50 items-center justify-center">
                <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <Path d="M3 6h18" />
                  <Path d="M16 10a4 4 0 0 1-8 0" />
                </Svg>
              </View>
              <View>
                <Text className="text-[26px] font-black text-teal-600 leading-none">{orderCount}</Text>
                <Text className="text-[10px] font-black uppercase text-slate-500 mt-1">Orders</Text>
              </View>
            </ChamferedBox>
          </Pressable>

          <Pressable
            onPress={() => router.push("/cart")}
            className="flex-1"
          >
            <ChamferedBox fillColor="#ffffff" strokeColor="rgba(14, 165, 233, 0.25)" bevelSize={12} className="p-4 flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-xl bg-blue-50 items-center justify-center">
                <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <Circle cx="9" cy="21" r="1" />
                  <Circle cx="20" cy="21" r="1" />
                  <Path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </Svg>
              </View>
              <View>
                <Text className="text-[26px] font-black text-blue-600 leading-none">{cart.itemCount()}</Text>
                <Text className="text-[10px] font-black uppercase text-slate-500 mt-1">Cart items</Text>
              </View>
            </ChamferedBox>
          </Pressable>
        </View>

        {/* Global Gradients for the screen */}
        <Svg width={0} height={0} style={{ position: 'absolute' }}>
          <Defs>
            <SvgLinearGradient id="saveGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#0d9488" />
              <Stop offset="100%" stopColor="#1d4ed8" />
            </SvgLinearGradient>
            <SvgLinearGradient id="secGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#0891b2" />
              <Stop offset="100%" stopColor="#0d9488" />
            </SvgLinearGradient>
          </Defs>
        </Svg>

        {/* Identity node */}
        <ChamferedBox fillColor="#ffffff" strokeColor="rgba(14, 165, 233, 0.25)" bevelSize={12} className="mt-6">
          <View className="p-5">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-8 h-8 rounded-full bg-teal-600 items-center justify-center">
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <Circle cx="12" cy="7" r="4" />
                </Svg>
              </View>
              <Text className="text-[14px] font-black uppercase text-slate-900 tracking-tight">
                Identity Node
              </Text>
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-[10px] font-black uppercase text-slate-500">Name</Text>
              <View className="flex-row rounded-lg border border-slate-200 overflow-hidden bg-white h-[52px]">
                <View className="w-[52px] bg-teal-600 items-center justify-center">
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <Circle cx="12" cy="7" r="4" />
                  </Svg>
                </View>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  className="flex-1 px-4 text-[15px] text-slate-900 font-bold"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="mb-2 text-[10px] font-black uppercase text-slate-500">Email</Text>
              <View className="flex-row rounded-lg border border-slate-200 overflow-hidden bg-white h-[52px]">
                <View className="w-[52px] bg-teal-700 items-center justify-center">
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Rect width="20" height="16" x="2" y="4" rx="2" />
                    <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </Svg>
                </View>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 px-4 text-[15px] text-slate-900 font-bold"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <Pressable onPress={save} disabled={saving} className="w-full">
              <ChamferedBox fillColor="url(#saveGrad)" strokeColor="transparent" bevelSize={12} className="w-full h-14">
                <View className="flex-1 flex-row items-center justify-center gap-3">
                  {saving ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <Path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <Path d="M17 21v-8H7v8" />
                        <Path d="M7 3v5h8" />
                      </Svg>
                      <Text className="text-[14px] font-black text-white uppercase tracking-wider">Save Profile</Text>
                    </>
                  )}
                </View>
              </ChamferedBox>
            </Pressable>
          </View>
        </ChamferedBox>

        {/* Change Password node */}
        <ChamferedBox fillColor="#ffffff" strokeColor="rgba(14, 165, 233, 0.25)" bevelSize={12} className="mt-6">
          <View className="p-5">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-8 h-8 rounded-full bg-cyan-600 items-center justify-center">
                <Svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <Rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </Svg>
              </View>
              <Text className="text-[14px] font-black uppercase text-slate-900 tracking-tight">
                Security Credentials
              </Text>
            </View>

            {[
              { label: "Current Password", value: currentPassword, setter: setCurrentPassword },
              { label: "New Password", value: newPassword, setter: setNewPassword },
              { label: "Confirm New Password", value: confirmPassword, setter: setConfirmPassword },
            ].map((field, idx) => (
              <View key={idx} className="mb-4">
                <Text className="mb-2 text-[10px] font-black uppercase text-slate-500">{field.label}</Text>
                <View className="flex-row rounded-lg border border-slate-200 overflow-hidden bg-white h-[52px]">
                  <View className="w-[52px] bg-cyan-50 items-center justify-center">
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <Rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </Svg>
                  </View>
                  <TextInput
                    value={field.value}
                    onChangeText={field.setter}
                    secureTextEntry
                    placeholder="••••••••"
                    className="flex-1 px-4 text-[18px] text-slate-900 font-bold tracking-widest"
                    placeholderTextColor="#94A3B8"
                  />
                  <View className="w-[52px] items-center justify-center">
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <Path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <Circle cx="12" cy="12" r="3" />
                    </Svg>
                  </View>
                </View>
              </View>
            ))}

            <Pressable onPress={handleChangePassword} disabled={changingPassword} className="w-full mt-2">
              <ChamferedBox fillColor="url(#secGrad)" strokeColor="transparent" bevelSize={12} className="w-full h-14">
                <View className="flex-1 flex-row items-center justify-center gap-3">
                  {changingPassword ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <Rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </Svg>
                      <Text className="text-[14px] font-black text-white uppercase tracking-wider">Change Password</Text>
                    </>
                  )}
                </View>
              </ChamferedBox>
            </Pressable>
          </View>
        </ChamferedBox>

        {/* Address Vault Manager */}
        <ChamferedBox fillColor="#ffffff" strokeColor="rgba(14, 165, 233, 0.25)" bevelSize={12} className="mt-6">
          <View className="p-5">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-slate-700 items-center justify-center">
                  <Svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <Circle cx="12" cy="10" r="3" />
                  </Svg>
                </View>
                <Text className="text-[14px] font-black uppercase text-slate-900 tracking-tight">
                  Address Vault
                </Text>
              </View>
              <Pressable 
                onPress={() => setAddressModalVisible(true)} 
                className="px-3 py-1 border border-teal-600 rounded flex-row items-center"
                style={{ backgroundColor: 'transparent' }}
              >
                <Text className="text-[10px] font-black uppercase text-teal-600">+ Add New</Text>
              </Pressable>
            </View>

            {addresses.length === 0 ? (
              <View className="items-center py-6 border border-dashed border-slate-200 rounded-lg mt-2">
                <Text className="text-xs font-bold uppercase text-slate-400">No addresses registered</Text>
              </View>
            ) : (
              <View className="gap-3 mt-2">
                {addresses.map((addr) => (
                  <View key={addr.id} className="p-4 border border-slate-200 rounded-xl bg-white">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center gap-2">
                        <View className="px-2 py-0.5 rounded flex-row items-center gap-1 bg-blue-50">
                          <Svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <Path d="M3 10l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <Path d="M9 22V12h6v10" />
                          </Svg>
                          <Text className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                            {addr.type}
                          </Text>
                        </View>
                        {addr.is_default ? (
                          <View className="px-2 py-0.5 rounded flex-row items-center gap-1 bg-emerald-50">
                            <Svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <Path d="M22 4L12 14.01l-3-3" />
                            </Svg>
                            <Text className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                              Default
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <Pressable onPress={() => handleDeleteAddress(addr.id)} className="flex-row items-center gap-1 opacity-60 active:opacity-100">
                        <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <Path d="M3 6h18" />
                          <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <Path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </Svg>
                        <Text className="text-[10px] font-black text-red-500 uppercase">Delete</Text>
                      </Pressable>
                    </View>
                    <Text className="text-[15px] font-black text-slate-900 mt-1">{addr.hotel_name || "Private Residence"}</Text>
                    <Text className="text-[12px] font-semibold text-slate-500 mt-0.5 leading-tight">{addr.address}</Text>
                    
                    <View className="flex-row items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                      <View className="flex-row items-center gap-1.5">
                        <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <Path d="M2 21h20" />
                          <Path d="M19 21v-4" />
                          <Path d="M12 21v-8" />
                          <Path d="M5 21v-4" />
                          <Path d="M2 17h20" />
                          <Path d="M16 17L12 9 8 17" />
                        </Svg>
                        <Text className="text-[11px] font-semibold text-slate-600">Jetty: {addr.jetty}</Text>
                      </View>
                      <View className="flex-row items-center gap-1.5">
                        <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </Svg>
                        <Text className="text-[11px] font-semibold text-slate-600">{addr.phone}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ChamferedBox>

        <View className="mt-4 gap-3">
          <Pressable onPress={() => router.push("/products")}>
            <ChamferedBox fillColor="#ffffff" strokeColor="rgba(14, 165, 233, 0.2)" bevelSize={12} className="w-full">
              <View className="flex-row items-center p-2.5">
                <View className="w-12 h-12 rounded-xl bg-teal-50 items-center justify-center mr-4">
                  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <Path d="M3 6h18" />
                    <Path d="M16 10a4 4 0 0 1-8 0" />
                  </Svg>
                </View>
                <Text className="flex-1 text-[17px] font-black text-slate-900 tracking-wide">Browse Market</Text>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <Path d="m9 18 6-6-6-6" />
                </Svg>
              </View>
            </ChamferedBox>
          </Pressable>

          <Pressable onPress={() => router.push("/home")}>
            <ChamferedBox fillColor="#ffffff" strokeColor="rgba(14, 165, 233, 0.2)" bevelSize={12} className="w-full">
              <View className="flex-row items-center p-2.5">
                <View className="w-12 h-12 rounded-xl bg-blue-50 items-center justify-center mr-4">
                  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M3 10l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <Path d="M9 22V12h6v10" />
                  </Svg>
                </View>
                <Text className="flex-1 text-[17px] font-black text-slate-900 tracking-wide">Harbor Home</Text>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <Path d="m9 18 6-6-6-6" />
                </Svg>
              </View>
            </ChamferedBox>
          </Pressable>
        </View>

        <Pressable onPress={handleLogout} className="mt-4 mb-8">
          <ChamferedBox fillColor="#f43f5e" strokeColor="transparent" bevelSize={14} className="w-full">
            <View className="flex-row items-center p-2">
              <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center absolute left-2 z-10">
                <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <Polyline points="16 17 21 12 16 7" />
                  <Line x1="21" x2="9" y1="12" y2="12" />
                </Svg>
              </View>
              <Text className="flex-1 text-center text-[15px] font-black text-white uppercase tracking-widest pl-10 py-3.5">Log Out</Text>
            </View>
          </ChamferedBox>
        </Pressable>
      </ScrollView>

      {/* Address Addition Modal */}
      <Modal
        visible={addressModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View className="flex-1 justify-end px-4 pb-12 pt-20" style={{ backgroundColor: colors.bg + "E6" }}>
          <ScrollView 
            contentContainerClassName="rounded-none border p-6 shadow-2xl"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-black uppercase italic" style={{ color: colors.text }}>
                Register Node
              </Text>
              <Pressable
                onPress={() => setAddressModalVisible(false)}
                className="rounded-none p-2"
                style={{ backgroundColor: colors.textMuted + "1A" }}
              >
                <Text className="text-xs font-black" style={{ color: colors.text }}>X</Text>
              </Pressable>
            </View>

            <View className="mb-4">
              <Text 
                className="mb-2 text-[10px] font-black uppercase tracking-widest" 
                style={{ color: colors.text }}
              >
                Type / Label
              </Text>
              <View className="flex-row gap-2">
                {["HOME", "WORK", "HOTEL", "OTHER"].map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setAddrType(t)}
                    className="flex-1 py-2 rounded-none border items-center"
                    style={addrType === t ? {
                      borderColor: primaryColor,
                      backgroundColor: colors.primary + "1A"
                    } : {
                      borderColor: colors.border,
                      backgroundColor: colors.bgAlt
                    }}
                  >
                    <Text className="text-[9px] font-black" style={{ color: colors.text }}>{t}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-1 text-[10px] font-black uppercase" style={{ color: colors.text }}>Hotel / Resort Name</Text>
              <Input
                placeholder="e.g. Symphony Palms Resort"
                value={addrHotel}
                onChangeText={setAddrHotel}
              />
            </View>

            <View className="mb-4">
              <Text className="mb-1 text-[10px] font-black uppercase" style={{ color: colors.text }}>Room / Villa No (Optional)</Text>
              <Input
                placeholder="e.g. Room 204"
                value={addrRoom}
                onChangeText={setAddrRoom}
              />
            </View>

            <View className="mb-4">
              <Text 
                className="mb-2 text-[10px] font-black uppercase tracking-widest" 
                style={{ color: colors.text }}
              >
                Delivery Jetty
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                {JETTIES.map((j) => (
                  <Pressable
                    key={j}
                    onPress={() => setAddrJetty(j)}
                    className="px-3 py-2 rounded-none border mr-2"
                    style={addrJetty === j ? {
                      borderColor: primaryColor,
                      backgroundColor: colors.primary + "1A"
                    } : {
                      borderColor: colors.border,
                      backgroundColor: colors.bgAlt
                    }}
                  >
                    <Text className="text-[8px] font-black uppercase" style={{ color: colors.text }}>{j}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View className="mb-4">
              <Text className="mb-1 text-[10px] font-black uppercase" style={{ color: colors.text }}>Delivery Address / Destination</Text>
              <Input
                placeholder="e.g. Govind Nagar Beach No 3, Havelock"
                value={addrLine}
                onChangeText={setAddrLine}
              />
            </View>

            <View className="mb-4">
              <Text className="mb-1 text-[10px] font-black uppercase" style={{ color: colors.text }}>Contact Phone</Text>
              <Input
                placeholder="e.g. +91 9999999999"
                value={addrPhone}
                onChangeText={setAddrPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View 
              className="mb-6 flex-row items-center justify-between border-t pt-4"
              style={{ borderTopColor: colors.border }}
            >
              <Text 
                className="text-[10px] font-black uppercase tracking-widest" 
                style={{ color: colors.text }}
              >
                Set as Default Address
              </Text>
              <Switch
                value={addrDefault}
                onValueChange={setAddrDefault}
                trackColor={{ false: colors.bgAlt, true: primaryColor }}
                thumbColor="#F8FAFC"
              />
            </View>

            <Button
              label={addressLoading ? "COMMISSIONING…" : "SAVE ADDRESS"}
              loading={addressLoading}
              onPress={handleAddAddress}
              className="w-full"
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

