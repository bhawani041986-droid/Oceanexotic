import { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, Pressable } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import type { Territory } from "@/services/homeService";


interface TelemetryProps {
  territories: Territory[];
}

const { width } = Dimensions.get("window");
const radarSize = width - 48;

export function AndamanMaritimeTelemetry({ territories = [] }: TelemetryProps) {
  const radarRotation = useSharedValue(0);
  const signalPulse = useSharedValue(1);

  useEffect(() => {
    radarRotation.value = withRepeat(
      withTiming(360, {
        duration: 4000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    signalPulse.value = withRepeat(
      withTiming(1.6, {
        duration: 2000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
      -1,
      true
    );
  }, []);

  const radarSweepStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${radarRotation.value}deg` }],
  }));

  const activeNodes = (territories || [])
    .filter((t) => t.status === "ACTIVE")
    .slice(0, 5);

  const mappedNodes = activeNodes.map((node, index) => {
    const angle = (index * (360 / Math.max(1, activeNodes.length)) * Math.PI) / 180;
    const radius = radarSize * (0.18 + index * 0.04);
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    // SVG coordinates relative to absolute radar center
    const svgX = radarSize / 2 + x;
    const svgY = radarSize / 2 + y;

    return { node, x, y, svgX, svgY };
  });

  return (
    <View className="px-4 py-6 border-y border-white/5 bg-secondary/20">
      <View className="mb-4">
        <Text className="text-xl font-black italic uppercase text-foreground">Live Telemetry</Text>
        <Text className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">
          Futuristic Cold-Chain Logistics Tracking
        </Text>
      </View>

      {/* Control Buttons */}
      <View className="flex-row gap-3 mb-4">
        <Pressable className="flex-1 flex-row items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3 py-4">
          <View className="flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-emerald-500" />
            <Text className="text-xs font-black uppercase italic text-foreground">Fleet Auth</Text>
          </View>
          <Text className="text-[9px] font-black uppercase text-primary">DONE</Text>
        </Pressable>

        <Pressable className="flex-1 flex-row items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3 py-4">
          <View className="flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-primary" />
            <Text className="text-xs font-black uppercase italic text-foreground">Active Routing</Text>
          </View>
          <Text className="text-[9px] font-black uppercase text-primary">SYNCED</Text>
        </Pressable>
      </View>

      {/* Radar Panel Screen */}
      <View 
        style={{ height: radarSize }} 
        className="w-full relative items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#0B1120] p-4 shadow-2xl"
      >
        {/* Radar Background Grids */}
        <Svg width="100%" height="100%" className="absolute">
          {/* Concentric Radar Rings */}
          <Circle cx={radarSize / 2} cy={radarSize / 2} r={radarSize * 0.4} stroke="rgba(0, 212, 255, 0.08)" strokeWidth="1" />
          <Circle cx={radarSize / 2} cy={radarSize / 2} r={radarSize * 0.25} stroke="rgba(0, 212, 255, 0.08)" strokeWidth="1" />
          <Circle cx={radarSize / 2} cy={radarSize / 2} r={radarSize * 0.12} stroke="rgba(0, 212, 255, 0.08)" strokeWidth="1" />
          {/* Axis lines */}
          <Line x1={radarSize / 2} y1="0" x2={radarSize / 2} y2={radarSize} stroke="rgba(0, 212, 255, 0.05)" strokeWidth="1" />
          <Line x1="0" y1={radarSize / 2} x2={radarSize} y2={radarSize / 2} stroke="rgba(0, 212, 255, 0.05)" strokeWidth="1" />
          
          {/* Glowing dashed network path lines connecting the Sovereign Fleet Exchange nodes to the Center Hub */}
          {mappedNodes.map((item, index) => (
            <Line
              key={index}
              x1={radarSize / 2}
              y1={radarSize / 2}
              x2={item.svgX}
              y2={item.svgY}
              stroke="rgba(0, 243, 255, 0.22)"
              strokeWidth="1.2"
              strokeDasharray="4, 4"
            />
          ))}
        </Svg>

        {/* Rotating sweep */}
        <Animated.View 
          style={[styles.radarSweep, radarSweepStyle, { width: radarSize, height: radarSize }]}
          className="absolute items-center justify-center pointer-events-none"
        >
          <LinearGradient
            colors={["rgba(0,212,255,0.15)", "transparent", "transparent"]}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              width: radarSize / 2,
              height: radarSize / 2,
              position: "absolute",
              top: 0,
              right: 0,
              borderTopRightRadius: radarSize / 2,
            }}
          />
        </Animated.View>

        {/* Nodes mapped as dynamic glowing dots */}
        <View className="absolute inset-0 items-center justify-center">
          {mappedNodes.length > 0 ? (
            mappedNodes.map((item) => (
              <View 
                key={item.node.name}
                style={{
                  position: "absolute",
                  transform: [{ translateX: item.x }, { translateY: item.y }],
                }}
                className="items-center justify-center"
              >
                <View className="h-3 w-3 rounded-full bg-[#00f3ff] shadow-[0_0_8px_#00f3ff] items-center justify-center">
                  <View className="h-1 w-1 rounded-full bg-white" />
                </View>
                <View className="absolute top-4 bg-black/80 border border-[#00f3ff]/30 px-2 py-0.5 rounded shadow">
                  <Text className="text-[8px] font-black uppercase text-white tracking-widest">{item.node.name}</Text>
                </View>
              </View>
            ))
          ) : (
            <View className="items-center justify-center">
              <Text className="text-[#00d4ff] text-[18px] font-black tracking-widest animate-pulse">RADAR LIVE</Text>
              <Text className="text-muted-foreground text-[8px] uppercase tracking-widest mt-1">Sovereign Andaman Exchange</Text>
            </View>
          )}
        </View>

        {/* HUD Overlay telemetry info */}
        <View className="absolute top-4 right-4 flex-row items-center gap-1.5 bg-black/60 border border-primary/20 px-2 py-1 rounded-lg">
          <View className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <Text className="text-[7px] font-black text-foreground uppercase tracking-widest">Stable Connection</Text>
        </View>
        
        <View className="absolute bottom-4 left-4 bg-black/60 border border-primary/20 px-2 py-1 rounded-lg">
          <Text className="text-[7px] font-mono text-muted-foreground uppercase">REF: MAR-PB-NODE</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  radarSweep: {
    borderRadius: 9999,
  },
});
