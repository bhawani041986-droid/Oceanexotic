"use client";

import * as React from "react";
import { AlertCircle, RotateCcw, Home, RefreshCw, Anchor, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
// Using relative path to eliminate alias resolution latency during disruption
import { cn } from "../lib/utils";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // High-Integrity Diagnostic Logging
    if (typeof window !== "undefined") {
      console.log("MARITIME_REGISTRY_SIGNAL_DISRUPTION:", error.message);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-8 relative overflow-hidden font-sans">
      {/* Abyssal Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
         <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-danger/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-xl w-full relative z-10 space-y-12 text-center">
        {/* Disruption Icon */}
        <div className="relative inline-block group">
           <div className={cn(
             "w-24 h-24 rounded-[32px] bg-danger/10 border border-danger/20 flex items-center justify-center text-danger shadow-glow-purple relative overflow-hidden transition-transform duration-700 group-hover:rotate-[360deg]"
           )}>
              <AlertCircle className="w-12 h-12 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-danger/20 to-transparent" />
           </div>
           <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-[#0B1120] border border-danger/40 flex items-center justify-center text-danger animate-bounce">
              <ShieldAlert className="w-4 h-4" />
           </div>
        </div>

        {/* Narrative */}
        <div className="space-y-4">
           <h2 className="text-4xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Registry Disruption</h2>
           <p className="text-[12px] font-black text-text-secondary uppercase tracking-[0.3em] leading-relaxed max-w-sm mx-auto">
              A critical technical handshake has failed within the <span className="text-danger font-bold">Maritime Node Registry</span>.
           </p>
        </div>

        {/* Action Handshakes */}
        <div className="space-y-6 pt-4">
           <Button 
             onClick={() => reset()}
             className="w-full h-16 bg-danger hover:bg-danger/80 text-white text-[11px] font-black tracking-[0.2em] uppercase shadow-glow-purple gap-4 transition-all"
           >
              <RefreshCw className="w-5 h-5" /> RETRY SOVEREIGN HANDSHAKE
           </Button>
           
           <div className="flex flex-col items-center gap-6">
              <a 
                href="/admin/dashboard"
                className="text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-[var(--foreground)] transition-all flex items-center gap-3 border-b border-[var(--foreground)]/10 pb-1"
              >
                 <Anchor className="w-4 h-4" /> RETURN TO SOVEREIGN PORT
              </a>
              
              {/* Technical Telemetry */}
              <div className={cn("p-6 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 w-full")}>
                 <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2 text-left">Technical Telemetry</p>
                 <p className="text-[10px] font-mono text-danger/80 break-all leading-tight text-left">
                    {error.message || "SIGNAL_LOSS_PROTOCOL_X9"}
                 </p>
              </div>
           </div>
        </div>

        {/* Security Footer */}
        <div className="flex justify-center gap-10 opacity-20">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
              <span className="text-[8px] font-black text-[var(--foreground)] uppercase tracking-widest">DISRUPTION DETECTED</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[8px] font-black text-[var(--foreground)] uppercase tracking-widest">ENCRYPTION INTEGRITY: SECURE</span>
           </div>
        </div>
      </div>
    </div>
  );
}
