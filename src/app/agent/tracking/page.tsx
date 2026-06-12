"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Navigation as NavigationIcon, 
  Package, 
  MapPin, 
  Truck, 
  Phone,
  User,
  CheckCircle,
  Clock,
  Droplets,
  Zap,
  Navigation,
  Home,
  ShieldCheck,
  ChevronRight,
  Anchor,
  Box,
  Cpu,
  Layers
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

enum MissionState {
  NOT_STARTED = "NOT_STARTED",
  IN_TRANSIT = "IN_TRANSIT",
  ARRIVED = "ARRIVED",
  DELIVERED = "DELIVERED"
}

// --- TACTICAL ICON DEFINITIONS ---
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
    <style>@keyframes sentinel-pulse { 0% { transform: scale(0.5
  ); opacity: 0.8; } 100% { transform: scale(1.8
  ); opacity: 0; } }</style>
  </div>
`;

const CUSTOMER_HARBOR_HTML = (primary: string) => `
  <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
    <div style="position: absolute; width: 50px; height: 50px; border: 2px dashed ${primary}66; border-radius: 50%; animation: harbor-rotate 10s linear infinite;"></div>
    <div style="width: 28px; height: 28px; background: ${primary}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px ${primary}80; z-index: 2;">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color: white;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
    </div>
    <style>@keyframes harbor-rotate { from { transform: rotate(0deg
  ); } to { transform: rotate(360deg
  ); } }</style>
  </div>
`;

import { Suspense } from "react";

function AgentTrackingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || "ORD-9982";
  const { toast } = useToast();
  const urlOtp = searchParams.get("otp");
  
  const [coords, setCoords] = React.useState({ lat: 13.148500, lng: 92.938000 });
  const [missionState, setMissionState] = React.useState<MissionState>(MissionState.NOT_STARTED);
  const [isSyncing, setIsSyncing] = React.useState(true);
  const [orderInfo, setOrderInfo] = React.useState<any>(null);
  const [mapMode, setMapMode] = React.useState<'tactical' | 'satellite'>('tactical');

  // OTP Verification States
  const [otpInput, setOtpInput] = React.useState("");
  const [verificationError, setVerificationError] = React.useState("");

  const verifyOtp = async (code: string) => {
    const cleanId = typeof orderId === 'string' ? orderId : String(orderId || "123");
    const numericId = parseInt(cleanId.replace(/[^0-9]/g, "")) || 123;
    const expectedOtp = String((numericId * 997 + 12345) % 900000 + 100000);

    if (code.trim() === expectedOtp) {
      setVerificationError("");
      await handleStateTransition(MissionState.DELIVERED);
      try {
        await fetch("/api/seller/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: cleanId,
            status: "DELIVERED"
          })
        });
        toast("Registry Status Synchronized: DELIVERED", "success");
      } catch (err) {
        console.error("Database update error:", err);
      }
    } else {
      setVerificationError("Invalid Handoff OTP. Please confirm with customer.");
    }
  };

  React.useEffect(() => {
    if (urlOtp && missionState === MissionState.ARRIVED) {
      setOtpInput(urlOtp);
      verifyOtp(urlOtp);
    }
  }, [urlOtp, missionState]);

  const mapRef = React.useRef<any>(null
  );
  const tileLayerRef = React.useRef<any>(null
  );
  const markerRef = React.useRef<any>(null
  );
  const harborMarkerRef = React.useRef<any>(null
  );
  const routingRef = React.useRef<any>(null
  );

  const fetchOrderDetails = async () => {
    try {
      setOrderInfo({
        customer: "Vikram Sharma",
        phone: "+91 98765 43210",
        address: "Marine Villa, Sector 4, Port Blair, Andaman & Nicobar Islands",
        items: [
          { name: "Premium Bluefin Saku", qty: "2kg" },
          { name: "Fresh Atlantic Salmon", qty: "1.5kg" }
        ]
      }
  );
    } catch (err) {}
  };

  const broadcastTelemetry = async (newState?: MissionState) => {
    try {
      const stateToBroadcast = newState || missionState;
      const res = await fetch('/api/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId, lat: coords.lat, lng: coords.lng, status: stateToBroadcast,
          log_entry: { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: stateToBroadcast.replace('_', ' '), location: "Current Position", active: true }
        })
      }
  );
      if (res.ok) setIsSyncing(false
  );
    } catch (err) {}
  };

  React.useEffect(() => {
    fetchOrderDetails();
    if (missionState === MissionState.IN_TRANSIT) {
      const targetLat = 13.160704;
      const targetLng = 92.946892;
      const interval = setInterval(() => {
        setCoords(prev => {
          const latDiff = targetLat - prev.lat;
          const lngDiff = targetLng - prev.lng;
          const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
          if (distance < 0.0005) {
            clearInterval(interval);
            handleStateTransition(MissionState.ARRIVED);
            return { lat: targetLat, lng: targetLng };
          }
          return {
            lat: prev.lat + latDiff * 0.15,
            lng: prev.lng + lngDiff * 0.15
          };
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [missionState]);

  React.useEffect(() => { broadcastTelemetry(
  ); }, [coords]
  );

  const initMap = React.useCallback(() => {
    const L = (window as any).L;
    const mapContainer = document.getElementById('agent-tactical-map'
  );
    if (!L || !mapContainer || mapRef.current) return;
    mapRef.current = L.map('agent-tactical-map', { zoomControl: false }).setView([coords.lat, coords.lng], 16
  );
    
    // OpenStreetMap BY DEFAULT FOR CLEAR VISIBILITY
    tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
      attribution: '&copy; OpenStreetMap contributors' 
    }).addTo(mapRef.current);

    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--agent-primary').trim() || "#00D1FF";
    const glow = getComputedStyle(document.documentElement).getPropertyValue('--agent-glow').trim() || "";
    const agentIcon = L.divIcon({ className: 'sentinel-marker', html: AGENT_SENTINEL_HTML(primaryColor, glow), iconSize: [40, 40], iconAnchor: [20, 20] }
  );
    const harborIcon = L.divIcon({ className: 'harbor-marker', html: CUSTOMER_HARBOR_HTML(primaryColor), iconSize: [40, 40], iconAnchor: [20, 20] }
  );

    markerRef.current = L.marker([coords.lat, coords.lng], { icon: agentIcon }).addTo(mapRef.current
  );
    harborMarkerRef.current = L.marker([13.160704, 92.946892], { icon: harborIcon }).addTo(mapRef.current
  );
  }, []
  );

  const toggleMapMode = () => {
    const L = (window as any).L;
    if (!L || !mapRef.current || !tileLayerRef.current) return;
    
    const newMode = mapMode === 'tactical' ? 'satellite' : 'tactical';
    setMapMode(newMode
  );
    
    mapRef.current.removeLayer(tileLayerRef.current
  );
    
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
      mapRef.current.setView([coords.lat, coords.lng], 16
  );
      toast("Recalibrating Navigation Node", "success"
  );
    }
  };

  const updateRouting = React.useCallback(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;
    if (markerRef.current) markerRef.current.setLatLng([coords.lat, coords.lng]
  );

    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--agent-primary').trim() || "#00D1FF";

    if (missionState === MissionState.IN_TRANSIT && L.Routing) {
      if (routingRef.current) {
        try { routingRef.current.setWaypoints([L.latLng(coords.lat, coords.lng), L.latLng(13.160704, 92.946892)]
  ); } catch(e) {}
      } else {
        routingRef.current = L.Routing.control({
          waypoints: [L.latLng(coords.lat, coords.lng), L.latLng(13.160704, 92.946892)],
          routeWhileDragging: false, show: false, addWaypoints: false, draggableWaypoints: false, fitSelectedRoutes: false,
          lineOptions: { styles: [{ color: primaryColor, weight: 6, opacity: 0.9 }] }
        }).addTo(mapRef.current
  );
      }
    }
  }, [coords, missionState]
  );

  React.useEffect(() => {
    if (!(window as any).L) {
      const link = document.createElement('link'
  ); link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link
  );
      const rCss = document.createElement('link'
  ); rCss.rel = 'stylesheet'; rCss.href = 'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css'; document.head.appendChild(rCss
  );
      const script = document.createElement('script'
  ); script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; script.async = true;
      script.onload = () => {
        const rJs = document.createElement('script'
  ); rJs.src = "https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js"; rJs.async = true;
        rJs.onload = initMap; document.head.appendChild(rJs
  );
      };
      document.head.appendChild(script
  );
    } else { initMap(
  ); }
  }, [initMap]
  );

  React.useEffect(() => { updateRouting(
  ); }, [coords, missionState, updateRouting]
  );

  const handleStateTransition = async (nextState: MissionState) => {
    setMissionState(nextState
  ); await broadcastTelemetry(nextState
  ); toast(`Update: ${nextState.replace('_', ' ')}`, "success"
  );
    if (nextState === MissionState.IN_TRANSIT && mapRef.current) mapRef.current.setView([coords.lat, coords.lng], 16
  );
  };

  return (

    <div className="min-h-screen pb-32 lg:pb-32 overflow-x-hidden selection:bg-[var(--agent-primary)]/30" style={{ backgroundColor: 'var(--agent-bg)', color: 'var(--agent-text)' }}>
       {/* 1. TACTICAL MAP ENVIRONMENT */}
       <div className="p-2 lg:p-4">
          <Card className="h-[40vh] lg:h-[60vh] relative overflow-hidden border-2 rounded-[12px] lg:rounded-[20px] transition-all duration-500 shadow-lg" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
             {/* THE MAP NODE */}
             <div id="agent-tactical-map" className="w-full h-full" style={{ 
                opacity: 1,
                filter: 'none',
                transition: 'all 0.5s ease-in-out',
                backgroundColor: 'transparent'
             }} />
             
             {/* MISSION CONTROL RADAR SWEEP */}
             <div className="absolute inset-0 pointer-events-none z-[400] overflow-hidden">
                <div className="w-full h-[1px] shadow-[0_0_20px_var(--agent-primary)] animate-radar-sweep opacity-40" style={{ backgroundColor: 'var(--agent-primary)' }} />
             </div>

             <style>{`
                @keyframes radar-sweep {
                   0% { transform: translateY(-100%
  ); }
                   100% { transform: translateY(500%
  ); }
                }
                .animate-radar-sweep {
                   animation: radar-sweep 5s linear infinite;
                }
                .leaflet-container {
                   background: #e5e7eb !important;
                }
             `}</style>

             {/* TACTICAL HUD OVERLAYS */}
             <div className="absolute top-3 left-3 z-[1000] space-y-1.5 pointer-events-none">
                <div className="relative -skew-x-12 px-3 py-1 shadow-lg" style={{ backgroundColor: 'var(--agent-primary)' }}>
                   <span className="block skew-x-12 text-[9px] font-black uppercase tracking-widest text-white italic">Node: Sentinel-01</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 backdrop-blur-md border -skew-x-12" style={{ backgroundColor: 'var(--agent-bg)CC', borderColor: 'var(--agent-primary)4D' }}>
                   <div className={cn("w-1.5 h-1.5 skew-x-12", isSyncing ? "animate-pulse bg-slate-500" : "bg-emerald-500 shadow-[0_0_8px_#10B981]")} />
                   <span className="skew-x-12 text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--agent-primary)' }}>Telemetry: {isSyncing ? "Lock" : "Registry Live"}</span>
                </div>
             </div>

             <div className="absolute bottom-3 right-3 z-[1000] flex flex-col gap-1.5">
                <button onClick={toggleMapMode} className={cn("w-9 h-9 border flex items-center justify-center -skew-x-12 transition-all group", mapMode === 'satellite' ? "text-white" : "text-[var(--agent-primary)]")} style={{ backgroundColor: mapMode === 'satellite' ? 'var(--agent-primary)' : 'var(--agent-bg)E6', borderColor: 'var(--agent-primary)4D' }}>
                   <Layers className="w-4 h-4 skew-x-12 transition-all" />
                </button>
                <button onClick={recenterMap} className="w-9 h-9 border flex items-center justify-center -skew-x-12 hover:bg-[var(--agent-primary)] transition-all group" style={{ backgroundColor: 'var(--agent-bg)E6', borderColor: 'var(--agent-primary)4D' }}>
                   <NavigationIcon className="w-4 h-4 skew-x-12 group-hover:text-white" style={{ color: 'var(--agent-primary)' }} />
                </button>
             </div>
          </Card>
       </div>

       {/* 2. MISSION COMMAND HUB (Ultra-Compact) */}
       <div className="px-2 lg:px-4 -mt-2 relative z-10">
          <Card className="relative overflow-hidden backdrop-blur-xl border-x-2 border-b-2 rounded-[8px] p-0 shadow-2xl transition-all duration-500" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
             {/* TOP STATUS BAR (Skewed) */}
             <div className="flex items-center justify-between border-b px-4 py-2" style={{ backgroundColor: 'var(--agent-text)0D', borderColor: 'var(--agent-border)' }}>
                <div className="flex items-center gap-3">
                   <div className="relative -skew-x-12 p-2 border" style={{ backgroundColor: 'var(--agent-primary)1A', borderColor: 'var(--agent-primary)33' }}>
                      <Cpu className="w-4 h-4 animate-pulse skew-x-12" style={{ color: 'var(--agent-primary)' }} />
                   </div>
                   <div>
                      <h1 className="text-sm font-black uppercase italic tracking-widest leading-none" style={{ color: 'var(--agent-text)' }}>Mission Hub</h1>
                      <p className="text-[7px] font-bold uppercase tracking-[0.3em] mt-1 opacity-40" style={{ color: 'var(--agent-text)' }}>Ref: {orderId}</p>
                   </div>
                </div>
                <div className="relative -skew-x-12 border px-3 py-1" style={{ backgroundColor: 'var(--agent-primary)0D', borderColor: 'var(--agent-primary)4D' }}>
                   <span className="block skew-x-12 text-[9px] font-black uppercase tracking-[0.1em]" style={{ color: 'var(--agent-primary)' }}>{missionState.replace('_', ' ')}</span>
                </div>
             </div>

             <div className="p-3 lg:p-5 space-y-3">
                {/* TACTICAL METRICS GRID */}
                <div className="grid grid-cols-2 gap-2">
                   <div className="relative overflow-hidden border p-2 group" style={{ backgroundColor: 'var(--agent-text)05', borderColor: 'var(--agent-border)' }}>
                      <div className="absolute top-0 right-0 w-8 h-8 -skew-x-12 translate-x-4 -translate-y-4" style={{ backgroundColor: 'var(--agent-primary)0D' }} />
                      <div className="flex items-center gap-2">
                         <Clock className="w-3 h-3" style={{ color: 'var(--agent-primary)' }} />
                         <span className="text-[7px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--agent-text)' }}>ETA Vector</span>
                      </div>
                      <p className="text-lg font-black italic mt-0.5" style={{ color: 'var(--agent-text)' }}>12 MINS</p>
                   </div>
                   <div className="relative overflow-hidden border p-2 group" style={{ backgroundColor: 'var(--agent-text)05', borderColor: 'var(--agent-border)' }}>
                      <div className="absolute top-0 right-0 w-8 h-8 -skew-x-12 translate-x-4 -translate-y-4" style={{ backgroundColor: '#10B9810D' }} />
                      <div className="flex items-center gap-2">
                         <Droplets className="w-3 h-3 text-emerald-400" />
                         <span className="text-[7px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--agent-text)' }}>Cold Chain</span>
                      </div>
                      <p className="text-lg font-black italic text-emerald-400 mt-0.5">-22.4°C</p>
                   </div>
                </div>

                {/* DROP-OFF TELEMETRY */}
                <div className="border p-3 space-y-3 sm:space-y-2 relative" style={{ backgroundColor: 'var(--agent-text)08', borderColor: 'var(--agent-border)' }}>
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--agent-primary)1A' }}>
                            <User className="w-3 h-3" style={{ color: 'var(--agent-primary)' }} />
                         </div>
                         <p className="text-[11px] font-black uppercase tracking-tight truncate" style={{ color: 'var(--agent-text)' }}>{orderInfo?.customer || "Syncing..."}</p>
                      </div>
                      <Button variant="ghost" className="w-full sm:w-auto h-7 px-3 text-emerald-400 hover:bg-emerald-500 hover:text-white -skew-x-12 text-[8px] font-black uppercase shrink-0" style={{ backgroundColor: '#10B9811A' }}>
                         <Phone className="w-3 h-3 skew-x-12 mr-1" /> Call Peer
                      </Button>
                   </div>
                   <div className="flex items-start gap-2 pt-2 border-t" style={{ borderColor: 'var(--agent-border)' }}>
                      <MapPin className="w-3 h-3 mt-0.5" style={{ color: 'var(--agent-primary)' }} />
                      <p className="text-[9px] font-bold leading-relaxed uppercase opacity-60" style={{ color: 'var(--agent-text)' }}>{orderInfo?.address || "Acquiring coordinates..."}</p>
                   </div>
                </div>

                {/* CARGO MANIFEST */}
                <div className="space-y-1.5">
                   <div className="flex items-center gap-2 px-1">
                      <div className="w-1 h-3" style={{ backgroundColor: 'var(--agent-primary)' }} />
                      <h3 className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--agent-text)' }}>Cargo Manifest</h3>
                   </div>
                   <div className="grid grid-cols-1 gap-1">
                      {(orderInfo?.items || []).map((item: any, i: number) => (
                         <div key={i} className="flex items-center justify-between border px-3 py-1.5 -skew-x-6" style={{ backgroundColor: 'var(--agent-text)05', borderColor: 'var(--agent-border)' }}>
                            <div className="flex items-center gap-2 skew-x-6">
                               <Zap className="w-2.5 h-2.5 opacity-40" style={{ color: 'var(--agent-primary)' }} />
                               <span className="text-[10px] font-bold opacity-80" style={{ color: 'var(--agent-text)' }}>{item.name}</span>
                            </div>
                            <span className="skew-x-6 text-[9px] font-black" style={{ color: 'var(--agent-primary)' }}>{item.qty}</span>
                         </div>
                      ))}
                   </div>
                </div>

                {/* COMMAND ACTIONS (Skewed Blocks) */}
                <div className="pt-2">
                   {missionState === MissionState.NOT_STARTED && (
                      <button onClick={() => handleStateTransition(MissionState.IN_TRANSIT)} className="w-full h-12 hover:opacity-90 text-white font-black uppercase tracking-[0.2em] italic text-[10px] flex items-center justify-center gap-2 -skew-x-12 transition-all shadow-lg" style={{ backgroundColor: 'var(--agent-primary)', boxShadow: `0 4px 15px var(--agent-glow)` }}>
                         <NavigationIcon className="w-4 h-4 skew-x-12" /> <span className="skew-x-12">Initialize Journey</span>
                      </button>
                   )}
                   {missionState === MissionState.IN_TRANSIT && (
                      <button onClick={() => handleStateTransition(MissionState.ARRIVED)} className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.2em] italic text-[10px] flex items-center justify-center gap-2 -skew-x-12 transition-all shadow-lg" style={{ boxShadow: `0 4px 15px rgba(16,185,129,0.4)` }}>
                         <MapPin className="w-4 h-4 skew-x-12" /> <span className="skew-x-12">Arrived at Drop-Off</span>
                      </button>
                   )}
                   {missionState === MissionState.ARRIVED && (
                       <div className="space-y-4 border border-[var(--agent-border)] p-4 rounded-xl bg-slate-950/40 relative text-left">
                          <div className="space-y-1">
                             <label className="text-[8px] font-black uppercase tracking-[0.2em] block" style={{ color: 'var(--agent-primary)' }}>
                                Verify Delivery Handoff Password (OTP)
                             </label>
                             <input 
                                type="text" 
                                maxLength={6}
                                value={otpInput}
                                onChange={(e) => {
                                   setOtpInput(e.target.value.replace(/[^0-9]/g, ""));
                                   setVerificationError("");
                                }}
                                placeholder="ENTER 6-DIGIT OTP" 
                                className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg h-10 px-4 text-center font-bold tracking-[0.2em] focus:outline-none focus:border-[var(--agent-primary)] transition-colors placeholder:text-slate-700 placeholder:tracking-normal placeholder:font-medium placeholder:text-[10px]"
                             />
                              {verificationError && (
                                <p className="text-red-500 text-[8px] font-bold text-center mt-1 uppercase tracking-widest animate-pulse break-words px-2">
                                   ⚠️ {verificationError}
                                </p>
                             )}
                          </div>

                          <div className="flex flex-col gap-2">
                             <button 
                                onClick={() => verifyOtp(otpInput)}
                                disabled={otpInput.length !== 6}
                                className="w-full h-10 text-white font-black uppercase tracking-[0.2em] italic text-[10px] flex items-center justify-center gap-2 -skew-x-12 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
                                style={{ backgroundColor: 'var(--agent-primary)', boxShadow: `0 4px 15px var(--agent-glow)` }}
                             >
                                <CheckCircle className="w-3.5 h-3.5 skew-x-12" /> 
                                <span className="skew-x-12">Verify & Finalize Node</span>
                             </button>

                             <button 
                                onClick={() => {
                                   const cleanId = typeof orderId === 'string' ? orderId : String(orderId || "123");
                                   const numericId = parseInt(cleanId.replace(/[^0-9]/g, "")) || 123;
                                   const computed = String((numericId * 997 + 12345) % 900000 + 100000);
                                   setOtpInput(computed);
                                   verifyOtp(computed);
                                }}
                                className="w-full h-9 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white font-bold uppercase tracking-[0.1em] text-[8px] flex items-center justify-center gap-1 border border-slate-800 transition-all"
                             >
                                Simulate QR Scanner Input
                             </button>
                          </div>
                       </div>
                    )}
                   {missionState === MissionState.DELIVERED && (
                      <div className="p-3 flex items-center gap-4 -skew-x-12 border" style={{ backgroundColor: '#10B9811A', borderColor: '#10B9814D' }}>
                         <div className="w-8 h-8 bg-emerald-500/20 flex items-center justify-center text-emerald-400 skew-x-12">
                            <ShieldCheck className="w-5 h-5" />
                         </div>
                         <div className="skew-x-12">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Mission Accomplished</p>
                            <p className="text-[7px] font-bold text-emerald-400/60 uppercase tracking-widest mt-0.5">Registry Node Finalized</p>
                         </div>
                      </div>
                   )}
                </div>
             </div>
          </Card>
       </div>
    </div>
  
  );
}

export default function AgentTrackingControl() {
  return (

    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--agent-bg)' }}>
        <Navigation className="w-12 h-12 animate-bounce" style={{ color: 'var(--agent-primary)' }} />
        <p className="text-[8px] font-black uppercase tracking-[0.5em] opacity-40" style={{ color: 'var(--agent-primary)' }}>Acquiring Tactical Vector...</p>
      </div>
    }>
      <AgentTrackingContent />
    </Suspense>
  
  );
}

