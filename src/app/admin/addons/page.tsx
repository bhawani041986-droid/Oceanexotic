"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { 
  Sliders, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Save, 
  Clock, 
  Globe, 
  MapPin, 
  AlertTriangle, 
  Layers,
  Settings,
  Check,
  Award,
  Package,
  Flame,
  Loader2,
  Upload
} from "lucide-react";

interface Addon {
  id: string;
  name: string;
  price: number;
  type: string;
  description: string;
  image_url: string;
  is_active: number;
  allowed_areas: string | null;
  start_time: string;
  end_time: string;
  created_at?: string;
  updated_at?: string;
}

interface Territory {
  id: string;
  name: string;
  zone_type: string;
  status: string;
}

export default function AdminAddonsPage() {
  const { toast } = useToast();
  const [addons, setAddons] = useState<Addon[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [addonToDelete, setAddonToDelete] = useState<Addon | null>(null);
  const [deleteChecklist, setDeleteChecklist] = useState({
    confirmRegistry: false,
    confirmCheckout: false,
    confirmHistory: false,
  });
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    type: "Global Addon",
    description: "",
    image_url: "",
    is_active: 1,
    start_time: "00:00",
    end_time: "23:59",
    allowed_areas: [] as string[]
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch("/api/upload.php", {
        method: "POST",
        body: formDataUpload,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, image_url: data.url }));
        toast("Image asset successfully uploaded to cloud registry.", "success");
      } else {
        toast(data.message || "Failed to upload image asset.", "error");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast("Error uploading file.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch all addons and active territories
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [addonsRes, territoriesRes] = await Promise.all([
        fetch("/api/admin/addons.php"),
        fetch("/api/system/get_territories.php")
      ]);

      if (addonsRes.ok) {
        const addonsData = await addonsRes.json();
        setAddons(addonsData);
      } else {
        toast("Failed to fetch addons.", "error");
      }

      if (territoriesRes.ok) {
        const territoriesData = await territoriesRes.json();
        // Filter only active territories
        const activeTerritories = territoriesData.filter(
          (t: Territory) => t.status === "ACTIVE"
        );
        setTerritories(activeTerritories);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast("Error loading dashboard data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingAddon(null);
    setFormData({
      name: "",
      price: 0,
      type: "Global Addon",
      description: "",
      image_url: "",
      is_active: 1,
      start_time: "00:00",
      end_time: "23:59",
      allowed_areas: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (addon: Addon) => {
    setEditingAddon(addon);
    // Parse time strings e.g. "08:00:00" -> "08:00"
    const parseTime = (timeStr: string) => {
      if (!timeStr) return "00:00";
      const parts = timeStr.split(":");
      return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : "00:00";
    };

    const allowed = addon.allowed_areas 
      ? addon.allowed_areas.split(",").map(a => a.trim()).filter(Boolean)
      : [];

    setFormData({
      name: addon.name,
      price: addon.price,
      type: addon.type,
      description: addon.description || "",
      image_url: addon.image_url || "",
      is_active: addon.is_active,
      start_time: parseTime(addon.start_time),
      end_time: parseTime(addon.end_time),
      allowed_areas: allowed
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast("Add-on name is required.", "error");
      return;
    }
    if (formData.price <= 0) {
      toast("Price must be a positive number.", "error");
      return;
    }

    // Format start_time and end_time to HH:MM:SS
    const formatTime = (timeStr: string) => {
      if (!timeStr) return "00:00:00";
      const parts = timeStr.split(":");
      return parts.length === 2 ? `${parts[0]}:${parts[1]}:00` : timeStr;
    };

    const payload = {
      action: "save",
      id: editingAddon ? editingAddon.id : undefined,
      name: formData.name,
      price: formData.price,
      type: formData.type,
      description: formData.description,
      image_url: formData.image_url,
      is_active: formData.is_active,
      start_time: formatTime(formData.start_time),
      end_time: formatTime(formData.end_time),
      allowed_areas: formData.allowed_areas.length > 0 
        ? formData.allowed_areas.join(",") 
        : null
    };

    try {
      const res = await fetch("/api/admin/addons.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok && result.status === "success") {
        toast(result.message, "success");
        setIsModalOpen(false);
        fetchData();
      } else {
        toast(result.message || "Failed to save add-on.", "error");
      }
    } catch (error) {
      console.error("Error saving add-on:", error);
      toast("Error communicating with server.", "error");
    }
  };

  const handleToggleActive = async (addon: Addon) => {
    const newStatus = addon.is_active === 1 ? 0 : 1;
    try {
      const res = await fetch("/api/admin/addons.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "toggle_active",
          id: addon.id,
          is_active: newStatus
        })
      });

      const result = await res.json();
      if (res.ok && result.status === "success") {
        toast(result.message, "success");
        setAddons(prev => 
          prev.map(item => item.id === addon.id ? { ...item, is_active: newStatus } : item)
        );
      } else {
        toast(result.message || "Failed to update status.", "error");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast("Error updating add-on status.", "error");
    }
  };

  const confirmDelete = (addon: Addon) => {
    setAddonToDelete(addon);
    setDeleteChecklist({
      confirmRegistry: false,
      confirmCheckout: false,
      confirmHistory: false,
    });
    setDeleteConfirmName("");
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!addonToDelete) return;

    try {
      const res = await fetch("/api/admin/addons.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "delete",
          id: addonToDelete.id
        })
      });

      const result = await res.json();
      if (res.ok && result.status === "success") {
        toast(result.message, "success");
        setIsDeleteModalOpen(false);
        setAddonToDelete(null);
        fetchData();
      } else {
        toast(result.message || "Failed to delete add-on.", "error");
      }
    } catch (error) {
      console.error("Error deleting add-on:", error);
      toast("Error communicating with server.", "error");
    }
  };

  const handleAreaCheckboxChange = (areaName: string) => {
    setFormData(prev => {
      const current = [...prev.allowed_areas];
      const index = current.indexOf(areaName);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(areaName);
      }
      return { ...prev, allowed_areas: current };
    });
  };

  // Filtered addons for search
  const filteredAddons = addons.filter(addon => 
    addon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addon.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (addon.description && addon.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Stats calculation
  const totalCount = addons.length;
  const activeCount = addons.filter(a => a.is_active === 1).length;
  const globalCount = addons.filter(a => !a.allowed_areas).length;
  const timeRestrictedCount = addons.filter(a => 
    a.start_time !== "00:00:00" || a.end_time !== "23:59:59"
  ).length;

  return (
    <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-20 px-0 animate-fade-in text-[var(--foreground)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black tracking-tighter uppercase italic shadow-glow-purple/5 flex items-center justify-center md:justify-start gap-3">
            <Sliders className="w-6 md:w-8 h-6 md:h-8 text-primary" />
            Add-ons Control Panel
          </h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">
            Governing Custom Marinades, Ingredients, Packaging, and Local Market Addons
          </p>
        </div>
        <Button 
          onClick={openAddModal}
          variant="primary" 
          className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic"
        >
          <Plus className="w-3.5 md:w-4 h-3.5 md:h-4" /> COMMISSION ADD-ON
        </Button>
      </div>

      {/* Analytics/Impact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] md:gap-6">
        {[
          { label: "Total Registered", value: totalCount.toString(), icon: <Layers /> },
          { label: "Active Nodes", value: activeCount.toString(), icon: <Globe /> },
          { label: "Global Coverage", value: globalCount.toString(), icon: <Settings /> },
          { label: "Timed Offerings", value: timeRestrictedCount.toString(), icon: <Clock /> },
        ].map((stat) => (
          <Card key={stat.label} className="p-[10px] md:p-6 space-y-3 md:space-y-4 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[24px] md:rounded-[40px] hover:border-primary/20 transition-all group shadow-premium">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all shadow-glow-purple/5">
              {React.cloneElement(stat.icon as React.ReactElement, { className: "w-4 h-4 md:w-5 md:h-5" })}
            </div>
            <div className="space-y-0.5 md:space-y-1">
              <p className="text-[7px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{stat.label}</p>
              <h4 className="text-lg md:text-2xl font-black italic tracking-tighter">{stat.value}</h4>
            </div>
          </Card>
        ))}
      </div>

      {/* Registry Table */}
      <Card className="p-1 rounded-[24px] md:rounded-[40px] overflow-hidden bg-bg-secondary/20 shadow-premium border-[var(--foreground)]/5">
        <div className="p-[10px] md:p-6 border-b border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6">
           <div className="space-y-0.5 md:space-y-1 text-center md:text-left">
              <h3 className="text-base md:text-lg font-black tracking-tighter uppercase italic">Add-on Registry</h3>
              <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Live addon configuration telemetry</p>
           </div>
           <div className="relative group w-full md:w-64">
              <Input 
                placeholder="SEARCH ADDONS..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-10 text-[8px] md:text-[9px] font-black uppercase italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl" 
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
           </div>
        </div>
        {isLoading ? (
          <div className="p-20 text-center text-xs font-black uppercase tracking-widest text-text-secondary animate-pulse">
            Syncing registry database...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                 <TableHeader>
                    <TableRow className="border-[var(--foreground)]/5">
                       <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Add-on details</TableHead>
                       <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Category</TableHead>
                       <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Price</TableHead>
                       <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Operational window</TableHead>
                       <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Allowed zones</TableHead>
                       <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Active</TableHead>
                       <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Governance</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {filteredAddons.length === 0 ? (
                      <TableRow className="border-none">
                        <TableCell colSpan={7} className="text-center p-12 text-xs font-black uppercase text-text-secondary italic">
                          No matching records found in database registry.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAddons.map((addon) => {
                        const startShort = addon.start_time ? addon.start_time.substring(0, 5) : "00:00";
                        const endShort = addon.end_time ? addon.end_time.substring(0, 5) : "23:59";
                        const isTimed = startShort !== "00:00" || endShort !== "23:59";

                        return (
                          <TableRow key={addon.id} className="group/row border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                            <TableCell>
                               <div className="flex items-center gap-3">
                                  {addon.image_url ? (
                                     <img 
                                        src={addon.image_url} 
                                        alt={addon.name} 
                                        className="w-10 h-10 object-cover rounded-lg border border-[var(--foreground)]/5 bg-black"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=100&q=80";
                                        }}
                                     />
                                  ) : (
                                     <div className="w-10 h-10 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-lg flex items-center justify-center text-primary font-mono text-[9px]">
                                       N/A
                                     </div>
                                  )}
                                  <div className="space-y-0.5">
                                     <p className="font-bold text-xs text-[var(--foreground)] tracking-wide">{addon.name}</p>
                                     <p className="text-[8px] font-mono text-text-secondary uppercase tracking-widest">{addon.id}</p>
                                     {addon.description && (
                                       <p className="text-[9px] text-text-secondary line-clamp-1 max-w-[200px]">{addon.description}</p>
                                     )}
                                  </div>
                               </div>
                            </TableCell>
                            <TableCell className="text-[10px] font-black text-text-secondary uppercase italic opacity-80">
                              {addon.type}
                            </TableCell>
                            <TableCell className="font-black text-[var(--foreground)] italic text-xs tracking-tighter">
                              ₹{addon.price.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary">
                                <Clock className={`w-3.5 h-3.5 ${isTimed ? "text-primary shadow-glow-purple/25" : "opacity-40"}`} />
                                <span>
                                  {isTimed ? `${startShort} - ${endShort}` : "24 Hours Global"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary max-w-[180px]">
                                {addon.allowed_areas ? (
                                  <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                                ) : (
                                  <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                                )}
                                <span className="truncate">
                                  {addon.allowed_areas ? addon.allowed_areas : "Global Delivery"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                               <button 
                                 onClick={() => handleToggleActive(addon)}
                                 className={`w-12 h-6 rounded-full p-1 transition-all ${addon.is_active === 1 ? 'bg-primary' : 'bg-[var(--foreground)]/10'}`}
                               >
                                 <div className={`w-4 h-4 rounded-full bg-black transition-all ${addon.is_active === 1 ? 'translate-x-6' : 'translate-x-0'}`} />
                               </button>
                            </TableCell>
                            <TableCell className="text-right">
                               <div className="flex justify-end gap-1 md:gap-2">
                                  <button 
                                    onClick={() => openEditModal(addon)} 
                                    className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5"
                                  >
                                     <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => confirmDelete(addon)} 
                                    className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5"
                                  >
                                     <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                               </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                 </TableBody>
              </Table>
            </div>

            {/* Mobile view cards - visible only on lg screens and below */}
            <div className="lg:hidden space-y-4 p-4">
              {filteredAddons.length === 0 ? (
                <div className="text-center p-12 text-xs font-black uppercase text-text-secondary italic">
                  No matching records found in database registry.
                </div>
              ) : (
                filteredAddons.map((addon) => {
                  const startShort = addon.start_time ? addon.start_time.substring(0, 5) : "00:00";
                  const endShort = addon.end_time ? addon.end_time.substring(0, 5) : "23:59";
                  const isTimed = startShort !== "00:00" || endShort !== "23:59";

                  return (
                    <div 
                      key={addon.id} 
                      className="p-4 rounded-xl bg-bg-card/40 border border-[var(--foreground)]/5 space-y-3 shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {addon.image_url ? (
                             <img 
                                src={addon.image_url} 
                                alt={addon.name} 
                                className="w-12 h-12 object-cover rounded-lg border border-[var(--foreground)]/5 bg-black"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=100&q=80";
                                }}
                             />
                          ) : (
                             <div className="w-12 h-12 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-lg flex items-center justify-center text-primary font-mono text-[9px] shrink-0">
                               N/A
                             </div>
                          )}
                          <div className="space-y-0.5">
                             <p className="font-bold text-sm text-[var(--foreground)] tracking-wide">{addon.name}</p>
                             <p className="text-[8px] font-mono text-text-secondary uppercase tracking-widest leading-none">{addon.id}</p>
                             <Badge variant="glass" className="text-[8px] italic px-1.5 py-0 uppercase font-black tracking-widest mt-1">
                               {addon.type}
                             </Badge>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-black text-[var(--foreground)] italic text-sm tracking-tighter">
                            ₹{addon.price.toFixed(2)}
                          </p>
                          <button 
                            onClick={() => handleToggleActive(addon)}
                            className={`w-10 h-5 rounded-full p-0.5 mt-2 transition-all inline-block ${addon.is_active === 1 ? 'bg-primary' : 'bg-[var(--foreground)]/10'}`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-black transition-all ${addon.is_active === 1 ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>

                      {addon.description && (
                        <p className="text-[10px] text-text-secondary leading-relaxed border-t border-[var(--foreground)]/5 pt-2 italic">
                          {addon.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[8px] font-bold text-text-secondary">
                            <Clock className={`w-3 h-3 ${isTimed ? "text-primary shadow-glow-purple/25" : "opacity-40"}`} />
                            <span>
                              {isTimed ? `${startShort} - ${endShort}` : "24 Hours Global"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[8px] font-bold text-text-secondary">
                            {addon.allowed_areas ? (
                              <MapPin className="w-3 h-3 text-secondary shrink-0" />
                            ) : (
                              <Globe className="w-3 h-3 text-primary shrink-0" />
                            )}
                            <span className="truncate max-w-[120px]">
                              {addon.allowed_areas ? addon.allowed_areas : "Global Delivery"}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => openEditModal(addon)} 
                            className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5"
                          >
                             <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => confirmDelete(addon)} 
                            className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5"
                          >
                             <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Save/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingAddon ? "Edit Add-on Protocol" : "Commission New Add-on"}
        description="Configure add-on parameters, time restrictions, and delivery territory filters."
        className="md:max-w-2xl bg-bg-secondary/95 border border-primary/20 text-[var(--foreground)] shadow-[0_0_50px_rgba(168,85,247,0.15)] backdrop-blur-xl rounded-t-[28px] md:rounded-[28px] p-5 md:p-8"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic flex items-center gap-1">
                Name of Asset
              </label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Extra Lemon Pack" 
                className="h-12 bg-bg-primary/40 border border-[var(--foreground)]/10 rounded-xl px-4 text-xs text-[var(--foreground)] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all italic"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic">Price (₹)</label>
              <Input 
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ""}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                placeholder="e.g. 30.00" 
                className="h-12 bg-bg-primary/40 border border-[var(--foreground)]/10 rounded-xl px-4 text-xs text-[var(--foreground)] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-mono font-bold"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic">Add-on Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { value: "Global Addon", label: "Global", icon: Globe, desc: "Standard addon product" },
                { value: "Premium Addon", label: "Premium", icon: Award, desc: "Premium upgrades" },
                { value: "Packaging Addon", label: "Packaging", icon: Package, desc: "Box/insulation" },
                { value: "Delivery Addon", label: "Delivery", icon: MapPin, desc: "Logistics cost" },
                { value: "Grill Addon", label: "Grill", icon: Flame, desc: "Marinade & coals" },
              ].map((category) => {
                const Icon = category.icon;
                const isSelected = formData.type === category.value;
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: category.value })}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary/50 text-primary shadow-[0_0_15px_rgba(124,58,237,0.1)]"
                        : "bg-black/20 border-[var(--foreground)]/5 text-text-secondary hover:bg-black/35 hover:text-[var(--foreground)] hover:border-[var(--foreground)]/10"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? "text-primary" : "opacity-60"}`} />
                    <span className="text-[9px] font-black uppercase tracking-wider">{category.label}</span>
                    <span className="text-[7px] opacity-60 mt-0.5 leading-tight">{category.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-primary" /> Image Asset Upload
            </label>
            <div className="grid grid-cols-3 gap-5">
              <div className="col-span-2">
                <div className="relative group border border-dashed border-[var(--foreground)]/10 hover:border-primary/50 rounded-xl bg-bg-primary/20 hover:bg-bg-primary/40 transition-all duration-300">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        <p className="text-[8px] font-black text-primary uppercase tracking-widest animate-pulse">Uploading to Storage Node...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-text-secondary group-hover:text-primary transition-colors" />
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-wider">Drag & drop image file</p>
                          <p className="text-[8px] font-bold text-text-secondary uppercase tracking-widest">or click to browse local files</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {/* Fallback image link field in case they want to paste a URL */}
                <div className="mt-2.5 flex items-center gap-2">
                  <Input 
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="Alternatively, paste external image URL..." 
                    className="h-9 bg-bg-primary/30 border border-[var(--foreground)]/5 rounded-lg px-3 text-[9px] text-[var(--foreground)] outline-none focus:border-primary transition-all italic flex-1"
                  />
                  {formData.image_url && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData({...formData, image_url: ""})}
                      className="h-9 px-3 text-[8px] font-black uppercase border-[var(--foreground)]/10 text-danger hover:bg-danger/10 hover:border-danger/20 rounded-lg shrink-0"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              <div className="col-span-1 flex flex-col justify-between space-y-2">
                <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Live Preview</label>
                <div className="relative w-full h-24 rounded-xl overflow-hidden border border-primary/30 shadow-[0_0_15px_rgba(168,85,247,0.1)] bg-black/40 flex items-center justify-center">
                  {formData.image_url ? (
                    <>
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=100&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-[8px] font-black text-white uppercase tracking-widest">Active Node</p>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 text-center text-[8px] font-bold text-text-secondary uppercase tracking-wider leading-relaxed">
                      No asset committed
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic">Telemetry Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Provide a functional summary for the customer..." 
              className="w-full h-20 bg-bg-primary/40 border border-[var(--foreground)]/10 rounded-xl p-4 text-xs text-[var(--foreground)] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all no-scrollbar"
            />
          </div>

          <div className="space-y-4 border-t border-[var(--foreground)]/5 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary" /> Availability Scheduling Presets
              </label>
              <div className="flex gap-2">
                {[
                  { label: "24h Global", start: "00:00", end: "23:59" },
                  { label: "Morning (06-11)", start: "06:00", end: "11:00" },
                  { label: "Peak Hours (11-23)", start: "11:00", end: "23:00" },
                  { label: "Late Night (23-06)", start: "23:00", end: "06:00" }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, start_time: preset.start, end_time: preset.end })}
                    className="px-2.5 py-1 rounded border border-[var(--foreground)]/5 bg-black/20 hover:bg-primary/10 hover:border-primary/30 text-[8px] font-black uppercase tracking-wider text-text-secondary hover:text-primary transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic flex items-center gap-1">
                  Start Availability Time
                </label>
                <Input 
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  className="h-12 bg-bg-primary/40 border border-[var(--foreground)]/10 rounded-xl px-4 text-xs text-[var(--foreground)] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-mono font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic flex items-center gap-1">
                  End Availability Time
                </label>
                <Input 
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  className="h-12 bg-bg-primary/40 border border-[var(--foreground)]/10 rounded-xl px-4 text-xs text-[var(--foreground)] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-[var(--foreground)]/5 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-secondary" /> Allowed Delivery Zones
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, allowed_areas: territories.map(t => t.name) })}
                  className="text-[8px] font-black uppercase text-primary hover:underline"
                >
                  Select All
                </button>
                <span className="text-[8px] opacity-20">|</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, allowed_areas: [] })}
                  className="text-[8px] font-black uppercase text-text-secondary hover:underline hover:text-[var(--foreground)]"
                >
                  Clear All
                </button>
              </div>
            </div>
            <p className="text-[8px] text-text-secondary uppercase tracking-widest italic opacity-60 mb-2">
              Leave all unchecked to make this add-on available globally across all territory nodes.
            </p>
            {territories.length === 0 ? (
              <div className="text-[10px] text-text-secondary italic">No active delivery zones available in system settings.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 bg-bg-primary/40 rounded-2xl border border-[var(--foreground)]/5 max-h-40 overflow-y-auto no-scrollbar shadow-inner">
                {territories.map((territory) => {
                  const isChecked = formData.allowed_areas.includes(territory.name);
                  return (
                    <div 
                      key={territory.id} 
                      onClick={() => handleAreaCheckboxChange(territory.name)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked 
                          ? 'bg-primary/10 border-primary/40 text-primary shadow-glow-purple/10' 
                          : 'bg-black/20 border-[var(--foreground)]/5 text-text-secondary hover:bg-black/35 hover:text-[var(--foreground)]'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider truncate mr-2">
                        {territory.name}
                      </span>
                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all border ${
                        isChecked 
                          ? 'bg-primary border-primary text-black' 
                          : 'border-[var(--foreground)]/20 bg-transparent'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t border-[var(--foreground)]/5">
            <Button 
              type="button"
              onClick={() => setIsModalOpen(false)} 
              variant="outline" 
              className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest border border-[var(--foreground)]/10 text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all rounded-xl"
            >
              Abort
            </Button>
            <Button 
              type="submit"
              variant="primary" 
              className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest shadow-glow-purple rounded-xl flex items-center justify-center gap-3 italic transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="w-4 h-4" /> {editingAddon ? "COMMIT CHANGES" : "DEPLOY ADD-ON"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Purge Add-on Protocol"
        description="Are you absolutely sure you want to delete this addon product?"
        className="md:max-w-md bg-bg-secondary/95 border border-danger/30 text-[var(--foreground)] shadow-[0_0_50px_rgba(239,68,68,0.15)] backdrop-blur-xl rounded-t-[28px] md:rounded-[28px] p-5 md:p-8"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-danger/10 border border-danger/20 rounded-2xl text-danger shadow-[0_0_15px_rgba(239,68,68,0.05)]">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest">Permanent Decommission</h4>
              <p className="text-[9px] font-bold uppercase tracking-wider leading-relaxed opacity-85">
                WARNING: This operation is permanent. Failsafes are required below to unlock the purge command.
              </p>
            </div>
          </div>

          {addonToDelete && (
            <div className="p-4 bg-bg-primary/40 rounded-2xl border border-[var(--foreground)]/5 space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-danger/5 rounded-full blur-xl group-hover:bg-danger/10 transition-all duration-500" />
              <div className="flex items-center gap-4">
                {addonToDelete.image_url ? (
                  <img 
                    src={addonToDelete.image_url} 
                    alt={addonToDelete.name} 
                    className="w-12 h-12 object-cover rounded-xl border border-[var(--foreground)]/5 bg-black"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=100&q=80";
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-xl flex items-center justify-center text-primary font-mono text-[9px] shrink-0">
                    N/A
                  </div>
                )}
                <div className="space-y-0.5">
                  <p className="text-xs font-black uppercase tracking-widest text-[var(--foreground)]">{addonToDelete.name}</p>
                  <p className="text-[9px] font-mono font-bold text-text-secondary uppercase tracking-widest">{addonToDelete.id}</p>
                  <p className="text-sm font-black italic tracking-tight text-primary mt-1">₹{addonToDelete.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Safety Gate Checklist */}
          <div className="space-y-3 p-4 bg-black/20 rounded-2xl border border-[var(--foreground)]/5">
            <h5 className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Purge Acknowledgements</h5>
            <div className="space-y-2">
              {[
                { key: "confirmRegistry", label: "Permanently delete from marketplace registry" },
                { key: "confirmCheckout", label: "Bypass add-on checkout integrity checks" },
                { key: "confirmHistory", label: "Retain database logs for historical order compliance" }
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={deleteChecklist[item.key as keyof typeof deleteChecklist]}
                    onChange={(e) => setDeleteChecklist({ ...deleteChecklist, [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--foreground)]/20 bg-transparent text-danger focus:ring-danger/20 cursor-pointer"
                  />
                  <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Text Match Challenge */}
          {addonToDelete && (
            <div className="space-y-2">
              <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic">
                Type the add-on name <span className="text-primary font-bold">"{addonToDelete.name}"</span> to confirm:
              </label>
              <Input
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder="Type name here..."
                className="h-12 bg-bg-primary/40 border border-danger/20 rounded-xl px-4 text-xs text-[var(--foreground)] outline-none focus:border-danger focus:ring-1 focus:ring-danger/20 transition-all font-bold"
              />
            </div>
          )}

          <div className="flex gap-4">
            <Button 
              onClick={() => setIsDeleteModalOpen(false)} 
              variant="outline" 
              className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest border border-[var(--foreground)]/10 text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all rounded-xl"
            >
              Abort Purge
            </Button>
            <Button 
              disabled={
                !deleteChecklist.confirmRegistry ||
                !deleteChecklist.confirmCheckout ||
                !deleteChecklist.confirmHistory ||
                deleteConfirmName !== (addonToDelete?.name || "")
              }
              onClick={handleDelete}
              variant="primary" 
              className="flex-1 h-12 bg-danger hover:bg-danger/90 disabled:bg-[var(--foreground)]/10 disabled:opacity-50 disabled:cursor-not-allowed border-none text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 italic transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Trash2 className="w-4 h-4" /> PURGE REGISTRY
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
