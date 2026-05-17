"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Key, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  CheckCircle2,
  RefreshCcw
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (

    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-bg-primary via-bg-primary to-primary/10">
      <div className="max-w-md w-full space-y-10 animate-fade-in">
        
        <div className="text-center space-y-4">
           <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 uppercase text-[9px] tracking-[0.3em] h-8 px-4">
              CREDENTIAL TRANSFORMATION
           </Badge>
           <h2 className="text-4xl font-black text-[var(--foreground)] tracking-tight uppercase leading-none">New <span className="text-primary">Directives.</span></h2>
        </div>

        <Card className="p-10 lg:p-14 space-y-12 relative overflow-hidden group border-[var(--foreground)]/5 shadow-glow-purple">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32" />
          
          <div className="text-center space-y-4 relative z-10">
            <div className="w-20 h-20 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-primary mx-auto shadow-inner">
               <RefreshCcw className="w-10 h-10" />
            </div>
            <div className="space-y-1">
               <h3 className="text-xl font-bold text-[var(--foreground)] uppercase tracking-tight">Access Reset</h3>
               <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Establish a new access key for your Identity Node</p>
            </div>
          </div>

          <div className="space-y-8 relative z-10">
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">New Access Key</label>
                   <Input type="password" placeholder="••••••••••••" className="h-14 bg-bg-secondary border-[var(--foreground)]/5 focus:border-primary/50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Confirm Access Key</label>
                   <Input type="password" placeholder="••••••••••••" className="h-14 bg-bg-secondary border-[var(--foreground)]/5 focus:border-primary/50" />
                </div>
             </div>

            <div className="p-6 rounded-[20px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-3">
               <p className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest border-b border-[var(--foreground)]/5 pb-2 mb-2">COMPLIANCE PROTOCOL</p>
               <div className="flex items-center gap-3 text-[10px] font-medium text-text-secondary">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Minimum 12 Characters
               </div>
               <div className="flex items-center gap-3 text-[10px] font-medium text-text-secondary">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Alphanumeric Synergy
               </div>
               <div className="flex items-center gap-3 text-[10px] font-medium text-text-secondary opacity-40">
                  <CheckCircle2 className="w-3.5 h-3.5" /> High-Entropy Character Set
               </div>
            </div>

            <Button className="w-full h-16 text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-4 group">
               COMMIT NEW KEY <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="pt-8 border-t border-[var(--foreground)]/5 text-center relative z-10">
             <div className="flex items-center justify-center gap-3 text-[9px] font-black text-text-secondary uppercase tracking-widest">
                <Lock className="w-3.5 h-3.5 opacity-40" /> SECURE MARITIME ENCRYPTION ACTIVE
             </div>
          </div>
        </Card>
      </div>
    </div>
  
  );
}
