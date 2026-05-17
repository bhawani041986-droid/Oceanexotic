"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  ShieldCheck, 
  Smartphone, 
  Key, 
  QrCode, 
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Lock
} from "lucide-react";

export default function TwoFactorAuthPage() {
  const [step, setStep] = useState(1
  );

  return (

    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-bg-primary via-bg-primary to-primary/10">
      <div className="max-w-md w-full space-y-10 animate-fade-in">
        
        <div className="text-center space-y-4">
           <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 uppercase text-[9px] tracking-[0.3em] h-8 px-4">
              SECURITY COMMISSIONING
           </Badge>
           <h2 className="text-4xl font-black text-[var(--foreground)] tracking-tight uppercase leading-none">Identity <span className="text-primary">Fortress.</span></h2>
        </div>

        <Card className="p-10 lg:p-14 space-y-12 relative overflow-hidden group border-[var(--foreground)]/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32" />
          
          {step === 1 ? (
            <div className="space-y-10 relative z-10 animate-fade-in">
               <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-primary mx-auto">
                     <Smartphone className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-xl font-bold text-[var(--foreground)] uppercase tracking-tight">Authenticator App</h3>
                     <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Commission your secure authenticator node</p>
                  </div>
               </div>
               
               <div className="p-6 rounded-[24px] bg-bg-secondary border border-[var(--foreground)]/5 flex items-center justify-center">
                  <div className="w-48 h-48 bg-white rounded-[16px] p-4 flex items-center justify-center relative group">
                     <QrCode className="w-full h-full text-bg-primary" />
                     <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[16px]">
                        <p className="text-[8px] font-black text-[var(--foreground)] uppercase tracking-widest text-center px-4">SCAN VIA AUTHENTICATOR APP</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Manual Entry Key</label>
                     <div className="flex gap-2">
                        <Input readOnly defaultValue="4240-8892-0000-7712" className="h-12 bg-bg-secondary border-[var(--foreground)]/5" />
                        <Button variant="outline" className="h-12 px-4 text-[9px] font-black uppercase">COPY</Button>
                     </div>
                  </div>
                  <Button onClick={() => setStep(2)} className="w-full h-16 text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-4 group">
                     NEXT DIRECTIVE <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
               </div>
            </div>
          ) : (
            <div className="space-y-10 relative z-10 animate-fade-in">
               <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-[24px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                     <ShieldCheck className="w-10 h-10 shadow-glow-purple" />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-xl font-bold text-[var(--foreground)] uppercase tracking-tight">Verify Protocol</h3>
                     <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Input the 6-digit signal from your app</p>
                  </div>
               </div>

               <div className="flex justify-between gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <input 
                      key={i}
                      type="text"
                      maxLength={1}
                      className="w-full h-14 bg-bg-secondary border border-[var(--foreground)]/10 rounded-[12px] text-center text-xl font-black text-[var(--foreground)] focus:border-primary/50 outline-none"
                    />
                  ))}
               </div>

               <div className="space-y-4">
                  <Button className="w-full h-16 text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-4 group">
                     COMPLETE COMMISSION <CheckCircle2 className="w-4 h-4" />
                  </Button>
                  <button onClick={() => setStep(1)} className="w-full text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] hover:text-[var(--foreground)] transition-all">
                     BACK TO SCAN
                  </button>
               </div>
            </div>
          )}

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
