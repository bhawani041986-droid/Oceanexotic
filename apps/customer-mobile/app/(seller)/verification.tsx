import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, Modal, Image } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Svg, { Path, Circle } from "react-native-svg";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { FULL_API_URL } from "@/config/api";
import axios from "axios";

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

function ShieldIcon({ color }: { color: string }) {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

function UploadIcon({ color }: { color: string }) {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <Path d="m17 8-5-5-5 5" />
      <Path d="M12 3v12" />
    </Svg>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 6L9 17l-5-5" />
    </Svg>
  );
}

export default function SellerVerificationScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const primaryColor = "#7C3AED";
  const borderColor = "rgba(124, 58, 237, 0.25)";
  const bgCard = "rgba(15, 23, 42, 0.6)";

  const sellerId = user?.id ? (user.id.startsWith("SEL-") ? user.id : `SEL-${user.id}`) : 'SEL-001';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState({ progress: 0, rank: "LEVEL 1: INITIAL NODE", documents: [] as any[] });
  
  // Modal Upload states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("LEGAL");
  const [expiryDate, setExpiryDate] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchVerificationData = async () => {
    try {
      const res = await api.get(`/seller/get_verification.php`, {
        params: { seller_id: sellerId, t: Date.now() }
      });
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Verification telemetry error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationData();
  }, [sellerId]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Required", "Camera roll access is required to upload credential documents.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!docTitle.trim()) {
      Alert.alert("Invalid Input", "Please specify a credential title.");
      return;
    }
    if (!selectedImage) {
      Alert.alert("Asset Required", "Please select a document image to upload.");
      return;
    }

    setSubmitting(true);
    try {
      const filename = selectedImage.split('/').pop() || 'verification_doc.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      const uploadData = new FormData();
      uploadData.append('seller_id', sellerId);
      uploadData.append('title', docTitle);
      uploadData.append('doc_type', docType);
      if (expiryDate) {
        uploadData.append('expiry_date', expiryDate);
      }
      uploadData.append('file', {
        uri: selectedImage,
        name: filename,
        type,
      } as any);

      const res = await axios.post(`${FULL_API_URL}/seller/upload_doc.php`, uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success) {
        Alert.alert("Success", "Integrity credential registered & pending verification.");
        setIsModalVisible(false);
        // Reset states
        setDocTitle("");
        setExpiryDate("");
        setSelectedImage(null);
        // Refresh data
        setLoading(true);
        fetchVerificationData();
      } else {
        Alert.alert("Upload Failure", res.data?.error || "Failed to commit credential to registry.");
      }
    } catch (err) {
      console.error("Credential commit failed:", err);
      Alert.alert("Upload Failure", "Handshake with verification node interrupted.");
    } finally {
      setSubmitting(false);
    }
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
            Integrity Verification
          </Text>
          <Text className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">
            Merchant Node Compliance Audit
          </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Progress Card */}
        <View 
          className="p-5 rounded-[24px] border mb-5 relative overflow-hidden"
          style={{ backgroundColor: bgCard, borderColor: borderColor }}
        >
          <View className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full -mr-10 -mt-10 blur-2xl" />
          
          <View className="flex-row items-center space-x-3 mb-4">
            <View className="p-2.5 rounded-xl bg-slate-900 border border-white/5">
              <ShieldIcon color={primaryColor} />
            </View>
            <View>
              <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">
                Node Trust Level
              </Text>
              <Text className="text-sm font-black text-white uppercase italic tracking-tight mt-0.5">
                {data.rank}
              </Text>
            </View>
          </View>

          {/* Bar Progress */}
          <View className="space-y-1.5">
            <View className="flex-row justify-between items-center px-1">
              <Text className="text-[7.5px] font-black text-slate-400 uppercase">Integrity Index</Text>
              <Text className="text-[10px] font-black text-[#7C3AED] italic">{data.progress}%</Text>
            </View>
            <View className="h-2 w-full bg-slate-900 border border-white/5 rounded-full overflow-hidden">
              <View 
                className="h-full bg-[#7C3AED] rounded-full" 
                style={{ width: `${data.progress}%` }} 
              />
            </View>
          </View>

          <Text className="text-[7.5px] font-bold text-slate-500 uppercase mt-4 leading-relaxed">
            * Complete all compliance directives to unlock level 3 premium logistics dispatch nodes and direct buyer channels.
          </Text>
        </View>

        {/* Upload Trigger Button */}
        <Pressable
          onPress={() => setIsModalVisible(true)}
          className="h-12 border border-dashed rounded-2xl items-center justify-center flex-row gap-2 bg-white/5 active:bg-white/10 mb-6"
          style={{ borderColor: borderColor }}
        >
          <UploadIcon color={primaryColor} />
          <Text className="text-[9px] font-black text-white uppercase tracking-widest italic">
            Commission New Document
          </Text>
        </Pressable>

        {/* Credentials Registry List */}
        <View className="space-y-3">
          <Text className="text-xs font-black text-white uppercase tracking-tight italic ml-1">
            Compliance Registry
          </Text>

          {loading ? (
            <ActivityIndicator color={primaryColor} className="py-6" />
          ) : data.documents.length === 0 ? (
            <View className="py-12 items-center justify-center opacity-30 border border-white/5 rounded-2xl bg-slate-900/20">
              <Text className="text-[10px] font-bold text-white uppercase tracking-widest italic">
                No documents found in registry
              </Text>
            </View>
          ) : (
            data.documents.map((doc) => {
              const isVerified = doc.status === "VERIFIED";
              const isPending = doc.status === "PENDING";
              return (
                <View 
                  key={doc.id}
                  className="p-4 rounded-2xl border"
                  style={{ backgroundColor: bgCard, borderColor: borderColor }}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View>
                      <Text className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{doc.id} • {doc.type}</Text>
                      <Text className="text-xs font-black text-white mt-0.5 uppercase">{doc.title}</Text>
                    </View>
                    <View 
                      className={`px-2 py-0.5 rounded border ${
                        isVerified 
                          ? "bg-emerald-500/10 border-emerald-500/20" 
                          : isPending 
                          ? "bg-yellow-500/10 border-yellow-500/20" 
                          : "bg-rose-500/10 border-rose-500/20"
                      }`}
                    >
                      <Text className={`text-[7.5px] font-black uppercase ${
                        isVerified 
                          ? "text-emerald-500" 
                          : isPending 
                          ? "text-yellow-500" 
                          : "text-rose-500"
                      }`}>
                        {doc.status}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between bg-white/5 p-2 rounded-lg border border-white/5">
                    <View>
                      <Text className="text-[7px] font-black text-slate-500 uppercase">Valid Until</Text>
                      <Text className="text-[9px] font-bold text-slate-300">{doc.expiry}</Text>
                    </View>
                    <View className="justify-center">
                      <Text className="text-[7px] font-black text-[#7C3AED] uppercase tracking-widest">ENCRYPTED TELEMETRY</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* New Document Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-slate-950 border-t border-slate-800 rounded-t-[32px] p-6 space-y-4 max-h-[85%]">
            <View className="flex-row justify-between items-center border-b border-white/5 pb-3">
              <Text className="text-xs font-black text-white uppercase tracking-widest italic">
                Commission Compliance Asset
              </Text>
              <Pressable onPress={() => setIsModalVisible(false)} className="p-2 bg-white/5 rounded-full">
                <Text className="text-[10px] font-black text-white">✕</Text>
              </Pressable>
            </View>

            <ScrollView className="space-y-4">
              <View>
                <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Credential Title
                </Text>
                <TextInput
                  value={docTitle}
                  onChangeText={setDocTitle}
                  placeholder="e.g. FSSAI License"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  className="h-11 border rounded-xl bg-slate-900/50 px-3 text-xs font-bold text-white uppercase tracking-wider"
                  style={{ borderColor: borderColor }}
                />
              </View>

              <View>
                <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Document Registry Group
                </Text>
                <View className="flex-row bg-slate-900/50 rounded-xl p-0.5 border" style={{ borderColor: borderColor }}>
                  {["LEGAL", "QUALITY", "OPERATIONAL"].map((type) => {
                    const active = docType === type;
                    return (
                      <Pressable
                        key={type}
                        onPress={() => setDocType(type)}
                        className={`flex-1 py-2.5 rounded-lg items-center ${active ? "bg-[#7C3AED]" : ""}`}
                      >
                        <Text className="text-[7.5px] font-black text-white uppercase tracking-widest">{type}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Expiry Date (YYYY-MM-DD)
                </Text>
                <TextInput
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  placeholder="e.g. 2027-05-22"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  className="h-11 border rounded-xl bg-slate-900/50 px-3 text-xs font-bold text-white tracking-wider"
                  style={{ borderColor: borderColor }}
                />
              </View>

              <View>
                <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Select Document Image
                </Text>
                {selectedImage ? (
                  <View className="relative w-full h-32 border border-white/10 rounded-xl overflow-hidden bg-slate-900">
                    <Image source={{ uri: selectedImage }} className="w-full h-full" resizeMode="cover" />
                    <Pressable 
                      onPress={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/70 items-center justify-center border border-white/20"
                    >
                      <Text className="text-[10px] font-black text-white">✕</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={pickImage}
                    className="w-full h-24 border border-dashed rounded-xl items-center justify-center bg-white/5 active:bg-white/10"
                    style={{ borderColor: borderColor }}
                  >
                    <UploadIcon color={primaryColor} />
                    <Text className="text-[7.5px] font-black uppercase tracking-widest text-[#7C3AED] mt-1.5">
                      Select File Node
                    </Text>
                  </Pressable>
                )}
              </View>

              <Pressable
                onPress={handleUpload}
                disabled={submitting}
                className="w-full h-12 bg-[#7C3AED] active:bg-[#6D28D9] rounded-xl items-center justify-center mt-4 shadow-lg flex-row"
                style={{ shadowColor: primaryColor, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 }}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-[10px] font-black text-white uppercase tracking-widest italic">
                    Commit To Registry
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
