import { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Pressable, Platform, Modal } from "react-native";
import { WebView } from "react-native-webview";
import type { Territory } from "@/services/homeService";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useSettingsStore } from "@/store/settingsStore";

interface TelemetryProps {
  territories: Territory[];
}

const { width } = Dimensions.get("window");
const radarSize = width - 48;

export function AndamanMaritimeTelemetry({ territories = [] }: TelemetryProps) {
  const [isLReady, setIsLReady] = useState(false);
  const [isMapInit, setIsMapInit] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const mapRef = useRef<any>(null);
  
  const colors = useThemeColors();

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
  const activeNodes = (territories || []).filter((t) => t.status === "ACTIVE" && t.coordinates);

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
    
    // We append a random string to avoid duplicate ID issues on hot reload
    const mapId = isMapExpanded ? 'andaman-map-expanded' : 'andaman-map-inline';
    const container = document.getElementById(mapId);
    if (!container || (container as any)._leaflet_id) return;

    try {
      mapRef.current = L.map(mapId, {
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
      }).setView([11.6667, 92.7500], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
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
  }, [isLReady, isMapExpanded]);

  // Web Dynamic Marker Registry Sync
  useEffect(() => {
    if (Platform.OS !== "web" || !isMapInit || !mapRef.current) return;
    const L = (window as any).L;

    try {
      mapRef.current.eachLayer((layer: any) => {
        if (layer && !layer._url && layer !== mapRef.current) {
          try {
            mapRef.current.removeLayer(layer);
          } catch (e) {}
        }
      });

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
                      <div class="absolute w-6 h-6 rounded-none border border-[var(--foreground)]/10 animate-ping" style="border-color: ${color}22"></div>
                      <div class="w-2.5 h-2.5 rounded-none border border-white shadow-[0_0_8px_${color}]" style="background-color: ${color}"></div>
                  </div>
                  <div class="absolute bottom-[2px] left-1/2 -translate-x-1/2 animate-pulse">
                    <svg width="12" height="8" viewBox="0 0 24 16" fill="${color}" style="filter: drop-shadow(0 0 3px ${color}88)">
                      <path d="M0 0 L24 0 L12 16 Z" />
                    </svg>
                  </div>
                  <div class="absolute bottom-[10px] left-1/2 -translate-x-1/2 bg-black/95 border-b-2 px-3 py-1.5 flex flex-col items-center shadow-[0_0_20px_rgba(0,0,0,0.6)] rounded whitespace-nowrap" 
                       style="border-bottom-color: ${color}; transform: translateX(-50%); pointer-events: none; width: max-content;">
                       <div class="flex items-center gap-1.5">
                         <span class="text-[10px] font-black text-white/40 uppercase tracking-tighter">NODE REG: 0${i + 1}</span>
                         <div class="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse"></div>
                       </div>
                       <span class="text-xs font-black text-white uppercase tracking-wider">${t.name}</span>
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
  }, [territories, isMapInit, palette, isMapExpanded]);

  // Generates the HTML for the Native WebView
  const generateWebViewHTML = () => {
    const markersJs = activeNodes.map((t, i) => {
      const color = palette[i % palette.length];
      const raw = String(t.coordinates).split(",").map((s) => parseFloat(s.trim()));
      if (raw.length < 2 || isNaN(raw[0]) || isNaN(raw[1])) return '';
      
      const isHub = t.name.toLowerCase().includes("port blair");
      const polylineCode = isHub ? '' : `
        try {
          L.polyline([hubPos, [${raw[0]}, ${raw[1]}]], {
            color: '${color}',
            weight: 1,
            dashArray: '4, 8',
            opacity: 0.25
          }).addTo(map);
        } catch(e) {}
      `;

      return `
        ${polylineCode}
        var icon_${i} = L.divIcon({
          className: "maritime-cyber-pointer",
          html: \`<div class="relative" style="width: 20px; height: 20px;">
                <div class="w-3 h-3 flex items-center justify-center">
                    <div class="absolute w-6 h-6 border border-[#ffffff]/10 animate-ping" style="border-color: ${color}22; border-radius: 50%;"></div>
                    <div class="w-2.5 h-2.5 border border-white shadow-[0_0_8px_${color}]" style="background-color: ${color}; border-radius: 50%;"></div>
                </div>
                <div class="absolute bottom-[2px] left-1/2 -translate-x-1/2 animate-pulse">
                  <svg width="12" height="8" viewBox="0 0 24 16" fill="${color}" style="filter: drop-shadow(0 0 3px ${color}88)">
                    <path d="M0 0 L24 0 L12 16 Z" />
                  </svg>
                </div>
                <div class="absolute bottom-[10px] left-1/2 -translate-x-1/2 bg-black/95 border-b-2 px-3 py-1.5 flex flex-col items-center shadow-[0_0_20px_rgba(0,0,0,0.6)] rounded whitespace-nowrap" 
                     style="border-bottom-color: ${color}; transform: translateX(-50%); pointer-events: none; width: max-content;">
                     <div class="flex items-center gap-1.5">
                       <span class="text-[10px] font-black text-white/40 uppercase tracking-tighter">NODE REG: 0${i + 1}</span>
                       <div class="w-1.5 h-1.5 bg-emerald-500 animate-pulse" style="border-radius: 50%;"></div>
                     </div>
                     <span class="text-xs font-black text-white uppercase tracking-wider">${t.name}</span>
                </div>
            </div>\`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        L.marker([${raw[0]}, ${raw[1]}], { icon: icon_${i} }).addTo(map);
      `;
    }).join('\n');

    const hubNode = activeNodes.find((t) => t.name.toLowerCase().includes("port blair"));
    let hubPosCode = 'var hubPos = null;';
    if (hubNode) {
      const raw = String(hubNode.coordinates).split(",").map((s) => parseFloat(s.trim()));
      if (raw.length >= 2 && !isNaN(raw[0]) && !isNaN(raw[1])) {
        hubPosCode = `var hubPos = L.latLng(${raw[0]}, ${raw[1]});`;
      }
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { margin: 0; padding: 0; background: #0B1120; font-family: sans-serif; overflow: hidden; }
          #map { width: 100vw; height: 100vh; }
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
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([11.6667, 92.7500], 12);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
          ${hubPosCode}
          ${markersJs}
        </script>
      </body>
      </html>
    `;
  };

  const renderMapHeader = () => (
    <>
      <View className="mb-4">
        <Text className="text-xl font-black italic uppercase text-foreground">Live Delivery Map</Text>
        <Text className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: colors.primary }}>
          Real-time delivery hub mapping
        </Text>
      </View>

      <View className="flex-row gap-3 mb-4">
        <View className="flex-1 flex-row items-center gap-3 rounded-none border border-white/5 bg-secondary/30 p-3">
          <View className="h-8 w-8 bg-rose-500/15 flex items-center justify-center rounded-none">
            <Text className="text-rose-500 text-sm">🛡️</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[8px] font-black text-rose-500 uppercase tracking-[0.1em]">DONE</Text>
            <Text className="text-xs font-black text-foreground uppercase italic">Quality Check</Text>
          </View>
        </View>

        <View className="flex-1 flex-row items-center gap-3 rounded-none border border-white/5 bg-secondary/30 p-3">
          <View className="h-8 w-8 bg-rose-500/15 flex items-center justify-center rounded-none">
            <Text className="text-rose-500 text-sm">🧭</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[8px] font-black text-rose-500 uppercase tracking-[0.1em]">ACTIVE</Text>
            <Text className="text-xs font-black text-foreground uppercase italic">Out for Delivery</Text>
          </View>
        </View>
      </View>
    </>
  );

  const renderMapOverlays = () => (
    <>
      <View 
        style={{ borderColor: colors.primary + "33" }}
        className="absolute top-4 right-4 flex-row items-center gap-1.5 bg-black/60 border px-2 py-1 rounded-none z-[1000] pointer-events-none"
      >
        <View className="h-1.5 w-1.5 rounded-none bg-emerald-500 animate-pulse" />
        <Text className="text-[7px] font-black text-white uppercase tracking-widest">Stable Connection</Text>
      </View>
      <View 
        style={{ borderColor: colors.primary + "33" }}
        className="absolute top-4 left-4 bg-black/60 border px-2 py-1 rounded-none z-[1000] pointer-events-none"
      >
        <Text className="text-[7px] font-black uppercase" style={{ color: colors.primary }}>Sector: ALPHA-6</Text>
      </View>
      <View 
        style={{ borderColor: colors.primary + "33" }}
        className="absolute bottom-4 left-4 bg-black/60 border px-2 py-1 rounded-none z-[1000] pointer-events-none"
      >
        <Text className="text-[7px] font-mono text-muted-foreground uppercase">REF: PB-NODE</Text>
      </View>

      <Pressable 
        onPress={() => setIsMapExpanded(true)}
        className="absolute bottom-4 right-4 z-[1000] bg-black/80 border px-3 py-1.5 rounded-xl flex-row items-center gap-1.5"
        style={{ borderColor: colors.primary + "66" }}
      >
        <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.primary }}>⛶ ENLARGE MAP</Text>
      </Pressable>
    </>
  );

  const renderWebMap = () => (
    <View 
      style={{ height: radarSize * 0.75, width: "100%", borderColor: colors.primary + "33" }} 
      className="relative bg-[#0B1120] shadow-2xl shadow-primary/10 border-2 rounded-3xl self-center overflow-hidden"
    >
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
      <div id="andaman-map-inline" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />
      {renderMapOverlays()}
    </View>
  );

  const renderNativeMap = () => (
    <View 
      style={{ height: radarSize * 0.75, width: "100%", borderColor: colors.primary + "33" }} 
      className="relative bg-[#0B1120] shadow-2xl shadow-primary/10 border-2 rounded-3xl self-center overflow-hidden"
    >
      <WebView
        source={{ html: generateWebViewHTML() }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
      {renderMapOverlays()}
    </View>
  );

  return (
    <View className="px-4 py-6 border-y border-white/5 bg-secondary/20">
      {renderMapHeader()}
      {Platform.OS === "web" ? renderWebMap() : renderNativeMap()}

      {/* Fullscreen Modal for Enlarge Map */}
      <Modal
        visible={isMapExpanded}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsMapExpanded(false)}
      >
        <View className="flex-1 bg-black/90 p-4 pt-12 items-center justify-center">
          <View 
            style={{ borderColor: colors.primary + "66" }} 
            className="w-full h-[85%] relative bg-[#0B1120] shadow-2xl border-2 rounded-3xl overflow-hidden"
          >
            <Pressable 
              onPress={() => setIsMapExpanded(false)}
              className="absolute top-4 right-4 z-[1000] bg-black/80 border border-red-500/40 p-2 rounded-full"
            >
              <Text className="text-red-500 font-bold px-2">✖</Text>
            </Pressable>
            
            {Platform.OS === "web" ? (
              <div id="andaman-map-expanded" style={{ width: "100%", height: "100%" }} />
            ) : (
              <WebView
                source={{ html: generateWebViewHTML() }}
                style={{ flex: 1, backgroundColor: 'transparent' }}
                scrollEnabled={true}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
