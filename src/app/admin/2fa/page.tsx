"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Fingerprint, 
  Smartphone, 
  ShieldCheck, 
  Lock, 
  Key, 
  ArrowRight,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Admin2FAPage() {
  const [authMethod, setAuthMethod] = useState<"biometric" | "app" | "backup">("biometric"
  );
  const [isVerifying, setIsVerifying] = useState(false
  );
  const { toast } = useToast(
  );
  const router = useRouter(
  );

  const handleVerification = () => {
    setIsVerifying(true
  );
    // Simulate High-Fidelity Biometric Handshake
    setTimeout(() => {
      setIsVerifying(false
  );
      toast("Identity Handshake Successful. Sovereign Authority Granted.", "success"
  );
      router.push("/admin/dashboard"
  );
    }, 2500
  );
  };

  return (

    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abyssal Background Effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-tertiary/5 blur-[150px] rounded-full animate-pulse" />

      <Card className="w-full max-w-[520px] p-12 bg-bg-card border-[var(--foreground)]/5 relative z-10 shadow-premium overflow-hidden group">
        {/* Animated Security Scan Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20 animate-scan" />
        
        <div className="space-y-12">
           {/* Governance Header */}
           <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary relative shadow-glow-purple group-hover:scale-110 transition-transform duration-700">
                 <Fingerprint className="w-12 h-12 relative z-10" />
                 <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-40" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Multi-Factor Protocol</h2>
                 <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">
                    Identity validation required for <br />
                    <span className="text-[var(--foreground)] italic">Administrator Node: Sovereign Access</span>
                 </p>
              </div>
           </div>

           {/* Auth Method Selection */}
           <div className="grid grid-cols-1 gap-4">
              {[
                { id: "biometric", label: "Biometric Handshake", sub: "TouchID / FaceID Active", icon: <Fingerprint className="w-5 h-5" /> },
                { id: "app", label: "Authenticator App", sub: "Enter T-OTP Signal", icon: <Key className="w-5 h-5" /> },
                { id: "backup", label: "Emergency Recovery", sub: "Use RSA Backup Key", icon: <ShieldAlert className="w-5 h-5" /> },
              ].map((method) => (
                 <button
                   key={method.id}
                   onClick={() => setAuthMethod(method.id as any)}
                   className={cn(
                     "flex items-center gap-6 p-6 rounded-[24px] border transition-all duration-500 text-left relative overflow-hidden group/btn",
                     authMethod === method.id 
                       ? "bg-primary/10 border-primary/40 text-[var(--foreground)] shadow-glow-purple" 
                       : "bg-[var(--foreground)]/5 border-[var(--foreground)]/5 text-text-secondary hover:border-[var(--foreground)]/10"
                   )}
                 >
                    <div className={cn(
                      "w-12 h-12 rounded-[16px] flex items-center justify-center transition-colors",
                      authMethod === method.id ? "bg-primary text-[var(--foreground)]" : "bg-[var(--foreground)]/5 text-text-secondary group-hover/btn:text-[var(--foreground)]"
                    )}>
                       {method.icon}
                    </div>
                    <div className="space-y-1">
                       <p className="text-xs font-black uppercase tracking-widest">{method.label}</p>
                       <p className="text-[10px] font-medium opacity-60 italic">{method.sub}</p>
                    </div>
                    {authMethod === method.id && (
                       <div className="absolute right-6 top-1/2 -translate-y-1/2">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-glow-purple" />
                       </div>
                    )}
                 </button>
              ))}
           </div>

           {/* Verification Context Area */}
           <div className="space-y-8 pt-4">
              {authMethod === "app" && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <Input 
                      placeholder="ENTER 6-DIGIT TOTP SIGNAL" 
                      className="h-16 text-center text-xl font-black tracking-[0.5em] bg-bg-secondary border-[var(--foreground)]/10"
                      maxLength={6}
                    />
                 </div>
              )}

              <Button 
                onClick={handleVerification}
                disabled={isVerifying}
                className="w-full h-16 text-[11px] font-black tracking-[0.25em] uppercase shadow-glow-purple gap-4"
              >
                 {isVerifying ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                 ) : (
                   <>INITIALIZE IDENTITY HANDSHAKE <ArrowRight className="w-5 h-5" /></>
                 )}
              </Button>

              <div className="text-center">
                 <button className="text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-[var(--foreground)] transition-all underline underline-offset-8">
                    Lost access to your device?
                 </button>
              </div>
           </div>
        </div>

        {/* Security Registry Metadata */}
        <div className="mt-12 pt-8 border-t border-[var(--foreground)]/5 flex items-center justify-between opacity-30">
           <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">ENCRYPTION: AES-256-GCM</span>
           </div>
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">Sovereign Authority v2.4</span>
           </div>
        </div>
      </Card>
    </div>
  
  );
}
