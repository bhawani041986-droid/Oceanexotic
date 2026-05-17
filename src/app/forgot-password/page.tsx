"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Key, 
  ArrowRight, 
  Mail, 
  ShieldCheck, 
  ChevronLeft,
  Lock,
  Zap
} from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false
  );

  return (

    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-bg-primary via-bg-primary to-primary/10">
      <div className="max-w-md w-full space-y-10 animate-fade-in">
        
        <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-[var(--foreground)] transition-all group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> BACK TO PORT
        </Link>

        <Card className="p-10 lg:p-14 space-y-12 relative overflow-hidden group border-[var(--foreground)]/5 shadow-glow-purple">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32" />
          
          {!submitted ? (
            <div className="space-y-10 relative z-10 animate-fade-in">
               <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-primary mx-auto shadow-inner">
                     <Key className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                     <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight uppercase">Key Recovery</h2>
                     <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Initiate Access Directive Reset for your Identity Node</p>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Identity ID (Email)</label>
                     <Input placeholder="admiral@oceanexotic.com" className="h-14 bg-bg-secondary border-[var(--foreground)]/5 focus:border-primary/50" />
                  </div>
                  <Button onClick={() => setSubmitted(true)} className="w-full h-16 text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-4 group">
                     SEND RECOVERY SIGNAL <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
               </div>
            </div>
          ) : (
            <div className="space-y-10 relative z-10 animate-fade-in">
               <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-[24px] bg-success/10 border border-success/20 flex items-center justify-center text-success mx-auto shadow-glow-purple">
                     <Zap className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-xl font-bold text-[var(--foreground)] uppercase tracking-tight">Signal Transmitted</h3>
                     <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest text-center px-4">An access reset directive has been sent to your registered node.</p>
                  </div>
               </div>

               <div className="p-6 rounded-[20px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 text-center">
                  <p className="text-[10px] text-text-secondary font-medium leading-relaxed italic">
                    Please check your communication hub. The signal is valid for 15 minutes.
                  </p>
               </div>

               <Button variant="outline" onClick={() => setSubmitted(false)} className="w-full h-14 text-[10px] font-black uppercase tracking-widest border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/5">
                  RESEND SIGNAL
               </Button>
            </div>
          )}

          <div className="pt-8 border-t border-[var(--foreground)]/5 text-center relative z-10">
             <div className="flex items-center justify-center gap-3 text-[9px] font-black text-text-secondary uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-success" /> GLOBAL SECURITY PROTOCOL ACTIVE
             </div>
          </div>
        </Card>
      </div>
    </div>
  
  );
}
