"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Anchor,
  Zap,
  Lock
} from "lucide-react";
import Link from "next/link";

export default function ResetSuccessPage() {
  return (

    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-bg-primary via-bg-primary to-primary/10">
      <div className="max-w-md w-full space-y-10 animate-fade-in text-center">
        
        <Card className="p-10 lg:p-14 space-y-12 relative overflow-hidden group border-[var(--foreground)]/5 shadow-glow-purple">
          <div className="absolute top-0 right-0 w-80 h-80 bg-success/10 blur-[100px] rounded-full -mr-40 -mt-40" />
          
          <div className="space-y-8 relative z-10">
             <div className="w-24 h-24 rounded-[30px] bg-success/10 border border-success/20 flex items-center justify-center text-success mx-auto shadow-glow-purple animate-bounce-subtle">
                <CheckCircle2 className="w-12 h-12" />
             </div>
             
             <div className="space-y-4">
                <Badge variant="glass" className="bg-success/10 text-success border-success/20 uppercase text-[10px] tracking-[0.4em] h-10 px-8">
                   IDENTITY RESTORED
                </Badge>
                <h1 className="text-4xl font-black text-[var(--foreground)] tracking-tight uppercase leading-none">
                   Access <span className="text-success">Secured.</span>
                </h1>
                <p className="text-sm font-medium text-text-secondary leading-relaxed italic px-6">
                   Your new access directives have been commissioned and synchronized across the Global Maritime Node.
                </p>
             </div>
          </div>

          <div className="space-y-6 relative z-10">
             <Link href="/login">
                <Button className="w-full h-16 text-[11px] font-black tracking-widest uppercase shadow-glow-purple bg-success border-success hover:bg-success/90 flex items-center justify-center gap-4 group">
                   RETURN TO PORT <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
             </Link>
             
             <div className="flex items-center justify-center gap-6 pt-6">
                <div className="flex items-center gap-2 text-[9px] font-black text-text-secondary uppercase tracking-widest">
                   <ShieldCheck className="w-4 h-4 text-success" /> PROTECTION ACTIVE
                </div>
                <div className="w-1 h-1 bg-[var(--foreground)]/10 rounded-full" />
                <div className="flex items-center gap-2 text-[9px] font-black text-text-secondary uppercase tracking-widest">
                   <Zap className="w-4 h-4 text-primary" /> NODE SYNCED
                </div>
             </div>
          </div>

          <div className="pt-8 border-t border-[var(--foreground)]/5 text-center relative z-10">
             <div className="flex items-center justify-center gap-3 text-[9px] font-black text-text-secondary uppercase tracking-widest">
                <Lock className="w-3.5 h-3.5 opacity-40" /> SECURE HANDSHAKE COMPLETED
             </div>
          </div>
        </Card>

        <div className="space-y-4 opacity-40">
           <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.5em]">Global Identity Protocol Finalized</p>
        </div>
      </div>
    </div>
  
  );
}
