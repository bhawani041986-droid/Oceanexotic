"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  MapPin, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Globe, 
  Navigation,
  ShieldCheck,
  Activity,
  Anchor,
  MoreVertical,
  X
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

const INITIAL_AREAS = [
  { id: "LOC-001", name: "Miami Harbor Hub", sector: "Florida South", coverage: "50km", status: "ACTIVE", fee: "₹12.00" },
  { id: "LOC-002", name: "New York Port Terminal", sector: "Tri-State Area", coverage: "30km", status: "ACTIVE", fee: "₹25.00" },
  { id: "LOC-003", name: "Seattle Cold-Chain Node", sector: "Pacific NW", coverage: "45km", status: "MAINTENANCE", fee: "₹18.00" },
];

export default function AdminLogisticsPage() {
  const [areas, setAreas] = useState(INITIAL_AREAS
  );
  const [showAddForm, setShowAddForm] = useState(false
  );
  const [newArea, setNewArea] = useState({ name: "", sector: "", coverage: "", fee: "" }
  );
  const { toast } = useToast(
  );

  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);

  const handleSaveArea = () => {
    if (!newArea.name || !newArea.sector) {
      toast("Manifest incomplete. Name and Sector required.", "error");
      return;
    }
    
    if (editingAreaId) {
      setAreas(areas.map(a => a.id === editingAreaId ? { ...a, ...newArea } : a));
      toast(`Logistics node ${newArea.name} directives updated.`, "success");
    } else {
      const id = `LOC-00${areas.length + 1}`;
      setAreas([...areas, { ...newArea, id, status: "ACTIVE" }]);
      toast(`Logistics node ${newArea.name} commissioned.`, "success");
    }
    
    setShowAddForm(false);
    setEditingAreaId(null);
    setNewArea({ name: "", sector: "", coverage: "", fee: "" });
  };

  const handleEditArea = (area: any) => {
    setEditingAreaId(area.id);
    setNewArea({ name: area.name, sector: area.sector, coverage: area.coverage, fee: area.fee });
    setShowAddForm(true);
  };

  const handleDeleteArea = (id: string) => {
    setAreas(areas.filter(a => a.id !== id)
  );
    toast(`Logistics node decommissioned: ${id}`, "info"
  );
  };

  return (

    <div className="space-y-[10px] md:space-y-12 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic flex items-center justify-center md:justify-start gap-3 md:gap-4 shadow-glow-purple/5">
             <Navigation className="w-6 h-6 md:w-8 md:h-8 text-primary shadow-glow-purple" /> Distribution Governance
          </h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Governing Global Logistics Sectors & Delivery Coverage Nodes</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-4">
          <Link href="/admin/logistics/territories">
            <Button className="h-10 md:h-14 px-6 md:px-10 text-[9px] md:text-[11px] font-black tracking-widest uppercase bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)] hover:bg-[var(--foreground)]/10 flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic">
              <Globe className="w-3.5 md:w-4 h-3.5 md:h-4 text-primary" /> MARITIME REGISTRY
            </Button>
          </Link>
          <Button 
            onClick={() => {
              setEditingAreaId(null);
              setNewArea({ name: "", sector: "", coverage: "", fee: "" });
              setShowAddForm(true);
            }}
            className="h-10 md:h-14 px-6 md:px-10 text-[9px] md:text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic"
          >
            <Plus className="w-3.5 md:w-4 h-3.5 md:h-4" /> COMMISSION NEW SECTOR
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[10px] md:gap-10">
         
         {/* Sector Registry Table */}
          <Card className="lg:col-span-2 p-1 rounded-[24px] md:rounded-[40px] bg-bg-secondary/20 border-[var(--foreground)]/5 shadow-premium overflow-hidden">
             <div className="p-[10px] md:p-6 border-b border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6">
                <div className="space-y-0.5 md:space-y-1 text-center md:text-left">
                   <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Sovereign Logistics Registry</h3>
                   <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Live Monitoring of All Distribution Handshake Nodes</p>
                </div>
                <div className="relative group w-full md:w-48">
                   <Input placeholder="SEARCH SECTORS..." className="h-10 pl-10 text-[8px] md:text-[9px] font-black uppercase italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl" />
                   <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                </div>
             </div>
            <div className="hidden lg:block">
               <Table>
                  <TableHeader>
                     <TableRow className="border-[var(--foreground)]/5">
                        <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Location Identity</TableHead>
                        <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Geographic Sector</TableHead>
                        <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Coverage</TableHead>
                        <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Transit Fee</TableHead>
                        <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Registry Status</TableHead>
                        <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Governance</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {areas.map((area) => (
                       <TableRow key={area.id} className="group/row border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                          <TableCell>
                             <div className="space-y-0.5 md:space-y-1">
                                <p className="font-black text-[var(--foreground)] text-xs md:text-sm uppercase tracking-tighter italic group-hover/row:text-primary transition-colors">{area.name}</p>
                                <p className="text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">ID: {area.id}</p>
                             </div>
                          </TableCell>
                          <TableCell className="text-[9px] md:text-xs font-black text-text-secondary uppercase italic opacity-40">{area.sector}</TableCell>
                          <TableCell className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic opacity-60">{area.coverage}</TableCell>
                          <TableCell className="font-black text-primary italic text-[11px] md:text-sm tracking-tighter shadow-glow-purple/20">{area.fee}</TableCell>
                          <TableCell>
                             <Badge variant={area.status === "ACTIVE" ? "success" : "warning"} className="uppercase text-[8px] md:text-[10px] italic px-2 shadow-glow-purple/10">
                                {area.status}
                             </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                             <div className="flex justify-end gap-1 md:gap-2">
                                <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5" onClick={() => handleEditArea(area)}>
                                   <Edit3 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                                </button>
                                <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5" onClick={() => handleDeleteArea(area.id)}>
                                   <Trash2 className="w-3.5 md:w-4 h-3.5 md:h-4" />
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
               {areas.map((area) => (
                  <div key={area.id} className="p-4 rounded-xl border border-[var(--foreground)]/5 bg-bg-card/40 space-y-3">
                     <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                           <p className="font-black text-[var(--foreground)] italic text-sm tracking-tighter uppercase">{area.name}</p>
                           <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">ID: {area.id}</p>
                        </div>
                        <Badge variant={area.status === "ACTIVE" ? "success" : "warning"} className="uppercase text-[8px] italic px-2 shadow-glow-purple/10">
                           {area.status}
                        </Badge>
                     </div>
                     <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2.5">
                        <div className="space-y-0">
                           <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Sector</p>
                           <p className="text-[10px] font-black text-[var(--foreground)] italic uppercase">{area.sector}</p>
                        </div>
                        <div className="space-y-0">
                           <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Coverage</p>
                           <p className="text-[10px] font-black text-[var(--foreground)] italic">{area.coverage}</p>
                        </div>
                        <div className="space-y-0">
                           <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Transit Fee</p>
                           <p className="text-xs font-black text-primary italic">{area.fee}</p>
                        </div>
                        <div className="flex gap-1">
                           <button className="p-1.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5" onClick={() => handleEditArea(area)}>
                              <Edit3 className="w-3.5 h-3.5" />
                           </button>
                           <button className="p-1.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5" onClick={() => handleDeleteArea(area.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </Card>

         {/* Sector Directives & Stats */}
         <div className="space-y-[10px] md:space-y-8">
             {showAddForm && (
                <Card className="p-[10px] md:p-6 space-y-6 md:space-y-8 bg-bg-secondary/20 border-primary/30 animate-in slide-in-from-top-4 duration-500 rounded-[24px] md:rounded-[40px] shadow-glow-purple/10">
                   <div className="flex items-center justify-between border-b border-[var(--foreground)]/5 pb-4 md:pb-6">
                      <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">{editingAreaId ? "Update Sector Directives" : "Commission Sector"}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)} className="w-8 h-8 p-0 rounded-lg"><X className="w-4 h-4" /></Button>
                   </div>
                  <div className="space-y-4 md:space-y-6">
                     <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic opacity-60 ml-1">Sector Name</label>
                        <Input 
                          placeholder="e.g. San Francisco Bay Hub" 
                          value={newArea.name}
                          onChange={(e) => setNewArea({...newArea, name: e.target.value})}
                          className="h-11 md:h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 text-[11px] md:text-sm italic rounded-lg md:rounded-xl" 
                        />
                     </div>
                     <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic opacity-60 ml-1">Geographic Region</label>
                        <Input 
                          placeholder="e.g. Pacific West" 
                          value={newArea.sector}
                          onChange={(e) => setNewArea({...newArea, sector: e.target.value})}
                          className="h-11 md:h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 text-[11px] md:text-sm italic rounded-lg md:rounded-xl" 
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-1.5 md:space-y-2">
                           <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic opacity-60 ml-1">Coverage Reach</label>
                           <Input 
                             placeholder="e.g. 25km" 
                             value={newArea.coverage}
                             onChange={(e) => setNewArea({...newArea, coverage: e.target.value})}
                             className="h-11 md:h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 text-[11px] md:text-sm italic rounded-lg md:rounded-xl" 
                           />
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                           <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic opacity-60 ml-1">Transit Fee</label>
                           <Input 
                             placeholder="e.g. ₹15.00" 
                             value={newArea.fee}
                             onChange={(e) => setNewArea({...newArea, fee: e.target.value})}
                             className="h-11 md:h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 text-[11px] md:text-sm italic rounded-lg md:rounded-xl" 
                           />
                        </div>
                     </div>
                     <Button onClick={handleSaveArea} className="w-full h-12 md:h-14 text-[9px] md:text-[11px] font-black tracking-widest uppercase shadow-glow-purple rounded-lg md:rounded-xl italic">
                        {editingAreaId ? "UPDATE DIRECTIVES" : "AUTHORIZE COMMISSION"}
                     </Button>
                  </div>
               </Card>
            )}

            <Card className="p-[10px] md:p-6 space-y-6 md:space-y-8 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[24px] md:rounded-[48px] shadow-premium">
               <div className="flex items-center gap-3 md:gap-4 border-b border-[var(--foreground)]/5 pb-4 md:pb-6">
                  <Activity className="w-4 h-4 md:w-5 md:h-5 text-primary shadow-glow-purple" />
                  <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Logistics Pulse</h3>
               </div>
               <div className="space-y-[10px] md:space-y-8">
                  {[
                    { label: "Active Nodes", value: "42", icon: <MapPin className="text-primary" /> },
                    { label: "Transit Integrity", value: "99.9%", icon: <ShieldCheck className="text-success" /> },
                    { label: "Avg. Latency", value: "1.2h", icon: <Globe className="text-warning" /> },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between p-3 md:p-0 rounded-xl bg-[var(--foreground)]/5 md:bg-transparent border border-[var(--foreground)]/5 md:border-0">
                       <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-primary shadow-glow-purple/5">
                             {React.cloneElement(stat.icon as React.ReactElement, { className: "w-3.5 h-3.5 md:w-4 md:h-4" })}
                          </div>
                          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{stat.label}</p>
                       </div>
                       <p className="text-base md:text-xl font-black text-[var(--foreground)] italic tracking-tighter">{stat.value}</p>
                    </div>
                  ))}
               </div>
            </Card>

            <Card className="p-[10px] md:p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 space-y-3 md:space-y-4 rounded-[24px] md:rounded-[40px] shadow-glow-purple/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
               <div className="flex items-center gap-3 md:gap-4 relative z-10">
                  <Anchor className="w-4 h-4 md:w-5 md:h-5 text-primary shadow-glow-purple" />
                  <p className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic">Expansion Directive</p>
               </div>
               <div className="space-y-0.5 md:space-y-1 relative z-10">
                  <p className="text-lg md:text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter italic">GLOBAL REACH</p>
                  <p className="text-[8px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Your distribution network currently covers 84 active maritime sectors.</p>
               </div>
            </Card>
         </div>
      </div>
    </div>
  
  );
}
