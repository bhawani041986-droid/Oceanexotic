"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Ship, 
  MapPin, 
  Truck, 
  Waves, 
  Clock, 
  ShieldCheck, 
  ArrowLeft, 
  Droplets,
  Anchor,
  Navigation,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SellerShipmentTrackingPage() {
  const { id } = useParams(
  );
  const router = useRouter(
  );

  // High-Fidelity Logistics Metadata for Sellers
  const trackingEvents = [
    { time: "09:42 AM", status: "Handshake: Final Mile Node", location: "New York Port Distribution", active: true },
    { time: "08:15 AM", status: "Vessel Docked & Verified", location: "NY Terminal 4", active: false },
    { time: "04:30 AM", status: "Mid-Transit Cold-Chain Sync", location: "Atlantic Sector 7", active: false },
    { time: "Yesterday", status: "Commission Dispatched", location: "Origin Port Node", active: false },
  ];

  return (

    <div className="space-y-12 pb-20 animate-fade-in">
      
      <div className="flex items-center justify-between">
         <Button 
           variant="ghost" 
           onClick={() => router.back()}
           className="group gap-3 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100"
         >
           <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> BACK TO LOGISTICS
         </Button>
         <div className="flex gap-4">
            <Button variant="outline" className="h-10 px-6 text-[9px] font-black tracking-widest uppercase border-[var(--foreground)]/5">
               CONTACT VESSEL
            </Button>
            <Button className="h-10 px-6 text-[9px] font-black tracking-widest uppercase shadow-glow-purple">
               RE-ROUTE DIRECTIVE
            </Button>
         </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[var(--foreground)]/5 pb-12">
         <div className="space-y-4">
            <div className="flex items-center gap-4">
               <h1 className="text-5xl font-black tracking-tighter text-[var(--foreground)] uppercase italic">{id}</h1>
               <Badge variant="success" className="px-4 py-1.5 shadow-glow-purple uppercase tracking-widest text-[9px]">IN TRANSIT</Badge>
            </div>
            <p className="text-text-secondary font-medium uppercase tracking-[0.2em] text-[11px]">Vessel: Ocean Voyager • Sector: North Atlantic</p>
         </div>
         <div className="text-right space-y-1">
            <div className="flex items-center gap-3 text-primary justify-end">
               <Droplets className="w-4 h-4 animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-widest">Cold-Chain Status</p>
            </div>
            <p className="text-4xl font-black text-[var(--foreground)] leading-none">-62.4°C <span className="text-sm font-medium text-text-secondary uppercase">Stable</span></p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Live Fleet Ledger Map Visualization */}
         <Card className="lg:col-span-2 p-1 relative overflow-hidden bg-bg-secondary rounded-[40px] border-[var(--foreground)]/5 h-[500px]">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-30 grayscale contrast-150 brightness-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />
            
            {/* Tracking Node Overlay */}
            <div className="absolute top-1/3 left-1/3 group">
               <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-ping absolute -inset-0" />
               <div className="relative w-16 h-16 rounded-full bg-bg-primary border-2 border-primary flex items-center justify-center shadow-glow-purple text-primary">
                  <Ship className="w-8 h-8" />
               </div>
            </div>

            <div className="absolute bottom-10 left-10 right-10 p-10 rounded-[32px] bg-bg-primary/95 backdrop-blur-2xl border border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-8">
                  <div className="w-16 h-16 rounded-[22px] bg-primary/10 flex items-center justify-center text-primary">
                     <Activity className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Fleet Telemetry</p>
                     <p className="text-2xl font-black text-[var(--foreground)]">4.2 NM TO PORT</p>
                  </div>
               </div>
               <div className="text-right space-y-2">
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic">Est. Handshake</p>
                  <p className="text-sm font-bold text-[var(--foreground)] uppercase tracking-tighter">18:45 LOCAL TIME</p>
               </div>
            </div>
         </Card>

         {/* Logistics Directives & Timeline */}
         <div className="space-y-8">
            <div className="space-y-1">
               <h3 className="text-xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">TRANSIT DIRECTIVES</h3>
               <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Live Logistics Handshake Chain</p>
            </div>
            
            <div className="space-y-10 relative before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-[var(--foreground)]/5">
               {trackingEvents.map((event, i) => (
                  <div key={i} className="relative pl-12 group">
                     <div className={cn(
                        "absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full -translate-x-1/2 transition-all duration-500",
                        event.active ? "bg-primary shadow-glow-purple scale-125" : "bg-white/10"
                     )} />
                     <div className="space-y-1">
                        <p className={cn(
                           "text-[10px] font-black uppercase tracking-widest",
                           event.active ? "text-primary" : "text-text-secondary"
                        )}>{event.time}</p>
                        <h4 className={cn(
                           "text-base font-bold",
                           event.active ? "text-[var(--foreground)]" : "text-text-secondary/40"
                        )}>{event.status}</h4>
                        <p className="text-[11px] text-text-secondary/30 font-medium italic">{event.location}</p>
                     </div>
                  </div>
               ))}
            </div>

            <Card className="p-8 bg-primary/5 border-primary/20 space-y-6">
               <div className="flex items-center gap-4">
                  <ShieldCheck className="w-5 h-5 text-success shadow-glow-purple" />
                  <p className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">Integrity Handshake</p>
               </div>
               <p className="text-[11px] text-text-secondary leading-relaxed font-medium italic">All nodes have verified cold-chain integrity for this commission.</p>
               <Button variant="outline" className="w-full h-12 text-[10px] font-black tracking-widest uppercase border-primary/20 hover:bg-primary/10">
                  EXPORT LOGISTICS MANIFEST
               </Button>
            </Card>
         </div>
      </div>

    </div>
  
  );
}
