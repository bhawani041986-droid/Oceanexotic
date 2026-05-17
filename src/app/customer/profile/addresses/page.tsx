"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  MapPin, 
  Plus, 
  Home as HomeIcon, 
  Briefcase, 
  Ship, 
  Edit3, 
  Trash2, 
  MoreVertical,
  CheckCircle2
} from "lucide-react";

const SAVED_PORTS = [
  { id: "ADDR-001", label: "PRIMARY DOCK", address: "North Jetty Road, Phoenix Bay, Port Blair, South Andaman", jetty: "Phoenix Bay Jetty", type: "HOME", primary: true },
  { id: "ADDR-002", label: "HARVEST DEPOT", address: "Govind Nagar No.1, Havelock Island (Swaraj Dweep)", jetty: "Havelock No.1 Jetty", type: "WORK", primary: false },
];

export default function CustomerAddressesPage() {
  return (

    <div className="max-w-4xl mx-auto space-y-[10px] md:space-y-12 pt-4 md:pt-10 pb-10 animate-fade-in px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 border-b border-[var(--foreground)]/5 pb-[10px] md:pb-10">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Port Registry</h2>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Managing Your Global Delivery Coordinates</p>
        </div>
        <Button variant="primary" className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-2 md:gap-3 rounded-lg md:rounded-xl">
          <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> COMMISSION NEW PORT
        </Button>
      </div>

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px] md:gap-8">
        {SAVED_PORTS.map((port) => (
          <Card 
            key={port.id} 
            className={`p-[10px] md:p-8 space-y-[10px] md:space-y-6 group transition-all hover:border-primary/40 rounded-[20px] md:rounded-[30px] ${port.primary ? "border-primary/20 bg-primary/5 shadow-glow-purple/10" : "bg-bg-secondary/40 border-white/5"}`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[16px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-primary shrink-0">
                {port.type === "HOME" ? <HomeIcon className="w-5 h-5 md:w-6 md:h-6" /> : port.type === "WORK" ? <Briefcase className="w-5 h-5 md:w-6 md:h-6" /> : <Ship className="w-5 h-5 md:w-6 md:h-6" />}
              </div>
              {port.primary && (
                <Badge variant="success" className="bg-success/20 text-success border-success/20 uppercase text-[8px] tracking-[0.2em] h-6 px-3">
                   <CheckCircle2 className="w-3 h-3 mr-2" /> PRIMARY
                </Badge>
              )}
            </div>

            <div className="space-y-1 md:space-y-2">
              <h4 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tight uppercase italic">{port.label}</h4>
              <p className="text-[10px] md:text-xs text-text-secondary font-medium leading-relaxed italic">
                {port.address}
              </p>
              {port.jetty && <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">Jetty: {port.jetty}</p>}
            </div>

            <div className="pt-6 border-t border-[var(--foreground)]/5 flex items-center justify-between">
               <div className="flex gap-2">
                  <button className="p-2.5 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all">
                     <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all">
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
               {!port.primary && (
                 <button className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">
                   SET AS PRIMARY
                 </button>
               )}
            </div>
          </Card>
        ))}

        {/* Add New Empty State */}
        <button className="group p-8 rounded-[30px] border-2 border-dashed border-[var(--foreground)]/5 hover:border-primary/40 transition-all flex flex-col items-center justify-center space-y-4 bg-transparent min-h-[240px]">
           <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-white transition-all">
              <Plus className="w-8 h-8" />
           </div>
           <div className="text-center">
              <p className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-widest">COMMISSION NEW DESTINATION</p>
              <p className="text-[9px] text-text-secondary font-medium mt-1">Register a new port in your logistics network.</p>
           </div>
        </button>
      </div>

      {/* Logistics Notice */}
      <Card className="p-[10px] md:p-10 bg-bg-secondary/40 border border-[var(--foreground)]/5 flex items-center gap-[10px] md:gap-8 rounded-[20px] md:rounded-[30px]">
         <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-[18px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Ship className="w-6 h-6 md:w-7 md:h-7" />
         </div>
         <div className="space-y-0.5 md:space-y-1">
            <h4 className="text-xs md:text-sm font-black text-[var(--foreground)] uppercase italic tracking-tight">Cold-Chain Logistics Routing</h4>
            <p className="text-[10px] md:text-xs text-text-secondary font-medium leading-relaxed italic">
               Saved addresses are used to calculate the most efficient thermal logistics route from the harvest node to your docking point.
            </p>
         </div>
      </Card>
    </div>
  
  );
}
