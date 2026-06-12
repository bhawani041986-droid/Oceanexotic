"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  CreditCard, 
  Plus, 
  ShieldCheck, 
  Lock, 
  DollarSign, 
  MoreVertical,
  Edit3,
  Trash2,
  Gem
} from "lucide-react";

const SAVED_CARDS = [
  { id: "PAY-001", brand: "VISA", last4: "8892", expiry: "12/2028", primary: true, holder: "ADMIRAL JOHN DOE" },
  { id: "PAY-002", brand: "MASTERCARD", last4: "4240", expiry: "09/2027", primary: false, holder: "ADMIRAL JOHN DOE" },
];

export default function CustomerPaymentPage() {
  return (

    <div className="max-w-4xl mx-auto space-y-12 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--foreground)]/5 pb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight uppercase">Payment Vault</h2>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Governing Your Global Maritime Settlements</p>
        </div>
        <Button variant="primary" className="h-12 px-8 text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-3">
          <Plus className="w-4 h-4" /> COMMISSION ASSET
        </Button>
      </div>

      {/* Wallet Balance Pulse */}
      <Card className="p-10 lg:p-14 bg-gradient-to-br from-primary/20 to-bg-secondary/40 border-primary/20 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[80px] rounded-full -mr-40 -mt-40 transition-transform group-hover:scale-110" />
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="space-y-4">
               <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20">FLEET CREDITS ACTIVE</Badge>
               <h3 className="text-5xl font-black text-[var(--foreground)] tracking-tighter uppercase flex items-center gap-4">
                 <Gem className="w-10 h-10 text-primary shadow-glow-purple" /> 1,240.50
               </h3>
               <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Available for immediate harvest settlement</p>
            </div>
            <Button className="h-14 px-12 text-[11px] font-black tracking-widest uppercase shadow-glow-purple">RECHARGE WALLET</Button>
         </div>
      </Card>

      {/* Saved Instruments Grid */}
      <div className="space-y-6">
         <h4 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-[0.3em] px-2">Saved Settlement Assets</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {SAVED_CARDS.map((card) => (
             <Card 
               key={card.id} 
               className={`p-10 space-y-10 group transition-all hover:border-primary/40 relative overflow-hidden ${card.primary ? "border-primary/20 bg-primary/5" : "bg-bg-secondary/40 border-white/5"}`}
             >
               <div className="absolute top-0 right-0 p-6">
                  {card.primary && <Badge variant="success" className="h-6 px-3 text-[8px] font-black tracking-widest uppercase">PRIMARY</Badge>}
               </div>
               <div className="flex flex-col justify-between h-40">
                  <div className="flex justify-between items-start">
                     <div className="w-16 h-10 bg-[var(--foreground)]/5 rounded-md border border-[var(--foreground)]/10 flex items-center justify-center font-black text-[var(--foreground)] italic text-xs">
                        {card.brand}
                     </div>
                     <ShieldCheck className="w-6 h-6 text-primary opacity-40" />
                  </div>
                  <div className="space-y-4">
                     <p className="text-xl font-bold text-[var(--foreground)] tracking-[0.3em]">•••• •••• •••• {card.last4}</p>
                     <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">ASSET HOLDER</p>
                           <p className="text-[10px] font-bold text-[var(--foreground)] uppercase tracking-tight">{card.holder}</p>
                        </div>
                        <div className="space-y-1 text-right">
                           <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">EXPIRY</p>
                           <p className="text-[10px] font-bold text-[var(--foreground)] uppercase tracking-tight">{card.expiry}</p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="pt-6 border-t border-[var(--foreground)]/5 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="p-2.5 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all">
                     <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all">
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
             </Card>
           ))}
         </div>
      </div>

      {/* Security Protocol Strip */}
      <div className="p-10 rounded-[40px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center gap-8">
         <div className="w-14 h-14 rounded-[18px] bg-success/10 border border-success/20 flex items-center justify-center text-success">
            <Lock className="w-7 h-7" />
         </div>
         <div className="space-y-1">
            <h4 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-tight">Bank-Grade Systemty Protocol</h4>
            <p className="text-xs text-text-secondary font-medium leading-relaxed italic">
               Your settlement assets are encrypted using the Global Maritime Security Standard. OceanExotic Global does not store raw CVC or PIN data.
            </p>
         </div>
      </div>
    </div>
  
  );
}
