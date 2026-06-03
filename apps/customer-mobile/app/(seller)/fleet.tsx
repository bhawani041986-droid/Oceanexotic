import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, Modal, Animated } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle, Line, G } from "react-native-svg";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

function PlusIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12h14" />
      <Path d="M12 5v14" />
    </Svg>
  );
}

function ThermometerIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </Svg>
  );
}

// 8-NODE MARITIME GRID DEFINITION for mapping simulator coords to screen positions
const MARITIME_NODES = [
  { name: "Haddo Port Hub", lat: 11.6844, lng: 92.7265, x: 100, y: 80 },
  { name: "Junglighat Sector", lat: 11.6624, lng: 92.7165, x: 70, y: 130 },
  { name: "Phoenix Bay Node", lat: 11.6744, lng: 92.7365, x: 120, y: 100 },
  { name: "Aberdeen Bazar", lat: 11.6710, lng: 92.7410, x: 140, y: 110 },
  { name: "Port Blair Center", lat: 11.6667, lng: 92.7500, x: 160, y: 120 },
  { name: "Dollygunj Terminal", lat: 11.6450, lng: 92.7120, x: 50, y: 170 },
  { name: "Bathu Basti Market", lat: 11.6350, lng: 92.7100, x: 40, y: 190 },
  { name: "Garacharma Sector", lat: 11.6250, lng: 92.7100, x: 30, y: 210 }
];

export default function SellerFleetScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const primaryColor = "#7C3AED";
  const borderColor = "rgba(124, 58, 237, 0.25)";
  const bgCard = "rgba(15, 23, 42, 0.6)";

  const sellerId = user?.id ? (user.id.startsWith("SEL-") ? user.id : `SEL-${user.id}`) : 'SEL-001';

  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState<any[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeMissionDetails, setActiveMissionDetails] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  // Dispatch form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [agentName, setAgentName] = useState("");
  const [dispatching, setDispatching] = useState(false);

  // Radar Animation
  const sweepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(sweepAnim, {
        toValue: 360,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const fetchTelemetry = async () => {
    try {
      const res = await api.get(`/fleet.php`, { params: { t: Date.now() } });
      if (Array.isArray(res.data)) {
        setMissions(res.data);
        if (res.data.length > 0 && !activeOrderId) {
          setActiveOrderId(res.data[0].order_id);
        }
      }
    } catch (err) {
      console.error("Fleet telemetry fetch failure:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/seller/orders.php`, { params: { seller_id: sellerId, t: Date.now() } });
      if (Array.isArray(res.data)) {
        // Filter orders that need dispatching (PLACED or PROCESSING)
        const pending = res.data.filter((o: any) => o.status === "PLACED" || o.status === "PROCESSING" || o.status === "PREPARING");
        setOrders(pending);
      }
    } catch (err) {
      console.error("Orders fetch failure:", err);
    }
  };

  const fetchMissionDetails = async (orderId: string) => {
    try {
      const res = await api.get(`/fleet.php`, { params: { order_id: orderId, t: Date.now() } });
      if (res.data) {
        setActiveMissionDetails(res.data);
      }
    } catch (err) {
      console.error("Mission details fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    fetchOrders();
    const interval = setInterval(fetchTelemetry, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeOrderId) {
      fetchMissionDetails(activeOrderId);
    }
  }, [activeOrderId]);

  const handleDispatch = async () => {
    if (!selectedOrderId) {
      Alert.alert("Error", "Please select a pending order to dispatch.");
      return;
    }
    if (!agentName.trim()) {
      Alert.alert("Error", "Please enter the agent name.");
      return;
    }

    setDispatching(true);
    try {
      // 1. Update order status to SHIPPED and assign agent name
      await api.post(`/seller/orders.php`, {
        order_id: selectedOrderId,
        status: "SHIPPED",
        delivery_agent_name: agentName,
        estimated_delivery: "20 MINS",
        shipping_method: "COLD_CHAIN"
      });

      // 2. Initialize tracking coordinates (e.g. Dollygunj Terminal node)
      const targetNode = MARITIME_NODES[Math.floor(Math.random() * MARITIME_NODES.length)];
      await api.post(`/fleet.php`, {
        order_id: selectedOrderId,
        agent_name: agentName,
        lat: targetNode.lat,
        lng: targetNode.lng,
        temp: -18.5,
        status: "IN_TRANSIT",
        log_entry: {
          status: "Vessel Dispatched",
          location: targetNode.name
        }
      });

      Alert.alert("Success", "Dispatch mission initialized successfully.");
      setIsModalOpen(false);
      setSelectedOrderId("");
      setAgentName("");
      // Refresh
      fetchTelemetry();
      fetchOrders();
    } catch (err) {
      console.error("Dispatch error:", err);
      Alert.alert("Error", "Failed to dispatch mission.");
    } finally {
      setDispatching(false);
    }
  };

  // Convert GPS Coordinates to SVG space coordinates roughly around Port Blair
  const getScreenCoordinates = (lat: number, lng: number) => {
    // Reference bounds: lat [11.60, 11.70], lng [92.70, 92.76]
    const minLat = 11.62;
    const maxLat = 11.69;
    const minLng = 92.71;
    const maxLng = 92.755;

    const width = 220;
    const height = 220;

    // Normalization
    const x = ((lng - minLng) / (maxLng - minLng)) * width;
    // Invert Y axis for screen space
    const y = height - ((lat - minLat) / (maxLat - minLat)) * height;

    return {
      x: Math.max(10, Math.min(width - 10, x)),
      y: Math.max(10, Math.min(height - 10, y))
    };
  };

  const spin = sweepAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View className="flex-1 bg-[#020617]">
      {/* Header */}
      <View 
        className="h-16 flex-row items-center px-4 border-b bg-slate-950 justify-between"
        style={{ borderColor: borderColor }}
      >
        <View className="flex-row items-center">
          <Pressable 
            onPress={() => router.back()} 
            className="p-2 mr-2 rounded-full bg-white/5 border border-white/5 active:scale-95"
          >
            <BackIcon color="white" />
          </Pressable>
          <View>
            <Text className="text-xs font-black uppercase text-white tracking-widest italic">
              Logistics Fleet Command
            </Text>
            <Text className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">
              Andaman Sector Maritime Pulse
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => {
            if (orders.length === 0) {
              Alert.alert("Logistics Center", "No pending orders available for dispatch.");
              return;
            }
            setIsModalOpen(true);
          }}
          className="h-9 px-3 bg-[#7C3AED] active:bg-[#6D28D9] rounded-xl flex-row items-center gap-1.5"
        >
          <PlusIcon color="white" />
          <Text className="text-[9px] font-black text-white uppercase tracking-widest italic">
            Dispatch
          </Text>
        </Pressable>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Radar Map Card */}
        <View 
          className="p-4 rounded-[24px] border mb-5 overflow-hidden items-center justify-center relative bg-slate-950"
          style={{ borderColor: borderColor }}
        >
          {/* Svg Radar */}
          <View className="w-[220] h-[220] justify-center items-center relative">
            {/* Concentric rings */}
            <Svg width="220" height="220" viewBox="0 0 220 220" className="absolute">
              <Circle cx="110" cy="110" r="100" stroke="rgba(124, 58, 237, 0.15)" strokeWidth="1" fill="none" />
              <Circle cx="110" cy="110" r="70" stroke="rgba(124, 58, 237, 0.2)" strokeWidth="1" fill="none" strokeDasharray="4,4" />
              <Circle cx="110" cy="110" r="40" stroke="rgba(124, 58, 237, 0.25)" strokeWidth="1" fill="none" />
              
              {/* Radar Crosshairs */}
              <Line x1="10" y1="110" x2="210" y2="110" stroke="rgba(124, 58, 237, 0.1)" strokeWidth="1" />
              <Line x1="110" y1="10" x2="110" y2="210" stroke="rgba(124, 58, 237, 0.1)" strokeWidth="1" />

              {/* Draw active vessels */}
              {missions.map((m) => {
                const isSelected = m.order_id === activeOrderId;
                const coords = getScreenCoordinates(m.current_lat || 11.66, m.current_lng || 92.73);
                return (
                  <G key={m.order_id}>
                    {/* Pulsing selection aura */}
                    {isSelected && (
                      <Circle 
                        cx={coords.x} 
                        cy={coords.y} 
                        r="12" 
                        fill="rgba(124, 58, 237, 0.2)" 
                        stroke="rgba(124, 58, 237, 0.5)" 
                        strokeWidth="1" 
                      />
                    )}
                    <Circle 
                      cx={coords.x} 
                      cy={coords.y} 
                      r="6" 
                      fill={isSelected ? "#7C3AED" : "#10B981"} 
                      onPress={() => setActiveOrderId(m.order_id)} 
                    />
                  </G>
                );
              })}
            </Svg>

            {/* Sweep radar ray */}
            <Animated.View 
              style={{
                width: 200,
                height: 200,
                borderRadius: 100,
                borderLeftColor: "rgba(124, 58, 237, 0.3)",
                borderLeftWidth: 2.5,
                transform: [{ rotate: spin }]
              }}
              className="absolute pointer-events-none"
            />
          </View>

          <Text className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest mt-2">
            * Interactive Radar Node. Click nodes to sync active telemetry logs.
          </Text>
        </View>

        {/* Selected Mission details */}
        {activeOrderId && activeMissionDetails ? (
          <View className="space-y-4">
            {/* Title block */}
            <View 
              className="p-5 rounded-[24px] border"
              style={{ backgroundColor: bgCard, borderColor: borderColor }}
            >
              <View className="flex-row justify-between items-start mb-4 border-b border-white/5 pb-3">
                <View>
                  <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    MISSION TELEMETRY
                  </Text>
                  <Text className="text-xl font-black text-white italic mt-1">
                    {activeOrderId}
                  </Text>
                </View>
                <View className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                  <Text className="text-[7.5px] font-black text-emerald-500 uppercase">
                    {activeMissionDetails.status}
                  </Text>
                </View>
              </View>

              {/* stats strip */}
              <View className="flex-row justify-between gap-3 mb-4">
                <View className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5">
                  <View className="flex-row items-center gap-1.5 mb-1">
                    <ThermometerIcon color="#7C3AED" />
                    <Text className="text-[7.5px] font-black text-slate-400 uppercase">COLD-CHAIN</Text>
                  </View>
                  <Text className="text-base font-black text-white italic">
                    {activeMissionDetails.current_temp ? `${activeMissionDetails.current_temp}°C` : "N/A"}
                  </Text>
                </View>

                <View className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5">
                  <Text className="text-[7.5px] font-black text-slate-400 uppercase mb-1">EST. DELIVERY</Text>
                  <Text className="text-base font-black text-white italic">
                    {activeMissionDetails.estimated_arrival || "15 MINS"}
                  </Text>
                </View>
              </View>

              <View className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                <Text className="text-[7px] font-black text-slate-500 uppercase tracking-widest">ASSIGNED AGENT</Text>
                <Text className="text-xs font-bold text-white uppercase italic">{activeMissionDetails.agent_name}</Text>
              </View>
            </View>

            {/* Protocol timeline logs */}
            <View 
              className="p-5 rounded-[24px] border"
              style={{ backgroundColor: bgCard, borderColor: borderColor }}
            >
              <Text className="text-xs font-black text-white uppercase tracking-tight italic mb-4">
                Protocol Timeline Logs
              </Text>

              <View className="space-y-4 relative pl-3">
                <View className="absolute left-1.5 top-2 bottom-2 w-px bg-white/5" />

                {activeMissionDetails.logs?.map((log: any, idx: number) => (
                  <View key={idx} className="relative pl-4">
                    <View 
                      className={`absolute left-[-2.5px] top-1 w-2 h-2 rounded-full border border-slate-950 ${
                        log.active ? "bg-[#7C3AED]" : "bg-slate-700"
                      }`} 
                    />
                    <Text className={`text-[10px] font-black uppercase ${
                      log.active ? "text-white" : "text-slate-500"
                    }`}>
                      {log.status}
                    </Text>
                    <Text className="text-[7.5px] font-bold text-slate-500 uppercase mt-0.5">
                      {log.time} • {log.location}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View className="py-20 items-center justify-center opacity-30 border border-white/5 rounded-2xl bg-slate-900/20">
            <Text className="text-[10px] font-bold text-white uppercase tracking-widest italic">
              Select or Dispatch a Node Mission
            </Text>
          </View>
        )}

        {/* Active tracking list grid */}
        <View className="space-y-3 mt-6">
          <Text className="text-xs font-black text-white uppercase tracking-tight italic ml-1">
            Active Mission Manifest
          </Text>

          {missions.map((mission) => {
            const isSelected = mission.order_id === activeOrderId;
            return (
              <Pressable
                key={mission.order_id}
                onPress={() => setActiveOrderId(mission.order_id)}
                className={`p-4 rounded-xl border flex-row justify-between items-center ${
                  isSelected ? "bg-slate-900/40" : "bg-slate-950/20"
                }`}
                style={{ borderColor: isSelected ? primaryColor : "rgba(255, 255, 255, 0.05)" }}
              >
                <View>
                  <Text className="text-xs font-black text-white uppercase tracking-wider">{mission.order_id}</Text>
                  <Text className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                    {mission.agent_name}
                  </Text>
                </View>

                <View className="items-end">
                  <View className="bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-0.5 rounded">
                    <Text className="text-[7.5px] font-black text-[#10B981] uppercase">{mission.status}</Text>
                  </View>
                  <Text className="text-[7px] font-black text-slate-500 mt-1 uppercase tracking-widest">
                    {mission.current_lat?.toFixed(3)}N, {mission.current_lng?.toFixed(3)}E
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Dispatch Modal */}
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
                Commission New Dispatch
              </Text>
              <Pressable onPress={() => setIsModalOpen(false)} className="p-2 bg-white/5 rounded-full">
                <Text className="text-[10px] font-black text-white">✕</Text>
              </Pressable>
            </View>

            <ScrollView className="space-y-4">
              <View>
                <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Select Order Manifest
                </Text>
                <View className="space-y-2">
                  {orders.map((ord) => {
                    const isSel = selectedOrderId === ord.id;
                    return (
                      <Pressable
                        key={ord.id}
                        onPress={() => setSelectedOrderId(ord.id)}
                        className={`p-3.5 rounded-xl border flex-row justify-between items-center ${
                          isSel ? "bg-purple-950/20 border-purple-500/40" : "bg-slate-900/50 border-white/5"
                        }`}
                      >
                        <View>
                          <Text className="text-xs font-black text-white">{ord.id}</Text>
                          <Text className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                            Customer: {ord.customer_name}
                          </Text>
                        </View>
                        <Text className="text-xs font-black text-[#7C3AED]">₹{ord.total_amount}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Agent Node Name
                </Text>
                <TextInput
                  value={agentName}
                  onChangeText={setAgentName}
                  placeholder="e.g. INS-ANDAMAN-AGENT-01"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  className="h-11 border rounded-xl bg-slate-900/50 px-3 text-xs font-bold text-white uppercase tracking-wider"
                  style={{ borderColor: borderColor }}
                />
              </View>

              <Pressable
                onPress={handleDispatch}
                disabled={dispatching}
                className="w-full h-12 bg-[#7C3AED] active:bg-[#6D28D9] rounded-xl items-center justify-center mt-4 shadow-lg flex-row"
                style={{ shadowColor: primaryColor, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 }}
              >
                {dispatching ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-[10px] font-black text-white uppercase tracking-widest italic">
                    Initialize Dispatch Mission
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
