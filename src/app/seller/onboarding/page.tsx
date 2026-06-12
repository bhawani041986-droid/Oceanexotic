"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Store, 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  ChevronLeft,
  Ship,
  DollarSign
} from "lucide-react";

export default function MerchantOnboardingPage() {
  const [step, setStep] = useState(1
  );

  return (

    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-bg-primary via-bg-primary to-primary/10">
      <div className="max-w-2xl w-full space-y-12 animate-fade-in">
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center relative px-2">
           <div className="absolute top-1/2 left-0 w-full h-px bg-[var(--foreground)]/5 -z-10" />
           {[1, 2, 3].map((s) => (
             <div key={s} className="flex flex-col items-center gap-3">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${
                  s === step ? "bg-primary border-primary text-white shadow-glow-purple" : 
                  s < step ? "bg-success border-success text-white" : "bg-bg-primary border-white/10 text-text-secondary"
                }`}>
                   {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                <p className={`text-[8px] font-black uppercase tracking-widest ${s === step ? "text-primary" : "text-text-secondary"}`}>
                   {s === 1 ? "FLEET IDENTITY" : s === 2 ? "SOVEREIGNTY" : "SETTLEMENT"}
                </p>
             </div>
           ))}
        </div>

        <Card className="p-10 lg:p-14 space-y-12 relative overflow-hidden group border-[var(--foreground)]/5 shadow-glow-purple">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[100px] rounded-full -mr-40 -mt-40" />
          
          {step === 1 && (
            <div className="space-y-10 relative z-10 animate-fade-in">
               <div className="space-y-2">
                  <h2 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">Fleet Identity</h2>
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Establish your brand directive on the global marketplace</p>
               </div>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Merchant Hub Name</label>
                     <Input placeholder="e.g. Global Seafoods Alpha" className="h-14 bg-bg-secondary border-[var(--foreground)]/5" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Fleet Category</label>
                     <select defaultValue="Premium Wild-Caught" className="w-full h-14 bg-bg-secondary border border-[var(--foreground)]/5 rounded-[16px] px-6 text-xs font-bold text-[var(--foreground)] outline-none focus:border-primary/50 transition-all">
                        <option>Premium Wild-Caught</option>
                        <option>Artisanal Shellfish</option>
                        <option>Enterprise Logistics</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Node Description</label>
                     <textarea className="w-full h-32 bg-bg-secondary border border-[var(--foreground)]/5 rounded-[16px] p-6 text-xs text-text-secondary outline-none focus:border-primary/50 transition-all" placeholder="Briefly describe your maritime sourcing capabilities..." />
                  </div>
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 relative z-10 animate-fade-in">
               <div className="space-y-2">
                  <h2 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">Legal Systemty</h2>
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Verify your business credentials for platform commissioning</p>
               </div>
               <div className="space-y-8">
                  <div className="p-10 border-2 border-dashed border-[var(--foreground)]/5 rounded-[30px] flex flex-col items-center justify-center space-y-6 group hover:border-primary/40 transition-all cursor-pointer">
                     <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-white transition-all">
                        <FileText className="w-8 h-8" />
                     </div>
                     <div className="text-center">
                        <p className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-widest">UPLOAD MARITIME LICENSE</p>
                        <p className="text-[9px] text-text-secondary font-medium mt-1">PDF or JPEG (MAX 10MB)</p>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Business Registration ID</label>
                     <Input placeholder="VAT-9982-XXXX" className="h-14 bg-bg-secondary border-[var(--foreground)]/5" />
                  </div>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 relative z-10 animate-fade-in">
               <div className="space-y-2 text-center">
                  <div className="w-20 h-20 rounded-[24px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-glow-purple mb-6">
                     <Ship className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">Ready for Launch</h2>
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-10">Your merchant node is calibrated and ready for commissioning.</p>
               </div>
               <Card className="p-8 bg-bg-secondary/40 border border-[var(--foreground)]/5 space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                     <span className="text-text-secondary">Fleet Rank</span>
                     <span className="text-primary">NOVICE MERCHANT</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                     <span className="text-text-secondary">Commission Fee</span>
                     <span className="text-[var(--foreground)]">12% / ORDER</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                     <span className="text-text-secondary">SLA Threshold</span>
                     <span className="text-success">98.5% UPTIME</span>
                  </div>
               </Card>
            </div>
          )}

          <div className="flex gap-4 relative z-10 pt-10 border-t border-[var(--foreground)]/5">
             {step > 1 && (
               <Button variant="outline" onClick={() => setStep(step - 1)} className="h-16 px-10 text-[10px] font-black uppercase tracking-widest border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/5 flex items-center gap-4">
                  <ChevronLeft className="w-4 h-4" /> PREVIOUS
               </Button>
             )}
             <Button onClick={() => step < 3 ? setStep(step + 1) : null} className="flex-1 h-16 text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-4 group">
                {step === 3 ? "COMMISSION HUB" : "CONTINUE DIRECTIVE"} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </Button>
          </div>
        </Card>
      </div>
    </div>
  
  );
}
