"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Bell, 
  Send, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Smartphone, 
  Globe,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  Megaphone,
  Radio,
  Signal,
  RotateCcw,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

const MOCK_NOTIFICATIONS = [
  { id: "SIG-001", title: "Global Maintenance Handshake", content: "Platform downtime scheduled for database optimization.", type: "SYSTEM", channel: "GLOBAL", status: "SENT", date: "10 mins ago" },
  { id: "SIG-002", title: "New Commission Protocol Active", content: "Updated commission rates for sustainable fisheries.", type: "FINANCE", channel: "MERCHANTS", status: "SCHEDULED", date: "In 2 hours" },
  { id: "SIG-003", title: "Cold-Chain Integrity Alert", content: "Unusual temperature variance detected in SEC-04.", type: "CRITICAL", channel: "LOGISTICS", status: "FAILED", date: "1 hour ago" },
  { id: "SIG-004", title: "Welcome to OceanExotic Global v2.4", content: "New biometric handshake features now active.", type: "UPDATE", channel: "ALL", status: "SENT", date: "5 hours ago" },
];

const REVENUE_METRICS = [
  { label: "Net Revenue", value: "₹42,800", trend: "up", change: "+12%", icon: <Signal /> },
  { label: "Pending Reversals", value: "₹2,400", trend: "down", change: "-2%", icon: <RotateCcw /> },
  { label: "Auth Settlements", value: "₹18,200", trend: "up", change: "+5%", icon: <CheckCircle2 /> },
  { label: "Liabilities", value: "₹8,400", trend: "up", change: "+1%", icon: <AlertTriangle /> },
];

export default function AdminNotificationsPage() {
  const { toast } = useToast(
  );
  const [activeTab, setActiveTab] = useState<"history" | "broadcast">("history"
  );

  return (

    <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Settlement Reversal</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Governing Global Platform Refunds & Financial Corrections</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
           <Button variant="outline" className="w-full sm:w-auto h-10 md:h-12 px-6 md:px-8 text-[8px] md:text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2 md:gap-3 border-[var(--foreground)]/5 rounded-lg md:rounded-xl italic">
              <Download className="w-3.5 md:w-4 h-3.5 md:h-4 text-primary shadow-glow-purple/5" /> EXPORT LEDGER
           </Button>
           <Button variant="primary" className="w-full sm:w-auto h-10 md:h-12 px-6 md:px-8 text-[8px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic">
             <RotateCcw className="w-3.5 md:w-4 h-3.5 md:h-4" /> BATCH REVERSAL
           </Button>
        </div>
      </div>

      {activeTab === "broadcast" ? (
        <div className="max-w-4xl mx-auto space-y-[10px] md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <Card className="p-[10px] md:p-12 space-y-8 md:space-y-10 relative overflow-hidden rounded-[24px] md:rounded-[48px] shadow-premium bg-bg-secondary/20 border-[var(--foreground)]/5">
              {/* Financial Pulse Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[10px] md:gap-8">
                {REVENUE_METRICS.map((metric) => (
                  <Card key={metric.label} className="p-[10px] md:p-8 space-y-4 md:space-y-6 bg-bg-secondary/20 border-[var(--foreground)]/5 hover:border-primary/20 transition-all group rounded-[24px] md:rounded-[40px] shadow-premium">
                    <div className="flex items-center justify-between">
                       <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-[var(--foreground)] transition-all shadow-glow-purple/5">
                          {React.cloneElement(metric.icon as React.ReactElement, { className: "w-4 md:w-5 h-4 md:h-5" })}
                       </div>
                       <div className={`flex items-center gap-1 text-[8px] md:text-[10px] font-black uppercase tracking-widest italic ${metric.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                          {metric.trend === 'up' ? <ArrowUpRight className="w-3 md:w-3.5 h-3 md:h-3.5" /> : <ArrowDownRight className="w-3 md:w-3.5 h-3 md:h-3.5" />}
                          {metric.change}
                       </div>
                    </div>
                    <div className="space-y-0.5 md:space-y-1">
                       <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{metric.label}</p>
                       <h4 className="text-xl md:text-2xl font-black text-[var(--foreground)] italic tracking-tighter">{metric.value}</h4>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-4 md:space-y-6 relative z-10">
                 <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-[16px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-glow-purple/10">
                       <Megaphone className="w-5 md:w-6 h-5 md:h-6" />
                    </div>
                    <div className="space-y-0.5 md:space-y-1">
                       <h3 className="text-lg md:text-xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Compose Strategic Signal</h3>
                       <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Authorized Administrative Broadcast</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Signal Title</label>
                       <Input placeholder="Enter directive headline..." className="h-14 bg-bg-secondary/50 font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Signal Type</label>
                       <select defaultValue="SYSTEM DIRECTIVE" className="w-full h-14 bg-bg-secondary/50 border border-[var(--foreground)]/5 rounded-[16px] px-4 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] outline-none focus:border-primary/50 transition-all">
                          <option>SYSTEM DIRECTIVE</option>
                          <option>FINANCE ALERT</option>
                          <option>CRITICAL SECURITY</option>
                          <option>GENERAL UPDATE</option>
                       </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Signal Content</label>
                       <textarea 
                         placeholder="Enter detailed signal parameters..." 
                         className="w-full h-40 bg-bg-secondary/50 border border-[var(--foreground)]/5 rounded-[24px] p-6 text-sm font-medium text-[var(--foreground)] outline-none focus:border-primary/50 transition-all resize-none"
                       />
                    </div>
                 </div>

                 <div className="pt-10 flex justify-end gap-6">
                    <Button variant="ghost" className="h-14 px-10 text-[10px] font-black tracking-widest uppercase">CANCEL SIGNAL</Button>
                    <Button className="h-14 px-12 text-[10px] font-black tracking-widest uppercase shadow-glow-purple gap-4" onClick={() => toast("Signal successfully broadcast across all authorized nodes.", "success")}>
                       <Send className="w-4 h-4" /> BROADCAST SIGNAL
                    </Button>
                 </div>
              </div>
           </Card>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="grid grid-cols-1 gap-6">
              {MOCK_NOTIFICATIONS.map((notif) => (
                 <Card key={notif.id} className="p-[10px] md:p-8 hover:border-primary/20 transition-all group cursor-pointer relative overflow-hidden rounded-[24px] md:rounded-[40px] shadow-premium bg-bg-secondary/20 border-[var(--foreground)]/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
                       <div className="flex gap-4 md:gap-6">
                          <div className={cn(
                            "w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-[20px] flex items-center justify-center border transition-all shadow-glow-purple/5",
                            notif.type === 'CRITICAL' ? "bg-danger/10 border-danger/20 text-danger" : 
                            notif.type === 'SYSTEM' ? "bg-primary/10 border-primary/20 text-primary" :
                            "bg-[var(--foreground)]/5 border-[var(--foreground)]/10 text-text-secondary"
                          )}>
                             {notif.type === 'CRITICAL' ? <AlertTriangle className="w-5 md:w-6 h-5 md:h-6" /> : <Signal className="w-5 md:w-6 h-5 md:h-6" />}
                          </div>
                          <div className="space-y-1.5 md:space-y-2 max-w-2xl">
                             <div className="flex items-center gap-2 md:gap-3">
                                <h4 className="text-sm md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic group-hover:text-primary transition-colors">{notif.title}</h4>
                                <Badge variant={notif.status === 'SENT' ? 'success' : notif.status === 'SCHEDULED' ? 'warning' : 'danger'} className="text-[7px] md:text-[8px] font-black italic px-2">
                                   {notif.status}
                                </Badge>
                             </div>
                             <p className="text-[10px] md:text-sm text-text-secondary font-black italic leading-relaxed opacity-60">"{notif.content}"</p>
                             <div className="flex items-center gap-6 pt-2">
                                <div className="flex items-center gap-2">
                                   <Globe className="w-3.5 h-3.5 text-primary opacity-40" />
                                   <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Channel: {notif.channel}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                   <Signal className="w-3.5 h-3.5 text-primary opacity-40" />
                                   <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">ID: {notif.id}</span>
                                </div>
                             </div>
                          </div>
                       </div>
                       <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{notif.date}</span>
                          <div className="flex gap-2">
                             <button className="p-3 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 hover:border-primary/40 hover:text-primary transition-all">
                                <MoreVertical className="w-4 h-4" />
                             </button>
                             <button className="p-3 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 hover:border-danger/40 hover:text-danger transition-all">
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                    </div>
                 </Card>
              ))}
           </div>
           
           <div className="flex items-center justify-center pt-10">
              <Button variant="outline" className="h-12 px-10 text-[10px] font-black tracking-widest uppercase border-[var(--foreground)]/10 opacity-60 hover:opacity-100">LOAD ARCHIVED SIGNALS</Button>
           </div>
        </div>
      )}
    </div>
  
  );
}
