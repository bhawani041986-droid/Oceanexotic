import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, Modal } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

function StarIcon({ color, fill = "none" }: { color: string; fill?: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

export default function SellerReviewsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const primaryColor = "#7C3AED";
  const borderColor = "rgba(124, 58, 237, 0.25)";
  const bgCard = "rgba(15, 23, 42, 0.6)";

  const sellerId = user?.id ? (user.id.startsWith("SEL-") ? user.id : `SEL-${user.id}`) : 'SEL-001';

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingFilter, setRatingFilter] = useState("ALL"); // ALL, 5, 4, 3

  // Modal Reply States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetReview, setTargetReview] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/seller`, {
        params: { seller_id: sellerId, t: Date.now() }
      });
      if (Array.isArray(res.data)) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error("Reviews retrieval failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [sellerId]);

  const handleRespond = async () => {
    if (!replyText.trim()) {
      Alert.alert("Input Required", "Please type your broadcast response.");
      return;
    }
    if (!targetReview) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/reviews/respond`, {
        id: targetReview.id,
        response: replyText
      });

      if (res.data?.status === "success") {
        Alert.alert("Success", "Response broadcasted to marketplace registry.");
        setIsModalOpen(false);
        setReplyText("");
        setTargetReview(null);
        // Refresh
        setLoading(true);
        fetchReviews();
      } else {
        Alert.alert("Failure", res.data?.message || "Could not publish respond directive.");
      }
    } catch (err) {
      console.error("Review response submission failure:", err);
      Alert.alert("Failure", "Handshake with feedback database timed out.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (ratingFilter === "ALL") return true;
    return String(r.rating) === ratingFilter;
  });

  const renderStars = (rating: number) => {
    const starNodes = [];
    for (let i = 1; i <= 5; i++) {
      starNodes.push(
        <StarIcon 
          key={i} 
          color={i <= rating ? "#EAB308" : "rgba(255,255,255,0.1)"} 
          fill={i <= rating ? "#EAB308" : "none"} 
        />
      );
    }
    return <View className="flex-row gap-0.5">{starNodes}</View>;
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
            Reputation Ledger
          </Text>
          <Text className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">
            Buyer Commendations & Star Feedback
          </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Rating Filters Strip */}
        <View className="flex-row bg-slate-950/50 rounded-xl p-0.5 border mb-5" style={{ borderColor: borderColor }}>
          {["ALL", "5", "4", "3"].map((val) => {
            const active = ratingFilter === val;
            return (
              <Pressable
                key={val}
                onPress={() => setRatingFilter(val)}
                className={`flex-1 py-2 rounded-lg items-center ${active ? "bg-[#7C3AED]" : ""}`}
              >
                <Text className="text-[7.5px] font-black text-white uppercase tracking-widest">
                  {val === "ALL" ? "ALL LEVERAGES" : `${val} STARS`}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Reviews List */}
        <View className="space-y-4">
          {loading ? (
            <ActivityIndicator color={primaryColor} className="py-12" />
          ) : filteredReviews.length === 0 ? (
            <View className="py-16 items-center justify-center opacity-30 border border-white/5 rounded-2xl bg-slate-900/20">
              <Text className="text-[10px] font-bold text-white uppercase tracking-widest italic">
                No commendations registered in ledger
              </Text>
            </View>
          ) : (
            filteredReviews.map((rev) => {
              const hasReplied = !!rev.seller_response;
              return (
                <View 
                  key={rev.id}
                  className="p-5 rounded-[24px] border"
                  style={{ backgroundColor: bgCard, borderColor: borderColor }}
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View>
                      <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">
                        Buyer Account Node
                      </Text>
                      <Text className="text-xs font-black text-white uppercase italic mt-0.5">
                        {rev.user_name || "Merchant Client"}
                      </Text>
                    </View>
                    {renderStars(Number(rev.rating))}
                  </View>

                  <Text className="text-[10px] font-medium text-slate-300 leading-relaxed mb-4">
                    "{rev.comment}"
                  </Text>

                  {/* Date registry */}
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-[6.5px] font-bold text-slate-500 uppercase tracking-widest">
                      Committed: {new Date(rev.created_at).toLocaleDateString()}
                    </Text>
                    <Text className="text-[6.5px] font-black text-[#7C3AED] uppercase tracking-widest">
                      Verified Sale Registry
                    </Text>
                  </View>

                  {/* Seller response block if exists, otherwise provide reply trigger */}
                  {hasReplied ? (
                    <View className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl space-y-1">
                      <Text className="text-[7px] font-black text-[#7C3AED] uppercase tracking-widest">
                        Node Response Broadcast
                      </Text>
                      <Text className="text-[9px] font-medium text-slate-300">
                        "{rev.seller_response}"
                      </Text>
                      {rev.responded_at && (
                        <Text className="text-[6px] font-bold text-slate-600 uppercase">
                          {new Date(rev.responded_at).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => {
                        setTargetReview(rev);
                        setIsModalOpen(true);
                      }}
                      className="h-9 border border-dashed rounded-xl bg-white/5 active:bg-white/10 items-center justify-center"
                      style={{ borderColor: borderColor }}
                    >
                      <Text className="text-[8px] font-black text-[#7C3AED] uppercase tracking-widest">
                        Publish Response Broadcast
                      </Text>
                    </Pressable>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Response Modal */}
      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-slate-950 border-t border-slate-800 rounded-t-[32px] p-6 space-y-4 max-h-[85%]">
            <View className="flex-row justify-between items-center border-b border-white/5 pb-3">
              <Text className="text-xs font-black text-white uppercase tracking-widest italic">
                Broadcast Response Registry
              </Text>
              <Pressable 
                onPress={() => {
                  setIsModalOpen(false);
                  setTargetReview(null);
                  setReplyText("");
                }} 
                className="p-2 bg-white/5 rounded-full"
              >
                <Text className="text-[10px] font-black text-white">✕</Text>
              </Pressable>
            </View>

            {targetReview && (
              <ScrollView className="space-y-4">
                <View className="p-3 bg-white/5 rounded-xl border border-white/5 mb-2">
                  <Text className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest">
                    Buyer Comment
                  </Text>
                  <Text className="text-[9.5px] font-bold text-slate-400 mt-1 italic">
                    "{targetReview.comment}"
                  </Text>
                </View>

                <View>
                  <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Your Response Broadcast
                  </Text>
                  <TextInput
                    value={replyText}
                    onChangeText={setReplyText}
                    placeholder="Type your official reply node broadcast..."
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    multiline
                    numberOfLines={4}
                    className="border rounded-xl bg-slate-900/50 p-3 text-xs font-bold text-white uppercase tracking-wider h-20"
                    style={{ borderColor: borderColor, textAlignVertical: "top" }}
                  />
                </View>

                <Pressable
                  onPress={handleRespond}
                  disabled={submitting}
                  className="w-full h-12 bg-[#7C3AED] active:bg-[#6D28D9] rounded-xl items-center justify-center mt-2 shadow-lg flex-row"
                  style={{ shadowColor: primaryColor, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 }}
                >
                  {submitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-[10px] font-black text-white uppercase tracking-widest italic">
                      Publish Response
                    </Text>
                  )}
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
