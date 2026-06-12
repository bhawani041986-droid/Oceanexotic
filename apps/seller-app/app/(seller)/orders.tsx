import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import { cn } from "@/lib/utils";

// Custom UI Icons matching Hardened HUD
function ChevronLeftIcon({ color }: { color: string }) {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="m15 18-6-6 6-6" />
    </Svg>
  );
}

function ClockIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Path d="M12 6v6l4 2" />
    </Svg>
  );
}

function ShipIcon({ color }: { color: string }) {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M2 21h20" />
      <Path d="M19.3 14.8C21.1 13.5 22 11.7 22 9.5V7a1 1 0 0 0-1-1h-5.5V3a1 1 0 0 0-1-1h-5a1 1 0 0 0-1 1v3H3a1 1 0 0 0-1 1v2.5c0 2.2.9 4 2.7 5.3L2 18v2a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2l-2.7-3.2z" />
      <Path d="M12 8v4" />
      <Path d="M12 2v4" />
    </Svg>
  );
}

function LocationIcon({ color }: { color: string }) {
  return (
    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <Circle cx="12" cy="10" r="3" />
    </Svg>
  );
}

const SHIPPING_METHODS = [
  { id: "STANDARD", label: "Standard Shipping" },
  { id: "EXPRESS", label: "Express Courier" },
  { id: "COLD_CHAIN", label: "Cold Chain Delivery" }
];

export default function SellerOrdersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const user = useAuthStore((s) => s.user);

  const primaryColor = "#7C3AED"; 
  const borderColor = "rgba(124, 58, 237, 0.25)";
  const bgCard = "rgba(15, 23, 42, 0.6)";

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Dispatch Logistics Modal State
  const [isDispatchModalVisible, setIsDispatchModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [isSubmittingDispatch, setIsSubmittingDispatch] = useState(false);

  // Dispatch Form State
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [selectedAgentPhone, setSelectedAgentPhone] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("STANDARD");
  const [trackingNo, setTrackingNo] = useState("");
  const [estDeliveryDate, setEstDeliveryDate] = useState("");

  const sellerId = user?.id ? (user.id.startsWith("SEL-") ? user.id : `SEL-${user.id}`) : 'SEL-001';

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/seller/orders`, { params: { seller_id: sellerId } });
      if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to retrieve orders list.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Handle direct routing to initialize dispatch if order_id is in params
  useEffect(() => {
    if (params.order_id && orders.length > 0) {
      const targetOrder = orders.find(o => o.id === params.order_id);
      if (targetOrder && targetOrder.status === "PENDING") {
        openDispatchModal(targetOrder);
      }
    }
  }, [params.order_id, orders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const openDispatchModal = async (order: any) => {
    setSelectedOrder(order);
    setTrackingNo("VESSEL-TRK-" + Math.floor(100000 + Math.random() * 900000));
    setEstDeliveryDate(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
    setSelectedMethod("STANDARD");
    setIsDispatchModalVisible(true);
    
    // Fetch delivery agents
    setIsLoadingAgents(true);
    try {
      const res = await api.get("/agent/list");
      if (Array.isArray(res.data)) {
        setAgents(res.data);
        if (res.data.length > 0) {
          setSelectedAgentId(res.data[0].id);
          setSelectedAgentPhone(res.data[0].phone);
        }
      }
    } catch (e) {
      console.error("Failed to load active agents", e);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const handleAgentChange = (agentId: string) => {
    setSelectedAgentId(agentId);
    const agt = agents.find(a => a.id === agentId);
    if (agt) {
      setSelectedAgentPhone(agt.phone);
    }
  };

  const submitDispatch = async () => {
    if (!selectedAgentId) {
      Alert.alert("Registry Warning", "Please assign an active delivery agent.");
      return;
    }
    if (!trackingNo.trim()) {
      Alert.alert("Registry Warning", "Tracking registration ID is mandatory.");
      return;
    }

    setIsSubmittingDispatch(true);
    try {
      const payload = {
        order_id: selectedOrder.id,
        status: "SHIPPED",
        delivery_agent_name: selectedAgentId,
        delivery_agent_phone: selectedAgentPhone,
        shipping_method: selectedMethod,
        tracking_number: trackingNo,
        estimated_delivery: estDeliveryDate
      };

      const res = await api.post("/seller/orders", payload);
      if (res.data?.status === "success") {
        Alert.alert("Logistics Cleared", `Vessel Dispatch successfully initialized for ${selectedOrder.id}`);
        setIsDispatchModalVisible(false);
        fetchOrders();
      } else {
        Alert.alert("Execution Failed", res.data?.message || "Verify parameters.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Logistics Failure", "Handshake failed. Verify network connectivity.");
    } finally {
      setIsSubmittingDispatch(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesFilter = activeFilter === "ALL" || o.status === activeFilter;
      const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            o.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, searchQuery]);

  return (
    <View className="flex-1 bg-[#020617]">
      {/* Top Header */}
      <View 
        className="h-14 flex-row items-center px-4 border-b bg-slate-950"
        style={{ borderColor: borderColor }}
      >
        <Pressable 
          onPress={() => router.replace("/(seller)/dashboard")}
          className="h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 active:opacity-75"
        >
          <ChevronLeftIcon color={primaryColor} />
        </Pressable>
        <Text className="text-sm font-black uppercase text-white tracking-widest ml-3 italic">
          Order Manifest
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-white/5 bg-slate-950/80 px-2 py-2">
        {["ALL", "PENDING", "SHIPPED", "DELIVERED"].map((tab) => {
          const active = activeFilter === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveFilter(tab)}
              className={cn("flex-1 py-2 items-center rounded-lg border border-transparent", active && "bg-[#7C3AED]/10 border-[#7C3AED]/20")}
            >
              <Text className={cn("text-[7.5px] font-black tracking-widest uppercase", active ? "text-[#7C3AED]" : "text-slate-400")}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Main Order Manifest List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
        }
      >
        {/* Search */}
        <View 
          className="flex-row items-center px-3 h-10 border rounded-xl bg-slate-900/50 mb-5"
          style={{ borderColor: borderColor }}
        >
          <TextInput
            placeholder="Search Order ID or Customer..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            className="flex-1 text-xs font-black text-white uppercase tracking-wider"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Text className="text-slate-400 text-xs font-black px-1">✕</Text>
            </Pressable>
          )}
        </View>

        {isLoading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator color={primaryColor} size="large" />
            <Text className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-4 animate-pulse">
              Syncing orders list...
            </Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View 
            className="py-20 border border-dashed rounded-[24px] items-center justify-center space-y-4"
            style={{ borderColor: borderColor, backgroundColor: "rgba(255,255,255,0.01)" }}
          >
            <Text className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              No orders found in ledger
            </Text>
          </View>
        ) : (
          <View className="space-y-4">
            {filteredOrders.map((order) => (
              <View
                key={order.id}
                className="p-4 rounded-[24px] border relative overflow-hidden"
                style={{ backgroundColor: bgCard, borderColor: borderColor }}
              >
                {/* ID & Status */}
                <View className="flex-row justify-between items-center mb-3">
                  <View>
                    <Text className="text-sm font-black text-white italic tracking-tighter">
                      {order.id}
                    </Text>
                    <View className="flex-row items-center mt-1 opacity-60">
                      <ClockIcon color="rgba(255,255,255,0.6)" />
                      <Text className="text-[7px] font-black text-slate-300 uppercase tracking-widest ml-1">
                        {order.created_at || "Registry Date Unknown"}
                      </Text>
                    </View>
                  </View>

                  <View 
                    className={cn(
                      "px-2.5 py-1 rounded border text-[7.5px] font-black uppercase tracking-widest",
                      order.status === "DELIVERED" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                      order.status === "SHIPPED" && "bg-blue-500/10 border-blue-500/30 text-blue-400",
                      order.status === "PENDING" && "bg-rose-500/10 border-rose-500/30 text-rose-400",
                      order.status !== "DELIVERED" && order.status !== "SHIPPED" && order.status !== "PENDING" && "bg-slate-500/10 border-slate-500/30 text-slate-400"
                    )}
                  >
                    <Text className="text-[7.5px] font-black">{order.status}</Text>
                  </View>
                </View>

                {/* Details Section */}
                <View className="py-2.5 border-y border-white/5 space-y-2 mb-3.5">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 pr-4">
                      <Text className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Destination Port</Text>
                      <View className="flex-row items-center space-x-1">
                        <LocationIcon color="rgba(255,255,255,0.6)" />
                        <Text className="text-[10px] font-bold text-white uppercase tracking-tight" numberOfLines={1}>
                          {order.customer_name}
                        </Text>
                      </View>
                      <Text className="text-[9px] text-slate-400 mt-1 leading-normal" numberOfLines={2}>
                        {order.delivery_address}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Total Settlement</Text>
                      <Text className="text-sm font-black text-[#7C3AED] italic tracking-tighter">
                        ₹{Number(order.total_amount).toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  {/* Dispatch logistics if shipped/delivered */}
                  {(order.status === "SHIPPED" || order.status === "DELIVERED") && (
                    <View className="pt-2 border-t border-white/5 flex-row flex-wrap justify-between">
                      <View className="w-[48%]">
                        <Text className="text-[6.5px] font-black text-slate-500 uppercase tracking-widest">Courier Agent</Text>
                        <Text className="text-[9.5px] font-bold text-slate-300 uppercase tracking-wider">{order.delivery_agent_name}</Text>
                      </View>
                      <View className="w-[48%] items-end">
                        <Text className="text-[6.5px] font-black text-slate-500 uppercase tracking-widest">Tracking Reference</Text>
                        <Text className="text-[9.5px] font-bold text-blue-400 tracking-wider" numberOfLines={1}>{order.tracking_number}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Dispatch Trigger Button */}
                {order.status === "PENDING" ? (
                  <Pressable
                    onPress={() => openDispatchModal(order)}
                    className="w-full py-2.5 rounded-xl bg-[#7C3AED] items-center active:opacity-90 flex-row justify-center space-x-2"
                  >
                    <ShipIcon color="#FFFFFF" />
                    <Text className="text-[8px] font-black uppercase tracking-widest text-white">
                      Initialize Courier Dispatch
                    </Text>
                  </Pressable>
                ) : (
                  <View className="w-full py-2.5 rounded-xl border border-white/5 bg-white/5 items-center justify-center flex-row space-x-1.5">
                    <Text className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                      Delivery Completed
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* DISPATCH LOGISTICS MODAL */}
      <Modal
        visible={isDispatchModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsDispatchModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-background/90 px-4 pb-12 pt-20">
          <View 
            className="rounded-[32px] border bg-[#090d1f] p-6 shadow-2xl space-y-4"
            style={{ borderColor: borderColor }}
          >
            <View className="flex-row items-center justify-between border-b border-white/5 pb-4">
              <View>
                <Text className="text-lg font-black uppercase italic text-white">
                  Initialize Dispatch
                </Text>
                <Text className="text-[7.5px] font-black uppercase text-[#7C3AED] tracking-widest mt-0.5">
                  Secure Delivery Driver Assignment
                </Text>
              </View>
              <Pressable
                onPress={() => setIsDispatchModalVisible(false)}
                className="h-8 w-8 rounded-full bg-white/5 border border-white/10 items-center justify-center active:opacity-75"
              >
                <Text className="text-xs font-black text-white">✕</Text>
              </Pressable>
            </View>

            {selectedOrder && (
              <View className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <Text className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Order Manifest ID</Text>
                <Text className="text-xs font-black text-white italic tracking-tighter mt-0.5">{selectedOrder.id}</Text>
                <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-white/5">
                  <View>
                    <Text className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest">Consignee Address</Text>
                    <Text className="text-[9px] text-slate-300 font-bold uppercase mt-0.5" numberOfLines={1}>
                      {selectedOrder.customer_name} • {selectedOrder.delivery_address}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Select Delivery Agent */}
            <View>
              <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assign Courier Agent</Text>
              {isLoadingAgents ? (
                <ActivityIndicator color={primaryColor} />
              ) : (
                <View className="border rounded-xl bg-slate-900/50 overflow-hidden" style={{ borderColor: borderColor }}>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => handleAgentChange(e.target.value)}
                    className="w-full h-11 bg-transparent text-xs font-bold text-white uppercase tracking-widest px-3 outline-none"
                  >
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} ({agent.zone})
                      </option>
                    ))}
                    {agents.length === 0 && <option value="">No Active Agents Available</option>}
                  </select>
                </View>
              )}
            </View>

            {/* Agent Phone (ReadOnly indicator) */}
            <View>
              <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Agent Secure Direct Line</Text>
              <TextInput
                className="h-11 border rounded-xl bg-slate-900/10 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider"
                style={{ borderColor: borderColor }}
                value={selectedAgentPhone}
                editable={false}
              />
            </View>

            {/* Transit Mode & Tracking ID */}
            <View className="flex-row justify-between">
              <View className="w-[48%]">
                <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Transit Mode</Text>
                <View className="border rounded-xl bg-slate-900/50 overflow-hidden" style={{ borderColor: borderColor }}>
                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full h-11 bg-transparent text-[10px] font-bold text-white uppercase tracking-widest px-2 outline-none"
                  >
                    {SHIPPING_METHODS.map(sm => <option key={sm.id} value={sm.id}>{sm.label}</option>)}
                  </select>
                </View>
              </View>

              <View className="w-[48%]">
                <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Estimated ETA</Text>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  className="h-11 border rounded-xl bg-slate-900/50 px-3 text-xs font-bold text-white uppercase tracking-wider"
                  style={{ borderColor: borderColor }}
                  value={estDeliveryDate}
                  onChangeText={setEstDeliveryDate}
                />
              </View>
            </View>

            {/* Tracking ID */}
            <View>
              <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tracking Registry ID</Text>
              <TextInput
                placeholder="e.g. VESSEL-TRK-12345"
                placeholderTextColor="rgba(255,255,255,0.3)"
                className="h-11 border rounded-xl bg-slate-900/50 px-3 text-xs font-bold text-white uppercase tracking-wider"
                style={{ borderColor: borderColor }}
                value={trackingNo}
                onChangeText={setTrackingNo}
              />
            </View>

            {/* Execute Button */}
            <Pressable
              onPress={submitDispatch}
              disabled={isSubmittingDispatch || agents.length === 0}
              className="w-full h-12 rounded-xl bg-[#7C3AED] items-center justify-center active:opacity-90 flex-row"
              style={{
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
                elevation: 6
              }}
            >
              {isSubmittingDispatch ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-xs font-black text-white uppercase tracking-widest">
                  Confirm Dispatch
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
