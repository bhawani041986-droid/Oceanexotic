import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Modal, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

// Mock Order Metadata (1:1 with Web)
const MOCK_ORDER = {
  date: "May 09, 2026",
  status: "OUT_FOR_DELIVERY",
  total: 12800,
  shipping: 500,
  tax: 640,
  subtotal: 11660,
  address: {
    name: "Bhawani Singh",
    line1: "North Jetty Road, Phoenix Bay",
    city: "Port Blair",
    state: "South Andaman",
    zip: "744101",
  },
  items: [
    {
      id: "p1",
      name: "Premium Bluefin Tuna",
      price: 8500,
      qty: 1,
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400",
    },
    {
      id: "p2",
      name: "Hokkaido Scallops",
      price: 3160,
      qty: 1,
      image: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=400",
    },
  ],
};

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { toast, ToastHost } = useToast();

  const [reviewItem, setReviewItem] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmitReview = () => {
    if (!comment) {
      toast("Please provide feedback.", "error");
      return;
    }
    toast("Review submitted to ledger.", "success");
    setReviewItem(null);
    setComment("");
    setRating(5);
  };

  return (
    <View className="flex-1 bg-background">
      {ToastHost}
      <ScrollView contentContainerClassName="px-4 pt-16 pb-32">
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <Button
            variant="ghost"
            label="← BACK"
            onPress={() => router.back()}
            className="px-0"
          />
        </View>

        {/* Title */}
        <View className="mb-6 border-b border-white/10 pb-6">
          <View className="flex-row items-center gap-3">
            <Text className="text-3xl font-black uppercase italic text-foreground">
              {id}
            </Text>
            <View className="rounded bg-emerald-500/20 px-2 py-1">
              <Text className="text-[10px] font-black uppercase text-emerald-400">
                {MOCK_ORDER.status}
              </Text>
            </View>
          </View>
          <Text className="mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Sovereign Settlement Manifest • {MOCK_ORDER.date}
          </Text>

          {MOCK_ORDER.status !== "DELIVERED" && (
            <Button
              label="TRACK LIVE STATUS"
              onPress={() => router.push({ pathname: "/orders/[id]/tracking", params: { id } } as never)}
              className="mt-4 h-10 w-full rounded-xl"
            />
          )}
        </View>

        {/* 🔐 SECURE HANDOFF PROTOCOL */}
        <View className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/30">
              <Text className="text-lg">🔐</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs font-black uppercase italic text-foreground">
                Secure Handoff Protocol
              </Text>
              <Text className="mt-0.5 text-[9px] text-muted-foreground">
                Provide QR or OTP to confirm delivery
              </Text>
            </View>
          </View>
          
          <View className="mt-4 items-center justify-center border-t border-white/5 pt-4">
            <Image
              source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`http://localhost:3000/agent/confirm/${id}?otp=${String((parseInt(id?.replace(/[^0-9]/g, "") || "123") * 997 + 12345) % 900000 + 100000)}`)}` }}
              className="h-40 w-40 rounded-xl bg-white p-2"
              contentFit="contain"
            />
            <Text className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Verification Password (OTP)
            </Text>
            <Text className="mt-1 text-2xl font-black tracking-widest text-primary italic">
              {String((parseInt(id?.replace(/[^0-9]/g, "") || "123") * 997 + 12345) % 900000 + 100000)}
            </Text>
          </View>
        </View>

        {/* Items */}
        <Text className="mb-4 text-xs font-black uppercase tracking-widest text-foreground">
          Manifest Items
        </Text>
        <View className="mb-8 gap-4">
          {MOCK_ORDER.items.map((item) => (
            <View
              key={item.id}
              className="rounded-2xl border border-white/10 bg-secondary/40 p-4"
            >
              <View className="flex-row gap-4">
                <Image
                  source={{ uri: item.image }}
                  className="h-16 w-16 rounded-xl border border-white/5 bg-secondary/50"
                  contentFit="cover"
                />
                <View className="flex-1 justify-center">
                  <Text className="text-sm font-bold text-foreground">
                    {item.name}
                  </Text>
                  <Text className="mt-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    QTY: {item.qty} • SKU: OF-{item.id}
                  </Text>
                  <Text className="mt-2 text-lg font-black text-foreground">
                    ₹{item.price.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row border-t border-white/10 pt-4">
                <Button
                  variant="ghost"
                  label="RATE PRODUCT"
                  onPress={() => setReviewItem(item)}
                  className="flex-1 border border-white/10"
                />
              </View>
            </View>
          ))}
        </View>

        {/* Settlement Summary */}
        <View className="mb-6 rounded-2xl border border-white/10 bg-secondary/40 p-5">
          <Text className="mb-4 text-[10px] font-black uppercase tracking-widest text-foreground">
            Manifest Summary
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted-foreground">Subtotal</Text>
              <Text className="text-xs font-bold text-foreground">
                ₹{MOCK_ORDER.subtotal.toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted-foreground">Maritime Transit</Text>
              <Text className="text-[10px] font-black uppercase text-emerald-400">
                Complimentary
              </Text>
            </View>
            <View className="mb-2 flex-row justify-between">
              <Text className="text-xs text-muted-foreground">Settlement Tax</Text>
              <Text className="text-xs font-bold text-foreground">
                ₹{MOCK_ORDER.tax.toLocaleString()}
              </Text>
            </View>
            <View className="flex-row items-center justify-between border-t border-white/10 pt-3">
              <Text className="text-[10px] font-black uppercase tracking-widest text-foreground">
                Total Settlement
              </Text>
              <Text className="text-xl font-black italic text-primary">
                ₹{MOCK_ORDER.total.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        <View className="rounded-2xl border border-white/10 bg-secondary/40 p-5">
          <Text className="mb-3 text-[10px] font-black uppercase tracking-widest text-foreground">
            Port of Destination
          </Text>
          <Text className="text-xs font-bold uppercase italic text-foreground">
            {MOCK_ORDER.address.name}
          </Text>
          <Text className="mt-1 text-[11px] leading-tight text-muted-foreground">
            {MOCK_ORDER.address.line1}
            {"\n"}
            {MOCK_ORDER.address.city}, {MOCK_ORDER.address.state} {MOCK_ORDER.address.zip}
          </Text>
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={!!reviewItem}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewItem(null)}
      >
        <View className="flex-1 justify-end bg-background/90 px-4 pb-12 pt-20">
          <View className="rounded-3xl border border-white/10 bg-card p-6 shadow-2xl">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-black uppercase italic text-foreground">
                Rate Harvest
              </Text>
              <Pressable
                onPress={() => setReviewItem(null)}
                className="rounded-full bg-white/5 p-2"
              >
                <Text className="text-xs font-black text-foreground">X</Text>
              </Pressable>
            </View>

            {reviewItem && (
              <View className="mb-6 flex-row items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                <Image
                  source={{ uri: reviewItem.image }}
                  className="h-12 w-12 rounded-xl bg-secondary/50"
                  contentFit="cover"
                />
                <View className="flex-1">
                  <Text className="text-sm font-bold text-foreground">
                    {reviewItem.name}
                  </Text>
                  <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Order: {id}
                  </Text>
                </View>
              </View>
            )}

            <View className="mb-6 items-center">
              <Text className="mb-3 text-[10px] font-black uppercase tracking-widest text-foreground">
                Quality Rating
              </Text>
              <View className="flex-row gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Pressable key={s} onPress={() => setRating(s)}>
                    <Text
                      className={cn(
                        "text-3xl",
                        s <= rating ? "text-amber-400" : "text-white/20"
                      )}
                    >
                      ★
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="mb-2 text-[10px] font-black uppercase tracking-widest text-foreground">
                Harvest Notes
              </Text>
              <TextInput
                placeholder="Share your experience..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={comment}
                onChangeText={setComment}
                multiline
                className="h-24 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-foreground"
                textAlignVertical="top"
              />
            </View>

            <Button
              label="SUBMIT REVIEW"
              onPress={handleSubmitReview}
              className="w-full"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
