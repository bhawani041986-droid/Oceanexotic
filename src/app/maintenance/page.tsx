"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  ShieldAlert, 
  Activity, 
  Clock, 
  Waves, 
  Lock,
  Anchor,
  Zap
} from "lucide-react";

export default function MaintenancePage() {
  return (

    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-primary relative overflow-hidden">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10 grayscale" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-primary/80 to-primary/20" />
      
      <div className="max-w-xl w-full space-y-12 relative z-10 animate-fade-in text-center">
         
         <div className="space-y-6">
            <div className="w-24 h-24 rounded-[30px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-glow-purple relative animate-pulse">
               <Anchor className="w-12 h-12" />
               <div className="absolute -top-2 -right-2">
                  <Badge variant="danger" className="h-8 w-8 rounded-full p-0 flex items-center justify-center border-2 border-bg-primary">
                     <Lock className="w-4 h-4" />
                  </Badge>
               </div>
            </div>
            <div className="space-y-4">
               <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 uppercase text-[10px] tracking-[0.4em] h-10 px-8">
                  PLATFORM STASIS ACTIVE
               </Badge>
               <h1 className="text-5xl lg:text-6xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-none">
                  Deep Sea <span className="text-primary">Sync.</span>
               </h1>
               <p className="text-lg font-medium text-text-secondary leading-relaxed italic max-w-md mx-auto">
                  The global maritime registry is currently undergoing a sovereign synchronization protocol.
               </p>
            </div>
         </div>

         <Card className="p-10 lg:p-14 space-y-10 bg-bg-secondary/40 border-[var(--foreground)]/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32" />
            
            <div className="grid grid-cols-2 gap-8 relative z-10">
               <div className="space-y-2">
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Expected Restoration</p>
                  <div className="flex items-center justify-center gap-3 text-2xl font-black text-[var(--foreground)]">
                     <Clock className="w-6 h-6 text-primary" /> 14:00 GMT
                  </div>
               </div>
               <div className="space-y-2">
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Node Integrity</p>
                  <div className="flex items-center justify-center gap-3 text-2xl font-black text-success">
                     <Activity className="w-6 h-6" /> SECURE
                  </div>
               </div>
            </div>

            <div className="pt-10 border-t border-[var(--foreground)]/5 space-y-6 relative z-10">
               <div className="flex items-center justify-center gap-8">
                  <div className="flex items-center gap-3 text-[9px] font-black text-text-secondary uppercase tracking-[0.2em]">
                     <Zap className="w-4 h-4 text-primary" /> TRADE NODES: STANDBY
                  </div>
                  <div className="flex items-center gap-3 text-[9px] font-black text-text-secondary uppercase tracking-[0.2em]">
                     <Waves className="w-4 h-4 text-primary" /> COLD-CHAIN: ACTIVE
                  </div>
               </div>
            </div>
         </Card>

         <div className="space-y-4 opacity-40">
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.5em]">Global Maritime Authority Protocol 42-A</p>
            <div className="w-32 h-1 bg-[var(--foreground)]/10 mx-auto rounded-full overflow-hidden">
               <div className="w-2/3 h-full bg-primary animate-shimmer" />
            </div>
         </div>
      </div>
    </div>
  
  );
}
