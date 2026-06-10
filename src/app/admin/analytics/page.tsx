"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Activity, Zap, Globe, TrendingUp, TrendingDown, Clock, 
  Layers, Cpu, Monitor, Loader2, Download, Fish, Anchor, ShieldAlert
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const generateCSV = () => {
    if (!data) return;
    const csvRows = [];
    csvRows.push(['Metric', 'Value']);
    csvRows.push(['Total Revenue', data.totalRevenue]);
    csvRows.push(['Average Settlement', data.avgSettlement]);
    csvRows.push(['Peak Velocity', data.peakVelocity]);
    csvRows.push(['Active Sectors', data.activeSectors]);
    csvRows.push(['Fulfillment SLA', data.fulfillmentRate + '%']);
    csvRows.push(['Loss Rate', data.lossMetrics?.lossRate + '%']);
    csvRows.push(['Lost Revenue', data.lossMetrics?.lostRevenue]);
    csvRows.push([]);
    csvRows.push(['Top Seafood', 'Quantity Sold', 'Revenue Generated']);
    (data.topCatch || []).forEach((c: any) => {
       csvRows.push([c.name, c.qty, c.revenue]);
    });
    
    const csvString = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `oceanexotic-financials-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4 animate-fade-in">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic">Synchronizing Live Macro-Metrics...</p>
      </div>
    );
  }

  const chartData = data?.chartData || [];
  const pulseData = data?.pulse || [];
  const readinessMetrics = data?.metrics || [];
  const topCatch = data?.topCatch || [];
  const topAgents = data?.topAgents || [];
  const lossMetrics = data?.lossMetrics || { lostRevenue: 0, lossRate: "0.00" };

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
           <Button onClick={generateCSV} variant="outline" className="text-[8px] md:text-[10px] font-black tracking-widest uppercase flex items-center gap-2 border-primary/20 hover:bg-primary/10 transition-colors italic">
              <Download className="w-3 md:w-4 h-3 md:h-4 text-primary" /> FINANCIAL EXPORT
           </Button>
           <div className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-1.5 md:py-3 rounded-full bg-success/10 border border-success/20 text-success text-[7px] md:text-[10px] font-black tracking-widest uppercase animate-pulse italic shadow-glow-success/5">
              <Activity className="w-3 md:w-4 h-3 md:h-4" /> LIVE DATA STREAM
           </div>
        </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[10px] md:gap-10">
         
         {/* Recharts Trade Velocity */}
         <Card className="xl:col-span-2 p-[10px] md:p-8 space-y-4 md:space-y-8 bg-bg-secondary/20 relative overflow-hidden group rounded-[24px] md:rounded-[48px] border-[var(--foreground)]/5 shadow-premium">
            <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-primary/5 blur-[80px] md:blur-[100px] rounded-full -mr-32 -mt-32 md:-mr-48 md:-mt-48 transition-all group-hover:scale-110" />
            <div className="flex items-center justify-between border-b border-[var(--foreground)]/5 pb-3 md:pb-6 relative z-10">
               <div className="space-y-0.5 md:space-y-1">
                  <h3 className="text-sm md:text-xl font-black text-[var(--foreground)] tracking-tighter uppercase flex items-center gap-2 md:gap-3 italic">
                    <TrendingUp className="w-3.5 md:w-5 md:h-5 text-primary shadow-glow-purple/10" /> 30-Day Velocity
                  </h3>
                  <p className="text-[7px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Interactive Trajectory Matrix</p>
               </div>
               <Badge variant="glass" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[7px] md:text-[9px] italic font-black">TRAILING 30</Badge>
            </div>
            
            {/* Interactive Recharts Component */}
            <div className="h-56 md:h-80 w-full relative z-10 -ml-4 md:-ml-0">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#7E3AF2" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#7E3AF2" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="name" tick={{fontSize: 9, fill: 'var(--text-secondary)'}} tickLine={false} axisLine={false} dy={10} minTickGap={20} />
                   <YAxis tick={{fontSize: 9, fill: 'var(--text-secondary)'}} tickLine={false} axisLine={false} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                     itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                     labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                     formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                   />
                   <Area type="monotone" dataKey="revenue" stroke="#7E3AF2" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
            
            <div className="flex items-center justify-between pt-4 md:pt-6 border-t border-[var(--foreground)]/5 relative z-10">
               <div className="flex gap-4 md:gap-8">
                  <div className="space-y-0.5 md:space-y-1">
                     <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Total Yield</p>
                     <p className="text-base md:text-lg font-black text-success italic tracking-tighter">₹{data?.totalRevenue?.toLocaleString('en-IN') || "0"}</p>
                  </div>
                  <div className="space-y-0.5 md:space-y-1">
                     <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Avg. Settlement</p>
                     <p className="text-base md:text-lg font-black text-[var(--foreground)] italic tracking-tighter">₹{data?.avgSettlement?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || "0"}</p>
                  </div>
               </div>
            </div>
         </Card>

         {/* Loss Rate & Macro Stats */}
         <div className="space-y-[10px] md:space-y-8">
            <Card className="p-[10px] md:p-8 space-y-4 md:space-y-6 bg-gradient-to-br from-danger/5 to-transparent border-danger/10 rounded-[24px] md:rounded-[48px] shadow-glow-danger/5">
               <div className="flex items-center gap-3 md:gap-4 border-b border-danger/10 pb-4">
                  <ShieldAlert className="w-4 h-4 md:w-5 md:h-5 text-danger" />
                  <h3 className="text-base md:text-lg font-black text-danger tracking-tighter uppercase italic">Cold-Chain Loss Rate</h3>
               </div>
               <div className="space-y-3">
                  <p className="text-3xl md:text-5xl font-black text-danger italic tracking-tighter">{lossMetrics.lossRate}%</p>
                  <p className="text-[8px] md:text-[10px] font-black text-danger/60 uppercase tracking-widest italic">Revenue lost to Spoilage & Refunds</p>
                  <div className="flex items-center justify-between pt-4 border-t border-danger/10">
                     <p className="text-[8px] font-black text-danger/50 uppercase tracking-widest">Lost Capital</p>
                     <p className="text-xs font-black text-danger">₹{lossMetrics.lostRevenue.toLocaleString('en-IN')}</p>
                  </div>
               </div>
            </Card>

            <Card className="p-[10px] md:p-8 space-y-4 md:space-y-6 bg-gradient-to-br from-primary/10 to-transparent border-[var(--foreground)]/5 rounded-[24px] md:rounded-[48px] relative overflow-hidden group shadow-premium">
               <div className="absolute top-0 right-0 p-4 md:p-6 opacity-20">
                  <Globe className="w-8 h-8 md:w-12 md:h-12 text-primary" />
               </div>
               <div className="space-y-3 relative z-10">
                  <h4 className="text-xs md:text-sm font-black text-[var(--foreground)] uppercase tracking-tighter italic">Macro-Sourcing Reach</h4>
                  <div className="space-y-1">
                     <p className="text-3xl md:text-4xl font-black text-[var(--foreground)] italic tracking-tighter">{data?.activeSectors || 1}</p>
                     <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Active Maritime Sectors</p>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--foreground)]/5 rounded-full overflow-hidden mt-4">
                     <div className="h-full bg-primary rounded-full shadow-glow-purple" style={{ width: `${Math.min((data?.activeSectors || 1) * 10, 100)}%` }} />
                  </div>
               </div>
            </Card>
         </div>
      </div>

      {/* Secondary Matrices: Top Catch & Logistics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[10px] md:gap-10">
         
         {/* Top Catch Matrix */}
         <Card className="p-[10px] md:p-8 space-y-6 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[24px] md:rounded-[40px]">
            <div className="flex items-center gap-3 border-b border-[var(--foreground)]/5 pb-4">
               <Fish className="w-5 h-5 text-primary" />
               <h3 className="text-sm md:text-base font-black text-[var(--foreground)] tracking-tighter uppercase italic">Best-Selling Catch Matrix</h3>
            </div>
            <div className="space-y-4">
               {topCatch.map((catchItem: any, index: number) => (
                  <div key={catchItem.id} className="flex items-center justify-between p-3 rounded-2xl bg-[var(--foreground)]/5 hover:bg-primary/5 transition-colors border border-[var(--foreground)]/5">
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-[var(--foreground)]/5 flex items-center justify-center text-[10px] font-black text-text-secondary">#{index + 1}</div>
                        <div>
                           <p className="text-[10px] md:text-xs font-black text-[var(--foreground)] uppercase tracking-tighter italic">{catchItem.name}</p>
                           <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest opacity-60">{catchItem.qty} UNITS SOLD</p>
                        </div>
                     </div>
                     <p className="text-xs font-black text-success italic tracking-tighter">₹{catchItem.revenue.toLocaleString('en-IN')}</p>
                  </div>
               ))}
            </div>
         </Card>

         {/* Fleet Tracking */}
         <Card className="p-[10px] md:p-8 space-y-6 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[24px] md:rounded-[40px]">
            <div className="flex items-center gap-3 border-b border-[var(--foreground)]/5 pb-4">
               <Anchor className="w-5 h-5 text-warning" />
               <h3 className="text-sm md:text-base font-black text-[var(--foreground)] tracking-tighter uppercase italic">Logistics Velocity Leaders</h3>
            </div>
            <div className="space-y-4">
               {topAgents.map((agent: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-[var(--foreground)]/5 hover:bg-warning/5 transition-colors border border-[var(--foreground)]/5">
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center text-[10px] font-black text-warning">A{index + 1}</div>
                        <div>
                           <p className="text-[10px] md:text-xs font-black text-[var(--foreground)] uppercase tracking-tighter italic">{agent.name}</p>
                           <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest opacity-60">{agent.deliveries} MISSIONS</p>
                        </div>
                     </div>
                     <div className="flex flex-col items-end">
                        <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest opacity-60 mb-1">SLA INTEGRITY</p>
                        <Badge variant="success" className="text-[8px] font-black">{agent.sla}</Badge>
                     </div>
                  </div>
               ))}
            </div>
         </Card>

      </div>
    </div>
  );
}
