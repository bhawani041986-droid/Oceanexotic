"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Zap, 
  MapPin, 
  Truck, 
  ChevronRight, 
  Activity, 
  Fingerprint,
  RefreshCw,
  CheckCircle2,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AgentConfirmPage() {
  const { id } = useParams(
  );
  const router = useRouter(
  );
  const [status, setStatus] = React.useState<'pending' | 'verifying' | 'synced'>('pending'
  );
  const [progress, setProgress] = React.useState(0
  );

  const startVerification = () => {
    setStatus('verifying'
  );
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval
  );
          setStatus('synced'
  );
          return 100;
        }
        return prev + 2;
      }
  );
    }, 50
  );
  };

  return (

    <div className="min-h-screen bg-[#020617] text-white font-sans p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* BACKGROUND AMBIENCE */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 relative z-10 shadow-2xl"
      >
        {/* HEADER SECTION */}
        <div className="flex flex-col items-center text-center gap-6 mb-10">
          <div className="relative">
            <div className="absolute -inset-4 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
            <div className="w-20 h-20 bg-slate-800 rounded-full border border-white/10 flex items-center justify-center relative">
              {status === 'synced' ? (
                <ShieldCheck className="text-emerald-400 w-10 h-10" />
              ) : (
                <Lock className="text-blue-400 w-10 h-10" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">Agent Node Handoff</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em]">Operational Dispatch: {id}</p>
          </div>
        </div>

        {/* INTERFACE NODES */}
        <div className="space-y-4 mb-10">
          <div className="bg-white/5 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
              <Fingerprint size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Initialization Signature</p>
              <p className="text-[11px] font-mono text-white">OX-{id?.toString().slice(-4)}-SYNC-NODE</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>

          <div className="bg-white/5 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
              <MapPin size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Handoff Coordinate</p>
              <p className="text-[11px] font-medium text-white italic">Port Blair Sector-04 Hub</p>
            </div>
            <Activity className="w-4 h-4 text-slate-600" />
          </div>
        </div>

        {/* ACTIONS */}
        <AnimatePresence mode="wait">
          {status === 'pending' && (
            <motion.div 
              key="pending"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Button 
                onClick={startVerification}
                className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center gap-3 group transition-all"
              >
                <span className="font-black uppercase tracking-[0.2em] text-[12px]">Initialize Handshake</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          )}

          {status === 'verifying' && (
            <motion.div 
              key="verifying"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-blue-500"
                />
              </div>
              <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-blue-400">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Synchronizing Logistics Registry... {progress}%
              </div>
            </motion.div>
          )}

          {status === 'synced' && (
            <motion.div 
              key="synced"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl w-full text-center">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">Handoff Confirmed</p>
                <p className="text-sm font-medium text-slate-300">GPS Telemetry Synchronized Successfully.</p>
              </div>
              <Button 
                onClick={() => router.push('/agent/dashboard')}
                variant="ghost"
                className="text-slate-500 hover:text-white uppercase tracking-widest text-[10px] font-black"
              >
                Return to Command Center
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* FOOTER METADATA */}
      <div className="mt-12 flex flex-col items-center gap-2 relative z-10 opacity-40">
        <p className="text-[9px] font-black uppercase tracking-[0.5em]">Sovereign Node Verification</p>
        <div className="flex gap-4">
          <Zap size={12} />
          <Activity size={12} />
          <Globe size={12} />
        </div>
      </div>
    </div>
  
  );
}
