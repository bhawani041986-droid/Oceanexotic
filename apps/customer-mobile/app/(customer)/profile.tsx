import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable, Modal, Switch } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { userService, type UserProfile } from "@/services/userService";
import { orderService } from "@/services/orderService";
import { useCartStore } from "@/store/cartStore";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { checkoutService, type SavedAddress } from "@/services/checkoutService";
import { cn } from "@/lib/utils";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { assetUrl } from "@/config/assets";

const JETTIES = ["Phoenix Bay Jetty", "Haddo Jetty", "Junglighat Jetty", "Havelock Jetty", "Chatham Jetty"];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const cart = useCartStore();
  const { toast, ToastHost } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#7C3AED" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {ToastHost}
      <ScrollView contentContainerClassName="px-4 pb-28 pt-16">
        <Text className="text-2xl font-black uppercase italic text-foreground">Citizen Profile</Text>
        <Text className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {profile?.grade || "Maritime Citizen"}
        </Text>

        {/* Identity Head & Avatar */}
        <View className="flex-row items-center gap-4 mt-6 rounded-2xl border border-white/10 bg-card p-4">
          <Pressable 
            onPress={handlePickImage} 
            disabled={uploadingAvatar}
            className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 bg-secondary/50 justify-center items-center"
          >
            {uploadingAvatar ? (
              <ActivityIndicator color="#7C3AED" size="small" />
            ) : profile?.avatar_url ? (
              <Image
                source={{ uri: assetUrl(profile.avatar_url) }}
                className="w-full h-full"
                contentFit="cover"
              />
            ) : (
              <Text className="text-xl font-black text-primary">
                {name ? name.charAt(0).toUpperCase() : "M"}
              </Text>
            )}
            <View className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 items-center justify-center">
              <Text className="text-[7px] font-black text-white uppercase tracking-widest">EDIT</Text>
            </View>
          </Pressable>
          <View className="flex-1">
            <Text className="text-lg font-black uppercase text-foreground">{name || "Maritime Citizen"}</Text>
            <Text className="text-[8px] font-black uppercase tracking-widest text-primary mt-0.5">
              🚢 {profile?.grade || "Maritime Citizen"}
            </Text>
          </View>
        </View>

        <View className="mt-6 flex-row gap-3">
          <Pressable
            onPress={() => router.push("/orders")}
            className="flex-1 rounded-2xl border border-white/10 bg-card p-4"
          >
            <Text className="text-2xl font-black text-primary">{orderCount}</Text>
            <Text className="text-[9px] font-black uppercase text-muted-foreground">Orders</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/cart")}
            className="flex-1 rounded-2xl border border-white/10 bg-card p-4"
          >
            <Text className="text-2xl font-black text-primary">{cart.itemCount()}</Text>
            <Text className="text-[9px] font-black uppercase text-muted-foreground">Cart items</Text>
          </Pressable>
        </View>

        {/* Identity node */}
        <View className="mt-6 gap-4 rounded-2xl border border-white/10 bg-card p-5">
          <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Identity node
          </Text>
          <View>
            <Text className="mb-1 text-[10px] font-black uppercase text-foreground">Name</Text>
            <Input value={name} onChangeText={setName} />
          </View>
          <View>
            <Text className="mb-1 text-[10px] font-black uppercase text-foreground">Email</Text>
            <Input value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <Button label={saving ? "SAVING…" : "SAVE PROFILE"} loading={saving} onPress={save} />
        </View>

        {/* Change Password node */}
        <View className="mt-6 gap-4 rounded-2xl border border-white/10 bg-card p-5">
          <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Security credentials
          </Text>
          <View>
            <Text className="mb-1 text-[10px] font-black uppercase text-foreground">Current Password</Text>
            <Input
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="••••••••"
            />
          </View>
          <View>
            <Text className="mb-1 text-[10px] font-black uppercase text-foreground">New Password</Text>
            <Input
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="••••••••"
            />
          </View>
          <View>
            <Text className="mb-1 text-[10px] font-black uppercase text-foreground">Confirm New Password</Text>
            <Input
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="••••••••"
            />
          </View>
          <Button
            label={changingPassword ? "SYNCHRONIZING…" : "CHANGE PASSWORD"}
            loading={changingPassword}
            onPress={handleChangePassword}
          />
        </View>

        {/* Address Vault Manager */}
        <View className="mt-6 rounded-2xl border border-white/10 bg-card p-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Address Vault
            </Text>
            <Pressable onPress={() => setAddressModalVisible(true)} className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1">
              <Text className="text-[9px] font-black text-primary uppercase">+ ADD NEW</Text>
            </Pressable>
          </View>

          {addresses.length === 0 ? (
            <View className="items-center py-6 border border-dashed border-white/10 rounded-xl">
              <Text className="text-xs font-bold text-muted-foreground uppercase">No addresses registered</Text>
            </View>
          ) : (
            <View className="gap-3">
              {addresses.map((addr) => (
                <View key={addr.id} className="p-4 rounded-xl border border-white/10 bg-secondary/20 relative">
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {addr.type}
                      </Text>
                      {addr.is_default ? (
                        <Text className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                          Default
                        </Text>
                      ) : null}
                    </View>
                    <Pressable onPress={() => handleDeleteAddress(addr.id)} className="opacity-60 active:opacity-100 p-1">
                      <Text className="text-[9px] font-black text-rose-500 uppercase">Delete</Text>
                    </Pressable>
                  </View>
                  <Text className="text-xs font-bold text-foreground">{addr.hotel_name || "Private Residence"}</Text>
                  <Text className="text-[11px] text-muted-foreground mt-1 leading-tight">{addr.address}</Text>
                  <Text className="text-[9px] text-muted-foreground/60 mt-1 italic">
                    🚢 Jetty: {addr.jetty} · 📞 {addr.phone}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="mt-4 gap-2">
          <Pressable onPress={() => router.push("/products")} className="rounded-xl border border-white/10 bg-card px-4 py-4">
            <Text className="text-sm font-bold text-foreground">Browse Market</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/home")} className="rounded-xl border border-white/10 bg-card px-4 py-4">
            <Text className="text-sm font-bold text-foreground">Harbor Home</Text>
          </Pressable>
        </View>

        <Button label="LOG OUT" variant="ghost" onPress={handleLogout} className="mt-8 border border-danger/30" />
      </ScrollView>

      {/* Address Addition Modal */}
      <Modal
        visible={addressModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-background/90 px-4 pb-12 pt-20">
          <ScrollView contentContainerClassName="rounded-3xl border border-white/10 bg-card p-6 shadow-2xl">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-black uppercase italic text-foreground">
                Register Node
              </Text>
              <Pressable
                onPress={() => setAddressModalVisible(false)}
                className="rounded-full bg-white/5 p-2"
              >
                <Text className="text-xs font-black text-foreground">X</Text>
              </Pressable>
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-[10px] font-black uppercase tracking-widest text-foreground">
                Type / Label
              </Text>
              <View className="flex-row gap-2">
                {["HOME", "WORK", "HOTEL", "OTHER"].map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setAddrType(t)}
                    className={cn(
                      "flex-1 py-2 rounded-xl border items-center",
                      addrType === t ? "border-primary bg-primary/10" : "border-white/10 bg-white/5"
                    )}
                  >
                    <Text className="text-[9px] font-black text-foreground">{t}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-1 text-[10px] font-black uppercase text-foreground">Hotel / Resort Name</Text>
              <Input
                placeholder="e.g. Symphony Palms Resort"
                value={addrHotel}
                onChangeText={setAddrHotel}
              />
            </View>

            <View className="mb-4">
              <Text className="mb-1 text-[10px] font-black uppercase text-foreground">Room / Villa No (Optional)</Text>
              <Input
                placeholder="e.g. Room 204"
                value={addrRoom}
                onChangeText={setAddrRoom}
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-[10px] font-black uppercase tracking-widest text-foreground">
                Delivery Jetty
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                {JETTIES.map((j) => (
                  <Pressable
                    key={j}
                    onPress={() => setAddrJetty(j)}
                    className={cn(
                      "px-3 py-2 rounded-xl border mr-2",
                      addrJetty === j ? "border-primary bg-primary/10" : "border-white/10 bg-white/5"
                    )}
                  >
                    <Text className="text-[8px] font-black text-foreground uppercase">{j}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View className="mb-4">
              <Text className="mb-1 text-[10px] font-black uppercase text-foreground">Delivery Address / Destination</Text>
              <Input
                placeholder="e.g. Govind Nagar Beach No 3, Havelock"
                value={addrLine}
                onChangeText={setAddrLine}
              />
            </View>

            <View className="mb-4">
              <Text className="mb-1 text-[10px] font-black uppercase text-foreground">Contact Phone</Text>
              <Input
                placeholder="e.g. +91 9999999999"
                value={addrPhone}
                onChangeText={setAddrPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View className="mb-6 flex-row items-center justify-between border-t border-white/5 pt-4">
              <Text className="text-[10px] font-black uppercase tracking-widest text-foreground">
                Set as Default Address
              </Text>
              <Switch
                value={addrDefault}
                onValueChange={setAddrDefault}
                trackColor={{ false: "#1E293B", true: "#7C3AED" }}
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
