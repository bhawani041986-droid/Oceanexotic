"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Activity, 
  Search, 
  Filter, 
  Terminal, 
  ShieldCheck, 
  ShieldAlert, 
  User, 
  Globe, 
  Clock,
  RefreshCw,
  Zap,
  Eye,
  Server,
  Cpu,
  HardDrive
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_ACTIVITY = [
  { id: "LOG-4021", user: "Admiral Morgan", role: "ADMIN", action: "Synchronized Currency Registry (INR)", target: "Global Settings", status: "SUCCESS", time: "2 mins ago", ip: "192.168.1.42" },
  { id: "LOG-4020", user: "Erik Thorwald", role: "SELLER", action: "Updated Harvest Stock (Bluefin Tuna)", target: "Product Node PRD-001", status: "SUCCESS", time: "14 mins ago", ip: "45.12.8.210" },
  { id: "LOG-4019", user: "Sea Scout Sarah", role: "CUSTOMER", action: "Initialized High-Value Checkout", target: "Order ORD-8422", status: "PENDING", time: "28 mins ago", ip: "103.4.22.15" },
  { id: "LOG-4018", user: "System Pulse", role: "SYSTEM", action: "Automated Backup Handshake", target: "Maritime Database", status: "SUCCESS", time: "1 hour ago", ip: "LOCAL_NODE" },
  { id: "LOG-4017", user: "Unknown Signal", role: "ANONYMOUS", action: "Unauthorized 2FA Attempt", target: "Admin Login Node", status: "BLOCKED", time: "2 hours ago", ip: "212.48.9.14" },
];

export default function AdminMonitoringPage() {
  const [isRefreshing, setIsRefreshing] = useState(false
  );

  const handleRefresh = () => {
    setIsRefreshing(true
  );
    setTimeout(() => setIsRefreshing(false), 1500
  );
  };

  return (

    <div className="space-y-[10px] md:space-y-12 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic text-primary shadow-glow-purple/5">Macro-Activity Monitor</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Real-Time System Surveillance of Every Operational Node</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
           <div className="w-full sm:w-auto flex items-center justify-center md:justify-start gap-3 px-6 py-3 rounded-lg md:rounded-full bg-success/10 border border-success/20 text-success text-[8px] md:text-[9px] font-black uppercase tracking-widest italic">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-glow" />
              SYSTEM HEALTH: OPTIMAL
           </div>
           <Button variant="primary" className="w-full sm:w-auto h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic" onClick={handleRefresh} disabled={isRefreshing}>
             <RefreshCw className={cn("w-3.5 md:w-4 h-3.5 md:h-4", isRefreshing && "animate-spin")} /> {isRefreshing ? "SYNCING..." : "SYNC NODES"}
           </Button>
        </div>
      </div>

      {/* Infrastructure Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px] md:gap-8">
         {[
           { label: "Server Response", value: "42ms", icon: <Server />, health: 98 },
           { label: "CPU Load (Admiral Node)", value: "14%", icon: <Cpu />, health: 14 },
           { label: "Database Systemty", value: "8.4 TB", icon: <HardDrive />, health: 62 },
         ].map((stat) => (
           <Card key={stat.label} className="p-[10px] md:p-8 space-y-4 md:space-y-6 bg-bg-secondary/20 border-[var(--foreground)]/5 group rounded-[24px] md:rounded-[40px] shadow-premium">
              <div className="flex items-center justify-between">
                 <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-[var(--foreground)] transition-all shadow-glow-purple/5">
                    {React.cloneElement(stat.icon as React.ReactElement, { className: "w-4 md:w-5 h-4 md:h-5" })}
                 </div>
                 <Badge variant="glass" className="text-[7px] md:text-[8px] tracking-widest italic uppercase px-2">STABLE</Badge>
              </div>
              <div className="space-y-3 md:space-y-4">
                 <div className="space-y-0.5 md:space-y-1">
                    <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{stat.label}</p>
                    <h4 className="text-xl md:text-2xl font-black text-[var(--foreground)] italic tracking-tighter">{stat.value}</h4>
                 </div>
                 <div className="h-1 md:h-1.5 w-full bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary shadow-glow-purple transition-all duration-1000" style={{ width: `${stat.health}%` }} />
                 </div>
              </div>
           </Card>
         ))}
      </div>

      {/* Activity Registry Table */}
      <Card className="p-1 rounded-[24px] md:rounded-[40px] overflow-hidden bg-bg-secondary/20 shadow-premium border-[var(--foreground)]/5">
         <div className="p-[10px] md:p-8 border-b border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6">
            <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4">
               <Terminal className="w-5 h-5 md:w-6 md:h-6 text-primary shadow-glow-purple/10" />
               <div className="space-y-0.5 md:space-y-1">
                  <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Macro-Activity Ledger</h3>
                  <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Sequence of Authorized Handshakes</p>
               </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
               <div className="relative group w-full md:w-80">
                  <Input 
                    placeholder="FILTER ACTIVITY BY IDENTITY..." 
                    className="h-10 md:h-12 pl-10 md:pl-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 focus:border-primary/50 transition-all text-[8px] md:text-[9px] font-black tracking-widest uppercase italic rounded-lg md:rounded-xl" 
                  />
                  <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-3.5 md:w-4 h-3.5 md:h-4 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
               </div>
               <Button variant="outline" size="sm" className="w-full sm:w-auto h-10 md:h-12 px-6 md:px-8 flex items-center justify-center gap-2 md:gap-3 text-[8px] md:text-[9px] font-black uppercase border-[var(--foreground)]/5 rounded-lg md:rounded-xl italic">
                  <Filter className="w-3.5 md:w-4 h-3.5 md:h-4" /> FILTERS
               </Button>
            </div>
         </div>

         <div className="hidden lg:block">
            <Table>
               <TableHeader>
                  <TableRow className="border-[var(--foreground)]/5">
                     <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Operation Identity</TableHead>
                     <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Administrative Role</TableHead>
                     <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">System Action</TableHead>
                     <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Signal Status</TableHead>
                     <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Telemetry (Time/IP)</TableHead>
                     <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary pr-4 md:pr-6">Governance</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {MOCK_ACTIVITY.map((log) => (
                    <TableRow key={log.id} className="group/row border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                       <TableCell>
                          <div className="flex items-center gap-3 md:gap-4">
                             <div className={cn(
                               "w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-[14px] flex items-center justify-center text-[10px] md:text-xs font-black transition-all shadow-glow-purple/5",
                               log.status === "BLOCKED" ? "bg-danger/10 text-danger border border-danger/20" : "bg-[var(--foreground)]/5 text-primary border border-[var(--foreground)]/10"
                             )}>
                                {log.user[0]}
                             </div>
                             <div className="space-y-0.5 md:space-y-1">
                                <p className="font-black text-[var(--foreground)] text-xs md:text-sm uppercase tracking-tighter italic group-hover/row:text-primary transition-colors">{log.user}</p>
                                <p className="text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">ID: {log.id}</p>
                             </div>
                          </div>
                       </TableCell>
                       <TableCell>
                          <Badge variant={
                            log.role === "ADMIN" ? "default" : 
                            log.role === "SYSTEM" ? "success" :
                            log.role === "SELLER" ? "secondary" : "glass"
                          } className="text-[7px] md:text-[9px] italic px-2 uppercase font-black tracking-widest">
                             {log.role}
                          </Badge>
                       </TableCell>
                       <TableCell>
                          <div className="space-y-0.5 md:space-y-1">
                             <p className="text-xs md:text-sm font-black text-[var(--foreground)] uppercase tracking-tighter italic">{log.action}</p>
                             <p className="text-[7px] md:text-[8px] font-black text-primary uppercase tracking-widest italic opacity-60">Target: {log.target}</p>
                          </div>
                       </TableCell>
                       <TableCell>
                          <div className="flex items-center gap-1.5 md:gap-2">
                             {log.status === "SUCCESS" ? (
                               <ShieldCheck className="w-3.5 md:w-4 h-3.5 md:h-4 text-success shadow-glow" />
                             ) : log.status === "BLOCKED" ? (
                               <ShieldAlert className="w-3.5 md:w-4 h-3.5 md:h-4 text-danger shadow-glow" />
                             ) : (
                               <Clock className="w-3.5 md:w-4 h-3.5 md:h-4 text-warning shadow-glow" />
                             )}
                             <span className={cn(
                               "text-[8px] md:text-[10px] font-black uppercase tracking-widest italic",
                               log.status === "SUCCESS" ? "text-success" : 
                               log.status === "BLOCKED" ? "text-danger" : "text-warning"
                             )}>{log.status}</span>
                          </div>
                       </TableCell>
                       <TableCell>
                          <div className="space-y-0.5 md:space-y-1">
                             <p className="text-[9px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic">{log.time}</p>
                             <p className="text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">{log.ip}</p>
                          </div>
                       </TableCell>
                       <TableCell className="text-right pr-4 md:pr-6">
                          <div className="flex justify-end gap-1 md:gap-2">
                             <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                                <Eye className="w-3.5 md:w-4 h-3.5 md:h-4" />
                             </button>
                             <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5">
                                <Zap className="w-3.5 md:w-4 h-3.5 md:h-4" />
                             </button>
                          </div>
                       </TableCell>
                    </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>

         {/* Mobile card list */}
         <div className="lg:hidden space-y-3 p-4">
            {MOCK_ACTIVITY.map((log) => (
               <div key={log.id} className="p-4 rounded-xl border border-[var(--foreground)]/5 bg-bg-card/40 space-y-3">
                  <div className="flex items-start justify-between">
                     <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black transition-all shadow-glow-purple/5",
                          log.status === "BLOCKED" ? "bg-danger/10 text-danger border border-danger/20" : "bg-[var(--foreground)]/5 text-primary border border-[var(--foreground)]/10"
                        )}>
                           {log.user[0]}
                        </div>
                        <div className="space-y-0.5">
                           <p className="font-black text-[var(--foreground)] text-sm uppercase tracking-tighter italic">{log.user}</p>
                           <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">ID: {log.id}</p>
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-1.5">
                        <Badge variant={
                          log.role === "ADMIN" ? "default" : 
                          log.role === "SYSTEM" ? "success" :
                          log.role === "SELLER" ? "secondary" : "glass"
                        } className="text-[7px] italic px-1.5 uppercase font-black tracking-widest">
                           {log.role}
                        </Badge>
                        <div className="flex items-center gap-1">
                           {log.status === "SUCCESS" ? (
                             <ShieldCheck className="w-3 h-3 text-success" />
                           ) : log.status === "BLOCKED" ? (
                             <ShieldAlert className="w-3 h-3 text-danger" />
                           ) : (
                             <Clock className="w-3 h-3 text-warning" />
                           )}
                           <span className={cn(
                             "text-[7px] font-black uppercase tracking-widest italic",
                             log.status === "SUCCESS" ? "text-success" : 
                             log.status === "BLOCKED" ? "text-danger" : "text-warning"
                           )}>{log.status}</span>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-1 py-1">
                     <p className="text-xs font-black text-[var(--foreground)] uppercase tracking-tighter italic">{log.action}</p>
                     <p className="text-[8px] font-black text-primary uppercase tracking-widest italic opacity-60">Target: {log.target}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2.5">
                     <div className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest italic">
                        {log.time} • <span className="opacity-40">{log.ip}</span>
                     </div>
                     <div className="flex gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                           <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5">
                           <Zap className="w-3.5 h-3.5" />
                        </button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </Card>

      {/* Real-Time Pulse Effect */}
      <div className="flex items-center justify-center gap-10 py-10 opacity-40">
         <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest italic">Global Node Sync Active</span>
         </div>
         <div className="w-1 h-1 rounded-full bg-[var(--foreground)]/20" />
         <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest italic">Encrypted Connection Verified</span>
         </div>
      </div>
    </div>
  
  );
}
