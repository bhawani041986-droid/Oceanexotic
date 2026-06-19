"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Truck, 
  Calendar,
  DollarSign,
  ChevronRight,
  Clock,
  ArrowUpRight,
  User,
  Navigation,
  X,
  Activity,
  CheckCircle2,
  PackageCheck
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";

export default function AgentHistoryPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [history, setHistory] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [missionLogs, setMissionLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    if (selectedLogId) {
      setIsLoadingLogs(true);
      fetch(`/api/agent/logs?order_id=${selectedLogId}`)
        .then(res => res.json())
        .then(data => {
           if (data.logs && data.logs.length > 0) {
              setMissionLogs(data.logs);
           } else {
              // Fallback to placeholder if no DB logs exist yet
              setMissionLogs([
                 { status: "MISSION DISPATCHED", location_name: "Agent assigned and routing calculated.", created_at: new Date().toISOString() }
              ]);
           }
           setIsLoadingLogs(false);
        })
        .catch(err => {
           console.error(err);
           setIsLoadingLogs(false);
        });
    } else {
      setMissionLogs([]);
    }
  }, [selectedLogId]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/agent/orders?agent_id=${encodeURIComponent(user.id)}`);
      if (res.ok) {
        const data = await res.json();
        const completed = data.filter((m: any) => m.status?.toUpperCase() === 'DELIVERED' || m.status?.toUpperCase() === 'COMPLETED');
        setHistory(completed);
      }
    } catch (error) {
      toast("Archive Handshake Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchHistory();
  }, [user]);

  const filteredHistory = history.filter(item => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customer.toLowerCase().includes(searchTerm.toLowerCase())
  
  );

  return (

    <div className="bg-bg-primary min-h-screen p-6 md:p-10 space-y-10 pb-32">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-[var(--foreground)]">MISSION ARCHIVE</h1>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Historical Yield Governance • {filteredHistory.length} Missions Recorded</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full md:w-auto gap-3">
           <Button variant="outline" className="h-12 w-full sm:w-auto px-6 border-[var(--foreground)]/5 text-[10px] font-black uppercase tracking-widest gap-2 rounded-xl shrink-0">
              <Download className="w-4 h-4 text-primary shrink-0" /> EXPORT
           </Button>
           <Button variant="outline" className="h-12 w-full sm:w-auto px-6 border-[var(--foreground)]/5 text-[10px] font-black uppercase tracking-widest gap-2 rounded-xl shrink-0">
              <Filter className="w-4 h-4 text-primary shrink-0" /> FILTER
           </Button>
        </div>
      </div>

      {/* Search Node */}
      <div className="relative group max-w-2xl">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
         <Input 
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           placeholder="Search Missions, IDs, or Clients..." 
           className="h-16 pl-16 bg-[var(--foreground)]/5 border-[var(--foreground)]/10 rounded-[24px] text-sm text-[var(--foreground)] focus:bg-[var(--foreground)]/10 transition-all outline-none"
         />
      </div>

      {/* History Registry */}
      <div className="space-y-4">
         {loading ? (
            <div className="text-center py-20 text-[var(--foreground)] italic font-black uppercase tracking-widest text-[10px] animate-pulse">Accessing Mission Vault...</div>
         ) : filteredHistory.length === 0 ? (
            <div className="text-center py-20 rounded-[28px] bg-[var(--foreground)]/5 border border-dashed border-[var(--foreground)]/10">
               <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">No Missions Found in Archive</p>
            </div>
         ) : (
           filteredHistory.map((job) => (
             <Card key={job.id} className="p-8 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-[32px] hover:bg-[var(--foreground)]/10 transition-all group overflow-hidden relative">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                   
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center text-primary shrink-0 relative overflow-hidden shadow-glow-purple/10">
                         <History className="w-7 h-7 relative z-10" />
                      </div>
                      <div className="space-y-1.5">
                         <div className="flex items-center gap-3">
                            <h4 className="text-xl font-black text-[var(--foreground)] uppercase italic tracking-tighter leading-none">{job.id}</h4>
                            {job.is_pre_order === 1 && (
                               <span className="px-1.5 py-0.5 rounded-[4px] bg-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-wider border border-amber-500/30">PRE-ORDER</span>
                            )}
                            <Badge variant={job.status === 'DELIVERED' ? 'success' : 'glass'} className="text-[8px] font-black uppercase tracking-widest px-3 italic">
                               {job.status}
                            </Badge>
                         </div>
                         <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">CLIENT: {job.customer}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 gap-8 xl:gap-16 flex-1">
                      <div className="space-y-1">
                         <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2 opacity-50">
                            <Calendar className="w-3 h-3" /> REGISTERED
                         </p>
                         <p className="text-xs font-bold text-[var(--foreground)] uppercase">{job.time}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2 opacity-50">
                            <Truck className="w-3 h-3" /> AGENT
                         </p>
                         <p className="text-xs font-bold text-[var(--foreground)] uppercase">{job.agent_details.name}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2 opacity-50">
                            <Navigation className="w-3 h-3" /> TRACKING
                         </p>
                         <p className="text-xs font-bold text-primary uppercase">{job.agent_details.tracking}</p>
                      </div>
                      <div className="space-y-1 text-left md:text-right">
                         <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest flex items-center justify-start md:justify-end gap-2 opacity-50">
                            <DollarSign className="w-3 h-3 text-success shrink-0" /> YIELD
                         </p>
                         <p className="text-lg font-black text-success italic leading-none">₹{Math.floor(Math.random() * 500) + 200}</p>
                      </div>
                   </div>

                   <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-6 xl:mt-0">
                      <Button 
                         variant="ghost" 
                         onClick={() => setSelectedLogId(job.id)}
                         className="h-14 w-full sm:w-auto px-6 flex items-center justify-center bg-white/5 rounded-2xl hover:bg-primary hover:text-white transition-all group/btn text-[10px] font-black uppercase tracking-widest italic gap-2 shrink-0">
                         LOGS <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform shrink-0" />
                      </Button>
                   </div>
                </div>

                {/* Delivery Method Indicator */}
                <div className="absolute top-0 right-0 p-2 opacity-20">
                   <p className="text-[6px] font-black uppercase tracking-widest rotate-90 origin-right translate-x-2 text-[var(--foreground)]">{job.agent_details.method}</p>
                </div>
             </Card>
           ))
         )}
      </div>

      {/* Historical Summary */}
      <Card className="p-6 md:p-10 bg-primary/5 border border-dashed border-primary/20 rounded-[32px] flex flex-col md:flex-row items-center gap-6 md:gap-10">
         <div className="w-20 h-20 rounded-[28px] bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-glow-purple/20 relative">
            <TrendingUp className="w-10 h-10" />
            <ArrowUpRight className="absolute top-2 right-2 w-5 h-5" />
         </div>
         <div className="space-y-2 text-center md:text-left flex-1">
            <h3 className="text-lg font-black text-[var(--foreground)] uppercase tracking-widest">Lifetime Fleet Integrity</h3>
            <p className="text-xs text-text-secondary font-medium leading-relaxed max-w-2xl">
               You have successfully orchestrated missions with peak saku freshness guarantees. Your efficiency ranking is currently in the top 2% of the Port Blair sector.
            </p>
         </div>
         <div className="text-center md:text-right w-full md:w-auto mt-4 md:mt-0">
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Calculated Yield</p>
            <p className="text-4xl font-black text-[var(--foreground)] italic tracking-tighter">₹5,42,850</p>
         </div>
      </Card>

      {/* Logs Modal Overlay */}
      {selectedLogId && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => setSelectedLogId(null)} />
            <Card className="relative w-full max-w-lg bg-[#050B18] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8 animate-in slide-in-from-bottom-8 duration-300">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                        <Activity className="w-5 h-5 text-primary" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">MISSION LOGS</h3>
                        <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{selectedLogId}</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedLogId(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               <div className="relative pl-6 border-l-2 border-white/10 space-y-8 py-4">
                  {isLoadingLogs ? (
                     <div className="flex items-center justify-center py-10">
                        <Activity className="w-8 h-8 text-primary animate-spin" />
                     </div>
                  ) : (
                     missionLogs.map((log: any, idx: number) => {
                        const isLast = idx === missionLogs.length - 1;
                        let Icon = Navigation;
                        if (log.status?.includes('HARBOR') || log.status?.includes('PACKED')) Icon = PackageCheck;
                        else if (log.status?.includes('BIOMETRIC') || log.status?.includes('VERIFI')) Icon = CheckCircle2;
                        else if (log.status?.includes('COMPLETED') || log.status?.includes('DELIVERED')) Icon = DollarSign;

                        const timeStr = log.created_at ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "T+0";

                        return (
                           <div key={idx} className="relative">
                              <div className={`absolute -left-[35px] top-0 w-4 h-4 rounded-full border-4 border-[#050B18] ${isLast ? 'bg-success shadow-glow-success' : 'bg-primary shadow-glow-purple'}`} />
                              <div className="flex items-start justify-between gap-4">
                                 <div className="space-y-1">
                                    <h4 className={`text-sm font-black uppercase tracking-widest ${isLast ? 'text-success' : 'text-white'}`}>{log.status || "UPDATE"}</h4>
                                    <p className="text-[10px] text-white/50 font-medium leading-relaxed max-w-[200px]">{log.location_name || log.desc || "Log recorded."}</p>
                                 </div>
                                 <Badge variant="glass" className="text-[8px] font-black uppercase tracking-widest text-white/70 shrink-0">
                                    {timeStr}
                                 </Badge>
                              </div>
                           </div>
                        )
                     })
                  )}
               </div>
               
               <div className="mt-8 pt-6 border-t border-white/10">
                  <Button className="w-full h-12 bg-white/5 border border-white/10 text-white hover:bg-white/10" variant="ghost" onClick={() => setSelectedLogId(null)}>
                     CLOSE ARCHIVE
                  </Button>
               </div>
            </Card>
         </div>
      )}

    </div>
  
  );
}

function TrendingUp(props: any) {
  return (

    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
