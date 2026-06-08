"use client";

import React from "react";
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
  Navigation
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function AgentHistoryPage() {
  const { toast } = useToast(
  );
  const [history, setHistory] = React.useState<any[]>([]
  );
  const [loading, setLoading] = React.useState(true
  );
  const [searchTerm, setSearchTerm] = React.useState(""
  );

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/agent/orders?agent_id=AGENT-742"
  );
      if (res.ok) {
        const data = await res.json(
  );
        // Show all history for this agent
        setHistory(data
  );
      }
    } catch (error) {
      toast("Archive Handshake Failed", "error"
  );
    } finally {
      setLoading(false
  );
    }
  };

  React.useEffect(() => {
    fetchHistory(
  );
  }, []
  );

  const filteredHistory = history.filter(item => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customer.toLowerCase().includes(searchTerm.toLowerCase())
  
  );

  return (

    <div className="bg-bg-primary min-h-screen p-6 md:p-10 space-y-10 pb-32">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--foreground)]">MISSION ARCHIVE</h1>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Historical Yield Governance • {filteredHistory.length} Missions Recorded</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="h-12 px-6 border-[var(--foreground)]/5 text-[10px] font-black uppercase tracking-widest gap-2 rounded-xl">
              <Download className="w-4 h-4 text-primary" /> EXPORT
           </Button>
           <Button variant="outline" className="h-12 px-6 border-[var(--foreground)]/5 text-[10px] font-black uppercase tracking-widest gap-2 rounded-xl">
              <Filter className="w-4 h-4 text-primary" /> FILTER
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
                      <div className="space-y-1 text-right">
                         <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest flex items-center justify-end gap-2 opacity-50">
                            <DollarSign className="w-3 h-3 text-success" /> YIELD
                         </p>
                         <p className="text-lg font-black text-success italic leading-none">₹{Math.floor(Math.random() * 500) + 200}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-4">
                      <Button variant="ghost" className="h-14 px-6 flex items-center justify-center bg-white/5 rounded-2xl hover:bg-primary hover:text-white transition-all group/btn text-[10px] font-black uppercase tracking-widest italic gap-2">
                         LOGS <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
      <Card className="p-10 bg-primary/5 border border-dashed border-primary/20 rounded-[32px] flex flex-col md:flex-row items-center gap-10">
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
         <div className="text-right">
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Calculated Yield</p>
            <p className="text-4xl font-black text-[var(--foreground)] italic tracking-tighter">₹5,42,850</p>
         </div>
      </Card>

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
