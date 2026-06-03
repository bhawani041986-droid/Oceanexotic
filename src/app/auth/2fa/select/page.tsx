"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  ShieldCheck, 
  Smartphone, 
  Key, 
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Monitor,
  MessageSquare
} from "lucide-react";
import Link from "next/link";

export default function TwoFactorSelectPage() {
  return (

    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-bg-primary via-bg-primary to-primary/10">
      <div className="max-w-xl w-full space-y-12 animate-fade-in">
        
        <div className="text-center space-y-4">
           <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 uppercase text-[10px] tracking-[0.4em] h-10 px-8">
              SECURITY CALIBRATION
           </Badge>
           <h2 className="text-5xl font-black text-[var(--foreground)] tracking-tight uppercase leading-none">Choose Your <span className="text-primary">Shield.</span></h2>
           <p className="text-sm font-medium text-text-secondary leading-relaxed italic max-w-sm mx-auto">
              Select a secondary identity directive to harden your node sovereignty.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {[
             { 
               id: "auth-app", 
               title: "Authenticator App", 
               desc: "Hardened security via TOTP signal generators.", 
               icon: <Monitor />, 
               tag: "RECOMMENDED",
               link: "/auth/2fa"
             },
             { 
               id: "sms", 
               title: "Mobile Signal", 
               desc: "Identity verification via global SMS nodes.", 
               icon: <MessageSquare />, 
               tag: "FAST ACCESS",
               link: "/auth/2fa/sms" 
             },
           ].map((option) => (
             <Link key={option.id} href={option.link}>
                <Card className="p-8 h-full space-y-8 group cursor-pointer border-[var(--foreground)]/5 hover:border-primary/40 transition-all bg-bg-secondary/40 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                      {React.cloneElement(option.icon as React.ReactElement, { className: "w-20 h-20" })}
                   </div>
                   <div className="space-y-6 relative z-10">
                      <div className="w-14 h-14 rounded-[18px] bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                         {React.cloneElement(option.icon as React.ReactElement, { className: "w-6 h-6" })}
                      </div>
                      <div className="space-y-2">
                         <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-[var(--foreground)] uppercase tracking-tight">{option.title}</h3>
                            <Badge variant={option.id === 'auth-app' ? 'default' : 'glass'} className="text-[7px] tracking-[0.2em] px-2 h-5">
                               {option.tag}
                            </Badge>
                         </div>
                         <p className="text-[10px] text-text-secondary font-medium leading-relaxed italic">
                            {option.desc}
                         </p>
                      </div>
                   </div>
                   <div className="pt-6 border-t border-[var(--foreground)]/5 flex items-center justify-between relative z-10">
                      <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all">COMMISSION HUB</span>
                      <ArrowRight className="w-4 h-4 text-primary -translate-x-4 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
                   </div>
                </Card>
             </Link>
           ))}
        </div>

        <div className="p-8 rounded-[30px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center gap-6 opacity-60">
           <ShieldAlert className="w-6 h-6 text-warning" />
           <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest leading-relaxed">
              MFA sovereignty is required for all administrative nodes and high-volume trade hubs.
           </p>
        </div>
      </div>
    </div>
  
  );
}
