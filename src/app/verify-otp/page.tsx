"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  ShieldCheck, 
  ArrowRight, 
  RefreshCcw, 
  Lock,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

export default function VerifyOTPPage() {
  const [timer, setTimer] = useState(59
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0)
  );
    }, 1000
  );
    return (
) => clearInterval(interval
  );
  }, []
  );

  return (

    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-bg-primary via-bg-primary to-primary/10">
      <div className="max-w-md w-full space-y-10 animate-fade-in">
        
        <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-[var(--foreground)] transition-all group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> BACK TO PORT
        </Link>

        <Card className="p-10 lg:p-14 space-y-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32" />
          
          <div className="text-center space-y-4 relative z-10">
            <div className="w-20 h-20 rounded-[24px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-glow-purple">
               <ShieldCheck className="w-10 h-10" />
            </div>
            <div className="space-y-1">
               <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight uppercase">Verify Signal</h2>
               <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Sent to adm***@oceanexotic.com</p>
            </div>
          </div>

          <div className="space-y-8 relative z-10">
            <div className="flex justify-between gap-4">
              {[1, 2, 3, 4].map((i) => (
                <input 
                  key={i}
                  type="text"
                  maxLength={1}
                  className="w-full h-16 bg-bg-secondary border border-[var(--foreground)]/10 rounded-[16px] text-center text-2xl font-black text-[var(--foreground)] focus:border-primary/50 focus:shadow-glow-purple transition-all outline-none"
                />
              ))}
            </div>

            <Button className="w-full h-16 text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-4 group">
               AUTHORIZE IDENTITY <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="flex flex-col items-center gap-6">
               <div className="flex items-center gap-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">
                  {timer > 0 ? (
                    <>SIGNAL EXPIRES IN <span className="text-primary font-black">0:{timer < 10 ? `0${timer}` : timer}</span></>
                  ) : (
                    <span className="text-danger">SIGNAL EXPIRED</span>
                  )}
               </div>
               <button 
                 disabled={timer > 0}
                 className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${timer > 0 ? "opacity-20 cursor-not-allowed" : "text-primary hover:underline"}`}
               >
                 <RefreshCcw className="w-4 h-4" /> RESEND ACCESS TOKEN
               </button>
            </div>
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
