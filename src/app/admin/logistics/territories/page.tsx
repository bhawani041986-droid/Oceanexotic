"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Anchor, 
  MapPin, 
  Plus, 
  ChevronRight, 
  Ship, 
  Compass, 
  ArrowLeft,
  Search,
  Filter,
  MoreVertical,
  Activity,
  Globe,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";

export default function TerritoryManagementPage() {
  const [activeIsland, setActiveIsland] = React.useState("South Andaman"
  );
  const [searchQuery, setSearchQuery] = React.useState(""
  );
  const [territories, setTerritories] = React.useState<any[]>([]
  );
  const [isLoading, setIsLoading] = React.useState(true
  );
  const [showAddModal, setShowAddModal] = React.useState(false
  );
  const [newArea, setNewArea] = React.useState({ name: "", type: "JETTY", parentId: "" }
  );

  const fetchTerritories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/system/get_territories.php?island=${encodeURIComponent(activeIsland)}`);
      const data = await res.json(
  );
      setTerritories(data
  );
    } catch (error) {
      console.error("Failed to fetch territories", error
  );
    } finally {
      setIsLoading(false
  );
    }
  };

  React.useEffect(() => {
    fetchTerritories(
  );
  }, [activeIsland]
  );

  const toggleStatus = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/system/toggle_territory_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      }
  );
      const data = await res.json(
  );
      if (data.status === "success") {
        fetchTerritories(
  );
      }
    } catch (error) {
      console.error("Failed to toggle status", error
  );
    }
  };

  const handleAddArea = async () => {
    if (!newArea.name) return;
    try {
      const res = await fetch(`${API_BASE_URL}/system/add_territory.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newArea.name,
          zone_type: newArea.type,
          parent_id: newArea.parentId || territories.find(t => t.name === activeIsland)?.id || null,
          status: "ACTIVE"
        })
      }
  );
      const data = await res.json(
  );
      if (data.status === "success") {
        fetchTerritories(
  );
        setShowAddModal(false
  );
        setNewArea({ name: "", type: "JETTY", parentId: "" }
  );
      }
    } catch (error) {
      console.error("Failed to add territory", error
  );
    }
  };

  const filteredTerritories = territories.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  
  );

  return (

    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Page Header - Integrated with Admin Flow */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/admin/logistics" className="text-[var(--foreground)]/40 hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl md:text-3xl font-black text-[var(--foreground)] uppercase italic tracking-tighter">Maritime Territory Registry</h1>
          </div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-60">Logistics Infrastructure Node & Geographic Governance</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-[var(--foreground)] hover:opacity-90 px-8 h-12 text-[10px] font-black tracking-widest uppercase gap-3 shadow-glow-purple rounded-xl"
        >
          <Plus className="w-4 h-4" /> COMMISSION NEW NODE
        </Button>
      </div>

      {/* Add Territory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <Card className="w-full max-w-md p-8 bg-bg-secondary border-[var(--foreground)]/10 space-y-6 animate-in zoom-in-95 duration-200">
             <div className="flex items-center justify-between border-b border-[var(--foreground)]/5 pb-4">
                <h3 className="text-lg font-black text-[var(--foreground)] uppercase italic tracking-tighter">Commission Node</h3>
                <button onClick={() => setShowAddModal(false)} className="text-[var(--foreground)]/40 hover:text-[var(--foreground)]"><X className="w-5 h-5" /></button>
             </div>
             <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Node Identity</label>
                   <input 
                      type="text" 
                      placeholder="e.g. Phoenix Bay Jetty"
                      value={newArea.name}
                      onChange={(e) => setNewArea({...newArea, name: e.target.value})}
                      className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-3 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Classification</label>
                      <select 
                         value={newArea.type}
                         onChange={(e) => setNewArea({...newArea, type: e.target.value})}
                         className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-3 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
                      >
                         <option value="ISLAND">ISLAND</option>
                         <option value="PORT">PORT</option>
                         <option value="JETTY">JETTY</option>
                         <option value="WARD">WARD</option>
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Parent Registry</label>
                      <select 
                         value={newArea.parentId}
                         onChange={(e) => setNewArea({...newArea, parentId: e.target.value})}
                         className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-3 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
                      >
                         <option value="">(Selected Island)</option>
                         {territories.filter(t => t.zone_type !== 'WARD').map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                         ))}
                      </select>
                   </div>
                </div>
                <Button onClick={handleAddArea} className="w-full bg-primary py-4 text-[11px] font-black uppercase tracking-widest shadow-glow-purple mt-4">
                   AUTHORIZE COMMISSION
                </Button>
             </div>
          </Card>
        </div>
      )}

      <div className="space-y-8">
        {/* Territory Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Active Islands", value: "3", icon: Globe, color: "text-primary" },
            { label: "Port Hubs", value: "1", icon: Ship, color: "text-success" },
            { label: "Jetty Nodes", value: "12", icon: Anchor, color: "text-warning" },
            { label: "Coverage", value: "98%", icon: Activity, color: "text-info" }
          ].map((stat, i) => (
            <Card key={i} className="p-6 bg-bg-secondary/40 border-[var(--foreground)]/5 group hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-[var(--foreground)] italic">{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Filter */}
          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest px-2">Primary Islands</p>
              <div className="space-y-1">
                {["South Andaman", "Havelock Island", "Neil Island", "Little Andaman"].map((island) => (
                  <button
                    key={island}
                    onClick={() => setActiveIsland(island)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border",
                      activeIsland === island 
                        ? "bg-primary/10 border-primary/20 text-primary shadow-glow-purple-sm" 
                        : "bg-[var(--foreground)]/5 border-transparent text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/10"
                    )}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{island}</span>
                    <ChevronRight className={cn("w-4 h-4", activeIsland === island ? "opacity-100" : "opacity-0")} />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-[24px] bg-primary/5 border border-primary/20 relative overflow-hidden group">
              <Compass className="absolute -bottom-4 -right-4 w-20 h-20 text-primary opacity-5 group-hover:rotate-45 transition-transform duration-1000" />
              <div className="space-y-4 relative z-10">
                <h3 className="text-[10px] font-black text-[var(--foreground)] uppercase italic tracking-widest">Sovereign Mapping</h3>
                <p className="text-[10px] text-[var(--foreground)]/40 font-medium leading-tight">Define custom delivery zones and seller harvest ports across the archipelago.</p>
              </div>
            </div>
          </div>

          {/* Main Area Grid */}
          <div className="lg:col-span-9 space-y-6">
            {/* Search & Actions */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/20 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search maritime nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-bg-secondary/40 border border-[var(--foreground)]/10 rounded-xl py-3 pl-12 pr-4 text-xs text-[var(--foreground)] placeholder:text-[var(--foreground)]/20 outline-none focus:border-primary/50 focus:bg-bg-secondary transition-all"
                />
              </div>
              <div className="flex gap-2">
                <Button className="bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/10 px-4 py-2 h-11 text-[9px] font-black tracking-widest uppercase gap-2 rounded-xl text-[var(--foreground)]">
                  <Filter className="w-4 h-4" /> FILTERS
                </Button>
              </div>
            </div>

            {/* Territories Table */}
            <div className="border border-[var(--foreground)]/5 rounded-[24px] overflow-hidden bg-bg-secondary/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--foreground)]/5 border-b border-[var(--foreground)]/10">
                    <th className="p-6 text-[9px] font-black text-[var(--foreground)]/40 uppercase tracking-[0.2em]">Maritime Node</th>
                    <th className="p-6 text-[9px] font-black text-[var(--foreground)]/40 uppercase tracking-[0.2em]">Classification</th>
                    <th className="p-6 text-[9px] font-black text-[var(--foreground)]/40 uppercase tracking-[0.2em]">Parent Registry</th>
                    <th className="p-6 text-[9px] font-black text-[var(--foreground)]/40 uppercase tracking-[0.2em]">Status</th>
                    <th className="p-6 text-[9px] font-black text-[var(--foreground)]/40 uppercase tracking-[0.2em]">Sub-Nodes</th>
                    <th className="p-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-20 text-center">
                        <Activity className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Accessing Maritime Registry...</p>
                      </td>
                    </tr>
                  ) : filteredTerritories.map((t) => (
                    <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 flex items-center justify-center border border-[var(--foreground)]/10">
                            <MapPin className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-bold text-[var(--foreground)] tracking-tight">{t.name}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <Badge variant="outline" className="text-[8px] font-black tracking-widest border-[var(--foreground)]/10 text-[var(--foreground)]/60">
                          {t.zone_type}
                        </Badge>
                      </td>
                      <td className="p-6">
                        <span className="text-[10px] font-bold text-[var(--foreground)]/40 italic">{t.parent_name || "ROOT"}</span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full", t.status === "ACTIVE" ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-[var(--foreground)]/20")} />
                          <span className={cn("text-[9px] font-black tracking-widest uppercase", t.status === "ACTIVE" ? "text-success" : "text-[var(--foreground)]/20")}>
                            {t.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className="text-xs font-black text-[var(--foreground)]">{t.sub_nodes}</span>
                      </td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => toggleStatus(t.id)}
                          className="w-8 h-8 rounded-lg hover:bg-[var(--foreground)]/5 flex items-center justify-center text-[var(--foreground)]/20 hover:text-[var(--foreground)] transition-all group/btn"
                        >
                          <MoreVertical className="w-4 h-4 group-hover/btn:text-primary transition-colors" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  
  );
}
