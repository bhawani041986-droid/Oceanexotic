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
  Anchor,
  Layers
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import dynamic from "next/dynamic";

const PortBlairMap = dynamic(() => import("@/components/ui/PortBlairMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center border-2 border-dashed border-slate-800">
      <Layers className="w-8 h-8 text-primary/50 animate-pulse mb-3" />
      <p className="text-[10px] uppercase tracking-widest text-primary/50 font-black">Initializing Nav Grid</p>
    </div>
  )
});

export default function OrderTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [trackingData, setTrackingData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [recenterTrigger, setRecenterTrigger] = React.useState(0);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch(`/api/delivery?order_id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setTrackingData(data);
      }
    } catch (error) {
      console.error("Tracking Error:", error);
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
    logs: [{ time: "Now", status: "Order Picked Up", location: "Andaman Sector", active: true }]
  };



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
                <p className="text-text-secondary font-medium uppercase tracking-[0.2em] text-[8px] lg:text-[11px]">ID: {id} • DELIVERY AGENT: {displayData.agent_name || "ASSIGNING..."}</p>
              </div>
              <div className="p-3 lg:p-6 rounded-2xl lg:rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center gap-3 lg:gap-6">
                 <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Droplets className="w-4 h-4 lg:w-6 lg:h-6 animate-pulse" />
                 </div>
                 <div className="space-y-0">
                    <p className="text-[8px] lg:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest leading-none">Temperature</p>
                    <p className="text-sm lg:text-xl font-black text-primary leading-tight">{displayData.current_temp}°C STABLE</p>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
               <div className="lg:col-span-2 relative overflow-hidden bg-bg-secondary rounded-[24px] lg:rounded-[40px] border border-[var(--foreground)]/10 h-[350px] lg:h-[450px] transition-all duration-500 shadow-lg">
                  <style>{`
                    .leaflet-tooltip-dark {
                      background: rgba(15, 23, 42, 0.9);
                      border: 1px solid rgba(255, 255, 255, 0.1);
                      color: white;
                      font-size: 10px;
                      font-weight: 700;
                      letter-spacing: .05em;
                      border-radius: 6px;
                      padding: 4px 8px;
                      text-transform: uppercase;
                    }
                    .leaflet-tooltip-dark::before {
                      border-top-color: rgba(15, 23, 42, 0.9);
                    }
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

                  <PortBlairMap
                    driverLat={displayData.current_lat || 13.160704}
                    driverLng={displayData.current_lng || 92.946892}
                    deliveryLat={13.160704}
                    deliveryLng={92.946892}
                    status={displayData.status}
                    recenterTrigger={recenterTrigger}
                    className="w-full h-full rounded-[22px] lg:rounded-[38px] z-0"
                  />

                  {/* Radar sweep */}
                  <div className="absolute inset-0 pointer-events-none z-[400] overflow-hidden">
                    <div className="w-full h-[1px] shadow-[0_0_20px_var(--primary)] animate-radar-sweep opacity-40 bg-primary" />
                  </div>

                  {/* Top-Left Skewed Node HUD */}
                  <div className="absolute top-3 left-3 z-[1000] space-y-1.5 pointer-events-none">
                    <div className="relative -skew-x-12 px-3 py-1 shadow-lg bg-primary">
                      <span className="block skew-x-12 text-[9px] font-black uppercase tracking-widest text-white italic">
                        Node: Sentinel-01
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 backdrop-blur-md border border-primary/30 -skew-x-12 bg-slate-950/80">
                      <div className={cn("w-1.5 h-1.5 skew-x-12 rounded-full", loading ? "bg-slate-500 animate-pulse" : "bg-emerald-500 shadow-[0_0_8px_#10B981]")} />
                      <span className="skew-x-12 text-[8px] font-bold uppercase tracking-[0.2em] text-primary">
                        Tracking: {loading ? "Locking..." : "Catalog Live"}
                      </span>
                    </div>
                  </div>

                  {/* Bottom-Left Arrival Overlay */}
                  <div className="absolute bottom-3 left-3 right-16 p-2.5 lg:p-4 rounded-xl lg:rounded-[20px] bg-slate-950/95 border border-primary/30 flex items-center justify-between z-[1000] shadow-2xl pointer-events-none">
                      <div className="flex items-center gap-3 lg:gap-4">
                         <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-[8px] lg:rounded-[10px] bg-primary/10 flex items-center justify-center text-primary relative">
                            <Truck className="w-4 h-4 lg:w-5 lg:h-5" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 lg:w-2.5 lg:h-2.5 bg-success rounded-full border border-white animate-pulse" />
                         </div>
                         <div className="space-y-0">
                            <p className="text-[6px] lg:text-[7px] font-black text-text-secondary uppercase tracking-widest leading-none">Arrival</p>
                            <p className="text-sm lg:text-lg font-black text-white uppercase leading-tight">{displayData.estimated_arrival}</p>
                         </div>
                      </div>
                      <div className="flex flex-col items-end space-y-0">
                         <p className="text-[6px] lg:text-[7px] font-black text-text-secondary uppercase tracking-widest leading-none">Coordinates</p>
                         <p className="text-[8px] lg:text-[10px] font-black text-primary font-mono opacity-80 leading-tight">
                            {displayData.current_lat?.toFixed(3)}, {displayData.current_lng?.toFixed(3)}
                         </p>
                      </div>
                  </div>

                  {/* Bottom-Right Skewed Controls */}
                  <div className="absolute bottom-3 right-3 z-[1000] flex flex-col gap-1.5">
                    <button
                      onClick={() => {
                        toast("Map Recalibrated", "success");
                      }}
                      className="w-9 h-9 border flex items-center justify-center -skew-x-12 transition-all hover:bg-primary/20 bg-slate-950/90 border-primary/30 text-primary"
                    >
                      <Layers className="w-4 h-4 skew-x-12" />
                    </button>
                    <button
                      onClick={() => {
                        setRecenterTrigger(prev => prev + 1);
                        toast("Recentered on Driver Signal", "success");
                      }}
                      className="w-9 h-9 border flex items-center justify-center -skew-x-12 hover:bg-primary hover:text-white transition-all bg-slate-950/90 border-primary/30 text-primary"
                    >
                      <NavigationIcon className="w-4 h-4 skew-x-12" />
                    </button>
                  </div>
               </div>

               <div className="space-y-4 lg:space-y-8">
                  <div className="space-y-1">
                     <h2 className="text-base lg:text-xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">TRACKING HISTORY</h2>
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
                     <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/80">Package Delivered</span>
                  </Card>
               </div>
            </div>
          </div>
        </div>
    </div>
  );
}
