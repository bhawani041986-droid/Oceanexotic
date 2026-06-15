"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { 
  Truck, 
  MapPin, 
  Droplets, 
  Zap, 
  Navigation, 
  Plus, 
  ChevronRight,
  Activity,
  Wind,
  Home,
  ShieldCheck,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import dynamic from "next/dynamic";

const PortBlairFleetMap = dynamic(
  () => import("@/components/ui/PortBlairMap").then((m) => m.PortBlairFleetMap),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/40 border-t-primary rounded-full animate-spin" /></div> }
);




export default function AgentMissionControl() {
  const { toast } = useToast(
  );
  const [activeOrder, setActiveOrder] = React.useState<string | null>("ORD-9982"
  );
  const [missions, setMissions] = React.useState<any[]>([]
  );
  const [pendingOrders, setPendingOrders] = React.useState<any[]>([]);
  const [selectedPendingOrders, setSelectedPendingOrders] = React.useState<string[]>([]);
  const [batchAgentName, setBatchAgentName] = React.useState("");
  const [editForm, setEditForm] = React.useState({ lat: 11.6667, lng: 92.7500, temp: -22.4, status: "IN_TRANSIT", log_status: "", location_name: "" });

  const toggleOrderSelection = (orderId: string) => {
    setSelectedPendingOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };

  const fetchPendingOrders = async () => {
    try {
      const res = await fetch('/api/fleet/pending');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPendingOrders(data.orders);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFleetTelemetry = async () => {
    try {
      const res = await fetch('/api/fleet'
  );
      if (res.ok) {
        const data = await res.json(
  );
        const missionList = Array.isArray(data) ? data : [data];
        setMissions(missionList
  );
        const activeOne = missionList.find(m => m.order_id === activeOrder
  );
        if (activeOne) { setEditForm(prev => ({ ...prev, lat: activeOne.current_lat, lng: activeOne.current_lng, temp: activeOne.current_temp, status: activeOne.status })
  ); }
      }
    } catch (err) {}
  };

  React.useEffect(() => {
    fetchFleetTelemetry();
    fetchPendingOrders();
    const interval = setInterval(fetchFleetTelemetry, 20000);
    return (
) => clearInterval(interval
  );
  }, [activeOrder]
  );

  const handlePulseUpdate = async () => {
    try {
      const res = await fetch('/api/fleet', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: activeOrder, lat: editForm.lat, lng: editForm.lng, temp: editForm.temp, status: editForm.status, log_entry: editForm.log_status ? { status: editForm.log_status, location: editForm.location_name || "Node", active: true } : undefined })
      }
  );
      if (res.ok) { toast("Telemetry Updated", "success"
  ); fetchFleetTelemetry(
  ); setEditForm(p => ({ ...p, log_status: "", location_name: "" })
  ); }
    } catch (err) { toast("Transmission Failed", "error"
  ); }
  };

  const handleBatchDispatch = async () => {
    if (selectedPendingOrders.length === 0) {
      toast("No missions selected for dispatch", "error");
      return;
    }
    if (!batchAgentName) {
      toast("Agent Designation required for dispatch", "error");
      return;
    }

    try {
      const dispatchPromises = selectedPendingOrders.map(order_id => 
        fetch('/api/fleet', {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            order_id, 
            agent_name: batchAgentName, 
            lat: 11.6667, 
            lng: 92.7500, 
            status: "ASSIGNED" 
          })
        })
      );

      await Promise.all(dispatchPromises);
      
      toast(`Successfully dispatched ${selectedPendingOrders.length} vessels under ${batchAgentName}`, "success");
      
      setSelectedPendingOrders([]);
      setBatchAgentName("");
      fetchFleetTelemetry();
      fetchPendingOrders();
    } catch (err) {
      toast("Batch Dispatch Failed", "error");
    }
  };

  return (

    <div className="space-y-[10px] md:space-y-8 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-8">
         <div className="space-y-1 text-center md:text-left">
            <h1 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter text-[var(--foreground)] leading-none shadow-glow-purple/5">Global Command Hub</h1>
            <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] flex items-center justify-center md:justify-start gap-2 italic opacity-60"><Activity className="w-3 h-3 text-primary shadow-glow-purple" /> Real-Time Authority Sector: Andaman</p>
         </div>
      </div>

      <Card className="h-[250px] md:h-[450px] relative overflow-hidden border-primary/20 bg-black/40 rounded-[24px] md:rounded-[48px] shadow-glow-purple/10">
         <PortBlairFleetMap
           agents={missions.map((m: any) => ({
             id: m.order_id,
             lat: m.current_lat || 11.6670,
             lng: m.current_lng || 92.7359,
             label: `${m.order_id} — ${m.agent_name || 'Unassigned'}`,
             isActive: m.order_id === activeOrder,
           }))}
           activeAgentId={activeOrder}
           className="absolute inset-0 z-10"
         />
         <div className="absolute top-3 md:top-6 right-3 md:right-6 z-20 flex flex-col gap-2">
            <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-black/60 backdrop-blur-xl border border-[var(--foreground)]/10 space-y-1 md:space-y-2">
               <div className="flex items-center gap-2 md:gap-3"><div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-success animate-pulse shadow-glow" /><span className="text-[7px] md:text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest italic">System Link: Active</span></div>
               <div className="flex items-center gap-2 md:gap-3"><div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-primary shadow-glow" /><span className="text-[7px] md:text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest italic">Registry: {missions.length} Vessels</span></div>
            </div>
         </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-[10px] md:gap-6">
         {/* Left Aside: Pending Missions (4 cols) */}
         <Card className="xl:col-span-4 p-[10px] md:p-6 bg-bg-secondary/20 border-primary/20 shadow-glow-purple/5 rounded-[24px] md:rounded-[40px] flex flex-col h-[500px] xl:h-[600px]">
            <div className="border-b border-[var(--foreground)]/5 pb-4 mb-4">
               <h3 className="text-base md:text-lg font-black text-[var(--foreground)] uppercase italic tracking-tighter flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-primary" /> Pending Missions
               </h3>
               <p className="text-[8px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Select upcoming deliveries to assign</p>
            </div>
            
            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
               {pendingOrders.length === 0 ? (
                 <div className="h-full flex items-center justify-center">
                   <p className="text-[9px] text-text-secondary italic uppercase font-black text-center opacity-50">No pending orders found</p>
                 </div>
               ) : pendingOrders.map((order: any) => {
                 const isSelected = selectedPendingOrders.includes(order.order_id);
                 return (
                   <div 
                     key={order.order_id} 
                     onClick={() => toggleOrderSelection(order.order_id)}
                     className={cn("p-3 rounded-xl cursor-pointer flex items-start gap-3 border transition-all", isSelected ? "bg-primary/20 border-primary shadow-glow-purple/10" : "bg-[var(--foreground)]/5 border-[var(--foreground)]/5 hover:border-primary/50")}
                   >
                     {/* Custom Checkbox */}
                     <div className={cn("mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all", isSelected ? "bg-primary border-primary" : "border-[var(--foreground)]/20")}>
                        {isSelected && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-[var(--foreground)]"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                     </div>
                     <div className="space-y-1 flex-1">
                       <div className="flex justify-between items-center">
                         <p className="text-[11px] font-black uppercase italic text-[var(--foreground)] tracking-tighter">{order.order_id}</p>
                         <Badge className={cn("text-[7px] px-1.5 py-0 uppercase italic", order.status === "PENDING" ? "bg-warning/20 text-warning" : "bg-success/20 text-success")}>{order.status}</Badge>
                       </div>
                       <p className="text-[8px] font-black uppercase italic text-text-secondary tracking-widest opacity-80">{order.customer_name} • {order.area}</p>
                     </div>
                   </div>
                 );
               })}
            </div>

            {/* Batch Dispatch Controls */}
            <div className="pt-4 mt-4 border-t border-[var(--foreground)]/5 space-y-3">
               <div className="space-y-1.5">
                 <label className="text-[8px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic ml-1">Agent Designation</label>
                 <Input 
                   value={batchAgentName} 
                   onChange={e => setBatchAgentName(e.target.value)} 
                   className="h-10 bg-[var(--foreground)]/5 border-[var(--foreground)]/10 text-[10px] rounded-xl italic font-black uppercase text-primary placeholder:text-text-secondary/40" 
                   placeholder="e.g. Agent Vikram" 
                 />
               </div>
               <Button 
                 onClick={handleBatchDispatch} 
                 disabled={selectedPendingOrders.length === 0}
                 className="w-full h-12 bg-primary shadow-glow-purple text-[9px] md:text-[10px] font-black uppercase tracking-widest italic rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <Navigation className="w-3.5 h-3.5 mr-2" /> DISPATCH BATCH ({selectedPendingOrders.length})
               </Button>
            </div>
         </Card>

         <Card className="xl:col-span-5 p-1 border-[var(--foreground)]/5 bg-bg-secondary/20 rounded-[24px] md:rounded-[40px] shadow-premium overflow-hidden">
            <div className="p-[10px] md:p-6 border-b border-[var(--foreground)]/5 flex items-center justify-between">
               <h2 className="text-base md:text-lg font-black text-[var(--foreground)] uppercase italic tracking-tighter flex items-center gap-2 md:gap-3">
                  <Truck className="w-4 md:w-5 h-4 md:h-5 text-primary shadow-glow-purple" /> Active Fleet Registry
               </h2>
               <div className="flex items-center gap-2 md:gap-4">
                  <div className="relative group w-full md:w-48">
                     <Input placeholder="SEARCH VESSELS..." className="h-10 pl-10 text-[8px] md:text-[9px] font-black uppercase italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl" />
                     <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                  </div>
               </div>
            </div>
           <div className="hidden lg:block overflow-x-auto">
             <Table>
                <TableHeader className="bg-[var(--foreground)]/5">
                   <TableRow className="border-[var(--foreground)]/5">
                      <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Mission ID</TableHead>
                      <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Agent</TableHead>
                      <TableHead className="text-center text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Cold-Chain</TableHead>
                      <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Status</TableHead>
                      <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary pr-4 md:pr-6">Actions</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {missions.map((m) => (
                      <TableRow key={m.order_id} onClick={() => setActiveOrder(m.order_id)} className={cn("cursor-pointer transition-all hover:bg-[var(--foreground)]/5 border-l-4 border-l-transparent border-[var(--foreground)]/5 group/row", activeOrder === m.order_id && "bg-primary/5 border-l-primary")}>
                         <TableCell className="font-black text-[var(--foreground)] italic py-3 md:py-4 text-xs md:text-sm tracking-tighter group-hover/row:text-primary transition-colors">{m.order_id}</TableCell>
                         <TableCell className="text-[9px] md:text-[11px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{m.agent_name}</TableCell>
                         <TableCell className="text-center"><span className="text-blue-400 font-black italic flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-sm"><Droplets className="w-3 md:w-3.5 h-3 md:h-3.5" /> {m.current_temp}°C</span></TableCell>
                         <TableCell><Badge className={cn("text-[7px] md:text-[8px] font-black tracking-widest uppercase px-2 py-0.5 italic shadow-glow-purple/5", m.status === "IN_TRANSIT" ? "bg-primary/20 text-primary" : "bg-success/20 text-success")}>{m.status.replace('_', ' ')}</Badge></TableCell>
                         <TableCell className="text-right pr-4 md:pr-6"><Button variant="ghost" size="sm" className="w-8 md:w-9 h-8 md:h-9 rounded-lg hover:bg-primary group border border-[var(--foreground)]/5"><ChevronRight className="w-3.5 md:w-4 h-3.5 md:h-4 group-hover:text-[var(--foreground)]" /></Button></TableCell>
                      </TableRow>
                   ))}
                </TableBody>
             </Table>
           </div>

           {/* Mobile card list - visible below lg breakpoint */}
           <div className="lg:hidden space-y-3 p-4">
             {missions.length === 0 ? (
               <p className="text-center py-8 text-xs font-black uppercase text-text-secondary italic">No active fleet missions.</p>
             ) : missions.map((m) => (
               <div
                 key={m.order_id}
                 onClick={() => setActiveOrder(m.order_id)}
                 className={cn(
                   "p-4 rounded-xl border cursor-pointer transition-all space-y-3",
                   activeOrder === m.order_id
                     ? "bg-primary/10 border-primary/40 shadow-glow-purple/10"
                     : "bg-bg-card/40 border-[var(--foreground)]/5 hover:border-primary/20"
                 )}
               >
                 <div className="flex items-start justify-between">
                   <div className="space-y-0.5">
                     <p className="font-black text-[var(--foreground)] italic text-sm tracking-tighter">{m.order_id}</p>
                     <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{m.agent_name || "UNASSIGNED"}</p>
                   </div>
                   <Badge className={cn("text-[8px] font-black tracking-widest uppercase px-2 py-0.5 italic", m.status === "IN_TRANSIT" ? "bg-primary/20 text-primary" : "bg-success/20 text-success")}>
                     {m.status?.replace('_', ' ')}
                   </Badge>
                 </div>
                 <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2.5">
                   <div className="flex items-center gap-1.5 text-blue-400">
                     <Droplets className="w-3.5 h-3.5" />
                     <span className="font-black italic text-sm tracking-tighter">{m.current_temp}°C</span>
                     <span className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60 ml-1">Cold-Chain</span>
                   </div>
                   <ChevronRight className="w-4 h-4 text-text-secondary opacity-40" />
                 </div>
               </div>
             ))}
           </div>
        </Card>

        <div className="xl:col-span-3 space-y-[10px] md:space-y-6">
           <Card className="p-[10px] md:p-6 border-primary/20 bg-primary/5 shadow-glow-purple/10 rounded-[24px] md:rounded-[40px] space-y-4 md:space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-base md:text-lg font-black text-[var(--foreground)] uppercase italic tracking-tighter">Mission Pulse</h3>
                 <Badge variant="outline" className="border-primary/30 text-primary font-black italic text-[8px] md:text-[10px] px-2 uppercase">{activeOrder}</Badge>
              </div>
              <div className="space-y-3 md:space-y-4">
                 <div className="grid grid-cols-2 gap-[10px] md:gap-4">
                    <div className="space-y-1 md:space-y-2"><label className="text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60 ml-1">Lat</label><Input type="number" step="0.0001" value={editForm.lat} onChange={(e) => setEditForm(p => ({ ...p, lat: parseFloat(e.target.value) }))} className="h-10 md:h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/10 font-mono text-[9px] md:text-xs text-[var(--foreground)] rounded-lg italic" /></div>
                    <div className="space-y-1 md:space-y-2"><label className="text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60 ml-1">Lng</label><Input type="number" step="0.0001" value={editForm.lng} onChange={(e) => setEditForm(p => ({ ...p, lng: parseFloat(e.target.value) }))} className="h-10 md:h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/10 font-mono text-[9px] md:text-xs text-[var(--foreground)] rounded-lg italic" /></div>
                 </div>
                 <div className="grid grid-cols-2 gap-[10px] md:gap-4">
                    <div className="space-y-1 md:space-y-2"><label className="text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60 ml-1">Temp</label><Input type="number" step="0.1" value={editForm.temp} onChange={(e) => setEditForm(p => ({ ...p, temp: parseFloat(e.target.value) }))} className="h-10 md:h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/10 text-blue-400 font-black text-[10px] md:text-base rounded-lg italic" /></div>
                    <div className="space-y-1 md:space-y-2">
                       <label className="text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60 ml-1">Status</label>
                       <select value={editForm.status} onChange={(e) => setEditForm(p => ({ ...p, status: e.target.value }))} className="w-full h-10 md:h-12 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-lg px-2 md:px-3 text-[8px] md:text-[9px] font-black uppercase text-[var(--foreground)] italic outline-none focus:border-primary/50 transition-all">
                          <option value="IN_TRANSIT" className="bg-bg-primary">In Transit</option>
                          <option value="NEAR_DESTINATION" className="bg-bg-primary">Near Destination</option>
                          <option value="DELIVERED" className="bg-bg-primary">Delivered</option>
                       </select>
                    </div>
                 </div>
                 <Button onClick={handlePulseUpdate} className="w-full h-12 md:h-14 bg-primary shadow-glow-purple text-[9px] md:text-[10px] font-black uppercase tracking-widest gap-2 md:gap-3 rounded-lg md:rounded-xl italic">
                    <Navigation className="w-3.5 md:w-4 h-3.5 md:h-4" /> BROADCAST TELEMETRY
                 </Button>
              </div>
           </Card>
        </div>
      </div>

    </div>
  
  );
}
