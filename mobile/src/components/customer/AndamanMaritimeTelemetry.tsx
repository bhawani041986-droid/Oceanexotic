import { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Pressable, Platform, ActivityIndicator, Image as RNImage, PanResponder } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import type { Territory } from "@/services/homeService";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useSettingsStore } from "@/store/settingsStore";

interface TelemetryProps {
  territories: Territory[];
}

const { width } = Dimensions.get("window");
const radarSize = width - 48;

export function AndamanMaritimeTelemetry({ territories = [] }: TelemetryProps) {
  const radarRotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const scanPosition = useSharedValue(0);

  const colors = useThemeColors();
  const theme = useSettingsStore((s) => s.theme);

  // Dynamically tailor the radar/telemetry color palette based on selected admin theme
  const getPalette = () => {
    return [
      colors.primary,
      colors.secondary,
      colors.accent,
      colors.primary,
      colors.accent,
      colors.text || "#ffffff"
    ];
  };

  const palette = getPalette();

  // Web Interactive Leaflet state
  const [isLReady, setIsLReady] = useState(false);
  const [isMapInit, setIsMapInit] = useState(false);
  const mapRef = useRef<any>(null);

  // Interactive Zoom level state for Mobile Native version
  const [zoom, setZoom] = useState(12);

  // Dynamic map panning center state for Native iOS/Android (initialized at Port Blair coordinates)
  const [latCenter, setLatCenter] = useState(11.6667);
  const [lngCenter, setLngCenter] = useState(92.7500);

  // Panning translation offset during active drag gesture
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Dynamic zoom projection boundaries based on current map center and zoom level
  const BASE_LAT_DELTA = 0.1;
  const BASE_LNG_DELTA = 0.06;
  const scaleFactor = Math.pow(2, 12 - zoom);

  const latDelta = BASE_LAT_DELTA * scaleFactor;
  const lngDelta = BASE_LNG_DELTA * scaleFactor;

  const latMin = latCenter - latDelta / 2;
  const latMax = latCenter + latDelta / 2;
  const lngMin = lngCenter - lngDelta / 2;
  const lngMax = lngCenter + lngDelta / 2;

  // React Native PanResponder gesture mapping
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only claim gesture if it's a real swipe/drag rather than a simple click
        return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
      },
      onPanResponderMove: (evt, gestureState) => {
        setPanOffset({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Translate final drag pixels back to lat/lng degrees displacement
        const dLng = -(gestureState.dx / radarSize) * lngDelta;
        const dLat = (gestureState.dy / (radarSize * 0.75)) * latDelta;
        
        setLngCenter(prev => prev + dLng);
        setLatCenter(prev => prev + dLat);
        setPanOffset({ x: 0, y: 0 });
      },
    })
  ).current;

  useEffect(() => {
    radarRotation.value = withRepeat(
      withTiming(360, {
        duration: 8000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    pulseScale.value = withRepeat(
      withTiming(1.5, {
        duration: 2000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
      -1,
      true
    );
    scanPosition.value = withRepeat(
      withTiming(radarSize - 10, {
        duration: 4000,
        easing: Easing.linear,
      }),
      -1,
      true
    );
  }, []);

  // Web Leaflet Script & CSS Handshake Loader
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    if ((window as any).L) {
      setIsLReady(true);
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => setIsLReady(true);
    document.head.appendChild(script);
  }, []);

  // Web Map Instance Initialization
  useEffect(() => {
    if (Platform.OS !== "web" || !isLReady || isMapInit || typeof window === "undefined") return;
    const L = (window as any).L;
    const container = document.getElementById("andaman-maritime-map");
    if (!container || (container as any)._leaflet_id) return;

    try {
      mapRef.current = L.map("andaman-maritime-map", {
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
      }).setView([11.6667, 92.7500], 12);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png", {
        maxZoom: 20
      }).addTo(mapRef.current);

      setIsMapInit(true);
    } catch (err) {
      console.error("Map Initialization Error:", err);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setIsMapInit(false);
      }
    };
  }, [isLReady]);

  // Web Dynamic Marker Registry Sync
  useEffect(() => {
    if (Platform.OS !== "web" || !isMapInit || !mapRef.current) return;
    const L = (window as any).L;

    try {
      // Clear old layers
      mapRef.current.eachLayer((layer: any) => {
        if (layer && !layer._url && layer !== mapRef.current) {
          try {
            mapRef.current.removeLayer(layer);
          } catch (e) {}
        }
      });

      const activeNodes = (territories || [])
        .filter((t) => t.status === "ACTIVE" && t.coordinates);

      const mainHub = activeNodes.find((t) => t.name.toLowerCase().includes("port blair"));
      let hubPos: any = null;
      if (mainHub) {
        const hp = String(mainHub.coordinates).split(",").map((s) => parseFloat(s.trim()));
        if (hp.length >= 2 && !isNaN(hp[0]) && !isNaN(hp[1])) {
          hubPos = L.latLng(hp[0], hp[1]);
        }
      }

      activeNodes.forEach((t, i) => {
        const raw = String(t.coordinates).split(",").map((s) => parseFloat(s.trim()));
        if (raw.length >= 2 && !isNaN(raw[0]) && !isNaN(raw[1])) {
          const pos = L.latLng(raw[0], raw[1]);
          const color = palette[i % palette.length];

          if (hubPos && pos && !t.name.toLowerCase().includes("port blair")) {
            try {
              L.polyline([hubPos, pos], {
                color: color,
                weight: 1,
                dashArray: "4, 8",
                opacity: 0.25
              }).addTo(mapRef.current);
            } catch (e) {}
          }

          const icon = L.divIcon({
            className: "maritime-cyber-pointer",
            html: `<div class="relative" style="width: 20px; height: 20px;">
                  <div class="w-3 h-3 flex items-center justify-center">
                      <div class="absolute w-6 h-6 rounded-full border border-[var(--foreground)]/10 animate-ping" style="border-color: ${color}22"></div>
                      <div class="w-2.5 h-2.5 rounded-full border border-white shadow-[0_0_8px_${color}]" style="background-color: ${color}"></div>
                  </div>
                  <div class="absolute bottom-[2px] left-1/2 -translate-x-1/2 animate-pulse">
                    <svg width="12" height="8" viewBox="0 0 24 16" fill="${color}" style="filter: drop-shadow(0 0 3px ${color}88)">
                      <path d="M0 0 L24 0 L12 16 Z" />
                    </svg>
                  </div>
                  <div class="absolute bottom-[10px] left-1/2 -translate-x-1/2 bg-black/95 border-b-2 px-2.5 py-1 flex flex-col items-center shadow-[0_0_20px_rgba(0,0,0,0.6)] rounded whitespace-nowrap" 
                       style="border-bottom-color: ${color}; transform: translateX(-50%); pointer-events: none; width: max-content;">
                       <div class="flex items-center gap-1">
                         <span class="text-[5.5px] font-black text-white/40 uppercase tracking-tighter">NODE REG: 0${i + 1}</span>
                         <div class="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                       </div>
                       <span class="text-[9px] font-black text-white uppercase tracking-wider">${t.name}</span>
                       <span class="text-[5px] font-mono text-[${color}] opacity-80">${t.coordinates}</span>
                  </div>
              </div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          L.marker(pos, { icon }).addTo(mapRef.current);
        }
      });
    } catch (err) {
      console.error("Leaflet marker sync error:", err);
    }
  }, [territories, isMapInit, palette]);

  const radarSweepStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${radarRotation.value}deg` }],
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanPosition.value }],
  }));

  // Filter active telemetry nodes with valid coordinates
  const activeNodes = (territories || [])
    .filter((t) => t.status === "ACTIVE" && t.coordinates);

  // Map latitude and longitude to exact geographic pixel bounds
  const mappedNodes = activeNodes.map((node, index) => {
    const parts = String(node.coordinates).split(",").map(p => parseFloat(p.trim()));
    let x = radarSize / 2;
    let y = (radarSize * 0.75) / 2;
    
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const lat = parts[0];
      const lng = parts[1];
      
      // Calculate scaled percentages
      const xPct = (lng - lngMin) / (lngMax - lngMin);
      const yPct = 1 - (lat - latMin) / (latMax - latMin); // Invert Y for SVG coordinates
      
      // Keep inside bounds (Adjusted for rectangular height: radarSize * 0.75)
      x = Math.max(20, Math.min(radarSize - 20, xPct * radarSize));
      y = Math.max(20, Math.min((radarSize * 0.75) - 20, yPct * (radarSize * 0.75)));
    }

    const color = palette[index % palette.length];

    return {
      node,
      x,
      y,
      color,
      registryId: `ACT_0${index + 1}`
    };
  });

  // Main Port Blair anchor hub positioning
  const hubNode = mappedNodes.find(item => item.node.name.toLowerCase().includes("port blair")) || mappedNodes[0];

  // 1. RENDER WEB LEAFLET VERSION WITH DESIGN SYSTEM PARITY
  if (Platform.OS === "web") {
    return (
      <View className="px-4 py-6 border-y border-white/5 bg-secondary/20">
        <View className="mb-4">
          <Text className="text-xl font-black italic uppercase text-foreground">Live Telemetry Map</Text>
          <Text className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: colors.primary }}>
            Futuristic Cold-Chain Logistics Tracking
          </Text>
        </View>

        {/* Dynamic Status Tabs */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 flex-row items-center gap-3 rounded-xl border border-white/5 bg-secondary/30 p-3">
            <View className="h-8 w-8 bg-rose-500/15 flex items-center justify-center rounded-lg">
              <Text className="text-rose-500 text-sm">🛡️</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[8px] font-black text-rose-500 uppercase tracking-[0.1em]">DONE</Text>
              <Text className="text-xs font-black text-foreground uppercase italic">Fleet Auth</Text>
            </View>
          </View>

          <View className="flex-1 flex-row items-center gap-3 rounded-xl border border-white/5 bg-secondary/30 p-3">
            <View className="h-8 w-8 bg-rose-500/15 flex items-center justify-center rounded-lg">
              <Text className="text-rose-500 text-sm">🧭</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[8px] font-black text-rose-500 uppercase tracking-[0.1em]">ACTIVE</Text>
              <Text className="text-xs font-black text-foreground uppercase italic">Routing</Text>
            </View>
          </View>
        </View>

        <View 
          style={{ 
            height: radarSize * 0.75, 
            width: "100%", 
            overflow: "hidden", 
            borderColor: colors.primary + "33",
            ...Platform.select({
              web: {
                clipPath: "polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)"
              }
            })
          }} 
          className="relative bg-[#0B1120] shadow-2xl border self-center"
        >
          {/* Inject Leaflet CSS custom overrides style tag */}
          <style dangerouslySetInnerHTML={{ __html: `
            .leaflet-control-zoom { border: none !important; margin: 15px !important; }
            .leaflet-control-zoom-in, .leaflet-control-zoom-out { 
                background-color: rgba(0,0,0,0.7) !important; 
                color: ${colors.primary} !important; 
                border: 1px solid ${colors.primary}26 !important; 
                backdrop-filter: blur(10px);
                font-size: 14px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 30px !important;
                height: 30px !important;
            }
            .leaflet-tile {
              filter: saturate(1.2) brightness(0.65) contrast(1.2) hue-rotate(210deg) !important;
            }
          `}} />
          
          <div 
            id="andaman-maritime-map" 
            style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
          />

          {/* Tactical Digital Background Grid Lines Overlay */}
          <svg 
            width="100%" 
            height="100%" 
            style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 900 }}
          >
            {/* Tactical Digital Background Grid Lines */}
            <line x1="0" y1="20%" x2="100%" y2="20%" stroke={colors.primary + "0A"} strokeWidth="1" />
            <line x1="0" y1="40%" x2="100%" y2="40%" stroke={colors.primary + "0A"} strokeWidth="1" />
            <line x1="0" y1="60%" x2="100%" y2="60%" stroke={colors.primary + "0A"} strokeWidth="1" />
            <line x1="0" y1="80%" x2="100%" y2="80%" stroke={colors.primary + "0A"} strokeWidth="1" />
            <line x1="20%" y1="0" x2="20%" y2="100%" stroke={colors.primary + "0A"} strokeWidth="1" />
            <line x1="40%" y1="0" x2="40%" y2="100%" stroke={colors.primary + "0A"} strokeWidth="1" />
            <line x1="60%" y1="0" x2="60%" y2="100%" stroke={colors.primary + "0A"} strokeWidth="1" />
            <line x1="80%" y1="0" x2="80%" y2="100%" stroke={colors.primary + "0A"} strokeWidth="1" />
          </svg>

          {/* Global HUD Stats Overlays (Identical to Web Version) */}
          <View 
            style={{ borderColor: colors.primary + "33" }}
            className="absolute top-4 right-4 flex-row items-center gap-1.5 bg-black/60 border px-2 py-1 rounded-lg z-[1000] pointer-events-none"
          >
            <View className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Text className="text-[7px] font-black text-white uppercase tracking-widest">Stable Connection</Text>
          </View>

          <View 
            style={{ borderColor: colors.primary + "33" }}
            className="absolute top-4 left-4 bg-black/60 border px-2 py-1 rounded-lg z-[1000] pointer-events-none"
          >
            <Text className="text-[7px] font-black uppercase" style={{ color: colors.primary }}>Sector: ALPHA-6</Text>
          </View>
          
          <View 
            style={{ borderColor: colors.primary + "33" }}
            className="absolute bottom-4 left-4 bg-black/60 border px-2 py-1 rounded-lg z-[1000] pointer-events-none"
          >
            <Text className="text-[7px] font-mono text-muted-foreground uppercase">REF: MAR-PB-NODE</Text>
          </View>

          <View 
            style={{ borderColor: colors.primary + "33" }}
            className="absolute bottom-4 right-4 bg-black/60 border px-2 py-1 rounded-lg z-[1000] pointer-events-none"
          >
            <Text className="text-[7px] font-mono text-white uppercase">TELEMETRY 042.8° NE</Text>
          </View>
        </View>
      </View>
    );
  }

  // 2. RENDER NATIVE SVG COORDINATE VERSION WITH BACKGROUND MAP & LEAP PARITY
  return (
    <View className="px-4 py-6 border-y border-white/5 bg-secondary/20">
      <View className="mb-4">
        <Text className="text-xl font-black italic uppercase text-foreground">Live Telemetry Map</Text>
        <Text className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: colors.primary }}>
          Futuristic Cold-Chain Logistics Tracking
        </Text>
      </View>

      {/* Dynamic Status Tabs */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1 flex-row items-center gap-3 rounded-xl border border-white/5 bg-secondary/30 p-3">
          <View className="h-8 w-8 bg-rose-500/15 flex items-center justify-center rounded-lg">
            <Text className="text-rose-500 text-sm">🛡️</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[8px] font-black text-rose-500 uppercase tracking-[0.1em]">DONE</Text>
            <Text className="text-xs font-black text-foreground uppercase italic">Fleet Auth</Text>
          </View>
        </View>

        <View className="flex-1 flex-row items-center gap-3 rounded-xl border border-white/5 bg-secondary/30 p-3">
          <View className="h-8 w-8 bg-rose-500/15 flex items-center justify-center rounded-lg">
            <Text className="text-rose-500 text-sm">🧭</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[8px] font-black text-rose-500 uppercase tracking-[0.1em]">ACTIVE</Text>
            <Text className="text-xs font-black text-foreground uppercase italic">Routing</Text>
          </View>
        </View>
      </View>

      {/* Cyber Digital Map Interface Container */}
      <View 
        {...panResponder.panHandlers}
        style={{ height: radarSize * 0.75, width: "100%", overflow: "hidden", borderColor: colors.primary + "33" }} 
        className="relative items-center justify-center bg-[#0B1120] shadow-2xl border self-center"
      >
        {/* Panning interactive viewport map layer */}
        <View 
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            transform: [{ translateX: panOffset.x }, { translateY: panOffset.y }]
          }}
        >
          {/* Real geographic dark-blueprint background map overlay (Matches Leaflet voyager of Port Blair region) */}
          <RNImage
            source={{ uri: `https://static-maps.yandex.ru/1.x/?ll=${lngCenter},${latCenter}&z=${zoom}&l=map&size=600,450` }}
            style={{ width: "100%", height: "100%", position: "absolute", opacity: 0.55 }}
            resizeMode="cover"
          />
          {/* Dark Blue Overlay to convert light map to dark blueprint */}
          <View 
            style={StyleSheet.absoluteFillObject} 
            className="bg-[#0B1120]/65" 
          />

          {/* Real-time Web/Native SVG Map Render */}
          <Svg width="100%" height="100%" className="absolute">
            {/* Tactical Digital Background Grid Lines */}
            <Line x1="0" y1={(radarSize * 0.75) * 0.2} x2={radarSize} y2={(radarSize * 0.75) * 0.2} stroke={colors.primary + "0D"} strokeWidth="1" />
            <Line x1="0" y1={(radarSize * 0.75) * 0.4} x2={radarSize} y2={(radarSize * 0.75) * 0.4} stroke={colors.primary + "0D"} strokeWidth="1" />
            <Line x1="0" y1={(radarSize * 0.75) * 0.6} x2={radarSize} y2={(radarSize * 0.75) * 0.6} stroke={colors.primary + "0D"} strokeWidth="1" />
            <Line x1="0" y1={(radarSize * 0.75) * 0.8} x2={radarSize} y2={(radarSize * 0.75) * 0.8} stroke={colors.primary + "0D"} strokeWidth="1" />
            <Line x1={radarSize * 0.2} y1="0" x2={radarSize * 0.2} y2={radarSize * 0.75} stroke={colors.primary + "0D"} strokeWidth="1" />
            <Line x1={radarSize * 0.4} y1="0" x2={radarSize * 0.4} y2={radarSize * 0.75} stroke={colors.primary + "0D"} strokeWidth="1" />
            <Line x1={radarSize * 0.6} y1="0" x2={radarSize * 0.6} y2={radarSize * 0.75} stroke={colors.primary + "0D"} strokeWidth="1" />
            <Line x1={radarSize * 0.8} y1="0" x2={radarSize * 0.8} y2={radarSize * 0.75} stroke={colors.primary + "0D"} strokeWidth="1" />

            {/* Dynamic Geographic Linkages connecting the Harbor Nodes to the Port Blair main terminal */}
            {hubNode && mappedNodes.map((item, index) => {
              if (item.node.name === hubNode.node.name) return null;
              return (
                <Line
                  key={index}
                  x1={hubNode.x}
                  y1={hubNode.y}
                  x2={item.x}
                  y2={item.y}
                  stroke={item.color}
                  strokeWidth="1.2"
                  strokeDasharray="4, 5"
                  opacity={0.35}
                />
              );
            })}
          </Svg>

          {/* Mapped Geographic Nodes with Cyber Pillars */}
          <View className="absolute inset-0">
            {mappedNodes.length > 0 ? (
              mappedNodes.map((item) => {
                const isHub = item.node.name.toLowerCase().includes("port blair");
                
                return (
                  <View 
                    key={item.node.name}
                    style={{
                      position: "absolute",
                      left: item.x - 8,
                      top: item.y - 8,
                    }}
                    className="items-center justify-center z-20"
                  >
                    {/* Glowing Radar Indicator */}
                    <View className="relative h-4 w-4 items-center justify-center">
                      {/* Ripple */}
                      <View 
                        style={{ borderColor: item.color }} 
                        className="absolute h-8 w-8 rounded-full border border-white/20 animate-ping opacity-35" 
                      />
                      {/* Solid anchor point */}
                      <View 
                        style={{ backgroundColor: item.color, shadowColor: item.color }} 
                        className="h-2.5 w-2.5 rounded-full border border-white shadow-[0_0_8px_#00f3ff] items-center justify-center"
                      >
                        <View className="h-1 w-1 rounded-full bg-white" />
                      </View>
                    </View>

                    {/* Cyber Node Floating HUD Label - Centered & Wide */}
                    <View 
                      style={{ 
                        position: "absolute",
                        top: 18,
                        left: -65 + 8, // Center 130px label under 16px anchor
                        width: 130,
                        alignItems: "center",
                        borderBottomColor: item.color 
                      }}
                      className="bg-[#030712]/95 border border-white/15 border-b-2 px-2 py-1 rounded shadow-[0_0_20px_rgba(0,0,0,0.7)]"
                    >
                      <View className="flex-row items-center gap-1">
                        <Text className="text-[5.5px] font-black text-white/50 tracking-tighter uppercase">{item.registryId}</Text>
                        <View className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                      </View>
                      <Text className="text-[8.5px] font-black uppercase text-white tracking-widest text-center" numberOfLines={1}>
                        {item.node.name}
                      </Text>
                      <Text style={{ color: item.color }} className="text-[5.5px] font-mono opacity-80 text-center">
                        {item.node.coordinates}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View className="absolute inset-0 items-center justify-center">
                <Text style={{ color: colors.primary }} className="text-[18px] font-black tracking-widest animate-pulse">RADAR SECURE</Text>
                <Text className="text-muted-foreground text-[8px] uppercase tracking-widest mt-1">Sovereign Andaman Exchange</Text>
              </View>
            )}
          </View>
        </View>

        {/* Custom SVG beveled overlays to shape the container on Native iOS/Android */}
        <Svg width="30" height="30" style={{ position: "absolute", top: -1, left: -1, zIndex: 40 }}>
          <Path d="M0,0 L30,0 L0,30 Z" fill={colors.bg} />
          <Path d="M30,0 L0,30" stroke={colors.primary + "33"} strokeWidth="1.5" />
        </Svg>
        <Svg width="30" height="30" style={{ position: "absolute", bottom: -1, right: -1, zIndex: 40 }}>
          <Path d="M30,30 L0,30 L30,0 Z" fill={colors.bg} />
          <Path d="M0,30 L30,0" stroke={colors.primary + "33"} strokeWidth="1.5" />
        </Svg>

        {/* High-Tech Custom Zoom Controls for Native */}
        <View 
          style={{ position: "absolute", right: 16, top: "50%", transform: [{ translateY: -28 }], borderColor: colors.primary + "33" }}
          className="bg-[#090D1A]/95 border rounded flex-col items-center justify-center p-0.5 z-30 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        >
          <Pressable 
            onPress={() => setZoom(prev => Math.min(15, prev + 1))}
            className="h-7 w-7 items-center justify-center border-b"
            style={{ borderBottomColor: colors.primary + "1A" }}
          >
            <Text style={{ color: colors.primary }} className="text-sm font-black">+</Text>
          </Pressable>
          <Pressable 
            onPress={() => setZoom(prev => Math.max(10, prev - 1))}
            className="h-7 w-7 items-center justify-center"
          >
            <Text style={{ color: colors.primary }} className="text-sm font-black">-</Text>
          </Pressable>
        </View>

        {/* Global HUD Stats Overlays (Identical to Web Version) */}
        <View 
          style={{ borderColor: colors.primary + "33" }}
          className="absolute top-4 right-4 flex-row items-center gap-1.5 bg-black/60 border px-2 py-1 rounded-lg z-30 pointer-events-none"
        >
          <View className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <Text className="text-[7px] font-black text-white uppercase tracking-widest">Stable Connection</Text>
        </View>

        <View 
          style={{ borderColor: colors.primary + "33" }}
          className="absolute top-4 left-4 bg-black/60 border px-2 py-1 rounded-lg z-30 pointer-events-none"
        >
          <Text className="text-[7px] font-black uppercase" style={{ color: colors.primary }}>Sector: ALPHA-6</Text>
        </View>
        
        <View 
          style={{ borderColor: colors.primary + "33" }}
          className="absolute bottom-4 left-4 bg-black/60 border px-2 py-1 rounded-lg z-30 pointer-events-none"
        >
          <Text className="text-[7px] font-mono text-muted-foreground uppercase">REF: MAR-PB-NODE</Text>
        </View>

        <View 
          style={{ borderColor: colors.primary + "33" }}
          className="absolute bottom-4 right-4 bg-black/60 border px-2 py-1 rounded-lg z-30 pointer-events-none"
        >
          <Text className="text-[7px] font-mono text-white uppercase">TELEMETRY 042.8° NE</Text>
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
