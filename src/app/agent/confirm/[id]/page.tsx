"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  Lock,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AgentConfirmPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlOtp = searchParams.get("otp");

  const [status, setStatus] = React.useState<'pending' | 'verifying' | 'synced'>('pending');
  const [progress, setProgress] = React.useState(0);
  const [otpInput, setOtpInput] = React.useState("");
  const [error, setError] = React.useState("");

  const verifyOtp = (code: string) => {
    const cleanId = typeof id === 'string' ? id : String(id || "123");
    const numericId = parseInt(cleanId.replace(/[^0-9]/g, "")) || 123;
    const expectedOtp = String((numericId * 997 + 12345) % 900000 + 100000);

    if (code.trim() === expectedOtp) {
      setError("");
      setStatus('verifying');
      
      // Update DB status to DELIVERED
      fetch("/api/seller/orders.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: cleanId,
          status: "DELIVERED"
        })
      }).catch(err => console.error("Database update error:", err));

      let prog = 0;
      const interval = setInterval(() => {
        prog += 5;
        setProgress(prog);
        if (prog >= 100) {
          clearInterval(interval);
          setStatus('synced');
        }
      }, 50);
    } else {
      setError("Invalid Delivery Handoff OTP. Please check with customer.");
    }
  };

  React.useEffect(() => {
    if (urlOtp) {
      setOtpInput(urlOtp);
      verifyOtp(urlOtp);
    }
  }, [urlOtp]);

  const handleManualVerify = () => {
    verifyOtp(otpInput);
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
              <p className="text-[11px] font-mono text-white">OX-{(id || "123").toString().slice(-4).toUpperCase()}-SYNC-NODE</p>
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
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                  Enter 6-Digit Handoff OTP
                </label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value.replace(/[^0-9]/g, ""));
                    setError("");
                  }}
                  placeholder="e.g. 123456" 
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl h-14 px-5 text-center text-xl font-bold tracking-[0.3em] focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-700 placeholder:tracking-normal placeholder:font-medium placeholder:text-sm"
                />
                {error && (
                  <p className="text-red-500 text-[10px] font-bold text-center mt-1 uppercase tracking-widest animate-pulse">
                    ⚠️ {error}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleManualVerify}
                  disabled={otpInput.length !== 6}
                  className="w-full h-16 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center gap-3 group transition-all"
                >
                  <span className="font-black uppercase tracking-[0.2em] text-[12px]">Verify & Handoff</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="text-center py-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">- OR -</span>
                </div>

                <Button 
                  onClick={() => {
                    const cleanId = typeof id === 'string' ? id : String(id || "123");
                    const numericId = parseInt(cleanId.replace(/[^0-9]/g, "")) || 123;
                    const computed = String((numericId * 997 + 12345) % 900000 + 100000);
                    setOtpInput(computed);
                    verifyOtp(computed);
                  }}
                  variant="outline"
                  className="w-full h-12 border border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 rounded-xl flex items-center justify-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest"
                >
                  <Fingerprint className="w-4 h-4" /> Simulate QR Scan
                </Button>
              </div>
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
