"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { 
  Ship, 
  MapPin, 
  Truck, 
  Waves, 
  Globe, 
  Clock, 
  Anchor,
  Activity,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const SHIPMENTS = [
  { id: "SHP-8821", order: "#ORD-9982", destination: "New York Port", status: "IN TRANSIT", temp: "-62°C", vessel: "Ocean Voyager" },
  { id: "SHP-8820", order: "#ORD-9981", destination: "London Port", status: "PREPARING", temp: "-60°C", vessel: "Arctic Swift" },
  { id: "SHP-8819", order: "#ORD-9980", destination: "Tokyo Port", status: "DELIVERED", temp: "-58°C", vessel: "Pacific Pearl" },
];

export default function SellerShippingPage() {
  return (

    <div className="space-y-[10px] md:space-y-12 pt-4 md:pt-10 pb-32 md:pb-10 px-4 md:px-0 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Logistics Command</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Governing Global Fleet Movements & Cold-Chain Integrity</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
           <Button variant="outline" className="h-12 md:h-14 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2 md:gap-3 border-[var(--foreground)]/5 rounded-lg md:rounded-[20px] italic">
              <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> DEFINE PORTS
           </Button>
           <Button variant="primary" className="h-12 md:h-14 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-[20px] italic">
             <Ship className="w-3.5 h-3.5 md:w-4 md:h-4" /> COMMISSION VESSEL
           </Button>
        </div>
      </div>

      {/* Logistics Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] md:gap-6">
        {[
          { label: "Active Vessels", value: "8", icon: <Ship className="text-primary" /> },
          { label: "In Transit", value: "42", icon: <Waves className="text-primary" /> },
          { label: "Cold-Chain Sync", value: "100%", icon: <ShieldCheck className="text-success" /> },
          { label: "Avg. Fulfillment", value: "₹4.2L", icon: <Clock className="text-warning" /> },
        ].map((stat) => (
          <Card key={stat.label} className="p-[10px] md:p-8 space-y-2 md:space-y-4 bg-bg-secondary/20 border-[var(--foreground)]/5 group hover:border-primary/20 transition-all rounded-xl md:rounded-[24px] shadow-glow-purple/5">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-[12px] bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              {React.cloneElement(stat.icon as React.ReactElement, { className: "w-4 h-4 md:w-5 md:h-5" })}
            </div>
            <div className="space-y-0.5 md:space-y-1">
               <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest leading-none italic opacity-60">{stat.label}</p>
               <h4 className="text-lg md:text-2xl font-black text-[var(--foreground)] italic tracking-tighter">{stat.value}</h4>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px] md:gap-10">
         {/* Fleet Ledger Section */}
         <div className="md:col-span-2 space-y-[10px] md:space-y-6">
            <div className="px-1 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase flex items-center gap-2 md:gap-3 italic">
                   <Activity className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Live Fleet Tracking
                </h3>
                <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Status of all dispatched harvests</p>
              </div>
              <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 uppercase text-[7px] md:text-[8px] tracking-widest hidden sm:flex italic">3 IN TRANSIT</Badge>
            </div>

            {/* Mobile: Shipment Cards */}
            <div className="grid grid-cols-1 gap-[10px] md:hidden">
              {SHIPMENTS.map((shp) => (
                <Card key={shp.id} className="p-[10px] space-y-3 rounded-[20px] bg-bg-secondary/20 border-[var(--foreground)]/5 shadow-glow-purple/5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <p className="text-[7px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Fleet Identifier</p>
                      <p className="text-[11px] font-black text-[var(--foreground)] uppercase italic tracking-tighter">{shp.id}</p>
                    </div>
                    <Badge variant={shp.status === "DELIVERED" ? "success" : shp.status === "IN TRANSIT" ? "primary" : "warning"} className="h-5 text-[7px] px-1.5 shadow-glow-purple italic uppercase">
                      {shp.status}
                    </Badge>
                  </div>

                  <div className="p-3 bg-[var(--foreground)]/5 rounded-xl border border-[var(--foreground)]/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black text-text-secondary uppercase italic opacity-60">Destination</span>
                      <span className="text-[10px] font-black text-[var(--foreground)] italic">{shp.destination}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black text-text-secondary uppercase italic opacity-60">Cold-Chain</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-success shadow-glow-purple" />
                        <span className="text-[9px] font-black text-[var(--foreground)] italic">{shp.temp}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black text-text-secondary uppercase italic opacity-60">Vessel Node</span>
                      <span className="text-[9px] font-black text-[var(--foreground)] italic">{shp.vessel}</span>
                    </div>
                  </div>

                  <Link href={`/seller/shipping/${shp.id}`} className="block">
                    <Button variant="primary" className="w-full h-10 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-glow-purple flex items-center justify-center gap-2 italic">
                      INITIATE TRACKING <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>

            {/* Desktop: Shipment Table */}
            <Card className="hidden md:block p-1 rounded-[24px] overflow-hidden bg-bg-secondary/20 shadow-premium border-[var(--foreground)]/5">
               <Table>
                  <TableHeader>
                     <TableRow className="border-[var(--foreground)]/5">
                        <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Fleet ID</TableHead>
                        <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Destination</TableHead>
                        <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Cold-Chain</TableHead>
                        <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Logistics Status</TableHead>
                        <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Directive</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {SHIPMENTS.map((shp) => (
                       <TableRow key={shp.id} className="group border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                          <TableCell>
                             <div className="space-y-0.5">
                                <p className="font-black text-[var(--foreground)] text-xs md:text-sm uppercase tracking-tighter italic">{shp.id}</p>
                                <p className="text-[8px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{shp.vessel}</p>
                             </div>
                          </TableCell>
                          <TableCell className="text-[10px] md:text-xs font-black text-text-secondary italic opacity-60">{shp.destination}</TableCell>
                          <TableCell>
                             <div className="flex items-center gap-1.5 md:gap-2">
                                <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-success shadow-glow-purple" />
                                <span className="text-[9px] md:text-[10px] font-black text-[var(--foreground)] italic">{shp.temp}</span>
                             </div>
                          </TableCell>
                          <TableCell>
                             <Badge variant={shp.status === "DELIVERED" ? "success" : shp.status === "IN TRANSIT" ? "primary" : "warning"} className="shadow-glow-purple italic uppercase text-[8px] md:text-[10px] px-2">
                                {shp.status}
                             </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                             <Link href={`/seller/shipping/${shp.id}`}>
                               <Button variant="ghost" size="sm" className="text-[8px] md:text-[9px] font-black uppercase flex items-center gap-1.5 md:gap-2 group-hover:text-primary transition-colors italic border border-[var(--foreground)]/5 rounded-lg">
                                   TRACK <ArrowRight className="w-3 md:w-3.5 h-3 md:h-3.5" />
                               </Button>
                             </Link>
                          </TableCell>
                       </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </Card>
         </div>

         {/* Logistics Configuration Area */}
         <div className="space-y-4 md:space-y-8">
            <Card className="p-[10px] md:p-10 space-y-4 md:space-y-8 rounded-[24px] md:rounded-[28px] bg-bg-secondary/20 border-[var(--foreground)]/5 shadow-glow-purple/5">
               <div className="flex items-center gap-3 md:gap-4 border-b border-[var(--foreground)]/5 pb-4 md:pb-6">
                  <Globe className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Sourcing Reach</h3>
               </div>
               <div className="space-y-2 md:space-y-6">
                  {[
                    { label: "North Atlantic Sector", status: "OPTIMAL", active: true },
                    { label: "Pacific Rim Basin", status: "OPTIMAL", active: true },
                    { label: "Arctic Harvest Node", status: "STANDBY", active: false },
                  ].map((zone) => (
                    <div key={zone.label} className="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-[16px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5">
                       <p className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic">{zone.label}</p>
                       <Badge variant={zone.active ? "success" : "secondary"} className="text-[6px] md:text-[7px] italic uppercase">
                          {zone.status}
                       </Badge>
                    </div>
                  ))}
               </div>
               <Button variant="outline" className="w-full h-10 md:h-12 text-[9px] md:text-[10px] font-black tracking-widest uppercase border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/5 rounded-lg md:rounded-[16px] italic">
                  UPDATE DIRECTIVES
               </Button>
            </Card>

            <Card className="p-[10px] md:p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 space-y-2 md:space-y-4 rounded-[24px] shadow-glow-purple/5">
               <div className="flex items-center gap-3 md:gap-4">
                  <Anchor className="w-4 h-4 md:w-5 md:h-5 text-primary shadow-glow-purple" />
                  <p className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic opacity-60">Efficiency Rank</p>
               </div>
               <div className="space-y-0.5 md:space-y-1">
                  <p className="text-xl md:text-3xl font-black text-[var(--foreground)] uppercase tracking-tighter italic">GOLD TIER</p>
                  <p className="text-[8px] md:text-[9px] font-black text-text-secondary italic leading-relaxed opacity-60">Top 5% of marketplace nodes.</p>
               </div>
            </Card>
         </div>
      </div>
    </div>
  
  );
}
