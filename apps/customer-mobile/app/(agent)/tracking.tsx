import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator, Linking, Dimensions, Platform, Image as RNImage, StyleSheet, Animated } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Svg, { Circle, Line, Path, Rect, G } from "react-native-svg";
import { useAuthStore } from "@/store/authStore";
import { useAgentStore, MOODS } from "@/store/agentStore";
import { FULL_API_URL } from "@/config/api";
import { useToast } from "@/components/ui/Toast";
import axios from "axios";

// Standard hashing function for deterministic values
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const AREA_COORDINATES: Record<string, [number, number]> = {
  'Havelock Island': [11.9761, 92.9876],
  'Neil Island': [11.8340, 93.0471],
  'Bambooflat': [11.7022, 92.7061],
  'Garacharma': [11.6335, 92.7107],
  'Diglipur': [13.2662, 92.9786],
  'Rangat': [12.4764, 92.9238],
  'Mayabundar': [12.9214, 92.9067],
  'Baratang': [12.1197, 92.7845],
  'Haddo': [11.6775, 92.7188],
  'Phoenix Bay': [11.6711, 92.7302],
  'Aberdeen Bazaar': [11.6685, 92.7378],
  'Port Blair': [11.6667, 92.7500],
};

function getDeliveryCoords(address: string, orderId: string): { lat: number; lng: number } {
  const addr = (address || '').toLowerCase();
  let areaName = 'Port Blair';
  
  if (addr.includes('havelock') || addr.includes('swaraj dweep')) areaName = 'Havelock Island';
  else if (addr.includes('neil island') || addr.includes('shaheed dweep')) areaName = 'Neil Island';
  else if (addr.includes('bambooflat') || addr.includes('bamboo flat')) areaName = 'Bambooflat';
  else if (addr.includes('garacharma')) areaName = 'Garacharma';
  else if (addr.includes('diglipur')) areaName = 'Diglipur';
  else if (addr.includes('rangat')) areaName = 'Rangat';
  else if (addr.includes('mayabundar')) areaName = 'Mayabundar';
  else if (addr.includes('baratang')) areaName = 'Baratang';
  else if (addr.includes('haddo')) areaName = 'Haddo';
  else if (addr.includes('phoenix bay')) areaName = 'Phoenix Bay';
  else if (addr.includes('aberdeen')) areaName = 'Aberdeen Bazaar';
  
  const base = AREA_COORDINATES[areaName] || AREA_COORDINATES['Port Blair'];
  
  // Add a small deterministic offset based on orderId to prevent exact overlapping
  const seed = simpleHash(orderId);
  const offsetLat = ((seed % 100) - 50) / 20000;
  const offsetLng = (((seed >> 3) % 100) - 50) / 20000;
  
  return {
    lat: base[0] + offsetLat,
    lng: base[1] + offsetLng
  };
}

// Custom SVG Icons matching Lucide
function ClockIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Path d="M12 6v6l4 2" />
    </Svg>
  );
}

function ThermometerIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </Svg>
  );
}

function UserIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

function MapPinIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <Circle cx="12" cy="10" r="3" />
    </Svg>
  );
}

function PhoneIcon({ color }: { color: string }) {
  return (
    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </Svg>
  );
}

function BoxIcon({ color }: { color: string }) {
  return (
    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <Path d="M3.27 6.96 12 12.01l8.73-5.05" />
      <Path d="M12 22.08V12" />
    </Svg>
  );
}

function LockIcon({ color }: { color: string }) {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Svg>
  );
}

function ShieldCheckIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <Path d="m9 11 2 2 4-4" />
    </Svg>
  );
}

function CameraIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <Circle cx="12" cy="13" r="4" />
    </Svg>
  );
}

// --- TACTICAL ICON DEFINITIONS FOR WEB MAP ---
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

function LayersIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="m12 3-10 5 10 5 10-5-10-5Z" />
      <Path d="m2 17 10 5 10-5" />
      <Path d="m2 12 10 5 10-5" />
    </Svg>
  );
}

function NavigationIcon({ color }: { color: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="m3 11 19-9-9 19-2-8-8-2Z" />
    </Svg>
  );
}

export default function AgentTrackingScreen() {
  const { order_id } = useLocalSearchParams<{ order_id: string }>();
  const orderId = order_id || "ORD-000001";
  
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { toast, ToastHost } = useToast();
  const currentMood = useAgentStore((s) => s.currentMood);
  const mood = MOODS[currentMood];
  const isLight = currentMood === "DAYLIGHT";

  // Coordinates Setup (Deterministic and Driftable)
  const startLat = 11.6844;
  const startLng = 92.7265;
  const [destLat, setDestLat] = useState(11.6710);
  const [destLng, setDestLng] = useState(92.7410);

  const [coords, setCoords] = useState({ lat: startLat, lng: startLng });
  const [missionState, setMissionState] = useState<string>("NOT_STARTED");
  const [isSyncing, setIsSyncing] = useState(true);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [temp, setTemp] = useState(-22.4);

  // OTP Verification States
  const [otpInput, setOtpInput] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Radar sweep animation helper
  const [pulseScale, setPulseScale] = useState(1);

  // Scanner states & refs
  const [isScanning, setIsScanning] = useState(false);
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const streamRef = useRef<any>(null);

  // Web Interactive Leaflet state
  const [isLReady, setIsLReady] = useState(false);
  const [isMapInit, setIsMapInit] = useState(false);
  const mapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const harborMarkerRef = useRef<any>(null);
  const routingRef = useRef<any>(null);
  const [mapMode, setMapMode] = useState<'tactical' | 'satellite'>('tactical');

  // Web Leaflet Script & CSS Handshake Loader
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    if ((window as any).L && (window as any).L.Routing) {
      setIsLReady(true);
      return;
    }

    const initLeafletScripts = () => {
      if (!(window as any).L) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        const rCss = document.createElement("link");
        rCss.rel = "stylesheet";
        rCss.href = "https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css";
        document.head.appendChild(rCss);

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = () => {
          const rJs = document.createElement("script");
          rJs.src = "https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js";
          rJs.async = true;
          rJs.onload = () => setIsLReady(true);
          document.head.appendChild(rJs);
        };
        document.head.appendChild(script);
      } else if (!(window as any).L.Routing) {
        const rCss = document.createElement("link");
        rCss.rel = "stylesheet";
        rCss.href = "https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css";
        document.head.appendChild(rCss);

        const rJs = document.createElement("script");
        rJs.src = "https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js";
        rJs.async = true;
        rJs.onload = () => setIsLReady(true);
        document.head.appendChild(rJs);
      } else {
        setIsLReady(true);
      }
    };

    initLeafletScripts();
  }, []);

  const initMap = React.useCallback(() => {
    const L = (window as any).L;
    const mapContainer = document.getElementById('agent-tactical-map');
    if (!L || !mapContainer || mapRef.current) return;

    mapRef.current = L.map('agent-tactical-map', { zoomControl: false }).setView([coords.lat, coords.lng], 16);
    
    // OpenStreetMap BY DEFAULT FOR CLEAR VISIBILITY
    tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
      attribution: '&copy; OpenStreetMap contributors' 
    }).addTo(mapRef.current);

    const agentIcon = L.divIcon({ 
      className: 'sentinel-marker', 
      html: AGENT_SENTINEL_HTML(mood.primary, mood.glow), 
      iconSize: [40, 40], 
      iconAnchor: [20, 20] 
    });
    const harborIcon = L.divIcon({ 
      className: 'harbor-marker', 
      html: CUSTOMER_HARBOR_HTML(mood.primary), 
      iconSize: [40, 40], 
      iconAnchor: [20, 20] 
    });

    markerRef.current = L.marker([coords.lat, coords.lng], { icon: agentIcon }).addTo(mapRef.current);
    harborMarkerRef.current = L.marker([destLat, destLng], { icon: harborIcon }).addTo(mapRef.current);
    setIsMapInit(true);
  }, [coords.lat, coords.lng, destLat, destLng, mood.primary, mood.glow]);

  useEffect(() => {
    if (Platform.OS === "web" && isLReady && !isMapInit) {
      initMap();
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        tileLayerRef.current = null;
        markerRef.current = null;
        harborMarkerRef.current = null;
        routingRef.current = null;
        setIsMapInit(false);
      }
    };
  }, [isLReady, isMapInit, initMap]);

  const updateRouting = React.useCallback(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current || !isMapInit) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
    }

    if (missionState === "IN_TRANSIT" && L.Routing) {
      if (routingRef.current) {
        try { 
          routingRef.current.setWaypoints([L.latLng(coords.lat, coords.lng), L.latLng(destLat, destLng)]); 
        } catch(e) {}
      } else {
        routingRef.current = L.Routing.control({
          waypoints: [L.latLng(coords.lat, coords.lng), L.latLng(destLat, destLng)],
          routeWhileDragging: false, show: false, addWaypoints: false, draggableWaypoints: false, fitSelectedRoutes: false,
          lineOptions: { styles: [{ color: mood.primary, weight: 6, opacity: 0.9 }] }
        }).addTo(mapRef.current);
      }
    } else {
      if (routingRef.current) {
        try {
          mapRef.current.removeControl(routingRef.current);
          routingRef.current = null;
        } catch (e) {}
      }
    }
  }, [coords.lat, coords.lng, destLat, destLng, missionState, mood.primary, isMapInit]);

  useEffect(() => {
    if (Platform.OS === "web") {
      updateRouting();
    }
  }, [coords, missionState, updateRouting]);

  const toggleMapMode = () => {
    const L = (window as any).L;
    if (!L || !mapRef.current || !tileLayerRef.current) return;
    
    const newMode = mapMode === 'tactical' ? 'satellite' : 'tactical';
    setMapMode(newMode);
    
    mapRef.current.removeLayer(tileLayerRef.current);
    
    if (newMode === 'satellite') {
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
      }).addTo(mapRef.current);
      toast("Satellite Reconnaissance Active", "success");
    } else {
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        attribution: '&copy; OpenStreetMap contributors' 
      }).addTo(mapRef.current);
      toast("Tactical Vector View Active", "success");
    }
  };

  const recenterMap = () => {
    if (mapRef.current) {
      mapRef.current.setView([coords.lat, coords.lng], 16);
      toast("Recalibrating Navigation Node", "success");
    }
  };

  // Fetch Order details and check database telemetry
  const loadOrderDetails = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      // 1. Fetch current order items/details from orders list
      const listUrl = `${FULL_API_URL}/agent/orders.php?agent_id=${encodeURIComponent(user.name)}`;
      const listRes = await axios.get(listUrl);
      let matchOrder = null;
      if (Array.isArray(listRes.data)) {
        matchOrder = listRes.data.find((o: any) => o.id === orderId);
      }

      if (matchOrder) {
        setOrderInfo(matchOrder);
        const resolved = getDeliveryCoords(matchOrder.location, orderId);
        setDestLat(resolved.lat);
        setDestLng(resolved.lng);
      } else {
        // Fallback mock details if order not assigned or already completed in local registry
        const fallback = {
          id: orderId,
          customer: "Bhawani Singh",
          customer_email: "bhawani@oceanfresh.com",
          location: "Marine Villa, Phoenix Bay, Port Blair",
          status: "PENDING",
          items: [
            { name: "Premium Bluefin Saku", qty: "2 units" },
            { name: "Fresh Hokkaido Scallops", qty: "1 unit" }
          ]
        };
        setOrderInfo(fallback);
        const resolved = getDeliveryCoords(fallback.location, orderId);
        setDestLat(resolved.lat);
        setDestLng(resolved.lng);
      }

      // 2. Fetch fleet tracking telemetry to see if already in transit
      const fleetUrl = `${FULL_API_URL}/fleet.php?order_id=${encodeURIComponent(orderId)}`;
      const fleetRes = await axios.get(fleetUrl);
      if (fleetRes.data && fleetRes.data.status) {
        const dbStatus = fleetRes.data.status;
        if (dbStatus !== "ASSIGNED" && dbStatus !== "PENDING") {
          setMissionState(dbStatus);
        }
        
        // Use coordinates from database if they exist
        if (fleetRes.data.current_lat && fleetRes.data.current_lng) {
          setCoords({
            lat: parseFloat(fleetRes.data.current_lat),
            lng: parseFloat(fleetRes.data.current_lng)
          });
        }
        if (fleetRes.data.current_temp) {
          setTemp(parseFloat(fleetRes.data.current_temp));
        }
      }
    } catch (err) {
      console.error("handshake error:", err);
      toast("Error synchronizing active registry.", "error");
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadOrderDetails();
  }, [orderId, user]);

  // Periodic Telemetry Synchronization & Coordinate Drift Simulation
  useEffect(() => {
    let interval: any = null;

    if (missionState === "IN_TRANSIT") {
      interval = setInterval(() => {
        // Fluctuating temp slightly
        setTemp(prev => {
          const delta = (Math.random() - 0.5) * 0.2;
          const next = prev + delta;
          return next < -24 ? -24 : next > -20 ? -20 : next;
        });

        // Drift towards customer destination node
        setCoords(prev => {
          const deltaLat = destLat - prev.lat;
          const deltaLng = destLng - prev.lng;
          const distance = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);

          // If distance is extremely small, vehicle arrived at destination
          if (distance < 0.0004) {
            handleStateTransition("ARRIVED");
            return { lat: destLat, lng: destLng };
          }

          // Move 15% closer to destination node
          return {
            lat: prev.lat + deltaLat * 0.15,
            lng: prev.lng + deltaLng * 0.15
          };
        });
      }, 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [missionState, destLat, destLng]);

  // Sync coords & state changes to database fleet_tracking
  const broadcastTelemetry = async (stateToBroadcast: string, updatedCoords = coords, updatedTemp = temp) => {
    setIsSyncing(true);
    try {
      await axios.post(`${FULL_API_URL}/fleet.php`, {
        order_id: orderId,
        lat: updatedCoords.lat,
        lng: updatedCoords.lng,
        temp: updatedTemp,
        status: stateToBroadcast,
        agent_name: user?.name || "INS-AGENT",
        log_entry: {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: stateToBroadcast,
          location: stateToBroadcast === "DELIVERED" ? "Consignee Portal" : "Maritime Drift Vector"
        }
      });
    } catch (err) {
      console.error("Telemetry upload failure:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync whenever coords or temp changes in transit
  useEffect(() => {
    if (missionState === "IN_TRANSIT") {
      broadcastTelemetry(missionState, coords, temp);
    }
  }, [coords]);

  const handleStateTransition = async (nextState: string) => {
    setMissionState(nextState);
    toast(`Mission registry status set to: ${nextState.replace("_", " ")}`, "success");
    await broadcastTelemetry(nextState, coords, temp);
  };

  // OTP handoff logic
  const verifyOtp = async (code: string) => {
    setVerificationError("");
    const cleanId = orderId;
    const numericId = parseInt(cleanId.replace(/[^0-9]/g, "")) || 123;
    const expectedOtp = String(((numericId * 997 + 12345) % 900000) + 100000);

    if (code.trim() === expectedOtp) {
      setIsVerifying(true);
      
      try {
        // 1. Update database orders table status to DELIVERED
        await axios.post(`${FULL_API_URL}/seller/orders.php`, {
          order_id: orderId,
          status: "DELIVERED",
          delivery_agent_name: user?.name || "INS-AGENT"
        });

        // 2. Update telemetry status to DELIVERED
        setMissionState("DELIVERED");
        await broadcastTelemetry("DELIVERED");

        toast("Secure Handoff Protocol Verified! Order Completed.", "success");
      } catch (err) {
        console.error("Verify save error:", err);
        toast("Handshake validation succeeded, but database sync failed.", "error");
      } finally {
        setIsVerifying(false);
      }
    } else {
      setVerificationError("Invalid Handoff OTP. Please confirm with customer.");
    }
  };

  const tickScan = React.useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return;
    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const jsQR = (window as any).jsQR;
        if (jsQR) {
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert"
          });
          
          if (code && code.data) {
            const qrData = code.data;
            setScanLog(prev => [...prev, `[FOUND] Decoded payload: ${qrData.slice(0, 32)}...`]);
            
            // Extract OTP from URL query parameters (e.g. otp=123456)
            const otpMatch = qrData.match(/[?&]otp=(\d{6})/);
            const detectedOtp = otpMatch ? otpMatch[1] : qrData.replace(/[^0-9]/g, "").slice(0, 6);
            
            if (detectedOtp && detectedOtp.length === 6) {
              setScanLog(prev => [...prev, `[SUCCESS] Signature match: OTP ${detectedOtp}`, "[SYSTEM] finalizing dispatch node..."]);
              setOtpInput(detectedOtp);
              verifyOtp(detectedOtp);
              
              // Clean up camera stream and scanner overlay
              setTimeout(() => {
                setIsScanning(false);
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach((track: any) => track.stop());
                  streamRef.current = null;
                }
                setIsCameraActive(false);
              }, 800);
              return;
            }
          }
        }
      }
    }
    if (isScanning) {
      requestAnimationFrame(tickScan);
    }
  }, [isScanning, verifyOtp]);

  const startWebScan = React.useCallback(async () => {
    setScanLog(["[SYSTEM] Scanner node initialized", "[SYSTEM] Requesting camera permission..."]);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play();
        setIsCameraActive(true);
        setScanLog(prev => [...prev, "[SYSTEM] Video feed synced", "[SYSTEM] Analyzing viewfinder frames..."]);
        requestAnimationFrame(tickScan);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setScanLog(prev => [...prev, "⚠️ [ERROR] Camera hardware connection failed", "[SYSTEM] Confirm with customer and use manual OTP"]);
      toast("Camera permission or hardware error", "error");
    }
  }, [tickScan, toast]);

  const stopWebScan = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Web Scanner Hook
  useEffect(() => {
    if (Platform.OS !== "web" || !isScanning) return;
    
    let active = true;
    
    const loadAndStart = async () => {
      if (!(window as any).jsQR) {
        setScanLog(["[SYSTEM] Dynamic dependency resolver active", "[SYSTEM] Fetching jsQR module..."]);
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
        script.async = true;
        script.onload = () => {
          if (active) startWebScan();
        };
        script.onerror = () => {
          setScanLog(prev => [...prev, "⚠️ [ERROR] Dependency load failed. Use manual entry."]);
        };
        document.head.appendChild(script);
      } else {
        startWebScan();
      }
    };
    
    loadAndStart();
    
    return () => {
      active = false;
      stopWebScan();
    };
  }, [isScanning, startWebScan, stopWebScan]);

  // Native Simulation Scanner Hook
  useEffect(() => {
    if (Platform.OS === "web" || !isScanning) return;
    
    setScanLog(["[SYSTEM] Native scanner node initialized", "[SYSTEM] Simulating target lock..."]);
    
    const logs = [
      "[RECON] Analyzing live video feed...",
      "[RECON] Cross-referencing QR metadata...",
      "[RECON] Signature match found: ORD-CONFIRM",
      "[RECON] Decrypting operational payloads..."
    ];
    
    let step = 0;
    const interval = setInterval(() => {
      if (step < logs.length) {
        setScanLog(prev => [...prev, logs[step]]);
        step++;
      } else {
        clearInterval(interval);
        
        // Compute correct OTP
        const cleanId = orderId;
        const numericId = parseInt(cleanId.replace(/[^0-9]/g, "")) || 123;
        const correctOtp = String(((numericId * 997 + 12345) % 900000) + 100000);
        
        setScanLog(prev => [...prev, `[SUCCESS] Signature Decrypted: OTP ${correctOtp}`, "[SYSTEM] finalizing secure handoff..."]);
        
        setTimeout(() => {
          setOtpInput(correctOtp);
          verifyOtp(correctOtp);
          setIsScanning(false);
        }, 1000);
      }
    }, 600);
    
    return () => clearInterval(interval);
  }, [isScanning]);

  // Pulse animation simulation for vector view radar
  useEffect(() => {
    const pulseTimer = setInterval(() => {
      setPulseScale((prev) => (prev >= 1.5 ? 0.8 : prev + 0.1));
    }, 200);
    return () => clearInterval(pulseTimer);
  }, []);

  // Animated radar sweep line for native map
  const sweepAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sweepAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      alert("Dialer protocol not available on this interface.");
    });
  };

  // Progress along path helper
  const totalDist = Math.sqrt(Math.pow(destLat - startLat, 2) + Math.pow(destLng - startLng, 2));
  const currentDist = Math.sqrt(Math.pow(destLat - coords.lat, 2) + Math.pow(destLng - coords.lng, 2));
  const progressRatio = totalDist > 0 ? Math.max(0, Math.min(1, 1 - currentDist / totalDist)) : 0;

  // Radar coordinate map conversion helper
  const convertToRadarCoords = (lat: number, lng: number) => {
    // Center at center of coordinates (midpoint)
    const midLat = (startLat + destLat) / 2;
    const midLng = (startLng + destLng) / 2;
    const scale = 3000; // Zoom factor

    const x = 120 + (lng - midLng) * scale * 1.5;
    const y = 100 - (lat - midLat) * scale;
    return { x, y };
  };

  const hubCoords = convertToRadarCoords(startLat, startLng);
  const userCoords = convertToRadarCoords(coords.lat, coords.lng);
  const customerCoords = convertToRadarCoords(destLat, destLng);

  if (isLoading || !orderInfo) {
    return (
      <View className="flex-1 items-center justify-center bg-[#020617]">
        <ActivityIndicator color={mood.primary} size="large" />
        <Text className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-4 animate-pulse">
          Acquiring Satellite Lock...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: mood.bg }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
      {ToastHost}

      {/* TACTICAL MAP ENVIRONMENT */}
      {Platform.OS === "web" ? (
        <View 
          className="h-[280px] relative overflow-hidden border-2 rounded-[24px] mb-4 shadow-lg"
          style={{ backgroundColor: mood.cardBg, borderColor: mood.border }}
        >
          {/* Inject Leaflet CSS custom overrides style tag */}
          <style dangerouslySetInnerHTML={{ __html: `
            .leaflet-control-zoom { border: none !important; margin: 15px !important; }
            .leaflet-control-zoom-in, .leaflet-control-zoom-out { 
                background-color: rgba(0,0,0,0.7) !important; 
                color: ${mood.primary} !important; 
                border: 1px solid ${mood.primary}26 !important; 
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
            id="agent-tactical-map" 
            style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
          />

          {/* MISSION CONTROL RADAR SWEEP */}
          <div className="absolute inset-0 pointer-events-none z-[400] overflow-hidden">
             <div className="w-full h-[1px] shadow-[0_0_20px_var(--agent-primary)] animate-radar-sweep opacity-40" style={{ backgroundColor: mood.primary }} />
          </div>

          <style>{`
             @keyframes radar-sweep {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(500%); }
             }
             .animate-radar-sweep {
                animation: radar-sweep 5s linear infinite;
             }
             .leaflet-container {
                background: #e5e7eb !important;
             }
          `}</style>

          {/* TACTICAL HUD OVERLAYS */}
          <View className="absolute top-3 left-3 z-[1000] space-y-1.5 pointer-events-none">
             <View className="bg-primary/95 px-3 py-1 rounded-sm" style={{ backgroundColor: mood.primary }}>
                <Text className="text-[9px] font-black uppercase tracking-widest text-slate-900 italic">Node: Sentinel-01</Text>
             </View>
             <View className="flex-row items-center gap-2 px-2 py-1 backdrop-blur-md border rounded-sm" style={{ backgroundColor: "rgba(15,23,42,0.8)", borderColor: mood.primary + "4D" }}>
                <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSyncing ? "#64748B" : "#10B981" }} />
                <Text className="text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: mood.primary }}>Telemetry: {isSyncing ? "Lock" : "Registry Live"}</Text>
             </View>
          </View>

          {/* MAP MODE & RECENTER CONTROLS */}
          <View className="absolute bottom-3 right-3 z-[1000] flex-col gap-1.5">
             <Pressable onPress={toggleMapMode} className="w-9 h-9 border flex items-center justify-center rounded-lg transition-all" style={{ backgroundColor: mapMode === 'satellite' ? mood.primary : 'rgba(15,23,42,0.9)', borderColor: mood.primary + '4D' }}>
                <LayersIcon color={mapMode === 'satellite' ? '#FFFFFF' : mood.primary} />
             </Pressable>
             <Pressable onPress={recenterMap} className="w-9 h-9 border flex items-center justify-center rounded-lg transition-all" style={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: mood.primary + '4D' }}>
                <NavigationIcon color={mood.primary} />
             </Pressable>
          </View>

          <View className="absolute bottom-3 left-3 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-white/5 pointer-events-none z-[1000]">
            <Text className="text-[6.5px] font-black text-slate-500 uppercase tracking-widest leading-none">
              GRID COORDINATES
            </Text>
            <Text className="text-[8.5px] font-bold text-slate-300 uppercase mt-0.5">
              {coords.lat.toFixed(6)} N • {coords.lng.toFixed(6)} E
            </Text>
          </View>
        </View>
      ) : (
        /* ── NATIVE TACTICAL MAP (matches web Leaflet visual) ── */
        <View
          style={{
            height: 290,
            borderRadius: 24,
            borderWidth: 2,
            borderColor: mood.border,
            overflow: 'hidden',
            marginBottom: 16,
            backgroundColor: isLight ? '#E2E8F0' : '#020617',
            position: 'relative',
          }}
        >
          {/* Background map tile */}
          <RNImage
            source={{ uri: `https://static-maps.yandex.ru/1.x/?ll=${coords.lng},${coords.lat}&z=14&l=map&size=640,560` }}
            style={{ width: '100%', height: '100%', position: 'absolute', opacity: isLight ? 0.45 : 0.5 }}
            resizeMode="cover"
          />

          {/* Dark blueprint overlay */}
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: isLight ? 'rgba(241,245,249,0.45)' : 'rgba(2,6,23,0.62)' }
            ]}
          />

          {/* SVG radar graphics */}
          <Svg width="100%" height="100%" viewBox="0 0 300 290" style={{ position: 'absolute' }}>
            {/* Three concentric radar rings */}
            <Circle cx="150" cy="145" r="45" stroke={mood.primary} strokeWidth="0.6" strokeDasharray="3,3" fill="none" opacity="0.28" />
            <Circle cx="150" cy="145" r="80" stroke={mood.primary} strokeWidth="0.5" strokeDasharray="2,5" fill="none" opacity="0.17" />
            <Circle cx="150" cy="145" r="115" stroke={mood.primary} strokeWidth="0.8" fill="none" opacity="0.1" />

            {/* Compass cross-hair lines */}
            <Line x1="150" y1="4" x2="150" y2="286" stroke={mood.primary} strokeWidth="0.5" opacity="0.14" />
            <Line x1="4" y1="145" x2="296" y2="145" stroke={mood.primary} strokeWidth="0.5" opacity="0.14" />

            {/* Diagonal grid */}
            <Line x1="4" y1="4" x2="296" y2="286" stroke={mood.primary} strokeWidth="0.3" opacity="0.07" />
            <Line x1="296" y1="4" x2="4" y2="286" stroke={mood.primary} strokeWidth="0.3" opacity="0.07" />

            {/* Dashed route path from hub → agent → customer */}
            <Line
              x1={hubCoords.x * 1.25}
              y1={hubCoords.y * 1.45}
              x2={customerCoords.x * 1.25}
              y2={customerCoords.y * 1.45}
              stroke={mood.primary}
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.35"
            />

            {/* HUB origin node */}
            <G>
              <Circle cx={hubCoords.x * 1.25} cy={hubCoords.y * 1.45} r="7" fill="#334155" opacity="0.5" />
              <Circle cx={hubCoords.x * 1.25} cy={hubCoords.y * 1.45} r="3.5" fill="#64748B" />
            </G>

            {/* CUSTOMER destination node */}
            <G>
              <Circle cx={customerCoords.x * 1.25} cy={customerCoords.y * 1.45} r="11" fill="none" stroke={mood.primary} strokeWidth="1.5" opacity="0.8" />
              <Circle cx={customerCoords.x * 1.25} cy={customerCoords.y * 1.45} r="5.5" fill={mood.primary} />
              <Circle cx={customerCoords.x * 1.25} cy={customerCoords.y * 1.45} r="16" fill="none" stroke={mood.primary} strokeWidth="0.8" opacity="0.3" strokeDasharray="2,3" />
            </G>

            {/* AGENT animated pulsing dot */}
            {missionState !== 'DELIVERED' && (
              <G>
                <Circle
                  cx={userCoords.x * 1.25}
                  cy={userCoords.y * 1.45}
                  r={8 * pulseScale}
                  fill="none"
                  stroke={mood.primary}
                  strokeWidth="2"
                  opacity="0.55"
                />
                <Circle
                  cx={userCoords.x * 1.25}
                  cy={userCoords.y * 1.45}
                  r={14 * pulseScale}
                  fill="none"
                  stroke={mood.primary}
                  strokeWidth="0.8"
                  opacity="0.18"
                />
                <Circle cx={userCoords.x * 1.25} cy={userCoords.y * 1.45} r="6" fill={mood.primary} />
                {/* Direction cross on agent */}
                <Line x1={userCoords.x * 1.25 - 10} y1={userCoords.y * 1.45} x2={userCoords.x * 1.25 + 10} y2={userCoords.y * 1.45} stroke={mood.primary} strokeWidth="1" opacity="0.4" />
                <Line x1={userCoords.x * 1.25} y1={userCoords.y * 1.45 - 10} x2={userCoords.x * 1.25} y2={userCoords.y * 1.45 + 10} stroke={mood.primary} strokeWidth="1" opacity="0.4" />
              </G>
            )}
          </Svg>

          {/* Animated radar sweep line (mirrors web CSS animation) */}
          <Animated.View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 1.5,
              backgroundColor: mood.primary,
              opacity: 0.45,
              shadowColor: mood.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9,
              shadowRadius: 8,
              transform: [{
                translateY: sweepAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 290]
                })
              }]
            }}
          />

          {/* TOP-LEFT HUD — Sentinel node label (skewed style matching web) */}
          <View style={{ position: 'absolute', top: 12, left: 12, gap: 6 }}>
            {/* Primary badge */}
            <View style={{ backgroundColor: mood.primary, paddingHorizontal: 10, paddingVertical: 3, transform: [{ skewX: '-8deg' }] }}>
              <Text style={{ fontSize: 8, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase', color: '#0F172A', fontStyle: 'italic', transform: [{ skewX: '8deg' }] }}>
                Node: Sentinel-01
              </Text>
            </View>
            {/* Telemetry status */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              paddingHorizontal: 8, paddingVertical: 3,
              borderWidth: 1, borderColor: mood.primary + '40',
              backgroundColor: 'rgba(2,6,23,0.85)',
              transform: [{ skewX: '-8deg' }]
            }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isSyncing ? '#64748B' : '#10B981', shadowColor: '#10B981', shadowRadius: isSyncing ? 0 : 4 }} />
              <Text style={{ fontSize: 7, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: mood.primary, transform: [{ skewX: '8deg' }] }}>
                Telemetry: {isSyncing ? 'Lock' : 'Registry Live'}
              </Text>
            </View>
          </View>

          {/* BOTTOM-RIGHT HUD — toggle + recenter buttons (matching web) */}
          <View style={{ position: 'absolute', bottom: 12, right: 12, gap: 6 }}>
            <Pressable
              onPress={toggleMapMode}
              style={{
                width: 36, height: 36,
                borderRadius: 6,
                borderWidth: 1, borderColor: mood.primary + '4D',
                backgroundColor: mapMode === 'satellite' ? mood.primary : 'rgba(2,6,23,0.88)',
                alignItems: 'center', justifyContent: 'center',
                transform: [{ skewX: '-8deg' }]
              }}
            >
              <LayersIcon color={mapMode === 'satellite' ? '#FFFFFF' : mood.primary} />
            </Pressable>
            <Pressable
              onPress={recenterMap}
              style={{
                width: 36, height: 36,
                borderRadius: 6,
                borderWidth: 1, borderColor: mood.primary + '4D',
                backgroundColor: 'rgba(2,6,23,0.88)',
                alignItems: 'center', justifyContent: 'center',
                transform: [{ skewX: '-8deg' }]
              }}
            >
              <NavigationIcon color={mood.primary} />
            </Pressable>
          </View>

          {/* BOTTOM-LEFT — grid coordinates */}
          <View style={{
            position: 'absolute', bottom: 12, left: 12,
            backgroundColor: 'rgba(2,6,23,0.82)',
            paddingHorizontal: 10, paddingVertical: 6,
            borderRadius: 10,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)'
          }}>
            <Text style={{ fontSize: 6, fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: 2 }}>GRID COORDINATES</Text>
            <Text style={{ fontSize: 8, fontWeight: '700', color: '#CBD5E1', textTransform: 'uppercase', marginTop: 2 }}>
              {coords.lat.toFixed(5)} N · {coords.lng.toFixed(5)} E
            </Text>
          </View>

          {/* TOP-RIGHT — drift progress */}
          <View style={{
            position: 'absolute', top: 12, right: 12,
            backgroundColor: 'rgba(2,6,23,0.82)',
            paddingHorizontal: 10, paddingVertical: 6,
            borderRadius: 10,
            borderWidth: 1, borderColor: mood.primary + '22',
            alignItems: 'flex-end'
          }}>
            <Text style={{ fontSize: 6, fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: 2 }}>DRIFT PROGRESS</Text>
            <Text style={{ fontSize: 9, fontWeight: '900', color: mood.primary, marginTop: 2 }}>
              {Math.round(progressRatio * 100)}% COMPLETE
            </Text>
          </View>
        </View>
      )}

      {/* MISSION CONTROL HUB */}
      <View 
        className="border-2 rounded-[24px] relative overflow-hidden p-5 mb-6"
        style={{ backgroundColor: isLight ? "#F8FAFC" : "rgba(15, 23, 42, 0.95)", borderColor: mood.border }}
      >
        {/* Status Header */}
        <View className="flex-row items-center justify-between border-b border-white/5 pb-4 mb-4">
          <View className="flex-row items-center space-x-2">
            <Text className="text-[9px] font-black uppercase text-slate-400">MISSION REGISTRY</Text>
            <Text className="text-base font-black italic tracking-tighter" style={{ color: mood.text }}>
              {orderId}
            </Text>
          </View>

          <View 
            className="px-2.5 py-0.5 rounded border"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.02)", borderColor: mood.border }}
          >
            <Text className="text-[8px] font-black uppercase tracking-wider" style={{ color: mood.primary }}>
              {missionState.replace("_", " ")}
            </Text>
          </View>
        </View>

        {/* Tactical Metrics Grid */}
        <View className="flex-row mb-4 space-x-2">
          <View 
            className="flex-1 p-3 rounded-2xl border flex-row items-center space-x-2.5"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.05)", borderColor: mood.border }}
          >
            <ClockIcon color={mood.primary} />
            <View>
              <Text className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest">ETA VECTOR</Text>
              <Text className="text-sm font-black italic" style={{ color: mood.text }}>
                {missionState === "DELIVERED" ? "0 MINS" : missionState === "ARRIVED" ? "ARIVED" : `${Math.max(1, Math.round((1 - progressRatio) * 15))} MINS`}
              </Text>
            </View>
          </View>

          <View 
            className="flex-1 p-3 rounded-2xl border flex-row items-center space-x-2.5"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.05)", borderColor: mood.border }}
          >
            <ThermometerIcon color="#10B981" />
            <View>
              <Text className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest">COLD CHAIN</Text>
              <Text className="text-sm font-black italic text-emerald-500">
                {temp.toFixed(1)}°C
              </Text>
            </View>
          </View>
        </View>

        {/* Consignee details */}
        <View 
          className="p-4 rounded-2xl border space-y-3 mb-4"
          style={{ backgroundColor: "rgba(0,0,0,0.1)", borderColor: mood.border }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2">
              <UserIcon color={mood.primary} />
              <Text className="text-[10px] font-black uppercase" style={{ color: mood.text }}>
                {orderInfo.customer}
              </Text>
            </View>
            <Pressable
              onPress={() => handleCall("+91 99332 12345")}
              className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex-row items-center space-x-1"
            >
              <PhoneIcon color="#10B981" />
              <Text className="text-[7.5px] font-black text-emerald-500 uppercase tracking-widest">CALL PEER</Text>
            </Pressable>
          </View>

          <View className="border-t border-white/5 pt-3 flex-row items-start space-x-2">
            <MapPinIcon color={mood.primary} />
            <View className="flex-1">
              <Text className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest leading-none">
                DROP-OFF NODE
              </Text>
              <Text className="text-[9px] font-bold text-slate-300 uppercase mt-0.5 leading-relaxed">
                {orderInfo.location}
              </Text>
            </View>
          </View>
        </View>

        {/* Cargo items manifest */}
        <View className="mb-6">
          <View className="flex-row items-center space-x-1.5 mb-2">
            <View className="w-1.5 h-3 rounded-full" style={{ backgroundColor: mood.primary }} />
            <Text className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Cargo Items</Text>
          </View>
          <View className="space-y-1.5">
            {orderInfo.items && orderInfo.items.map((item: any, i: number) => (
              <View 
                key={i} 
                className="flex-row justify-between items-center px-4 py-2 border rounded-xl"
                style={{ backgroundColor: "rgba(0,0,0,0.05)", borderColor: mood.border }}
              >
                <View className="flex-row items-center space-x-2">
                  <BoxIcon color={mood.primary} />
                  <Text className="text-[9px] font-bold" style={{ color: mood.text }}>{item.name}</Text>
                </View>
                <Text className="text-[9px] font-black" style={{ color: mood.primary }}>{item.qty}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* MISSION COMMAND ACTIONS */}
        <View>
          {missionState === "NOT_STARTED" && (
            <Pressable
              onPress={() => handleStateTransition("IN_TRANSIT")}
              className="h-12 w-full rounded-2xl flex-row items-center justify-center space-x-2"
              style={{
                backgroundColor: mood.primary,
                shadowColor: mood.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 4
              }}
            >
              <Text className="text-[10px] font-black text-white uppercase tracking-[0.25em] italic">
                INITIALIZE JOURNEY
              </Text>
            </Pressable>
          )}

          {missionState === "IN_TRANSIT" && (
            <Pressable
              onPress={() => handleStateTransition("ARRIVED")}
              className="h-12 w-full bg-emerald-600 rounded-2xl flex-row items-center justify-center space-x-2"
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 4
              }}
            >
              <Text className="text-[10px] font-black text-white uppercase tracking-[0.25em] italic">
                ARRIVED AT DROP-OFF
              </Text>
            </Pressable>
          )}

          {missionState === "ARRIVED" && (
            <View 
              className="p-4 border rounded-2xl space-y-4"
              style={{ backgroundColor: "rgba(0,0,0,0.15)", borderColor: mood.border }}
            >
              {/* Scan QR Code Button */}
              <Pressable
                onPress={() => setIsScanning(true)}
                className="h-12 w-full rounded-xl flex-row items-center justify-center space-x-2"
                style={{
                  backgroundColor: mood.primary,
                  shadowColor: mood.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 4
                }}
              >
                <CameraIcon color="#FFFFFF" />
                <Text className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">
                  SCAN CUSTOMER QR CODE
                </Text>
              </Pressable>

              <View className="items-center py-1">
                <Text className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest">
                  — OR ENTER SECURITY OTP —
                </Text>
              </View>

              <View className="space-y-1.5">
                <Text className="text-[7.5px] font-black uppercase tracking-[0.15em]" style={{ color: mood.primary }}>
                  Secure Delivery Handoff Password (OTP)
                </Text>
                <TextInput
                  value={otpInput}
                  onChangeText={(txt) => {
                    setOtpInput(txt.replace(/[^0-9]/g, ""));
                    setVerificationError("");
                  }}
                  maxLength={6}
                  keyboardType="numeric"
                  placeholder="ENTER 6-DIGIT OTP"
                  placeholderTextColor={isLight ? "#94A3B8" : "rgba(255,255,255,0.15)"}
                  className="bg-slate-950/40 text-center font-bold tracking-[0.3em] h-11 rounded-xl border text-sm"
                  style={{
                    borderColor: mood.border,
                    color: mood.text,
                    backgroundColor: isLight ? "#F1F5F9" : "rgba(0,0,0,0.4)"
                  }}
                />
                {verificationError ? (
                  <Text className="text-red-500 text-[8px] font-bold text-center uppercase tracking-widest mt-1 animate-pulse">
                    ⚠️ {verificationError}
                  </Text>
                ) : null}
              </View>

              <View className="space-y-2">
                <Pressable
                  onPress={() => verifyOtp(otpInput)}
                  disabled={otpInput.length !== 6 || isVerifying}
                  className="h-10 rounded-xl flex-row items-center justify-center space-x-1.5"
                  style={{
                    backgroundColor: mood.primary,
                    opacity: otpInput.length !== 6 || isVerifying ? 0.5 : 1
                  }}
                >
                  {isVerifying ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <LockIcon color="#FFFFFF" />
                      <Text className="text-[9.5px] font-black text-white uppercase tracking-widest">
                        VERIFY & HANDOFF
                      </Text>
                    </>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => {
                    const cleanId = orderId;
                    const numericId = parseInt(cleanId.replace(/[^0-9]/g, "")) || 123;
                    const computed = String(((numericId * 997 + 12345) % 900000) + 100000);
                    setOtpInput(computed);
                    verifyOtp(computed);
                  }}
                  className="h-8 border border-dashed rounded-xl flex-row items-center justify-center"
                  style={{ borderColor: mood.border }}
                >
                  <Text className="text-[8px] font-black uppercase tracking-widest" style={{ color: mood.text }}>
                    Simulate QR Scan Input
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {missionState === "DELIVERED" && (
            <View 
              className="p-4 flex-row items-center space-x-3.5 border rounded-2xl"
              style={{ backgroundColor: "rgba(16,185,129,0.06)", borderColor: "rgba(16,185,129,0.25)" }}
            >
              <View className="w-9 h-9 rounded-xl bg-emerald-500/20 items-center justify-center">
                <ShieldCheckIcon color="#10B981" />
              </View>
              <View>
                <Text className="text-[9.5px] font-black text-emerald-500 uppercase tracking-widest">
                  MISSION ACCOMPLISHED
                </Text>
                <Text className="text-[7.5px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">
                  Registry verified and finalized
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>

    {/* QR SCANNER FULL SCREEN OVERLAY */}
    {isScanning && (
      <View 
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: 'rgba(2, 6, 23, 0.98)', zIndex: 5000, padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40 }
        ]}
      >
        {/* Injected scan line keyframe styling */}
        {Platform.OS === 'web' && (
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes scanner-sweep {
              0% { top: 0%; opacity: 0.4; }
              50% { top: 100%; opacity: 1; }
              100% { top: 0%; opacity: 0.4; }
            }
          `}} />
        )}

        {/* Title Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: mood.border, paddingBottom: 16, marginBottom: 24 }}>
          <View>
            <Text style={{ fontSize: 10, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase', color: mood.primary }}>
              TACTICAL SCANNER ACTIVE
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '900', fontStyle: 'italic', color: 'white', letterSpacing: -0.5 }}>
              {`OX-${orderId.toString().slice(-6).toUpperCase()}-SCAN`}
            </Text>
          </View>
          <Pressable 
            onPress={() => {
              setIsScanning(false);
              stopWebScan();
            }}
            style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: mood.border, backgroundColor: 'rgba(15,23,42,0.6)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 9, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase', color: '#94A3B8' }}>
              CLOSE SCANNER
            </Text>
          </Pressable>
        </View>

        {/* Viewfinder Area */}
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, marginVertical: 16 }}>
          <View 
            style={{ 
              width: 260, 
              height: 260, 
              position: 'relative', 
              overflow: 'hidden', 
              borderWidth: 2, 
              borderRadius: 32, 
              alignItems: 'center', 
              justifyContent: 'center',
              borderColor: mood.primary, 
              backgroundColor: 'black' 
            }}
          >
            {Platform.OS === 'web' ? (
              <video 
                ref={videoRef}
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
                playsInline
                autoPlay
                muted
              />
            ) : (
              <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15,23,42,0.6)', padding: 16 }}>
                <ActivityIndicator size="large" color={mood.primary} />
                <Text style={{ fontSize: 8, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, color: '#94A3B8', marginTop: 16, textAlign: 'center' }}>
                  ACQUIRING NATIVE TELEMETRY FEED...
                </Text>
              </View>
            )}

            {/* Corner Brackets — z-index above video */}
            <View style={{ position: 'absolute', top: 12, left: 12, width: 24, height: 24, borderTopWidth: 2, borderLeftWidth: 2, borderColor: mood.primary, zIndex: 2 }} />
            <View style={{ position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderTopWidth: 2, borderRightWidth: 2, borderColor: mood.primary, zIndex: 2 }} />
            <View style={{ position: 'absolute', bottom: 12, left: 12, width: 24, height: 24, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: mood.primary, zIndex: 2 }} />
            <View style={{ position: 'absolute', bottom: 12, right: 12, width: 24, height: 24, borderBottomWidth: 2, borderRightWidth: 2, borderColor: mood.primary, zIndex: 2 }} />

            {/* Dashed focus guide */}
            <View style={{ position: 'absolute', top: 24, right: 24, bottom: 24, left: 24, borderWidth: 1, borderStyle: 'dashed', borderColor: mood.primary, opacity: 0.25, zIndex: 2 }} />

            {/* In-view active scanner beam */}
            <View 
              style={{ 
                position: 'absolute',
                left: 0,
                right: 0,
                height: 2.5,
                backgroundColor: mood.primary,
                shadowColor: mood.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
                top: '50%',
                zIndex: 3,
                ...(Platform.OS === 'web' ? { animation: 'scanner-sweep 3s ease-in-out infinite' } : {})
              }}
            />
          </View>

          <Text style={{ fontSize: 9, fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: 3, marginTop: 16, textAlign: 'center' }}>
            Point camera at customer QR code
          </Text>
        </View>

        {/* Terminal Diagnostics Logs */}
        <View 
          className="h-[140px] rounded-2xl border p-4 font-mono text-[9px] mb-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', borderColor: mood.border }}
        >
          <Text className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">
            DIAGNOSTICS PROTOCOL
          </Text>
          <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 10 }}>
            {scanLog.map((log, index) => (
              <Text key={index} className="text-slate-300 font-mono text-[9px] mb-1">
                {log}
              </Text>
            ))}
          </ScrollView>
        </View>

        {/* Metadata Footer */}
        <View className="items-center mb-6">
          <Text className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] leading-none">
            SOVEREIGN HANDOFF LAYER
          </Text>
        </View>

        {/* Hidden Canvas for Web decoding */}
        {Platform.OS === 'web' && (
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        )}
      </View>
    )}
  </View>
  );
}
