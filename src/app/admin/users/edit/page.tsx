"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ShieldAlert, 
  Star, 
  RotateCcw,
  Edit3,
  BadgeCheck,
  Zap,
  Globe,
  Clock,
  History,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminEditUserPage() {
  const { toast } = useToast(
  );
  const router = useRouter(
  );
  const params = useParams(
  );
  const [isSubmitting, setIsSubmitting] = useState(false
  );
  const [isMounted, setIsMounted] = useState(false
  );

  useEffect(() => {
    setIsMounted(true
  );
  }, []
  );

  const handleSave = () => {
    setIsSubmitting(true
  );
    // Simulate Sovereign Profile Modification
    setTimeout(() => {
      setIsSubmitting(false
  );
      toast("Identity profile successfully synchronized.", "success"
  );
      router.push("/admin/users"
  );
    }, 2000
  );
  };

  if (!isMounted) return null;

  return (

    <div className="space-y-12 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--foreground)]/5 pb-10">
        <div className="flex items-center gap-6">
           <Link href="/admin/users">
              <button className="w-12 h-12 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-text-secondary hover:text-[var(--foreground)] transition-all">
                 <ArrowLeft className="w-5 h-5" />
              </button>
           </Link>
           <div className="space-y-1">
              <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight uppercase italic flex items-center gap-4">
                 <Edit3 className="w-8 h-8 text-primary" /> Edit Citizen <span className="text-primary/60">{params?.id}</span>
              </h2>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Modifying Sovereign Identity Parameters within the Global Registry</p>
           </div>
        </div>
        <div className="flex gap-4">
           <Button variant="ghost" className="h-12 px-8 text-[10px] font-black tracking-widest uppercase flex items-center gap-3">
              <RotateCcw className="w-4 h-4" /> REVERT CHANGES
           </Button>
           <Button 
             onClick={handleSave}
             disabled={isSubmitting}
             className="h-12 px-10 text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-3"
           >
             <Save className="w-4 h-4" /> {isSubmitting ? "SYNCING..." : "COMMIT MODIFICATIONS"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-10">
           <Card className="p-10 space-y-8 bg-bg-secondary/40 border-[var(--foreground)]/5">
              <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-6">
                 <User className="w-5 h-5 text-primary" />
                 <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase italic">Sovereign Identity Parameters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Citizen Nomenclature</label>
                    <Input defaultValue="Admiral Morgan" className="h-14 bg-bg-secondary border-[var(--foreground)]/10 font-bold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Communication Node (Email)</label>
                    <div className="relative">
                       <Input defaultValue="morgan@ocean.com" className="h-14 pl-12 bg-bg-secondary border-[var(--foreground)]/10 font-bold" />
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Mobile Uplink</label>
                    <div className="relative">
                       <Input defaultValue="+91 98765 43210" className="h-14 pl-12 bg-bg-secondary border-[var(--foreground)]/10 font-bold" />
                       <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Sovereign Role</label>
                    <select defaultValue="ADMIRAL (ADMIN)" className="w-full h-14 bg-bg-secondary border border-[var(--foreground)]/10 rounded-[16px] px-4 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] outline-none focus:border-primary/50 transition-all">
                       <option value="GLOBAL CITIZEN (CUSTOMER)">GLOBAL CITIZEN (CUSTOMER)</option>
                       <option value="FLEET MERCHANT (SELLER)">FLEET MERCHANT (SELLER)</option>
                       <option value="ADMIRAL (ADMIN)">ADMIRAL (ADMIN)</option>
                    </select>
                 </div>
              </div>
           </Card>

           <Card className="p-10 space-y-8 bg-bg-secondary/40 border-[var(--foreground)]/5">
              <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-6">
                 <History className="w-5 h-5 text-primary" />
                 <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase italic">Registry Activity Pulse</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="p-6 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-2">
                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Total Trades</p>
                    <p className="text-2xl font-black text-[var(--foreground)]">128</p>
                 </div>
                 <div className="p-6 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-2">
                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Last Arrival</p>
                    <p className="text-sm font-bold text-[var(--foreground)] italic">2 hours ago</p>
                 </div>
                 <div className="p-6 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-2">
                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Market Value</p>
                    <p className="text-xl font-black text-primary italic">₹42,800</p>
                 </div>
              </div>
           </Card>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-10">
           {/* Governance Status */}
           <Card className="p-8 space-y-6 bg-bg-secondary/40 border-[var(--foreground)]/5">
              <div className="flex items-center gap-3">
                 <BadgeCheck className="w-4 h-4 text-primary" />
                 <h4 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest italic">Governance Status</h4>
              </div>
              <div className="space-y-4">
                 {[
                   { id: 'VERIFIED', label: 'VERIFIED CITIZEN', icon: <ShieldCheck className="w-3.5 h-3.5" />, active: true, color: 'text-success' },
                   { id: 'PENDING', label: 'PENDING AUDIT', icon: <Clock className="w-3.5 h-3.5" />, active: false, color: 'text-warning' },
                   { id: 'SUSPENDED', label: 'SUSPENDED ACCESS', icon: <ShieldAlert className="w-3.5 h-3.5" />, active: false, color: 'text-danger' },
                 ].map((status) => (
                    <button key={status.id} className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-[20px] border transition-all duration-300",
                      status.active ? "bg-primary/10 border-primary/40 text-[var(--foreground)] shadow-glow-purple" : "bg-[var(--foreground)]/5 border-[var(--foreground)]/5 text-text-secondary"
                    )}>
                       <div className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center",
                         status.active ? "bg-primary text-[var(--foreground)]" : "bg-[var(--foreground)]/5"
                       )}>
                          {status.icon}
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-widest">{status.label}</p>
                    </button>
                 ))}
              </div>
           </Card>

           {/* Reputation Governance */}
           <Card className="p-8 space-y-6 bg-bg-secondary/40 border-[var(--foreground)]/5">
              <div className="flex items-center gap-3">
                 <Star className="w-4 h-4 text-primary" />
                 <h4 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest italic">Reputation Rank</h4>
              </div>
              <div className="space-y-4">
                 {[
                   { id: 'BRONZE', label: 'BRONZE CITIZEN', icon: <Zap className="w-3.5 h-3.5" />, active: false },
                   { id: 'SILVER', label: 'SILVER VOYAGER', icon: <Globe className="w-3.5 h-3.5" />, active: false },
                   { id: 'GOLD', label: 'GOLD MASTER', icon: <Star className="w-3.5 h-3.5" />, active: false },
                   { id: 'PLATINUM', label: 'PLATINUM ADMIRAL', icon: <ShieldCheck className="w-3.5 h-3.5" />, active: true },
                 ].map((rank) => (
                    <button key={rank.id} className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-[20px] border transition-all duration-300 text-left",
                      rank.active ? "bg-primary/10 border-primary/40 text-[var(--foreground)] shadow-glow-purple" : "bg-[var(--foreground)]/5 border-[var(--foreground)]/5 text-text-secondary"
                    )}>
                       <div className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center",
                         rank.active ? "bg-primary text-[var(--foreground)]" : "bg-[var(--foreground)]/5"
                       )}>
                          {rank.icon}
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-widest">{rank.label}</p>
                    </button>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  
  );
}
