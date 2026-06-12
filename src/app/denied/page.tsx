"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Lock, 
  ShieldX, 
  ArrowLeft, 
  Fingerprint, 
  Terminal,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function AccessDeniedPage() {
  return (

    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Security Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.05),transparent_70%)]" />
      
      <div className="max-w-2xl w-full space-y-12 relative z-10">
         <div className="text-center space-y-6">
            <div className="relative inline-block">
               <div className="w-24 h-24 rounded-[28px] bg-warning/10 border border-warning/20 flex items-center justify-center text-warning shadow-glow-amber animate-pulse">
                  <ShieldX className="w-12 h-12" />
               </div>
               <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-bg-primary border-4 border-bg-primary flex items-center justify-center text-warning">
                  <Fingerprint className="w-6 h-6" />
               </div>
            </div>
            <div className="space-y-2">
               <h1 className="text-4xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-none text-glow-amber">Access Refused.</h1>
               <p className="text-[10px] font-black text-warning uppercase tracking-[0.4em]">INSUFFICIENT AUTHORITY CLEARANCE</p>
            </div>
            <p className="text-sm text-text-secondary font-medium leading-relaxed italic max-w-md mx-auto">
               You are attempting to access a high-authority governance node without the required maritime identity clearance. Your attempt has been logged.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-8 bg-bg-secondary/40 border-warning/20 space-y-6 group">
               <div className="w-12 h-12 rounded-[16px] bg-white/5 border border-white/5 flex items-center justify-center text-warning group-hover:bg-warning group-hover:text-white transition-all">
                  <Lock className="w-6 h-6" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-tight">Authority Login</h3>
                  <p className="text-[10px] text-text-secondary leading-relaxed font-medium italic">Commission your administrative keys at the System Gateway.</p>
               </div>
               <Link href="/admin/login">
                  <Button variant="ghost" className="w-full h-12 text-[10px] font-black tracking-widest uppercase flex items-center justify-between group-hover:text-warning">
                     AUTHORIZE <ChevronRight className="w-4 h-4" />
                  </Button>
               </Link>
            </Card>

            <Card className="p-8 bg-bg-secondary/40 border-[var(--foreground)]/5 space-y-6 group">
               <div className="w-12 h-12 rounded-[16px] bg-white/5 border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <ArrowLeft className="w-6 h-6" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-tight">Public Port</h3>
                  <p className="text-[10px] text-text-secondary leading-relaxed font-medium italic">Return to the public marketplace to browse available harvests.</p>
               </div>
               <Link href="/customer">
                  <Button variant="ghost" className="w-full h-12 text-[10px] font-black tracking-widest uppercase flex items-center justify-between group-hover:text-primary">
                     RETREAT <ChevronRight className="w-4 h-4" />
                  </Button>
               </Link>
            </Card>
         </div>

         <div className="pt-10 border-t border-[var(--foreground)]/5 text-center flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-[9px] font-black text-text-secondary uppercase tracking-[0.3em]">
               <Terminal className="w-3.5 h-3.5 opacity-40" /> Handshake Attempt ID: SEC_4421_NODE_X
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-warning uppercase tracking-widest bg-warning/5 px-4 py-2 rounded-full border border-warning/10">
               <AlertCircle className="w-3.5 h-3.5" /> UNAUTHORIZED ACCESS IS LOGGED
            </div>
         </div>
      </div>
    </div>
  
  );
}
