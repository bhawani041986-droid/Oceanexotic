import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { WebView } from "react-native-webview";
import api from "@/services/api";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SectionTitle } from "@/components/customer/SectionTitle";

const AGENT_SENTINEL_HTML = (primary: string, glow: string) => `
  <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
    <div style="position: absolute; width: 50px; height: 50px; border-radius: 50%; background: ${primary}; opacity: 0.2; animation: sentinel-pulse 2s infinite;"></div>
    <div style="position: relative; color: ${primary}; display: flex; filter: ${glow.length > 20 ? `drop-shadow(0 0 10px ${primary})` : 'none'}; z-index: 2;">
       <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 12c-2.5 2.5-5 5-10 5s-8-3-11-5c3-2 6-5 11-5s7.5 2.5 10 5z" stroke="${primary}" />
          <path d="M23 12l-3-3m0 6l3-3" stroke="${primary}" />
          <path d="M13 8c-1 1-1 3 0 4" stroke="${primary}" opacity="0.6" />
          <circle cx="6" cy="12" r="1" fill="${primary}" />
       </svg>
    </div>
    <style>@keyframes sentinel-pulse { 0% { transform: scale(0.5); opacity: 0.8; } 100% { transform: scale(1.8); opacity: 0; } }</style>
  </div>
`;

const CUSTOMER_HARBOR_HTML = (primary: string) => `
  <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
    <div style="position: absolute; width: 50px; height: 50px; border: 2px dashed ${primary}66; border-radius: 50%; animation: harbor-rotate 10s linear infinite;"></div>
    <div style="width: 28px; height: 28px; background: ${primary}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px ${primary}80; z-index: 2;">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color: white;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
    </div>
    <style>@keyframes harbor-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }</style>
  </div>
`;

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const primaryColor = colors.primary;
  const glowShadow = `drop-shadow(0 0 10px ${primaryColor})`;

  const fetchTelemetry = async () => {
    try {
      const { data } = await api.get(`/fleet?order_id=${id}`);
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
    logs: [{ time: "Now", status: "Order Processed", location: "Andaman Sector", active: true }],
  };

  const currentLat = displayData.current_lat || 13.160704;
  const currentLng = displayData.current_lng || 92.946892;

  useEffect(() => {
    if (webViewRef.current && trackingData) {
      const lat = trackingData.current_lat || 13.160704;
      const lng = trackingData.current_lng || 92.946892;
      const js = `if (typeof updateTelemetry === 'function') { updateTelemetry(${lat}, ${lng}); } true;`;
      webViewRef.current.injectJavaScript(js);
    }
  }, [currentLat, currentLng]);

  const zoomIn = () => {
    webViewRef.current?.injectJavaScript(`if(typeof map !== 'undefined') map.zoomIn({animate: true}); true;`);
  };

  const zoomOut = () => {
    webViewRef.current?.injectJavaScript(`if(typeof map !== 'undefined') map.zoomOut({animate: true}); true;`);
  };

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; background-color: #020617; }
        html, body, #map { height: 100%; width: 100%; }
        .leaflet-control-attribution { display: none; }
        .leaflet-tile {
          filter: saturate(1.2) brightness(0.65) contrast(1.2) hue-rotate(210deg) !important;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${currentLat}, ${currentLng}], 16);
        
        L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
          maxZoom: 19
        }).addTo(map);

        var agentIcon = L.divIcon({ 
          className: 'sentinel-marker', 
          html: \`${AGENT_SENTINEL_HTML(primaryColor, glowShadow)}\`, 
          iconSize: [40, 40], 
          iconAnchor: [20, 20] 
        });

        var harborIcon = L.divIcon({ 
          className: 'harbor-marker', 
          html: \`${CUSTOMER_HARBOR_HTML(primaryColor)}\`, 
          iconSize: [40, 40], 
          iconAnchor: [20, 20] 
        });

        var agentMarker = L.marker([${currentLat}, ${currentLng}], { icon: agentIcon }).addTo(map);
        // Fixed dest for demo purposes (Havelock)
        var custMarker = L.marker([13.160704, 92.946892], { icon: harborIcon }).addTo(map);

        var routeLine = L.polyline([
          [${currentLat}, ${currentLng}],
          [13.160704, 92.946892]
        ], { color: '${primaryColor}', weight: 3, dashArray: '5, 5' }).addTo(map);

        window.updateTelemetry = function(lat, lng) {
          var newLatLng = new L.LatLng(lat, lng);
          agentMarker.setLatLng(newLatLng);
          routeLine.setLatLngs([newLatLng, custMarker.getLatLng()]);
        };
      </script>
    </body>
    </html>
  `;

  if (loading && !trackingData) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <ActivityIndicator color="#7C3AED" size="large" />
        <Text className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Loading Tracking...
        </Text>
      </View>
    );
  }

  const MapOverlay = () => (
    <>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: htmlTemplate }}
        style={{ flex: 1, backgroundColor: "#020617" }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
      />
      
      {/* Agent Skewed HUD Overlay (Top-Left) */}
      <View style={{ position: 'absolute', top: 12, left: 12, gap: 6, pointerEvents: 'none' }}>
        <View style={{ backgroundColor: primaryColor, paddingHorizontal: 10, paddingVertical: 3, transform: [{ skewX: '-8deg' }] }}>
          <Text style={{ fontSize: 8, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase', color: '#0F172A', fontStyle: 'italic', transform: [{ skewX: '8deg' }] }}>
            Node: Sentinel-01
          </Text>
        </View>
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 6,
          paddingHorizontal: 8, paddingVertical: 3,
          borderWidth: 1, borderColor: primaryColor + '40',
          backgroundColor: 'rgba(2,6,23,0.85)',
          transform: [{ skewX: '-8deg' }]
        }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', shadowColor: '#10B981', shadowRadius: 4 }} />
          <Text style={{ fontSize: 7, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: primaryColor, transform: [{ skewX: '8deg' }] }}>
            Telemetry: Registry Live
          </Text>
        </View>
      </View>

      {/* Grid Coordinates HUD (Bottom-Left) */}
      <View style={{
        position: 'absolute', bottom: 12, left: 12,
        backgroundColor: 'rgba(2,6,23,0.82)',
        paddingHorizontal: 10, paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        pointerEvents: 'none'
      }}>
        <Text style={{ fontSize: 6, fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: 2 }}>GRID COORDINATES</Text>
        <Text style={{ fontSize: 8, fontWeight: '700', color: '#CBD5E1', textTransform: 'uppercase', marginTop: 2 }}>
          {currentLat.toFixed(5)} N · {currentLng.toFixed(5)} E
        </Text>
      </View>

      {/* Native Interactivity Controls (Bottom-Right) */}
      {!isFullScreen && (
        <View className="absolute bottom-3 right-3 items-center gap-2" style={{ zIndex: 9999, elevation: 10 }}>
          <Pressable 
            onPress={zoomIn}
            className="w-8 h-8 rounded-full bg-black/80 border items-center justify-center mb-1"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-primary font-black text-lg leading-none">+</Text>
          </Pressable>
          <Pressable 
            onPress={zoomOut}
            className="w-8 h-8 rounded-full bg-black/80 border items-center justify-center mb-2"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-primary font-black text-lg leading-none">-</Text>
          </Pressable>
          <Pressable 
            onPress={() => setIsFullScreen(true)}
            className="px-3 py-1.5 rounded-md bg-primary/20 border border-primary"
          >
            <Text className="text-[8px] font-black uppercase text-primary tracking-widest">
              ENLARGE
            </Text>
          </Pressable>
        </View>
      )}
    </>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      {isFullScreen ? (
        <View style={StyleSheet.absoluteFill} className="z-[9999]">
           <MapOverlay />
           {/* Full Width Control Bar */}
           <View 
             className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between px-6 py-4 border-t"
             style={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderColor: colors.border, zIndex: 9999, elevation: 20, paddingBottom: Math.max(insets.bottom, 16) }}
           >
             {/* Zoom Out */}
             <Pressable 
               onPress={zoomOut}
               className="w-12 h-12 rounded-full bg-black/50 border items-center justify-center"
               style={{ borderColor: colors.border }}
             >
               <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 24 }}>-</Text>
             </Pressable>

             {/* Minimize/Close Button */}
             <Pressable 
               onPress={() => setIsFullScreen(false)}
               className="px-6 py-3 rounded-none border flex-row items-center gap-2"
               style={{ backgroundColor: colors.primary, borderColor: 'transparent' }}
             >
               <Text className="text-[11px] font-black uppercase text-white tracking-widest">
                 ✕ CLOSE FULLSCREEN
               </Text>
             </Pressable>

             {/* Zoom In */}
             <Pressable 
               onPress={zoomIn}
               className="w-12 h-12 rounded-full bg-black/50 border items-center justify-center"
               style={{ borderColor: colors.border }}
             >
               <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 24 }}>+</Text>
             </Pressable>
           </View>
        </View>
      ) : (
        <ScrollView contentContainerClassName="px-4 pb-12 pt-6">
          <View className="flex-row items-center justify-between mb-3">
             <Button
                variant="ghost"
                label="← BACK"
                onPress={() => router.back()}
                className="px-0 h-auto"
             />
             <View className="rounded bg-emerald-500/20 px-3 py-1">
                <Text className="text-[10px] font-black uppercase text-emerald-400">
                  {displayData.status}
                </Text>
             </View>
          </View>

          {/* Compact Header Grid */}
          <View className="mb-4 flex-row items-start justify-between p-3 rounded-xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <View className="flex-1">
              <SectionTitle 
                title="Live Tracking" 
                subtitle={`ID: ${id} • VESSEL: ${displayData.agent_name}`} 
              />
            </View>
            <View className="items-end">
              <Text className="text-[8px] font-black uppercase tracking-widest" style={{ color: colors.primary }}>
                Cold-Chain
              </Text>
              <Text className="mt-0.5 text-base font-black" style={{ color: colors.text }}>
                {displayData.current_temp}°C
              </Text>
            </View>
          </View>

          {/* Map Container */}
          <View className="mb-6 h-80 overflow-hidden rounded-[24px] border border-primary/20 relative">
            <MapOverlay />
          </View>

          {/* Delivery Timeline Logs */}
          <View className="mb-3">
            <Text className="text-sm font-black uppercase italic tracking-tighter" style={{ color: colors.text }}>
              Delivery Timeline
            </Text>
            <View className="h-[2px] w-12 mt-1" style={{ backgroundColor: colors.primary }} />
          </View>
          <View className="pl-2">
            {displayData.logs.map((event: any, i: number) => (
              <View key={i} className="relative mb-4 pl-8">
                {/* Timeline line */}
                {i !== displayData.logs.length - 1 && (
                  <View className="absolute bottom-[-16px] left-[3px] top-[14px] w-[1px] bg-white/10" />
                )}
                {/* Timeline dot */}
                <View
                  className={cn(
                    "absolute left-0 top-1.5 h-2 w-2 rounded-none",
                    event.active ? "bg-primary shadow-lg" : "bg-white/20"
                  )}
                />
                <Text
                  className="text-[9px] font-black uppercase tracking-widest"
                  style={{ color: event.active ? colors.primary : colors.textMuted }}
                >
                  {event.time}
                </Text>
                <Text
                  className="mt-0.5 text-xs font-bold leading-tight"
                  style={{ color: event.active ? colors.text : colors.textMuted }}
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
      )}
    </View>
  );
}
