"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  MessageSquare, 
  FileText, 
  Ship, 
  LifeBuoy, 
  ChevronRight, 
  Search,
  Mail,
  Phone,
  ShieldCheck
} from "lucide-react";
import { Input } from "@/components/ui/Input";

const SUPPORT_TOPICS = [
  { title: "Ordering & Commissioning", icon: <Ship className="text-primary" />, desc: "How to navigate the global harvest registry." },
  { title: "Cold-Chain Protocols", icon: <ShieldCheck className="text-success" />, desc: "Details on our thermal monitoring and logistics." },
  { title: "Settlement & Payments", icon: <FileText className="text-warning" />, desc: "Managing your maritime financial transactions." },
  { title: "Fleet Rank & Loyalty", icon: <LifeBuoy className="text-purple-500" />, desc: "Understanding Admiral ranks and rewards." },
];

export default function CustomerSupportPage() {
  return (

    <div className="max-w-5xl mx-auto space-y-16 py-10 animate-fade-in">
      
      {/* Search Header */}
      <div className="text-center space-y-8">
        <div className="space-y-4">
           <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20">SUPPORT RADAR</Badge>
           <h1 className="text-5xl font-black text-[var(--foreground)] tracking-tight uppercase">How can the Fleet <span className="text-primary">Assist?</span></h1>
           <p className="text-sm font-medium text-text-secondary max-w-xl mx-auto leading-relaxed">
             Access the global maritime knowledge registry or initiate a live signal with our support admirals.
           </p>
        </div>
        <div className="relative max-w-2xl mx-auto group">
          <Input 
            placeholder="Search the knowledge registry (e.g., Shipping, Refunds)..." 
            className="h-16 pl-16 pr-8 text-lg font-bold bg-bg-secondary border-[var(--foreground)]/5 focus:border-primary/50 transition-all rounded-[20px] shadow-premium" 
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Primary Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="p-10 space-y-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 group hover:border-primary/40 transition-all">
            <div className="w-16 h-16 rounded-[24px] bg-primary/20 flex items-center justify-center text-primary shadow-glow-purple group-hover:scale-110 transition-transform">
               <MessageSquare className="w-8 h-8" />
            </div>
            <div className="space-y-4">
               <h3 className="text-2xl font-bold text-[var(--foreground)] tracking-tight uppercase">Initiate Live Signal</h3>
               <p className="text-sm text-text-secondary leading-relaxed">
                  Direct encrypted channel with a Fleet Admiral. Real-time response for urgent harvest commissions.
               </p>
               <Button className="h-14 px-10 text-[11px] font-black tracking-widest uppercase shadow-glow-purple">START LIVE CHAT</Button>
            </div>
         </Card>
         <Card className="p-10 space-y-8 bg-bg-secondary/40 border-[var(--foreground)]/5 group hover:border-[var(--foreground)]/20 transition-all">
            <div className="w-16 h-16 rounded-[24px] bg-[var(--foreground)]/5 flex items-center justify-center text-text-secondary border border-[var(--foreground)]/10 group-hover:scale-110 transition-transform">
               <Mail className="w-8 h-8" />
            </div>
            <div className="space-y-4">
               <h3 className="text-2xl font-bold text-[var(--foreground)] tracking-tight uppercase">Formal Commissioning</h3>
               <p className="text-sm text-text-secondary leading-relaxed">
                  Submit a detailed support directive for complex fleet inquiries. Guaranteed 4h response time.
               </p>
               <Button variant="outline" className="h-14 px-10 text-[11px] font-black tracking-widest uppercase">SUBMIT DIRECTIVE</Button>
            </div>
         </Card>
      </div>

      {/* Knowledge Registry Grid */}
      <section className="space-y-8">
         <div className="space-y-1">
            <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase">Knowledge Registry</h3>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Select a sector to explore fleet documentation</p>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUPPORT_TOPICS.map((topic) => (
               <Card key={topic.title} className="p-8 space-y-6 hover:border-primary/30 cursor-pointer group transition-all bg-bg-secondary/20">
                  <div className="w-12 h-12 rounded-[14px] bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                     {React.cloneElement(topic.icon as React.ReactElement, { className: "w-6 h-6" })}
                  </div>
                  <div className="space-y-2">
                     <h4 className="text-sm font-bold text-[var(--foreground)] tracking-tight leading-tight">{topic.title}</h4>
                     <p className="text-[10px] text-text-secondary font-medium leading-relaxed">{topic.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                     EXPLORE <ChevronRight className="w-3 h-3" />
                  </div>
               </Card>
            ))}
         </div>
      </section>

      {/* Direct Communication Strip */}
      <div className="p-10 rounded-[40px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-around gap-10 text-center">
         <div className="space-y-2">
            <Phone className="w-6 h-6 text-primary mx-auto opacity-40" />
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Global Fleet Line</p>
            <p className="text-sm font-bold text-[var(--foreground)]">+1 (800) OCEAN-FR</p>
         </div>
         <div className="h-12 w-px bg-[var(--foreground)]/5 hidden md:block" />
         <div className="space-y-2">
            <Mail className="w-6 h-6 text-primary mx-auto opacity-40" />
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Direct Dispatch</p>
            <p className="text-sm font-bold text-[var(--foreground)]">admirals@oceanexotic.com</p>
         </div>
         <div className="h-12 w-px bg-[var(--foreground)]/5 hidden md:block" />
         <div className="space-y-2">
            <MessageSquare className="w-6 h-6 text-primary mx-auto opacity-40" />
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Fleet Response Hub</p>
            <p className="text-sm font-bold text-[var(--foreground)]">Live 24/7 Global</p>
         </div>
      </div>

    </div>
  
  );
}
