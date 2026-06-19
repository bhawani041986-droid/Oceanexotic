import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { WebView } from "react-native-webview";
import api from "@/services/api";

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

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

  // Sync telemetry updates back to WebView Leaflet instance
  useEffect(() => {
    if (webViewRef.current && trackingData) {
      const lat = trackingData.current_lat || 13.160704;
      const lng = trackingData.current_lng || 92.946892;
      const js = `if (typeof updateTelemetry === 'function') { updateTelemetry(${lat}, ${lng}); } true;`;
      webViewRef.current.injectJavaScript(js);
    }
  }, [currentLat, currentLng]);

  // Leaflet HTML with Google Maps hybrid tiles and custom marker pulsing styles
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css" />
      <style>
        body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; background-color: #020617; }
        @keyframes sentinel-pulse {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes harbor-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js"></script>
      <script>
        var map, agentMarker, customerMarker, routingControl;
        var customerLat = 13.160704, customerLng = 92.946892;

        function initMap(initialLat, initialLng) {
          map = L.map('map', { zoomControl: false }).setView([initialLat, initialLng], 13);
          
          L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
            attribution: '&copy; Google Maps'
          }).addTo(map);

          // Neon Agent Blip
          var agentIcon = L.divIcon({
            className: 'sentinel-marker',
            html: \`
              <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                <div style="position: absolute; width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(45deg, #00D1FF, #6366F1); opacity: 0.3; animation: sentinel-pulse 2s infinite;"></div>
                <div style="position: relative; color: white; display: flex; filter: drop-shadow(0 0 10px rgba(0, 209, 255, 0.6)) drop-shadow(0 0 5px rgba(99, 102, 241, 0.4)); z-index: 2;">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <defs>
                        <linearGradient id="fish-neon-cust" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#00D1FF;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366F1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <path d="M23 12c-2.5 2.5-5 5-10 5s-8-3-11-5c3-2 6-5 11-5s7.5 2.5 10 5z" stroke="url(#fish-neon-cust)" />
                      <path d="M23 12l-3-3m0 6l3-3" stroke="url(#fish-neon-cust)" />
                      <path d="M13 8c-1 1-1 3 0 4" stroke="url(#fish-neon-cust)" opacity="0.6" />
                      <circle cx="6" cy="12" r="1" fill="#00D1FF" />
                   </svg>
                </div>
              </div>
            \`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          });

          // Customer Harbor Node Home Icon
          var customerIcon = L.divIcon({
            className: 'harbor-marker',
            html: \`
              <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                <div style="position: absolute; width: 50px; height: 50px; border: 2px dashed rgba(99, 102, 241, 0.4); border-radius: 50%; animation: harbor-rotate 10s linear infinite;"></div>
                <div style="width: 28px; height: 28px; background: #6366F1; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(99, 102, 241, 0.5); z-index: 2;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color: white;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
              </div>
            \`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          });

          agentMarker = L.marker([initialLat, initialLng], { icon: agentIcon }).addTo(map);
          customerMarker = L.marker([customerLat, customerLng], { icon: customerIcon }).addTo(map);
          
          updateRoute(initialLat, initialLng);
        }

        function updateRoute(lat, lng) {
          if (routingControl) {
            try { routingControl.setWaypoints([L.latLng(lat, lng), L.latLng(customerLat, customerLng)]); } catch(e) {}
          } else {
            routingControl = L.Routing.control({
              waypoints: [L.latLng(lat, lng), L.latLng(customerLat, customerLng)],
              routeWhileDragging: false, show: false, addWaypoints: false, draggableWaypoints: false, fitSelectedRoutes: false,
              lineOptions: { styles: [{ color: '#00D1FF', weight: 4, opacity: 0.8, dashArray: '10, 15' }] }
            }).addTo(map);
          }
        }

        function updateTelemetry(lat, lng) {
          if (agentMarker) {
            agentMarker.setLatLng([lat, lng]);
          }
          updateRoute(lat, lng);
          map.panTo([lat, lng]);
        }

        initMap(${currentLat}, ${currentLng});
      </script>
    </body>
    </html>
  `;

  if (loading && !trackingData) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#7C3AED" size="large" />
        <Text className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Loading Tracking...
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

        {/* WebView Map Container */}
        <View className="mb-8 h-80 overflow-hidden rounded-[32px] border border-white/5 bg-secondary/30 relative">
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{ html: htmlTemplate }}
            style={{ flex: 1, backgroundColor: "#020617" }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scrollEnabled={false}
          />
          
          <View className="absolute top-3 left-3 z-50 pointer-events-none">
            <View className="rounded bg-black/60 px-2 py-0.5">
              <Text className="text-[8px] font-black uppercase tracking-widest text-primary">
                Live Delivery Map
              </Text>
            </View>
          </View>

          <View className="absolute bottom-3 left-3 right-3 flex-row items-center justify-between rounded-2xl border border-white/10 bg-background/95 p-3 pointer-events-none">
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
                {currentLat.toFixed(3)}, {currentLng.toFixed(3)}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Timeline Logs */}
        <Text className="mb-4 text-base font-black uppercase italic tracking-tighter text-foreground">
          Delivery Timeline
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
