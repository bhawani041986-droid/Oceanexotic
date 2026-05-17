"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  ChevronRight,
  ChevronLeft,
  Zap,
  Globe,
  Database,
  Users,
  Settings,
  Scale
} from "lucide-react";
import Link from "next/link";

export default function AdminRoleCreatePage() {
  return (

    <div className="space-y-12 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--foreground)]/5 pb-10">
        <div className="space-y-1">
           <Link href="/admin/roles" className="inline-flex items-center gap-2 text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-[var(--foreground)] transition-all group mb-2">
             <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> BACK TO ROLE REGISTRY
           </Link>
          <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight uppercase">Commission Role</h2>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Establishing New Authority Tiers & Permission Nodes</p>
        </div>
        <Button className="h-14 px-10 text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-3">
          <Zap className="w-4 h-4" /> COMMISSION ROLE
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Role Identity Area */}
        <div className="lg:col-span-1 space-y-8">
           <Card className="p-10 space-y-8">
              <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-6">
                 <ShieldCheck className="w-5 h-5 text-primary" />
                 <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase">Role Identity</h3>
              </div>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Authority Title</label>
                    <Input placeholder="e.g. Senior Logistics Mediator" className="h-14 bg-bg-secondary border-[var(--foreground)]/5" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Directive Clearance</label>
                    <select defaultValue="Level-1 (Support)" className="w-full h-14 bg-bg-secondary border border-[var(--foreground)]/5 rounded-[16px] px-6 text-xs font-bold text-[var(--foreground)] outline-none focus:border-primary/50 transition-all">
                       <option>Level-1 (Support)</option>
                       <option>Level-5 (Strategic)</option>
                       <option>Level-9 (Supreme)</option>
                    </select>
                 </div>
              </div>
           </Card>

           <Card className="p-8 bg-bg-secondary/40 border-[var(--foreground)]/5 space-y-4">
              <div className="flex items-center gap-4">
                 <Lock className="w-4 h-4 text-warning" />
                 <p className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">Security Advisory</p>
              </div>
              <p className="text-[9px] text-text-secondary font-medium leading-relaxed italic">
                 New roles inherit no permissions by default. Use the sovereignty matrix to authorize specific node access.
              </p>
           </Card>
        </div>

        {/* Sovereignty Matrix Area */}
        <div className="lg:col-span-2 space-y-10">
           <Card className="p-10 space-y-10">
              <div className="flex items-center justify-between border-b border-[var(--foreground)]/5 pb-6">
                 <div className="flex items-center gap-4">
                    <Database className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase">Sovereignty Matrix</h3>
                 </div>
                 <Badge variant="glass" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[9px] tracking-widest">GRANULAR ACCESS</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[
                   { label: "Global Trade Registry", desc: "Access to all order and harvest data nodes.", icon: <Globe /> },
                   { label: "Settlement Mediation", desc: "Authorize refunds and dispute resolutions.", icon: <Scale /> },
                   { label: "Identity Governance", desc: "Manage user and merchant authority tiers.", icon: <Users /> },
                   { label: "System Calibration", desc: "Modify platform rules and global settings.", icon: <Settings /> },
                 ].map((node) => (
                   <div key={node.label} className="p-6 rounded-[20px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-start gap-6 group hover:border-primary/40 transition-all cursor-pointer">
                      <div className="w-12 h-12 rounded-[16px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-text-secondary group-hover:text-primary transition-all">
                         {React.cloneElement(node.icon as React.ReactElement, { className: "w-5 h-5" })}
                      </div>
                      <div className="flex-1 space-y-2">
                         <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-tight">{node.label}</p>
                            <div className="w-10 h-6 bg-[var(--foreground)]/5 rounded-full relative p-1 transition-colors group-hover:bg-primary/20">
                               <div className="w-4 h-4 bg-[var(--foreground)]/20 rounded-full" />
                            </div>
                         </div>
                         <p className="text-[9px] text-text-secondary font-medium italic leading-relaxed">{node.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>

           <div className="p-10 rounded-[40px] bg-primary/5 border border-primary/20 flex items-center justify-between group">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 rounded-[18px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-glow-purple">
                    <ShieldCheck className="w-7 h-7" />
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-tight">Authority Commitment</h4>
                    <p className="text-xs text-text-secondary font-medium italic">Role commissioning requires Level-9 Supreme Clearance.</p>
                 </div>
              </div>
              <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10">PREVIEW HIERARCHY</Button>
           </div>
        </div>
      </div>
    </div>
  
  );
}
