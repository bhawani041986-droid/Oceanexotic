"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Terminal,
  Fingerprint,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  return (

    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-bg-primary via-bg-primary to-purple-900/20">
      <div className="max-w-md w-full space-y-10 animate-fade-in">
        
        <div className="flex items-center justify-between">
           <Link href="/customer" className="inline-flex items-center gap-2 text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-[var(--foreground)] transition-all group">
             <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> PUBLIC PORT
           </Link>
           <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 uppercase text-[8px] tracking-[0.3em] h-8 px-4">
              GOVERNANCE MODE
           </Badge>
        </div>

        <Card className="p-10 lg:p-14 space-y-12 relative overflow-hidden group border-primary/20 shadow-glow-purple">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32" />
          
          <div className="text-center space-y-4 relative z-10">
            <div className="w-20 h-20 rounded-[24px] bg-[var(--foreground)]/5 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-inner">
               <Fingerprint className="w-10 h-10" />
            </div>
            <div className="space-y-1">
               <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight uppercase">System Entry</h2>
               <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Global Maritime Authority Authorization Node</p>
            </div>
          </div>

          <div className="space-y-8 relative z-10">
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Authority ID (Email)</label>
                   <Input placeholder="admin@oceanexotic.com" className="h-14 bg-bg-secondary border-[var(--foreground)]/5 focus:border-primary/50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Access Directive (Password)</label>
                   <Input type="password" placeholder="••••••••••••" className="h-14 bg-bg-secondary border-[var(--foreground)]/5 focus:border-primary/50" />
                </div>
             </div>

            <div className="space-y-4">
              <Button className="w-full h-16 text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-4 group">
                 AUTHORIZE ACCESS <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="ghost" className="w-full h-14 text-[9px] font-black tracking-widest uppercase border border-[var(--foreground)]/5 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 flex items-center justify-center gap-3">
                 <Fingerprint className="w-4 h-4 text-primary" /> BIOMETRIC IDENTITY VERIFICATION
              </Button>
            </div>

            <div className="flex flex-col items-center gap-6">
               <div className="flex items-center gap-3 text-[9px] font-black text-text-secondary uppercase tracking-widest">
                  <Terminal className="w-3.5 h-3.5 opacity-40 text-success" /> SECURE HANDSHAKE PENDING
               </div>
               <div className="flex gap-4">
                  <Link href="/admin/forgot-password">
                     <button className="text-[9px] font-black text-text-secondary uppercase tracking-widest hover:text-[var(--foreground)] transition-colors">
                       FORGOT ACCESS KEY?
                     </button>
                  </Link>
                  <div className="w-px h-3 bg-[var(--foreground)]/10" />
                  <Link href="/admin/otp">
                     <button className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">
                       OTP BYPASS
                     </button>
                  </Link>
               </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[var(--foreground)]/5 text-center relative z-10">
             <div className="flex items-center justify-center gap-3 text-[9px] font-black text-text-secondary uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-success" /> AES-256 MARITIME ENCRYPTION ACTIVE
             </div>
          </div>
        </Card>

        <div className="text-center opacity-40">
           <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.4em]">Unauthorized Access is Federally Monitored</p>
        </div>
      </div>
    </div>
  
  );
}
