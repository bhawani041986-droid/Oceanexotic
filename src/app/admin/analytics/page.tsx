"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Activity, 
  Zap, 
  Globe, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  ArrowRight,
  ChevronRight,
  Layers,
  Cpu,
  Monitor,
  Loader2
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics');
        if (res.ok) {
          const json = await res.json();
          if (json.success) setData(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Live refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4 animate-fade-in">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic">Synchronizing Live Macro-Metrics...</p>
      </div>
    );
  }

  const chartData = data?.chartData || [60, 45, 80, 55, 90, 70, 85, 40, 65, 75, 50, 95, 82, 68, 55, 88, 72, 90, 60, 45, 85, 70, 95, 80];
  const pulseData = data?.pulse || [
    { label: "Pacific Node Yield", value: "+12.4%", trend: "up" },
    { label: "Arctic Fulfilment", value: "-2.1%", trend: "down" },
    { label: "Atlantic Sourcing", value: "+8.5%", trend: "up" },
  ];
  const readinessMetrics = data?.metrics || [
    { label: "Cold-Chain Integrity", value: "99.98%", status: "OPTIMAL" },
    { label: "Fulfillment SLA", value: "98.2h", status: "STABLE" },
    { label: "Node Latency", value: "14ms", status: "FAST" },
  ];

  return (

    <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
      
      {/* Real-time Pulse Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase flex items-center justify-center md:justify-start gap-2 md:gap-4 italic shadow-glow-purple/5">
            <Monitor className="w-5 h-5 md:w-8 md:h-8 text-primary shadow-glow-purple/10" /> Global Pulse
          </h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Real-Time Macro-Economic Monitoring of the OceanExotic Global Network</p>
        </div>
        <div className="flex items-center justify-center gap-3 md:gap-4">
           <div className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-1.5 md:py-3 rounded-full bg-success/10 border border-success/20 text-success text-[7px] md:text-[10px] font-black tracking-widest uppercase animate-pulse italic shadow-glow-success/5">
              <Activity className="w-3 md:w-4 h-3 md:h-4" /> LIVE DATA STREAM ACTIVE
           </div>
        </div>
      </div>

      {/* Analytics Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px] md:gap-10">
         
         {/* Trade Velocity Component */}
         <Card className="md:col-span-2 p-[10px] md:p-8 space-y-4 md:space-y-10 bg-bg-secondary/20 relative overflow-hidden group rounded-[24px] md:rounded-[48px] border-[var(--foreground)]/5 shadow-premium">
            <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-primary/5 blur-[80px] md:blur-[100px] rounded-full -mr-32 -mt-32 md:-mr-48 md:-mt-48 transition-all group-hover:scale-110" />
            <div className="flex items-center justify-between border-b border-[var(--foreground)]/5 pb-3 md:pb-8 relative z-10">
               <div className="space-y-0.5 md:space-y-1">
                  <h3 className="text-sm md:text-xl font-black text-[var(--foreground)] tracking-tighter uppercase flex items-center gap-2 md:gap-3 italic">
                    <TrendingUp className="w-3.5 md:w-5 md:h-5 text-primary shadow-glow-purple/10" /> Settlement Velocity
                  </h3>
                  <p className="text-[7px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Global Order Commissions per Sector</p>
               </div>
               <Badge variant="glass" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[7px] md:text-[9px] italic font-black">LAST 24H</Badge>
            </div>
            
            <div className="h-40 md:h-72 flex items-end gap-1 md:gap-3 px-1 md:px-2 relative z-10">
               {chartData.map((h: number, i: number) => (
                 <div key={i} className="flex-1 space-y-2 md:space-y-4 group">
                    <div className="relative w-full bg-[var(--foreground)]/5 rounded-t-[2px] md:rounded-t-[8px] overflow-hidden min-h-[2px] md:min-h-[5px]" style={{ height: `${h}%` }}>
                       <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-100 transition-all duration-500 shadow-glow-purple" />
                    </div>
                 </div>
               ))}
            </div>
            
            <div className="flex items-center justify-between pt-4 md:pt-6 border-t border-[var(--foreground)]/5 relative z-10">
               <div className="flex gap-4 md:gap-8">
                  <div className="space-y-0.5 md:space-y-1">
                     <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Peak Velocity</p>
                     <p className="text-base md:text-lg font-black text-[var(--foreground)] italic tracking-tighter">₹{data?.peakVelocity?.toLocaleString('en-IN') || "0"}</p>
                  </div>
                  <div className="space-y-0.5 md:space-y-1">
                     <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Avg. Settlement</p>
                     <p className="text-base md:text-lg font-black text-[var(--foreground)] italic tracking-tighter">₹{data?.avgSettlement?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || "0"}</p>
                  </div>
               </div>
               <Button variant="ghost" className="text-[8px] md:text-[10px] font-black tracking-widest uppercase opacity-40 hover:opacity-100 flex items-center gap-2 md:gap-3 italic">
                  SECTOR BREAKDOWN <ChevronRight className="w-3.5 md:w-4 h-3.5 md:h-4" />
               </Button>
            </div>
         </Card>

         {/* Signal Hub Integrity */}
         <div className="space-y-[10px] md:space-y-8">
            <Card className="p-[10px] md:p-10 space-y-6 md:space-y-8 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[24px] md:rounded-[48px] shadow-glow-purple/5">
               <div className="flex items-center gap-3 md:gap-4 border-b border-[var(--foreground)]/5 pb-4 md:pb-6">
                  <Zap className="w-4 h-4 md:w-5 md:h-5 text-warning" />
                  <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Sourcing Pulse</h3>
               </div>
               <div className="space-y-4 md:space-y-8">
                  {pulseData.map((node: any) => (
                    <div key={node.label} className="flex items-center justify-between px-1">
                       <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{node.label}</p>
                       <div className={`flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-black italic tracking-tighter ${node.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                          {node.trend === 'up' ? <TrendingUp className="w-3.5 md:w-4 h-3.5 md:h-4" /> : <TrendingDown className="w-3.5 md:w-4 h-3.5 md:h-4" />}
                          {node.value}
                       </div>
                    </div>
                  ))}
               </div>
            </Card>

            <Card className="p-[10px] md:p-10 space-y-4 md:space-y-8 bg-gradient-to-br from-primary/10 to-transparent border-[var(--foreground)]/5 rounded-[24px] md:rounded-[48px] relative overflow-hidden group shadow-premium">
               <div className="absolute top-0 right-0 p-4 md:p-6 opacity-20">
                  <Globe className="w-8 h-8 md:w-12 md:h-12 text-primary" />
               </div>
               <div className="space-y-3 md:space-y-4 relative z-10">
                  <h4 className="text-xs md:text-sm font-black text-[var(--foreground)] uppercase tracking-tighter italic">Macro-Sourcing Reach</h4>
                  <div className="space-y-1">
                     <p className="text-3xl md:text-4xl font-black text-[var(--foreground)] italic tracking-tighter">{data?.activeSectors || 1}</p>
                     <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Active Maritime Sectors</p>
                  </div>
                  <div className="h-1 md:h-1.5 w-full bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                     <div className="h-full bg-primary rounded-full shadow-glow-purple" style={{ width: `${Math.min((data?.activeSectors || 1) * 10, 100)}%` }} />
                  </div>
               </div>
            </Card>
         </div>
      </div>

      {/* Operational Readiness Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px] md:gap-10">
         {readinessMetrics.map((stat: any, index: number) => (
            <Card key={stat.label} className="p-[10px] md:p-8 space-y-4 md:space-y-6 bg-bg-secondary/20 hover:border-primary/20 transition-all border-[var(--foreground)]/5 group rounded-[24px] md:rounded-[40px] shadow-glow-purple/5">
               <div className="flex items-center justify-between">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-[16px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                     {index === 0 && <Layers className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
                     {index === 1 && <Clock className="w-5 h-5 md:w-6 md:h-6 text-success" />}
                     {index === 2 && <Cpu className="w-5 h-5 md:w-6 md:h-6 text-warning" />}
                  </div>
                  <Badge variant={stat.status === "OPTIMAL" ? "success" : stat.status === "WARNING" ? "warning" : "secondary"} className="h-5 md:h-6 px-2 md:px-3 text-[7px] md:text-[8px] font-black tracking-widest italic uppercase">
                     {stat.status}
                  </Badge>
               </div>
               <div className="space-y-0.5 md:space-y-1">
                  <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{stat.label}</p>
                  <h4 className="text-lg md:text-2xl font-black text-[var(--foreground)] italic tracking-tighter">{stat.value}</h4>
               </div>
            </Card>
         ))}
      </div>
    </div>
  
  );
}
