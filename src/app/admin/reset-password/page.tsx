"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false
  );
  const [isResetting, setIsResetting] = useState(false
  );
  const [passwords, setPasswords] = useState({ new: "", confirm: "" }
  );
  const { toast } = useToast(
  );
  const router = useRouter(
  );

  const strength = passwords.new.length > 12 ? "SOVEREIGN" : passwords.new.length > 8 ? "OPTIMAL" : "WEAK";

  const handleReset = () => {
    if (passwords.new !== passwords.confirm) {
      toast("Credential mismatch. Confirm parity before proceeding.", "error"
  );
      return;
    }
    if (passwords.new.length < 8) {
      toast("Credential registry length violation. Minimum 8 characters required.", "error"
  );
      return;
    }

    setIsResetting(true
  );
    // Simulate High-Fidelity Security Handshake
    setTimeout(() => {
      setIsResetting(false
  );
      toast("Sovereign credentials successfully restored.", "success"
  );
      router.push("/admin/login"
  );
    }, 2500
  );
  };

  return (

    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abyssal Background Effects */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-tertiary/5 blur-[120px] rounded-full animate-pulse" />

      <Card className="w-full max-w-[500px] p-12 bg-bg-card border-[var(--foreground)]/5 relative z-10 shadow-premium group">
        <div className="space-y-12">
           {/* Governance Header */}
           <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-[28px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-glow-purple relative overflow-hidden group-hover:rotate-[360deg] transition-transform duration-1000">
                 <Key className="w-10 h-10 relative z-10" />
                 <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Credential Restore</h2>
                 <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] leading-relaxed">
                    Synchronizing new sovereign security <br />
                    <span className="text-[var(--foreground)] italic">Protocol: RSA-4096 Multi-Sig</span>
                 </p>
              </div>
           </div>

           {/* Input Registry */}
           <div className="space-y-8">
              <div className="space-y-6">
                 <div className="space-y-2 relative">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">New Sovereign Password</label>
                    <div className="relative">
                       <Input 
                         type={showPassword ? "text" : "password"}
                         placeholder="ENTER NEW CREDENTIALS..." 
                         className="h-16 pl-12 pr-12 bg-bg-secondary/50 border-[var(--foreground)]/10 font-bold"
                         value={passwords.new}
                         onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                       />
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary opacity-40" />
                       <button 
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-[var(--foreground)] transition-colors"
                       >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                    </div>
                 </div>

                 <div className="space-y-2 relative">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Confirm Sovereign Parity</label>
                    <div className="relative">
                       <Input 
                         type={showPassword ? "text" : "password"}
                         placeholder="CONFIRM CREDENTIALS..." 
                         className="h-16 pl-12 bg-bg-secondary/50 border-[var(--foreground)]/10 font-bold"
                         value={passwords.confirm}
                         onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                       />
                       <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary opacity-40" />
                    </div>
                 </div>
              </div>

              {/* Password Strength Registry */}
              <div className="p-6 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-text-secondary">Security Health</span>
                    <span className={cn(
                      "transition-colors",
                      strength === "SOVEREIGN" ? "text-success" : 
                      strength === "OPTIMAL" ? "text-primary" : "text-warning"
                    )}>{strength}</span>
                 </div>
                 <div className="h-1.5 w-full bg-[var(--foreground)]/5 rounded-full overflow-hidden flex gap-1">
                    <div className={cn("h-full rounded-full transition-all duration-700", passwords.new.length > 0 ? "bg-warning w-1/3" : "w-0")} />
                    <div className={cn("h-full rounded-full transition-all duration-700", passwords.new.length > 8 ? "bg-primary w-1/3" : "w-0")} />
                    <div className={cn("h-full rounded-full transition-all duration-700", passwords.new.length > 12 ? "bg-success w-1/3" : "w-0")} />
                 </div>
                 <div className="flex items-center gap-3">
                    <CheckCircle2 className={cn("w-3.5 h-3.5 transition-colors", passwords.new.length >= 8 ? "text-success" : "text-text-secondary opacity-20")} />
                    <span className="text-[9px] font-bold text-text-secondary uppercase">Min 8 Chars</span>
                    <CheckCircle2 className={cn("w-3.5 h-3.5 ml-4 transition-colors", /[A-Z]/.test(passwords.new) ? "text-success" : "text-text-secondary opacity-20")} />
                    <span className="text-[9px] font-bold text-text-secondary uppercase">Uppercase</span>
                    <CheckCircle2 className={cn("w-3.5 h-3.5 ml-4 transition-colors", /[0-9]/.test(passwords.new) ? "text-success" : "text-text-secondary opacity-20")} />
                    <span className="text-[9px] font-bold text-text-secondary uppercase">Numerical</span>
                 </div>
              </div>
           </div>

           {/* Action Handshake */}
           <div className="space-y-6 pt-4">
              <Button 
                onClick={handleReset}
                disabled={isResetting}
                className="w-full h-16 text-sm font-black tracking-[0.2em] uppercase shadow-glow-purple gap-4"
              >
                 {isResetting ? (
                   <RefreshCw className="w-5 h-5 animate-spin" />
                 ) : (
                   <>RESTORE SOVEREIGN ACCESS <ArrowRight className="w-5 h-5" /></>
                 )}
              </Button>
              
              <div className="text-center">
                 <button 
                   onClick={() => router.push("/admin/login")}
                   className="text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-[var(--foreground)] transition-colors flex items-center justify-center gap-2"
                 >
                    <AlertTriangle className="w-3.5 h-3.5 text-warning" /> REMEMBERED CREDENTIALS? LOGIN
                 </button>
              </div>
           </div>
        </div>

        {/* Security Footer */}
        <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-10 opacity-30">
           <div className="flex items-center gap-2">
              <Lock className="w-3 h-3 text-success" />
              <span className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest">AES-256-GCM PROTOCOL</span>
           </div>
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest">RSA-4096 VERIFIED</span>
           </div>
        </div>
      </Card>
    </div>
  
  );
}
