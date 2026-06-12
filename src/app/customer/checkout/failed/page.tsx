"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, RefreshCw, MessageCircle, ShieldAlert, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function PaymentFailedPage() {
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

    <div className="bg-[#0B1120] min-h-screen text-white font-inter flex flex-col items-center justify-center p-6 selection:bg-primary/30">
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-danger/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-warning/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="bg-[#172033]/60 backdrop-blur-3xl border-[var(--foreground)]/5 rounded-[48px] p-10 md:p-16 text-center space-y-10 shadow-2xl relative overflow-hidden">
          {/* Top Gradient Bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-danger via-warning to-primary" />
          
          {/* Error Icon Node */}
          <div className="relative mx-auto w-32 h-32">
             <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ type: "spring", damping: 12, delay: 0.2 }}
               className="w-full h-full bg-danger/20 rounded-full flex items-center justify-center border-4 border-danger/30 shadow-glow-red"
             >
                <XCircle className="w-16 h-16 text-danger" />
             </motion.div>
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="absolute -top-2 -right-2 bg-warning w-10 h-10 rounded-full flex items-center justify-center border-4 border-[#172033] shadow-xl"
             >
                <AlertCircle className="w-4 h-4 text-[var(--foreground)]" />
             </motion.div>
          </div>

          <div className="space-y-4">
             <Badge className="bg-danger/20 text-danger border-danger/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic">Handshake Denied</Badge>
             <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">Authorization <br /><span className="text-danger">Failed</span></h1>
             <p className="text-text-secondary font-medium italic text-lg max-w-md mx-auto">The technical handshake with your financial registry has failed. No assets have been decommissioned from your account.</p>
          </div>

          {/* Diagnostic Telemetry */}
          <div className="p-8 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-[40px] text-left space-y-6">
             <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary italic">Diagnostic Logs</h4>
                <Badge variant="outline" className="text-[8px] border-[var(--foreground)]/10 text-text-secondary uppercase">ERR_AUTH_EXPIRED</Badge>
             </div>
             <div className="space-y-4">
                <div className="flex items-start gap-4">
                   <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center text-danger shrink-0 mt-1"><ShieldAlert className="w-4 h-4" /></div>
                   <p className="text-xs text-text-secondary italic leading-relaxed">The payment authorization window has timed out or the secondary registry node rejected the signature.</p>
                </div>
                <div className="flex items-start gap-4">
                   <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center text-warning shrink-0 mt-1"><RefreshCw className="w-4 h-4" /></div>
                   <p className="text-xs text-text-secondary italic leading-relaxed">Please verify your credentials and ensure your maritime credit registry has sufficient liquidity.</p>
                </div>
             </div>
          </div>

          {/* Action Hub */}
          <div className="flex flex-col md:flex-row gap-4 pt-4">
             <Button 
               onClick={() => router.push("/customer/checkout")}
               className="flex-1 h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest gap-3 shadow-glow-purple group"
             >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" /> RETRY HANDSHAKE
             </Button>
             <Button 
               onClick={() => router.push("/customer/support")}
               variant="outline"
               className="flex-1 h-16 rounded-2xl border-[var(--foreground)]/10 text-[var(--foreground)] font-black uppercase text-xs tracking-widest gap-3 hover:bg-[var(--foreground)]/5"
             >
                <MessageCircle className="w-4 h-4" /> SIGNAL SUPPORT
             </Button>
          </div>

          <button 
            onClick={() => router.push("/customer/cart")}
            className="flex items-center justify-center gap-2 mx-auto text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary hover:text-[var(--foreground)] transition-colors group"
          >
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> RETURN TO CART VAULT
          </button>
        </Card>

        {/* Footer Metadata */}
        <p className="mt-10 text-center text-[9px] font-black uppercase tracking-widest text-text-secondary opacity-40">
           System Security Protocol • Registry Integrity Verified
        </p>
      </motion.div>
    </div>
  
  );
}
