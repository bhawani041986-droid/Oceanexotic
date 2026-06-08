"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Truck, 
  ShieldCheck, 
  ArrowLeft, 
  Droplets,
  Navigation as NavigationIcon,
  Home as HomeIcon,
  Anchor
} from "lucide-react";

export default function OrderTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [trackingData, setTrackingData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const mapRef = React.useRef<any>(null);
  const markerRef = React.useRef<any>(null);
  const customerMarkerRef = React.useRef<any>(null);
  const routingRef = React.useRef<any>(null);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch(`/api/fleet?order_id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setTrackingData(data);
      }
    } catch (error) {
      console.error("Telemetry Drift:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
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
    logs: [{ time: "Now", status: "Registry Live", location: "Andaman Sector", active: true }]
  };

  const initMapInstance = () => {
    const L = (window as any).L;
    const mapContainer = document.getElementById('map');
    if (!L || !mapContainer || mapRef.current) return;

    mapRef.current = L.map('map', { zoomControl: false }).setView([13.160704, 92.946892], 13);
    L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps'
    }).addTo(mapRef.current);

    // --- NEON MODERN MARITIME SENTINEL ICON (AGENT) ---
    const agentIcon = L.divIcon({
      className: 'sentinel-marker',
      html: `
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
          <style>
            @keyframes sentinel-pulse {
              0% { transform: scale(0.5); opacity: 0.8; }
              100% { transform: scale(1.8); opacity: 0; }
            }
          </style>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // --- SAFE HARBOR ICON (CUSTOMER) ---
    const customerIcon = L.divIcon({
      className: 'harbor-marker',
      html: `
        <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 50px; height: 50px; border: 2px dashed rgba(99, 102, 241, 0.4); border-radius: 50%; animation: harbor-rotate 10s linear infinite;"></div>
          <div style="width: 28px; height: 28px; background: #6366F1; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(99, 102, 241, 0.5); z-index: 2;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color: white;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <style>
            @keyframes harbor-rotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          </style>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    markerRef.current = L.marker([displayData.current_lat, displayData.current_lng], { icon: agentIcon }).addTo(mapRef.current);
    customerMarkerRef.current = L.marker([13.160704, 92.946892], { icon: customerIcon }).addTo(mapRef.current);
  };

  const updateMapElements = React.useCallback(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current || !markerRef.current) return;

    const lat = displayData.current_lat || 13.160704;
    const lng = displayData.current_lng || 92.946892;

    markerRef.current.setLatLng([lat, lng]);

    if (L.Routing) {
      if (routingRef.current) {
        try { routingRef.current.setWaypoints([L.latLng(lat, lng), L.latLng(13.160704, 92.946892)]); } catch (e) {}
      } else {
        routingRef.current = L.Routing.control({
          waypoints: [L.latLng(lat, lng), L.latLng(13.160704, 92.946892)],
          routeWhileDragging: false, show: false, addWaypoints: false, draggableWaypoints: false, fitSelectedRoutes: false,
          lineOptions: { styles: [{ color: '#00D1FF', weight: 4, opacity: 0.8, dashArray: '10, 15' }] }
        }).addTo(mapRef.current);
        routingRef.current.on('routingerror', () => console.warn("OSRM Handshake Delayed"));
      }
    }
  }, [displayData.current_lat, displayData.current_lng]);

  React.useEffect(() => {
    const loadLeaflet = () => {
      if (!(window as any).L) {
        const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link);
        const rCss = document.createElement('link'); rCss.rel = 'stylesheet'; rCss.href = 'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css'; document.head.appendChild(rCss);
        const script = document.createElement('script'); script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; script.async = true;
        script.onload = () => {
          const rJs = document.createElement('script'); rJs.src = "https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js"; rJs.async = true;
          rJs.onload = initMapInstance; 
          document.head.appendChild(rJs);
        };
        document.head.appendChild(script);
      } else { 
        // Small delay to ensure container is ready
        setTimeout(initMapInstance, 100); 
      }
    };
    loadLeaflet();
  }, []);

  React.useEffect(() => { updateMapElements(); }, [updateMapElements]);

  if (loading && !trackingData) {
    return (
      <div className="bg-bg-primary flex items-center justify-center text-white italic font-black uppercase tracking-widest text-[10px] py-40">Registry Sync...</div>
    );
  }

  return (
    <div className="bg-bg-primary">
        <div className="container mx-auto px-4 lg:px-10 py-4 lg:py-16">
          <div className="max-w-4xl mx-auto space-y-4 lg:space-y-12">
            
            <Button variant="ghost" onClick={() => router.back()} className="h-6 px-0 gap-2 text-[8px] font-black uppercase tracking-widest opacity-60 hover:opacity-100">
              <ArrowLeft className="w-3 h-3" /> BACK
            </Button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-8">
              <div className="space-y-1 lg:space-y-4">
                <div className="flex items-center gap-2 lg:gap-4">
                   <h1 className="text-2xl lg:text-[40px] font-black tracking-tight text-[var(--foreground)] leading-tight uppercase italic">LIVE TRACKING</h1>
                   <Badge variant="success" className="px-2 py-0.5 lg:px-4 lg:py-1.5 text-[8px] lg:text-[10px] shadow-glow-purple">{displayData.status}</Badge>
                </div>
                <p className="text-text-secondary font-medium uppercase tracking-[0.2em] text-[8px] lg:text-[11px]">ID: {id} • VESSEL: {displayData.agent_name || "ASSIGNING..."}</p>
              </div>
              <div className="p-3 lg:p-6 rounded-2xl lg:rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center gap-3 lg:gap-6">
                 <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Droplets className="w-4 h-4 lg:w-6 lg:h-6 animate-pulse" />
                 </div>
                 <div className="space-y-0">
                    <p className="text-[8px] lg:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest leading-none">Cold-Chain</p>
                    <p className="text-sm lg:text-xl font-black text-primary leading-tight">{displayData.current_temp}°C STABLE</p>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
               <Card className="lg:col-span-2 p-1 relative overflow-hidden bg-bg-secondary rounded-[24px] lg:rounded-[40px] border-[var(--foreground)]/5 h-[350px] lg:h-[450px]">
                  <div id="map" className="w-full h-full rounded-[22px] lg:rounded-[38px]" />
                  
                  <div className="absolute top-3 left-3 z-[1000] space-y-1 pointer-events-none">
                      <Badge variant="glass" className="bg-[var(--foreground)]/90 text-primary border-primary/20 uppercase tracking-[0.2em] text-[7px] font-black backdrop-blur-md">Maritime Command Map</Badge>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 p-2.5 lg:p-4 rounded-xl lg:rounded-[20px] bg-[var(--foreground)]/95 backdrop-blur-xl border border-[var(--foreground)]/10 flex items-center justify-between z-[1000] shadow-2xl pointer-events-none">
                      <div className="flex items-center gap-3 lg:gap-4">
                         <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-[8px] lg:rounded-[10px] bg-primary/10 flex items-center justify-center text-primary relative">
                            <Truck className="w-4 h-4 lg:w-5 lg:h-5" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 lg:w-2.5 lg:h-2.5 bg-success rounded-full border border-white animate-pulse" />
                         </div>
                         <div className="space-y-0">
                            <p className="text-[6px] lg:text-[7px] font-black text-text-secondary uppercase tracking-widest leading-none">Arrival</p>
                            <p className="text-sm lg:text-lg font-black text-bg-primary uppercase leading-tight">{displayData.estimated_arrival}</p>
                         </div>
                      </div>
                      <div className="flex flex-col items-end space-y-0">
                         <p className="text-[6px] lg:text-[7px] font-black text-text-secondary uppercase tracking-widest leading-none">Telemetry</p>
                         <p className="text-[8px] lg:text-[10px] font-black text-bg-primary font-mono opacity-80 leading-tight">
                            {displayData.current_lat?.toFixed(3)}, {displayData.current_lng?.toFixed(3)}
                         </p>
                      </div>
                  </div>
               </Card>

               <div className="space-y-4 lg:space-y-8">
                  <div className="space-y-1">
                     <h2 className="text-base lg:text-xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">MISSION REGISTRY</h2>
                  </div>
                  <div className="space-y-4 lg:space-y-8 relative before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-[var(--foreground)]/10">
                     {(displayData.logs || []).map((event: any, i: number) => (
                        <div key={i} className="relative pl-8 lg:pl-10 group">
                           <div className={cn("absolute left-1.5 top-1.5 w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full -translate-x-1/2 transition-all", event.active ? "bg-primary shadow-glow-purple scale-110 lg:scale-125" : "bg-white/20")} />
                           <div className="space-y-0.5 lg:space-y-1">
                              <p className={cn("text-[8px] lg:text-[10px] font-black uppercase tracking-widest", event.active ? "text-primary" : "text-text-secondary")}>{event.time}</p>
                              <p className={cn("text-xs lg:text-sm font-bold leading-tight", event.active ? "text-[var(--foreground)]" : "text-text-secondary/60")}>{event.status}</p>
                              <p className="text-[8px] lg:text-[10px] text-text-secondary/40 font-medium italic">{event.location}</p>
                           </div>
                        </div>
                     ))}
                  </div>
                  <Card className="p-4 lg:p-6 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 flex items-center gap-3">
                     <ShieldCheck className="w-4 h-4 lg:w-5 lg:h-5 text-success" />
                     <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/80">Harvest Secured</span>
                  </Card>
               </div>
            </div>
          </div>
        </div>
    </div>
  );
}
