import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Svg, { Circle, Line, Defs, RadialGradient, Stop } from "react-native-svg";
import api from "@/services/api";

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = async () => {
    try {
      const { data } = await api.get(`/fleet.php?order_id=${id}`);
      setTrackingData(data);
    } catch (error) {
      console.error("Telemetry Drift:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 20000);
    return () => clearInterval(interval);
  }, [id]);

  const displayData = trackingData || {
    status: "PROCESSING",
    current_temp: -22.4,
    estimated_arrival: "ACQUIRING...",
    current_lat: 13.160704,
    current_lng: 92.946892,
    agent_name: "ASSIGNING...",
    logs: [{ time: "Now", status: "Registry Live", location: "Andaman Sector", active: true }],
  };

  if (loading && !trackingData) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#7C3AED" size="large" />
        <Text className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Registry Sync...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-4 pb-24 pt-16">
        <Button
          variant="ghost"
          label="← BACK"
          onPress={() => router.back()}
          className="mb-6 self-start px-0"
        />

        {/* Header */}
        <View className="mb-6 flex-row items-start justify-between">
          <View className="flex-1">
            <View className="flex-row items-center gap-3">
              <Text className="text-3xl font-black uppercase italic leading-tight text-foreground">
                Live Tracking
              </Text>
            </View>
            <Text className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              ID: {id} • VESSEL: {displayData.agent_name}
            </Text>
          </View>
          <View className="rounded-2xl border border-primary/20 bg-primary/10 p-3">
            <Text className="text-[8px] font-black uppercase tracking-widest text-foreground">
              Cold-Chain
            </Text>
            <Text className="mt-1 text-base font-black text-primary">
              {displayData.current_temp}°C
            </Text>
          </View>
        </View>
        <View className="mb-8 self-start rounded bg-emerald-500/20 px-3 py-1">
          <Text className="text-[10px] font-black uppercase text-emerald-400">
            {displayData.status}
          </Text>
        </View>

        {/* Radar Map Simulation */}
        <View className="mb-8 h-80 overflow-hidden rounded-[32px] border border-white/5 bg-secondary/30 relative">
          <View className="absolute z-10 p-4">
            <Text className="text-[8px] font-black uppercase tracking-widest text-primary bg-background/50 px-2 py-1 rounded">
              Maritime Command Map
            </Text>
          </View>

          <Svg height="100%" width="100%" style={{ position: "absolute" }}>
            <Defs>
              <RadialGradient id="radar" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            {/* Radar circles */}
            <Circle cx="50%" cy="50%" r="20%" stroke="#ffffff10" strokeWidth="1" fill="none" />
            <Circle cx="50%" cy="50%" r="40%" stroke="#ffffff10" strokeWidth="1" fill="none" />
            <Circle cx="50%" cy="50%" r="60%" stroke="#ffffff10" strokeWidth="1" fill="none" />
            <Circle cx="50%" cy="50%" r="80%" stroke="#ffffff10" strokeWidth="1" fill="none" />
            {/* Crosshairs */}
            <Line x1="0" y1="50%" x2="100%" y2="50%" stroke="#ffffff10" strokeWidth="1" />
            <Line x1="50%" y1="0" x2="50%" y2="100%" stroke="#ffffff10" strokeWidth="1" />
            {/* Agent blip */}
            <Circle cx="60%" cy="40%" r="8" fill="url(#radar)" />
            <Circle cx="60%" cy="40%" r="3" fill="#00D1FF" />
            <Line x1="50%" y1="50%" x2="60%" y2="40%" stroke="#00D1FF" strokeWidth="1.5" strokeDasharray="3,3" />
            {/* Customer blip */}
            <Circle cx="50%" cy="50%" r="4" fill="#7C3AED" />
            <Circle cx="50%" cy="50%" r="10" stroke="#7C3AED" strokeWidth="1" strokeDasharray="2,2" fill="none" />
          </Svg>

          <View className="absolute bottom-3 left-3 right-3 flex-row items-center justify-between rounded-2xl border border-white/10 bg-background/95 p-3">
            <View>
              <Text className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                Arrival
              </Text>
              <Text className="text-sm font-black uppercase text-foreground">
                {displayData.estimated_arrival}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                Telemetry
              </Text>
              <Text className="text-[10px] font-black text-primary opacity-80">
                {displayData.current_lat?.toFixed(3)}, {displayData.current_lng?.toFixed(3)}
              </Text>
            </View>
          </View>
        </View>

        {/* Mission Registry Logs */}
        <Text className="mb-4 text-base font-black uppercase italic tracking-tighter text-foreground">
          Mission Registry
        </Text>
        <View className="pl-2">
          {displayData.logs.map((event: any, i: number) => (
            <View key={i} className="relative mb-6 pl-8">
              {/* Timeline line */}
              {i !== displayData.logs.length - 1 && (
                <View className="absolute bottom-[-24px] left-[3px] top-[14px] w-[1px] bg-white/10" />
              )}
              {/* Timeline dot */}
              <View
                className={cn(
                  "absolute left-0 top-1.5 h-2 w-2 rounded-full",
                  event.active ? "bg-primary shadow-lg" : "bg-white/20"
                )}
              />
              <Text
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  event.active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {event.time}
              </Text>
              <Text
                className={cn(
                  "mt-0.5 text-xs font-bold leading-tight",
                  event.active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {event.status}
              </Text>
              <Text className="text-[9px] font-medium italic text-muted-foreground/60">
                {event.location}
              </Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}
