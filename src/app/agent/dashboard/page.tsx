"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Navigation, 
  Package, 
  Clock, 
  MapPin, 
  Zap, 
  History,
  CheckCircle2,
  TrendingUp,
  Truck,
  Anchor,
  Map as MapIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";

export default function AgentDashboardPage() {
  const router = useRouter(
  );
  const { toast } = useToast(
  );
  const [isLoading, setIsLoading] = React.useState(true
  );
  const [missions, setMissions] = React.useState<any[]>([]
  );

  const fetchMissions = async () => {
    try {
      const res = await fetch("/api/agent/orders.php?agent_id=AGENT-742"
  );
      if (res.ok) {
        const data = await res.json(
  );
        // Filter for active missions (READY/TRANSIT/SHIPPED)
        const active = data.filter((m: any) => m.status !== 'DELIVERED'
  );
        setMissions(active
  );
      }
    } catch (error) {
      toast("Mission Control Sync Failed", "error"
  );
    } finally {
      setIsLoading(false
  );
    }
  };

  React.useEffect(() => {
    fetchMissions(
  );
  }, []
  );

  const stats = [
    { label: "Active Missions", value: missions.length.toString(), icon: <Navigation className="w-5 h-5" />, color: "text-primary" },
    { label: "Fleet Readiness", value: "OPTIMAL", icon: <CheckCircle2 className="w-5 h-5" />, color: "text-success" },
    { label: "Signal Strength", value: "100%", icon: <TrendingUp className="w-5 h-5" />, color: "text-ocean-blue" },
  ];

  return (

    <div className="bg-bg-primary min-h-screen p-6 md:p-10 space-y-10">
      
      {/* Header - Agent Identity */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--foreground)]">FLEET AGENT HUB</h1>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Operator: AGENT-742 • SEA-COMMAND ACTIVE</p>
           </div>
           <div className="flex items-center gap-4 p-4 rounded-[20px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success animate-pulse">
                 <div className="w-2 h-2 rounded-full bg-success" />
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-[var(--foreground)] uppercase">SIGNAL STATUS</p>
                 <p className="text-[9px] font-bold text-success uppercase">Active & Broadcasting</p>
              </div>
           </div>
        </div>

        {/* Tactical Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {stats.map((stat) => (
             <Card key={stat.label} className="p-8 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 space-y-4 group hover:border-primary/30 transition-all">
                <div className={stat.color}>{stat.icon}</div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{stat.label}</p>
                   <h3 className="text-3xl font-black text-[var(--foreground)] leading-none tracking-tighter italic">{stat.value}</h3>
                </div>
             </Card>
           ))}
        </div>

        {/* ACTIVE MISSIONS QUEUE */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Truck className="w-5 h-5 text-primary" />
                 <h2 className="text-xl font-black text-[var(--foreground)] uppercase italic tracking-tight">Active Mission Queue</h2>
              </div>
              <Badge variant="glass" className="uppercase tracking-widest text-[9px] font-black px-4">{missions.length} ASSIGNMENTS</Badge>
           </div>

           {isLoading ? (
              <div className="text-center py-20 text-[var(--foreground)] italic font-black uppercase tracking-widest text-[10px] animate-pulse">Synchronizing with Registry...</div>
           ) : missions.length === 0 ? (
              <div className="text-center py-20 rounded-[32px] bg-[var(--foreground)]/5 border border-dashed border-[var(--foreground)]/10 space-y-4">
                 <Package className="w-12 h-12 text-text-secondary opacity-20 mx-auto" />
                 <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">No Active Missions Assigned to your Hub</p>
              </div>
           ) : (
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {missions.map((mission) => (
                  <Card key={mission.id} className="p-8 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-[32px] space-y-8 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full pointer-events-none" />
                     
                     <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-2">
                           <div className="flex items-center gap-3">
                              <h3 className="text-2xl font-black text-[var(--foreground)] italic tracking-tighter uppercase">{mission.id}</h3>
                              {mission.urgency === "HIGH" && (
                                 <Badge variant="danger" className="animate-pulse text-[8px] font-black uppercase tracking-widest">URGENT</Badge>
                              )}
                           </div>
                           <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">CONSIGNEE: {mission.customer}</p>
                        </div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">{mission.time}</p>
                     </div>

                     <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-4 p-4 rounded-[20px] bg-bg-secondary/60 border border-[var(--foreground)]/5">
                           <MapPin className="w-5 h-5 text-text-secondary opacity-40" />
                           <div className="space-y-1">
                              <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Destination Node</p>
                              <p className="text-xs font-bold text-[var(--foreground)] uppercase">{mission.location}</p>
                           </div>
                        </div>
                     </div>

                     <div className="flex gap-3 relative z-10">
                        <Button 
                          onClick={() => router.push(`/agent/tracking?order_id=${mission.id}&auto=true`)}
                          className="flex-1 h-14 bg-primary hover:bg-primary-light shadow-glow-purple text-[10px] font-black uppercase tracking-widest gap-2"
                        >
                           <Zap className="w-4 h-4" /> START TRACKING
                        </Button>
                        <Button 
                          onClick={() => {
                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${mission.location}&travelmode=driving`, '_blank'
  );
                          }}
                          variant="outline"
                          className="flex-1 h-14 border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/5 text-[10px] font-black uppercase tracking-widest gap-2"
                        >
                           <MapIcon className="w-4 h-4 text-primary" /> NAVIGATE
                        </Button>
                        <Button 
                           onClick={() => router.push(`/customer/orders/${mission.id}/tracking`)}
                           variant="outline" 
                           className="h-14 px-6 border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/5 text-[10px] font-black uppercase tracking-widest"
                        >
                           VIEW LIVE
                        </Button>
                     </div>
                  </Card>
                ))}
             </div>
           )}
        </div>

        {/* Footer Navigation FALLBACK */}
        <div className="pt-10 flex justify-center">
           <Button 
              onClick={() => router.push('/agent/history')}
              variant="ghost" 
              className="text-[10px] font-black text-text-secondary uppercase tracking-widest gap-2 opacity-40 hover:opacity-100"
           >
              <History className="w-4 h-4" /> VIEW COMPLETED ARCHIVE
           </Button>
        </div>
      </div>
  
  );
}
