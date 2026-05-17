"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Navigation, 
  Waves, 
  Anchor, 
  Wind, 
  Thermometer, 
  Clock, 
  ShieldCheck, 
  Map as MapIcon,
  ChevronLeft,
  Activity,
  Signal,
  Wifi
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CustomerTrackPage() {
  const { id } = useParams(
  );
  const router = useRouter(
  );
  const [mounted, setMounted] = React.useState(false
  );

  React.useEffect(() => {
    setMounted(true
  );
  }, []
  );

  if (!mounted) return null;

  return (

    <div className="min-h-screen bg-[#020617] text-white font-sans overflow-hidden flex flex-col">
      
      {/* 1. TACTICAL HUD HEADER */}
      <header className="p-6 flex justify-between items-center bg-slate-900/40 backdrop-blur-xl border-b border-white/5 relative z-20">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="text-slate-500 hover:text-white"
          >
            <ChevronLeft size={20} />
          </Button>
          <div className="space-y-0.5">
            <h1 className="text-sm font-black uppercase tracking-widest leading-none">Live Telemetry Hub</h1>
            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em]">Transit Node: {id}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Signal Status</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Ultra-Stable</span>
              <Wifi size={12} className="text-emerald-400" />
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-slate-800">
            <Activity className="text-blue-400 w-5 h-5" />
          </div>
        </div>
      </header>

      {/* 2. THE MARITIME MAP CANVAS (SIMULATED) */}
      <div className="flex-1 relative bg-slate-950 overflow-hidden">
        {/* Map Grid Layer */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        {/* Vessel Node Animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Pulsing Radius */}
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -inset-16 bg-blue-500/20 rounded-full blur-2xl"
            />
            
            {/* Path Line (Simulated) */}
            <svg className="absolute -top-[200px] -left-[100px] w-[400px] h-[400px] pointer-events-none opacity-20">
              <path d="M 0 400 Q 200 200 400 0" fill="none" stroke="white" strokeWidth="2" strokeDasharray="8,8" />
            </svg>

            {/* The Vessel */}
            <motion.div 
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-16 h-16 bg-blue-600 rounded-2xl border-2 border-white/20 flex items-center justify-center shadow-glow-blue cursor-pointer group"
            >
              <Navigation className="text-white w-8 h-8 rotate-45" />
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[8px] font-black uppercase tracking-widest text-blue-400">Merchant Vessel: OCEAN-EX-01</p>
                <p className="text-[10px] font-bold">SPD: 12.4 KNOTS</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Port Nodes */}
        <div className="absolute top-1/4 left-1/4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-700 border-2 border-white/20" />
            <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Haddo Port</p>
          </div>
        </div>
        <div className="absolute bottom-1/4 right-1/4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-glow-green" />
            <p className="text-[8px] font-black uppercase text-emerald-400 tracking-widest">Sector-04 Hub (Dest)</p>
          </div>
        </div>

        {/* 3. FLOATING TELEMETRY WIDGETS */}
        <div className="absolute bottom-10 left-6 right-6 grid grid-cols-2 md:grid-cols-4 gap-4 z-20">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Est. Arrival</p>
              <p className="text-xs font-black">42 MINS</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400">
              <Waves size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sea State</p>
              <p className="text-xs font-black">CALM (0.5m)</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400">
              <Thermometer size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Cargo Temp</p>
              <p className="text-xs font-black">-18.4°C</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Registry</p>
              <p className="text-xs font-black italic">VERIFIED</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 4. SHIPMENT STATUS TIMELINE */}
      <div className="p-6 bg-slate-900/80 backdrop-blur-2xl border-t border-white/5 z-20">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Transit Milestones</h3>
            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-[8px] font-black text-blue-400 uppercase tracking-widest">Active Leg</span>
         </div>
         
         <div className="flex items-center gap-4">
            <div className="flex-1 h-1 bg-slate-800 rounded-full relative">
               <div className="absolute inset-y-0 left-0 w-2/3 bg-blue-500 shadow-glow-blue" />
               <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
               <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
               <div className="absolute top-1/2 left-2/3 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-600 border-2 border-white/20 animate-pulse shadow-glow-blue" />
               <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-700" />
            </div>
         </div>
         
         <div className="flex justify-between mt-4">
            <div className="text-left">
               <p className="text-[8px] font-black text-slate-500 uppercase">Departed</p>
               <p className="text-[10px] font-bold">Haddo Port</p>
            </div>
            <div className="text-center opacity-40">
               <p className="text-[8px] font-black text-slate-500 uppercase">In Transit</p>
               <p className="text-[10px] font-bold">Channel-02</p>
            </div>
            <div className="text-right">
               <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Incoming</p>
               <p className="text-[10px] font-bold text-blue-400">Sector-04 Hub</p>
            </div>
         </div>
      </div>

    </div>
  
  );
}
