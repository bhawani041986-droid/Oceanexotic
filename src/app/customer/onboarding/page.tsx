"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Anchor, 
  Waves, 
  Compass, 
  ShieldCheck, 
  ArrowRight, 
  ChevronRight,
  Fish,
  Globe
} from "lucide-react";
import Link from "next/link";

export default function CustomerOnboardingPage() {
  const [step, setStep] = useState(1
  );

  return (

    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-bg-primary via-bg-primary to-primary/10">
      <div className="max-w-3xl w-full space-y-12 animate-fade-in">
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center relative px-4">
           <div className="absolute top-1/2 left-0 w-full h-px bg-[var(--foreground)]/5 -z-10" />
           {[1, 2, 3].map((s) => (
             <div key={s} className="flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${
                  s === step ? "bg-primary border-primary text-white shadow-glow-purple" : 
                  s < step ? "bg-success border-success text-white" : "bg-bg-primary border-white/10 text-text-secondary"
                }`}>
                   {s < step ? <ShieldCheck className="w-6 h-6" /> : s}
                </div>
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${s === step ? "text-primary" : "text-text-secondary"}`}>
                   {s === 1 ? "WELCOME" : s === 2 ? "INTERESTS" : "READY"}
                </p>
             </div>
           ))}
        </div>

        <Card className="p-10 lg:p-14 space-y-12 relative overflow-hidden group border-[var(--foreground)]/5 shadow-glow-purple">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -mr-48 -mt-48" />
          
          {step === 1 && (
            <div className="space-y-10 relative z-10 animate-fade-in text-center">
               <div className="space-y-6">
                  <div className="w-24 h-24 rounded-[30px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-glow-purple">
                     <Anchor className="w-12 h-12" />
                  </div>
                  <div className="space-y-4">
                     <h2 className="text-4xl lg:text-5xl font-black text-[var(--foreground)] uppercase tracking-tighter leading-none">Account <span className="text-primary">Created.</span></h2>
                     <p className="text-lg font-medium text-text-secondary italic max-w-md mx-auto">
                        Welcome to OceanExotic! Your account is now active and ready for shopping.
                     </p>
                  </div>
               </div>
               <div className="p-8 rounded-[24px] bg-bg-secondary/40 border border-[var(--foreground)]/5 flex items-center justify-center gap-8">
                  <div className="text-center">
                     <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Membership Tier</p>
                     <p className="text-xl font-black text-[var(--foreground)]">NEW CUSTOMER</p>
                  </div>
                  <div className="h-10 w-px bg-[var(--foreground)]/10" />
                  <div className="text-center">
                     <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Account Status</p>
                     <p className="text-xl font-black text-[var(--foreground)]">ACTIVE</p>
                  </div>
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 relative z-10 animate-fade-in">
               <div className="space-y-2">
                  <h2 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">Your Preferences</h2>
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Select the seafood types you are interested in</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  {["Premium Saku", "Wild Crustaceans", "Arctic Whitefish", "Shellfish Reserve", "Roe & Caviar", "Cephalopod Hub"].map((spec) => (
                    <button key={spec} className="p-6 rounded-[20px] border border-[var(--foreground)]/5 bg-bg-secondary/40 text-left hover:border-primary/40 transition-all group">
                       <div className="flex items-center justify-between mb-4">
                          <Fish className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                          <div className="w-5 h-5 rounded-full border border-white/10 group-hover:bg-primary group-hover:border-primary transition-all" />
                       </div>
                       <p className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">{spec}</p>
                    </button>
                  ))}
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-12 relative z-10 animate-fade-in text-center">
               <div className="space-y-6">
                  <div className="w-24 h-24 rounded-[30px] bg-success/10 border border-success/20 flex items-center justify-center text-success mx-auto shadow-glow-purple">
                     <Compass className="w-12 h-12" />
                  </div>
                  <div className="space-y-4">
                     <h2 className="text-4xl font-black text-[var(--foreground)] uppercase tracking-tight">Setup Complete</h2>
                     <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] px-10 leading-relaxed">
                        Your profile is now configured and ready for shopping.
                     </p>
                  </div>
               </div>
               <div className="grid grid-cols-1 gap-6 text-left">
                  <Card className="p-8 bg-bg-secondary/40 space-y-4">
                     <div className="flex items-center gap-4">
                        <Globe className="w-5 h-5 text-primary" />
                        <p className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">Market Sourcing</p>
                     </div>
                     <p className="text-xs text-text-secondary font-medium leading-relaxed italic">
                        Access fresh local catches and imported seafood with temperature-controlled shipping.
                     </p>
                  </Card>
               </div>
            </div>
          )}

          <div className="flex gap-4 relative z-10 pt-10 border-t border-[var(--foreground)]/5">
             <Button onClick={() => step < 3 ? setStep(step + 1) : null} className="flex-1 h-16 text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-4 group">
                {step === 3 ? "START SHOPPING" : "NEXT"} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </Button>
          </div>
        </Card>
      </div>
    </div>
  
  );
}
