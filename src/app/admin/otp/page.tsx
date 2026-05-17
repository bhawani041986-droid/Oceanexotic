"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShieldCheck, ArrowRight, RefreshCw, Smartphone, Mail, Lock } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]
  );
  const [timer, setTimer] = useState(60
  );
  const [isVerifying, setIsVerifying] = useState(false
  );
  const { toast } = useToast(
  );
  const router = useRouter(
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

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1
  );
    setOtp(newOtp
  );

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`
  );
      nextInput?.focus(
  );
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`
  );
      prevInput?.focus(
  );
    }
  };

  const handleVerify = async () => {
    const code = otp.join(""
  );
    if (code.length < 6) {
      toast("Please enter the complete 6-digit signal code.", "error"
  );
      return;
    }

    setIsVerifying(true
  );
    // Simulate High-Fidelity Security Handshake
    setTimeout(() => {
      setIsVerifying(false
  );
      if (code === "123456") { // Authorized Demo Signal
        toast("Signal identity verified. Absolute technical authority granted.", "success"
  );
        router.push("/admin/dashboard"
  );
      } else {
        toast("Sovereign signal mismatch. Identity rejected.", "error"
  );
      }
    }, 2000
  );
  };

  return (

    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abyssal Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-tertiary/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: "2s" }} />

      <Card className="w-full max-w-[480px] p-12 bg-bg-card border-[var(--foreground)]/5 relative z-10 shadow-premium group">
        <div className="space-y-10">
           {/* Governance Identity */}
           <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-[28px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-glow-purple relative overflow-hidden">
                 <ShieldCheck className="w-10 h-10 relative z-10" />
                 <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Signal Verification</h2>
                 <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] leading-relaxed">
                    A secure 6-digit handshake has been transmitted to your <br />
                    <span className="text-[var(--foreground)] italic">Authorized Administrative Device</span>
                 </p>
              </div>
           </div>

           {/* OTP Input Registry */}
           <div className="space-y-8">
              <div className="flex justify-between gap-3">
                 {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-full h-16 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-[16px] text-center text-2xl font-black text-primary focus:border-primary focus:shadow-glow-purple transition-all outline-none"
                    />
                 ))}
              </div>

              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest px-2">
                 <div className="flex items-center gap-2 text-text-secondary">
                    <RefreshCw className={cn("w-3.5 h-3.5", timer > 0 && "opacity-20")} />
                    <span>RESEND SIGNAL IN <span className="text-[var(--foreground)] font-bold">{timer}S</span></span>
                 </div>
                 <button 
                   disabled={timer > 0}
                   className={cn(
                     "text-primary hover:underline underline-offset-8 transition-all",
                     timer > 0 && "opacity-20 cursor-not-allowed"
                   )}
                 >
                   REQUEST NEW CODE
                 </button>
              </div>
           </div>

           {/* Action Handshake */}
           <div className="space-y-6 pt-4">
              <Button 
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full h-16 text-sm font-black tracking-[0.2em] uppercase shadow-glow-purple gap-4"
              >
                 {isVerifying ? (
                   <RefreshCw className="w-5 h-5 animate-spin" />
                 ) : (
                   <>GRANT SOVEREIGN ACCESS <ArrowRight className="w-5 h-5" /></>
                 )}
              </Button>
              
              <div className="flex items-center justify-center gap-6">
                 <button 
                   onClick={() => router.push("/admin/login")}
                   className="text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-[var(--foreground)] transition-colors flex items-center gap-2"
                 >
                    <Smartphone className="w-3.5 h-3.5" /> TRY ANOTHER METHOD
                 </button>
              </div>
           </div>
        </div>

        {/* Security Registry Footer */}
        <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-10 opacity-30">
           <div className="flex items-center gap-2">
              <Lock className="w-3 h-3 text-success" />
              <span className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest">RSA-4096 ENCRYPTED</span>
           </div>
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest">BIOMETRIC HANDSHAKE READY</span>
           </div>
        </div>
      </Card>
    </div>
  
  );
}
