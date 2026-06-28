"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
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
  X,
  Edit3,
  Trash2
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
  const [isLoading, setIsLoading] = React.useState(true);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newArea, setNewArea] = React.useState({ name: "", type: "CITY_ISLAND", parentId: "", lat: "", lng: "", hubCode: "", manager: "", riderCapacity: "", minOrder: "", deliveryCharge: "", eta: "" });
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingArea, setEditingArea] = React.useState<any>(null);

  const fetchTerritories = async () => {
    try {
      // Fetch all territories to allow dynamic hierarchy parsing
      const res = await fetch(`${API_BASE_URL}/system/get_territories`);
      const data = await res.json();
      setTerritories(data);
      if (data.length > 0 && activeIsland === "South Andaman") {
        const rootNodes = data.filter((t: any) => !t.parent_id);
        if (rootNodes.length > 0) setActiveIsland(rootNodes[0].name);
      }
    } catch (error) {
      console.error("Failed to fetch territories", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTerritories();
  }, [activeIsland]);

  const toggleStatus = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/system/toggle_territory_status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.status === "success") {
        fetchTerritories();
      }
    } catch (error) {
      console.error("Failed to toggle status", error);
    }
  };

  const handleAddArea = async () => {
    if (!newArea.name) return;
    try {
      const coords = ['DELIVERY_ZONE', 'ADMIN_HUB'].includes(newArea.type) && newArea.lat && newArea.lng ? `${newArea.lat}, ${newArea.lng}` : null;
      
      let finalParentId = newArea.parentId || null;
      if (newArea.type === 'COUNTRY') {
        finalParentId = null;
      } else if (!finalParentId) {
        alert(`Please explicitly select a valid Parent Registry for the new ${newArea.type}.`);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/system/add_territory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newArea.name,
          zone_type: newArea.type,
          parent_id: finalParentId,
          coordinates: coords,
          status: "ACTIVE",
          // Extended payload for Hubs and Zones
          hub_code: newArea.hubCode,
          manager_name: newArea.manager,
          rider_capacity: newArea.riderCapacity,
          minimum_order: newArea.minOrder,
          delivery_charge: newArea.deliveryCharge,
          eta_mins: newArea.eta
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        fetchTerritories();
        setShowAddModal(false);
        setNewArea({ name: "", type: "CITY_ISLAND", parentId: "", lat: "", lng: "", hubCode: "", manager: "", riderCapacity: "", minOrder: "", deliveryCharge: "", eta: "" });
      }
    } catch (error) {
      console.error("Failed to add territory", error);
    }
  };

  const handleEditClick = (area: any) => {
    let lat = "";
    let lng = "";
    if (area.coordinates) {
      const parts = area.coordinates.split(",");
      if (parts.length === 2) {
        lat = parts[0].trim();
        lng = parts[1].trim();
      }
    }
    setEditingArea({
      id: area.id,
      name: area.name,
      type: area.zone_type,
      parentId: area.parent_id || "",
      lat,
      lng
    });
    setShowEditModal(true);
  };

  const handleEditArea = async () => {
    if (!editingArea.name) return;
    try {
      const coords = editingArea.lat && editingArea.lng ? `${editingArea.lat}, ${editingArea.lng}` : null;
      const res = await fetch(`${API_BASE_URL}/system/edit_territory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingArea.id,
          name: editingArea.name,
          zone_type: editingArea.type,
          coordinates: coords,
          parent_id: editingArea.parentId || null
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        fetchTerritories();
        setShowEditModal(false);
        setEditingArea(null);
      }
    } catch (error) {
      console.error("Failed to edit territory", error);
    }
  };

  const handleDeleteArea = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to decommission ${name}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/system/delete_territory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.status === "success") {
        fetchTerritories();
      }
    } catch (error) {
      console.error("Failed to delete territory", error);
    }
  };

  const buildHierarchyIds = (rootName: string): number[] => {
    const root = territories.find(t => t.name === rootName);
    if (!root) return [];
    
    let ids: number[] = [root.id];
    let queue: number[] = [root.id];
    
    while(queue.length > 0) {
      const currentId = queue.shift()!;
      const children = territories.filter(t => t.parent_id === currentId);
      children.forEach(c => {
        ids.push(c.id);
        queue.push(c.id);
      });
    }
    return ids;
  };

  const activeHierarchyIds = buildHierarchyIds(activeIsland);

  const filteredTerritories = territories.filter(t => 
    activeHierarchyIds.includes(t.id) &&
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rootTerritories = territories.filter(t => !t.parent_id);

  const getValidParentTypes = (type: string) => {
    switch(type) {
      case 'STATE_PROVINCE': return ['COUNTRY'];
      case 'DISTRICT': return ['STATE_PROVINCE'];
      case 'CITY_ISLAND': return ['DISTRICT'];
      case 'ADMIN_HUB': return ['CITY_ISLAND'];
      case 'DELIVERY_TERRITORY': return ['ADMIN_HUB'];
      case 'DELIVERY_ZONE': return ['DELIVERY_TERRITORY'];
      case 'COUNTRY': return [];
      default: return [];
    }
  };

  return (

    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Page Header - Integrated with Admin Flow */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/admin/logistics" className="text-[var(--foreground)]/40 hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl md:text-3xl font-black text-[var(--foreground)] uppercase italic tracking-tighter">Global Logistics Registry</h1>
          </div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-60">Logistics Infrastructure Nodes & Geographic Governance</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-[var(--foreground)] hover:opacity-90 px-8 h-12 text-[10px] font-black tracking-widest uppercase gap-3 shadow-glow-purple rounded-xl"
        >
          <Plus className="w-4 h-4" /> COMMISSION NEW NODE
        </Button>
      </div>

      {/* Add Territory Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Commission Node"
        description="Commission a new geographic territory node in the registry."
        className="bg-bg-secondary border-[var(--foreground)]/10 text-[var(--foreground)]"
      >
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
                    <option value="COUNTRY">COUNTRY</option>
                    <option value="STATE_PROVINCE">STATE / PROVINCE</option>
                    <option value="DISTRICT">DISTRICT</option>
                    <option value="CITY_ISLAND">CITY / ISLAND</option>
                    <option disabled>──────────</option>
                    <option value="ADMIN_HUB">ADMIN HUB</option>
                    <option value="DELIVERY_TERRITORY">DELIVERY TERRITORY</option>
                    <option value="DELIVERY_ZONE">DELIVERY ZONE (POLYGON)</option>
                 </select>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Parent Registry</label>
                 <select 
                    value={newArea.parentId}
                    onChange={(e) => setNewArea({...newArea, parentId: e.target.value})}
                    className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-3 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
                    disabled={newArea.type === 'COUNTRY'}
                 >
                    <option value="">{newArea.type === 'COUNTRY' ? '(Root Level)' : '(Selected Domain)'}</option>
                    {territories.filter(t => getValidParentTypes(newArea.type).includes(t.zone_type)).map(t => (
                       <option key={t.id} value={t.id}>{t.name} ({t.zone_type})</option>
                    ))}
                 </select>
              </div>
           </div>

           {/* ADMIN HUB SPECIFIC FIELDS */}
           {newArea.type === 'ADMIN_HUB' && (
             <div className="grid grid-cols-2 gap-4 animate-fade-in mt-4 border-t border-[var(--foreground)]/10 pt-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Hub Code</label>
                   <input 
                      type="text" 
                      placeholder="e.g. PBH001"
                      value={newArea.hubCode}
                      onChange={(e) => setNewArea({...newArea, hubCode: e.target.value})}
                      className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-3 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Manager</label>
                   <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={newArea.manager}
                      onChange={(e) => setNewArea({...newArea, manager: e.target.value})}
                      className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-3 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Rider Capacity</label>
                   <input 
                      type="number" 
                      placeholder="e.g. 20"
                      value={newArea.riderCapacity}
                      onChange={(e) => setNewArea({...newArea, riderCapacity: e.target.value})}
                      className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-3 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
                   />
                </div>
             </div>
           )}

           {/* DELIVERY ZONE SPECIFIC FIELDS */}
           {newArea.type === 'DELIVERY_ZONE' && (
             <div className="grid grid-cols-2 gap-4 animate-fade-in mt-4 border-t border-[var(--foreground)]/10 pt-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Delivery Charge (₹)</label>
                   <input 
                      type="number" 
                      placeholder="e.g. 40"
                      value={newArea.deliveryCharge}
                      onChange={(e) => setNewArea({...newArea, deliveryCharge: e.target.value})}
                      className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-3 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Minimum Order (₹)</label>
                   <input 
                      type="number" 
                      placeholder="e.g. 300"
                      value={newArea.minOrder}
                      onChange={(e) => setNewArea({...newArea, minOrder: e.target.value})}
                      className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-3 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">ETA (Mins)</label>
                   <input 
                      type="number" 
                      placeholder="e.g. 18"
                      value={newArea.eta}
                      onChange={(e) => setNewArea({...newArea, eta: e.target.value})}
                      className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-3 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
                   />
                </div>
             </div>
           )}
           
           {['DELIVERY_ZONE', 'ADMIN_HUB'].includes(newArea.type) && (
             <div className="grid grid-cols-2 gap-4 animate-fade-in mt-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Geo-Tag Latitude</label>
                   <input 
                      type="text" 
                      placeholder="e.g. 11.6234"
                      value={newArea.lat}
                      onChange={(e) => setNewArea({...newArea, lat: e.target.value})}
                      className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-3 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Geo-Tag Longitude</label>
                   <input 
                      type="text" 
                      placeholder="e.g. 92.7265"
                      value={newArea.lng}
                      onChange={(e) => setNewArea({...newArea, lng: e.target.value})}
                      className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-3 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
                   />
                </div>
             </div>
           )}
           <Button onClick={handleAddArea} className="w-full bg-primary py-4 text-[11px] font-black uppercase tracking-widest shadow-glow-purple mt-4">
              AUTHORIZE COMMISSION
           </Button>
        </div>
      </Modal>

      {/* Edit Territory Modal */}
      <Modal
        isOpen={showEditModal && !!editingArea}
        onClose={() => setShowEditModal(false)}
        title="Edit Node"
        description="Modify geographic territory node parameters in the registry."
        className="bg-bg-secondary border-[var(--foreground)]/10 text-[var(--foreground)]"
      >
        <div className="space-y-4">
           <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Node Identity</label>
              <input 
                 type="text" 
                 placeholder="e.g. Phoenix Bay Jetty"
                 value={editingArea?.name || ""}
                 onChange={(e) => setEditingArea({...editingArea, name: e.target.value})}
                 className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-3 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
              />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Classification</label>
                 <select 
                    value={editingArea?.type || "JETTY"}
                    onChange={(e) => setEditingArea({...editingArea, type: e.target.value})}
                    className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-3 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
                 >
                    <option value="COUNTRY">COUNTRY</option>
                    <option value="STATE">STATE / PROVINCE</option>
                    <option value="CITY">CITY</option>
                    <option value="AREA">AREA (Delivery Hub)</option>
                    <option disabled>──────────</option>
                    <option value="ISLAND">ISLAND</option>
                    <option value="PORT">PORT</option>
                    <option value="JETTY">JETTY</option>
                    <option value="WARD">WARD</option>
                 </select>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Parent Registry</label>
                 <select 
                    value={editingArea?.parentId || ""}
                    onChange={(e) => setEditingArea({...editingArea, parentId: e.target.value})}
                    className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-3 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
                    disabled={editingArea?.type === 'COUNTRY'}
                 >
                    <option value="">{editingArea?.type === 'COUNTRY' ? '(Root Level)' : '(Selected Domain)'}</option>
                    {territories.filter(t => getValidParentTypes(editingArea?.type || 'JETTY').includes(t.zone_type) && t.id !== editingArea?.id).map(t => (
                       <option key={t.id} value={t.id}>{t.name} ({t.zone_type})</option>
                    ))}
                 </select>
              </div>
           </div>
           
           {['AREA', 'WARD', 'JETTY'].includes(editingArea?.type) && (
             <div className="grid grid-cols-2 gap-4 animate-fade-in mt-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Geo-Tag Latitude</label>
                   <input 
                      type="text" 
                      placeholder="e.g. 11.6234"
                      value={editingArea.lat}
                      onChange={(e) => setEditingArea({...editingArea, lat: e.target.value})}
                      className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-3 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Geo-Tag Longitude</label>
                   <input 
                      type="text" 
                      placeholder="e.g. 92.7265"
                      value={editingArea.lng}
                      onChange={(e) => setEditingArea({...editingArea, lng: e.target.value})}
                      className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-3 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
                   />
                </div>
             </div>
           )}
           <Button onClick={handleEditArea} className="w-full bg-primary py-4 text-[11px] font-black uppercase tracking-widest shadow-glow-purple mt-4">
              SAVE CHANGES
           </Button>
        </div>
      </Modal>

      <div className="space-y-8">
        {/* Territory Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Primary Domains", value: rootTerritories.length.toString(), icon: Globe, color: "text-primary" },
            { label: "State Hubs", value: territories.filter(t => ['STATE', 'PORT'].includes(t.zone_type)).length.toString(), icon: Ship, color: "text-success" },
            { label: "City Nodes", value: territories.filter(t => ['CITY', 'JETTY'].includes(t.zone_type)).length.toString(), icon: Anchor, color: "text-warning" },
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
              <p className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest px-2">Primary Domains</p>
              <div className="space-y-1">
                {rootTerritories.length > 0 ? rootTerritories.map((root) => (
                  <button
                    key={root.id}
                    onClick={() => setActiveIsland(root.name)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border",
                      activeIsland === root.name 
                        ? "bg-primary/10 border-primary/20 text-primary shadow-glow-purple-sm" 
                        : "bg-[var(--foreground)]/5 border-transparent text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/10"
                    )}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{root.name}</span>
                    <ChevronRight className={cn("w-4 h-4", activeIsland === root.name ? "opacity-100" : "opacity-0")} />
                  </button>
                )) : (
                  <p className="text-[10px] text-[var(--foreground)]/40 px-2 italic">No Root Domains Configured</p>
                )}
              </div>
            </div>

            <div className="p-6 rounded-[24px] bg-primary/5 border border-primary/20 relative overflow-hidden group">
              <Compass className="absolute -bottom-4 -right-4 w-20 h-20 text-primary opacity-5 group-hover:rotate-45 transition-transform duration-1000" />
              <div className="space-y-4 relative z-10">
                <h3 className="text-[10px] font-black text-[var(--foreground)] uppercase italic tracking-widest">System Mapping</h3>
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

            {/* Territories Table - Desktop */}
            <div className="hidden lg:block border border-[var(--foreground)]/5 rounded-[24px] overflow-hidden bg-bg-secondary/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--foreground)]/5 border-b border-[var(--foreground)]/10">
                    <th className="p-6 text-[9px] font-black text-[var(--foreground)]/40 uppercase tracking-[0.2em]">Maritime Node</th>
                    <th className="p-6 text-[9px] font-black text-[var(--foreground)]/40 uppercase tracking-[0.2em]">Classification</th>
                    <th className="p-6 text-[9px] font-black text-[var(--foreground)]/40 uppercase tracking-[0.2em]">Parent Registry</th>
                    <th className="p-6 text-[9px] font-black text-[var(--foreground)]/40 uppercase tracking-[0.2em]">Status</th>
                    <th className="p-6 text-[9px] font-black text-[var(--foreground)]/40 uppercase tracking-[0.2em]">Sub-Nodes</th>
                    <th className="p-6 text-right text-[9px] font-black text-[var(--foreground)]/40 uppercase tracking-[0.2em] pr-10">Governance</th>
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
                  ) : filteredTerritories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-12 text-xs font-black uppercase text-text-secondary italic">
                        No matching records found in database registry.
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
                        <button 
                          onClick={() => toggleStatus(t.id)}
                          className="flex items-center gap-2"
                        >
                          <div className={cn("w-1.5 h-1.5 rounded-full", t.status === "ACTIVE" ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-[var(--foreground)]/20")} />
                          <span className={cn("text-[9px] font-black tracking-widest uppercase", t.status === "ACTIVE" ? "text-success" : "text-[var(--foreground)]/20")}>
                            {t.status}
                          </span>
                        </button>
                      </td>
                      <td className="p-6 text-center">
                        <span className="text-xs font-black text-[var(--foreground)]">{t.sub_nodes}</span>
                      </td>
                      <td className="p-6 text-right pr-6">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => handleEditClick(t)} 
                            className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5"
                          >
                             <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteArea(t.id, t.name)} 
                            className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5"
                          >
                             <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view cards - visible only on lg screens and below */}
            <div className="lg:hidden space-y-4">
              {isLoading ? (
                <div className="p-20 text-center">
                  <Activity className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                  <p className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Accessing Maritime Registry...</p>
                </div>
              ) : filteredTerritories.length === 0 ? (
                <div className="text-center p-12 text-xs font-black uppercase text-text-secondary italic bg-bg-secondary/20 border border-[var(--foreground)]/5 rounded-2xl">
                  No matching records found in database registry.
                </div>
              ) : (
                filteredTerritories.map((t) => (
                  <div 
                    key={t.id} 
                    className="p-4 rounded-xl bg-bg-card/40 border border-[var(--foreground)]/5 space-y-3 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 flex items-center justify-center border border-[var(--foreground)]/10 shrink-0">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-sm text-[var(--foreground)] tracking-wide">{t.name}</p>
                          <Badge variant="outline" className="text-[8px] font-black tracking-widest border-[var(--foreground)]/10 text-[var(--foreground)]/60">
                            {t.zone_type}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-right">
                        <button 
                          onClick={() => toggleStatus(t.id)}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border transition-all",
                            t.status === "ACTIVE" 
                              ? "bg-success/10 border-success/20 text-success" 
                              : "bg-[var(--foreground)]/5 border-[var(--foreground)]/10 text-[var(--foreground)]/40"
                          )}
                        >
                          {t.status}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2.5">
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Parent Registry</p>
                        <p className="text-[10px] font-bold text-[var(--foreground)]/50 italic">{t.parent_name || "ROOT"}</p>
                      </div>
                      
                      <div className="space-y-0.5 text-center">
                        <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Sub-Nodes</p>
                        <p className="text-xs font-black text-[var(--foreground)]">{t.sub_nodes}</p>
                      </div>

                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => handleEditClick(t)} 
                          className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5"
                        >
                           <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteArea(t.id, t.name)} 
                          className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5"
                        >
                           <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  
  );
}
