"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { 
  Plus, 
  Activity, 
  ShieldCheck,
  Thermometer,
  Clock,
  ChevronRight,
  Anchor,
  Home
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import dynamic from "next/dynamic";

const PortBlairFleetMap = dynamic(
  () => import("@/components/ui/PortBlairMap").then((m) => m.PortBlairFleetMap),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/40 border-t-primary rounded-full animate-spin" /></div> }
);



export default function SellerFleetControl() {
  const { toast } = useToast(
  );
  const [activeOrder, setActiveOrder] = React.useState<string | null>("ORD-9982"
  );
  const [missions, setMissions] = React.useState<any[]>([]
  );
  const [isLoading, setIsLoading] = React.useState(true
  );
  const [isDispatchModalOpen, setIsDispatchModalOpen] = React.useState(false
  );
  

  const [dispatchForm, setDispatchForm] = React.useState({ order_id: "", agent_name: "", lat: 11.6670, lng: 92.7359 }
  );

  const fetchFleetTelemetry = async () => {
    try {
      const res = await fetch('/api/fleet'
  );
      if (res.ok) {
        const data = await res.json(
  );
        setMissions(Array.isArray(data) ? data : [data]
  );
      }
    } catch (err) {} finally { setIsLoading(false
  ); }
  };



  React.useEffect(() => {
    fetchFleetTelemetry(
  );
    const interval = setInterval(fetchFleetTelemetry, 20000
  );
    return (
) => clearInterval(interval
  );
  }, []
  );

  const handleDispatch = async () => {
    try {
      const res = await fetch('/api/fleet', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: dispatchForm.order_id, agent_name: dispatchForm.agent_name, lat: dispatchForm.lat, lng: dispatchForm.lng, status: "ASSIGNED" })
      }
  );
      if (res.ok) { toast(`Dispatched: ${dispatchForm.order_id}`, "success"
  ); setIsDispatchModalOpen(false
  ); fetchFleetTelemetry(
  ); }
    } catch (err) { toast("Dispatch Failed", "error"
  ); }
  };

  const currentMission = missions.find(m => m.order_id === activeOrder
  );

  return (

    <div className="space-y-4 lg:space-y-10 pb-12 lg:pb-24 text-[var(--foreground)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 lg:gap-0 lg:border-b lg:border-[var(--foreground)]/5 lg:pb-10">
         <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl lg:text-[32px] font-black text-[var(--foreground)] uppercase italic tracking-tighter leading-none shadow-glow-purple/5">Fleet Systemty</h1>
            <p className="text-[8px] lg:text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] italic opacity-60">Processing Node • Andaman Sector Logistics</p>
         </div>
         <Button onClick={() => setIsDispatchModalOpen(true)} className="h-10 lg:h-12 px-4 lg:px-8 gap-2 lg:gap-3 text-[8px] lg:text-[10px] font-black uppercase tracking-widest shadow-glow-purple bg-primary w-full sm:w-auto italic rounded-lg">
            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> DISPATCH MISSION
         </Button>
      </div>

      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="DISPATCH MISSION"
        description="Initialize a new vessel mission in the fleet registry."
        className="md:max-w-md bg-bg-secondary/95 border border-primary/20 text-[var(--foreground)] shadow-[0_0_50px_rgba(168,85,247,0.15)] backdrop-blur-xl rounded-t-[28px] md:rounded-[28px] p-5 md:p-8"
      >
        <div className="space-y-4">
           <div className="space-y-2">
             <label className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic">Order Reference</label>
             <Input placeholder="ORD-XXXX" value={dispatchForm.order_id} onChange={(e) => setDispatchForm(p => ({ ...p, order_id: e.target.value }))} className="bg-[var(--foreground)]/5 border-[var(--foreground)]/10 h-12 rounded-xl text-xs" />
           </div>
           <div className="space-y-2">
             <label className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic">Agent Designation</label>
             <Input placeholder="Agent Name" value={dispatchForm.agent_name} onChange={(e) => setDispatchForm(p => ({ ...p, agent_name: e.target.value }))} className="bg-[var(--foreground)]/5 border-[var(--foreground)]/10 h-12 rounded-xl text-xs" />
           </div>
           <div className="flex gap-3 pt-2">
             <Button onClick={() => setIsDispatchModalOpen(false)} variant="outline" className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest border-[var(--foreground)]/10 rounded-xl italic">ABORT</Button>
             <Button onClick={handleDispatch} className="flex-1 h-12 bg-primary shadow-glow-purple text-[9px] lg:text-[10px] font-black uppercase tracking-widest italic rounded-xl">INITIALIZE</Button>
           </div>
        </div>
      </Modal>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-10">
        <div className="xl:col-span-8 space-y-4 lg:space-y-6">
           <Card className="p-0 bg-bg-secondary/10 border-[var(--foreground)]/5 overflow-hidden rounded-[20px] md:rounded-[40px] shadow-premium">
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                   <TableHeader>
                     <TableRow className="border-[var(--foreground)]/5">
                       <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40 pl-6 lg:pl-10">Mission ID</TableHead>
                       <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Agent Node</TableHead>
                       <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Logistics Status</TableHead>
                       <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Active Telemetry</TableHead>
                       <TableHead className="text-right pr-6 lg:pr-10 text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Governance</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                      {missions.map((mission) => (
                         <TableRow key={mission.order_id} onClick={() => setActiveOrder(mission.order_id)} className={cn("cursor-pointer border-white/5 transition-all h-14 md:h-16", activeOrder === mission.order_id ? "bg-primary/5 border-l-[4px] border-l-primary" : "hover:bg-white/[0.02]")}>
                            <TableCell className="font-black italic pl-6 lg:pl-10 text-xs md:text-sm text-[var(--foreground)] tracking-tighter">{mission.order_id}</TableCell>
                            <TableCell className="text-[9px] md:text-xs font-black text-text-secondary uppercase italic opacity-40 tracking-widest">{mission.agent_name || "UNASSIGNED"}</TableCell>
                            <TableCell><Badge variant={mission.status === "DELIVERED" ? "glass" : "success"} className="text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 shadow-glow-purple/10 italic">{mission.status}</Badge></TableCell>
                            <TableCell><div className="flex items-center gap-2 lg:gap-3"><Activity className={cn("w-3 h-3", mission.status === "IN_TRANSIT" ? "text-success animate-pulse" : "text-text-secondary opacity-20")} /><span className="text-[8px] md:text-[9px] font-black text-text-secondary italic opacity-40 tracking-widest">{mission.current_lat?.toFixed(3)}, {mission.current_lng?.toFixed(3)}</span></div></TableCell>
                            <TableCell className="text-right pr-6 lg:pr-10"><ChevronRight className="w-4 h-4 ml-auto text-text-secondary opacity-40" /></TableCell>
                         </TableRow>
                      ))}
                   </TableBody>
                </Table>
              </div>

              {/* Mobile card list - visible below lg breakpoint */}
              <div className="lg:hidden space-y-3 p-4">
                {missions.length === 0 ? (
                  <p className="text-center py-8 text-xs font-black uppercase text-text-secondary italic">No active fleet missions.</p>
                ) : missions.map((mission) => (
                  <div
                    key={mission.order_id}
                    onClick={() => setActiveOrder(mission.order_id)}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all space-y-3",
                      activeOrder === mission.order_id
                        ? "bg-primary/10 border-primary/40 shadow-glow-purple/10"
                        : "bg-bg-card/40 border-[var(--foreground)]/5 hover:border-primary/20"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <p className="font-black text-[var(--foreground)] italic text-sm tracking-tighter">{mission.order_id}</p>
                        <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{mission.agent_name || "UNASSIGNED"}</p>
                      </div>
                      <Badge variant={mission.status === "DELIVERED" ? "glass" : "success"} className="text-[8px] font-black uppercase tracking-widest px-2 italic">
                        {mission.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2.5">
                      <div className="flex items-center gap-1.5">
                        <Activity className={cn("w-3 h-3", mission.status === "IN_TRANSIT" ? "text-success animate-pulse" : "text-text-secondary opacity-20")} />
                        <span className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">
                          {mission.current_lat?.toFixed(3)}, {mission.current_lng?.toFixed(3)}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-secondary opacity-40" />
                    </div>
                  </div>
                ))}
              </div>
           </Card>
            <Card className="h-[300px] lg:h-[500px] relative overflow-hidden bg-black/40 border-primary/20">
              <PortBlairFleetMap
                agents={missions.map((m: any) => {
                  const isLiveAgent = m.order_id?.startsWith('LIVE_AGENT_');
                  const displayName = isLiveAgent ? `[LIVE] ${m.agent_name}` : `${m.order_id} — ${m.agent_name || 'Unassigned'}`;
                  return {
                    id: m.order_id,
                    lat: m.current_lat || 11.6670,
                    lng: m.current_lng || 92.7359,
                    label: displayName,
                    isActive: m.order_id === activeOrder,
                  }
                })}
                activeAgentId={activeOrder}
                className="absolute inset-0 z-10"
              />
            </Card>

        </div>

        <div className="xl:col-span-4 space-y-4 lg:space-y-8">
           <Card className="p-[10px] md:p-6 space-y-6 md:space-y-8 bg-bg-secondary/10 border-[var(--foreground)]/5 relative overflow-hidden rounded-[20px] md:rounded-[40px] shadow-premium">
              <div className="space-y-0.5"><h3 className="text-[7px] md:text-[9px] font-black text-primary uppercase tracking-[0.3em] italic">MISSION PULSE</h3><h2 className="text-xl md:text-2xl font-black uppercase italic leading-none text-[var(--foreground)] tracking-tighter">{activeOrder}</h2></div>
              <div className="p-4 md:p-5 rounded-xl md:rounded-[24px] bg-primary shadow-glow-purple/20 space-y-2 md:space-y-3 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><Thermometer className="w-12 h-12" /></div>
                 <div className="flex items-center justify-between relative z-10"><div className="flex items-center gap-2"><Thermometer className="w-3.5 h-3.5 md:w-4 md:h-4" /><span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest italic">COLD CHAIN</span></div><Badge variant="glass" className="bg-[var(--foreground)]/20 border-[var(--foreground)]/30 text-[6px] md:text-[8px] font-black italic">SECURE</Badge></div>
                 <div className="flex items-baseline gap-1 lg:gap-2 relative z-10"><span className="text-2xl md:text-3xl font-black italic text-[var(--foreground)] tracking-tighter">{currentMission?.current_temp?.toFixed(1) || "-22.4"}°C</span></div>
              </div>
              <div className="space-y-4 md:space-y-6 relative z-10">
                 <div className="flex items-center justify-between"><h4 className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Protocol Timeline</h4><Clock className="w-3 h-3 text-text-secondary opacity-20" /></div>
                 <div className="space-y-3 md:space-y-5 relative ml-1.5">
                    <div className="absolute left-[-0.5px] top-0 bottom-0 w-[1px] bg-[var(--foreground)]/5" />
                    {(currentMission?.logs || [{ time: "09:42 AM", status: "Initialized", location: "Seller Hub", active: true }]).map((log: any, i: number) => (
                       <div key={i} className="relative pl-5">
                          <div className={cn("absolute left-[-4px] top-1.5 w-1.5 h-1.5 rounded-full border border-bg-primary transition-all", log.active ? "bg-primary shadow-glow-purple scale-125" : "bg-white/10")} />
                          <div className="space-y-0"><p className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-tight italic", log.active ? "text-[var(--foreground)]" : "text-text-secondary opacity-30")}>{log.status}</p><p className="text-[6px] md:text-[8px] font-black text-text-secondary opacity-20 uppercase tracking-widest italic">{log.time} • {log.location}</p></div>
                       </div>
                    ))}
                 </div>
              </div>
              <Button className="w-full h-10 md:h-11 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] gap-2 lg:gap-3 italic rounded-lg">
                 <Anchor className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> CONTACT AGENT
              </Button>
           </Card>
        </div>
      </div>
    </div>
  
  );
}
