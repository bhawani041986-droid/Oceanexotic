"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useSettingsStore } from "@/store/settingsStore";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Image as ImageIcon, 
  Layout, 
  Plus, 
  Search, 
  Edit3, 
  Trash2,
  ExternalLink,
  ChevronRight,
  Eye,
  Save,
  Clock,
  X
} from "lucide-react";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";

export default function AdminCMSPage() {
  const router = useRouter(
  );
  const { flashDealActive, flashDealEnd, atmosphericGlow, setSettings, pushSettings } = useSettingsStore(
  );
  const { toast } = useToast(
  );
  const [content, setContent] = useState<any[]>([]
  );
  const [isLoading, setIsLoading] = useState(true
  );

  const [isModalOpen, setIsModalOpen] = useState(false
  );
  const [editingItem, setEditingItem] = useState<any>(null
  );
  const [viewOnly, setViewOnly] = useState(false
  );
  const [formData, setFormData] = useState({
    title: "",
    type: "BANNER",
    sector: "GLOBAL",
    status: "DRAFT",
    image_url: ""
  }
  );
  const fileInputRef = useRef<HTMLInputElement>(null
  );

  // 1. Fetch Dynamic Registry
  const fetchContent = async () => {
    try {
      setIsLoading(true
  );
      const response = await fetch(`${API_BASE_URL}/system/cms.php`);
      const data = await response.json(
  );
      if (data.status === 'success') {
        setContent(data.content || []
  );
      }
    } catch (error) {
      console.error("Registry Fetch Failed:", error
  );
      toast("Failed to synchronize with Maritime Registry.", "error"
  );
    } finally {
      setIsLoading(false
  );
    }
  };

  React.useEffect(() => {
    fetchContent(
  );
  }, []
  );

  const openModal = (item?: any, isView: boolean = false) => {
    setViewOnly(isView
  );
    if (item) {
      setEditingItem(item
  );
      setFormData({
        title: item.title,
        type: item.type,
        sector: item.sector,
        status: item.status,
        image_url: item.image_url
      }
  );
    } else {
      setEditingItem(null
  );
      setFormData({ title: "", type: "BANNER", sector: "GLOBAL", status: "DRAFT", image_url: "" }
  );
    }
    setIsModalOpen(true
  );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader(
  );
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result as string }
  );
        toast("Visual asset staged successfully.", "success"
  );
      };
      reader.readAsDataURL(file
  );
    }
  };

  const handleSave = async (forceStatus?: string) => {
    if (!formData.title) {
      toast("Directive title required.", "error"
  );
      return;
    }

    try {
      const payload = {
        ...formData,
        status: forceStatus || formData.status,
        id: editingItem?.id
      };

      const response = await fetch(`${API_BASE_URL}/system/cms.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
  );
      
      const data = await response.json(
  );
      if (data.status === 'success') {
        toast(editingItem ? "Broadcast Directive updated." : "New Content Directive commissioned.", "success"
  );
        fetchContent(
  );
        setIsModalOpen(false
  );
      }
    } catch (error) {
      toast("Registry update failed.", "error"
  );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to decommission this directive?")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/system/cms.php?id=${id}`, {
        method: 'DELETE'
      }
  );
      const data = await response.json(
  );
      if (data.status === 'success') {
        toast("Broadcast entry decommissioned.", "info"
  );
        fetchContent(
  );
      }
    } catch (error) {
      toast("Decommissioning failed.", "error"
  );
    }
  };

  const toggleStatus = async (item: any) => {
    const newStatus = item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await fetch(`${API_BASE_URL}/system/cms.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, status: newStatus })
      }
  );
      toast(`Directive state changed to ${newStatus}.`, "success"
  );
      fetchContent(
  );
    } catch (error) {
      toast("Status toggle failed.", "error"
  );
    }
  };

  return (

    <div className="space-y-[10px] md:space-y-12 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
      {/* CMS Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Broadcast Command</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Governing Platform-Wide Content & Visual Assets</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/marketplace/theme')}
            className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2 md:gap-3 border-[var(--foreground)]/5 rounded-lg md:rounded-xl italic"
          >
             <Layout className="w-3.5 md:w-4 h-3.5 md:h-4 text-primary" /> PAGE BUILDER
          </Button>
          <Button 
            variant="primary" 
            onClick={() => openModal()}
            className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic"
          >
            <Plus className="w-3.5 md:w-4 h-3.5 md:h-4" /> COMMISSION CONTENT
          </Button>
        </div>
      </div>

      {/* Media Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-[10px] md:gap-8">
        <Card className="lg:col-span-1 p-[10px] md:p-6 space-y-4 md:space-y-6 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[24px] md:rounded-[40px] shadow-premium">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-[16px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-glow-purple/5">
            <ImageIcon className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="space-y-1.5 md:space-y-2">
            <h3 className="text-xs md:text-sm font-black text-[var(--foreground)] uppercase tracking-tighter italic">Visual Repository</h3>
            <p className="text-[8px] md:text-[9px] text-text-secondary font-black tracking-widest uppercase italic opacity-40 leading-relaxed">
              {content.length * 40} Cinematic assets active across the network. High-fidelity sync status: <span className="text-success font-black">OPTIMAL</span>.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/admin/media')}
            className="w-full h-10 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic border-[var(--foreground)]/5 rounded-lg md:rounded-xl"
          >
            LAUNCH REPOSITORY
          </Button>
        </Card>

        <Card className="lg:col-span-3 p-1 rounded-[24px] md:rounded-[40px] bg-bg-secondary/20 border-[var(--foreground)]/5 shadow-premium overflow-hidden">
          <div className="p-[10px] md:p-6 border-b border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6">
             <div className="space-y-0.5 md:space-y-1 text-center md:text-left">
                <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Active Directives</h3>
                <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Live Content Streams across all Maritime Sectors</p>
             </div>
             <div className="relative group w-full md:w-64">
                <Input placeholder="SEARCH DIRECTIVES..." className="h-10 pl-10 text-[8px] md:text-[9px] font-black uppercase italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl" />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
             </div>
          </div>
          <Table>
             <TableHeader>
                <TableRow className="border-[var(--foreground)]/5">
                   <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Directive Identity</TableHead>
                   <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Type</TableHead>
                   <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Sector</TableHead>
                   <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Registry Status</TableHead>
                   <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Governance</TableHead>
                </TableRow>
             </TableHeader>
             <TableBody>
                {isLoading ? (
                   <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                         <div className="flex flex-col items-center gap-4 opacity-40">
                            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest italic">Synchronizing Registry...</p>
                         </div>
                      </TableCell>
                   </TableRow>
                ) : content.length === 0 ? (
                   <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                         <p className="text-[10px] font-black uppercase tracking-widest italic opacity-20">No directives found in sector.</p>
                      </TableCell>
                   </TableRow>
                ) : content.map((item) => (
                   <TableRow key={item.id} className="group/row border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                      <TableCell>
                         <div className="space-y-0.5 md:space-y-1">
                            <p className="font-black text-[var(--foreground)] text-xs md:text-sm uppercase tracking-tighter italic group-hover/row:text-primary transition-colors">{item.title}</p>
                            <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">ID: {item.id}</p>
                         </div>
                      </TableCell>
                      <TableCell>
                         <Badge variant="glass" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[8px] md:text-[10px] italic px-2">{item.type}</Badge>
                      </TableCell>
                      <TableCell className="text-[9px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic opacity-60">{item.sector}</TableCell>
                      <TableCell>
                         <button 
                           onClick={() => toggleStatus(item)}
                           className="cursor-pointer"
                         >
                           <Badge 
                              variant={item.status === 'PUBLISHED' ? 'success' : 'glass'} 
                              className={cn("text-[8px] md:text-[9px] font-black italic transition-all active:scale-95", item.status === 'PUBLISHED' ? 'shadow-glow-success' : 'opacity-40')}
                           >
                              {item.status}
                           </Badge>
                         </button>
                      </TableCell>
                      <TableCell className="text-right">
                         <div className="flex justify-end gap-1 md:gap-2">
                            <button onClick={() => openModal(item, true)} className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5">
                               <Eye className="w-3.5 md:w-4 h-3.5 md:h-4" />
                            </button>
                            <button onClick={() => openModal(item)} className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                               <Edit3 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5">
                               <Trash2 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                            </button>
                         </div>
                      </TableCell>
                   </TableRow>
                ))}
             </TableBody>
          </Table>
        </Card>
      </div>

      {/* CMS Strategy & Flash Deal Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[10px] md:gap-8">
        <Card className="lg:col-span-8 p-[10px] md:p-8 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[24px] md:rounded-[48px] relative overflow-hidden group shadow-premium">
           <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-primary/5 blur-[80px] md:blur-[100px] rounded-full -mr-32 -mt-32 md:-mr-48 md:-mt-48 transition-all group-hover:scale-110" />
           <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-12">
              <div className="space-y-3 md:space-y-4 max-w-2xl text-center md:text-left">
                 <h3 className="text-xl md:text-2xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Global Messaging Sovereignty</h3>
                 <p className="text-[10px] md:text-sm font-black tracking-widest uppercase italic text-text-secondary leading-relaxed opacity-40">
                    All broadcasted content is synchronized across 84 global maritime sectors. Immutability protocols are active for legal directives.
                 </p>
                 <div className="flex justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-1.5 md:gap-2">
                       <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                       <span className="text-[8px] md:text-[9px] font-black text-success uppercase tracking-widest italic">Legal Sync: Active</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                       <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                       <span className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-widest italic">Regional Caching: Optimal</span>
                    </div>
                 </div>
              </div>
               <Button 
                variant="outline" 
                onClick={() => router.push('/admin/logs')}
                className="w-full md:w-auto h-12 md:h-14 px-8 md:px-10 text-[9px] md:text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-3 md:gap-4 border-[var(--foreground)]/5 rounded-lg md:rounded-xl italic"
              >
                 VIEW AUDIT HISTORY <ChevronRight className="w-3.5 md:w-4 h-3.5 md:h-4" />
              </Button>
           </div>
        </Card>

        <Card className="lg:col-span-4 p-[10px] md:p-8 bg-primary/5 border-primary/20 rounded-[24px] md:rounded-[40px] space-y-6 relative overflow-hidden shadow-premium">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-glow-purple/20">
                 <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                 <h3 className="text-sm md:text-base font-black text-[var(--foreground)] uppercase italic tracking-tighter">Flash Deal Protocol</h3>
                 <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Temporal Campaign Governance</p>
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5">
                 <div className="space-y-1">
                    <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Protocol Status</p>
                    <p className={cn("text-[10px] font-black italic uppercase", flashDealActive ? "text-success" : "text-danger")}>
                       {flashDealActive ? "MISSION ACTIVE" : "DECOMMISSIONED"}
                    </p>
                 </div>
                 <button 
                  onClick={async () => {
                    setSettings({ flashDealActive: !flashDealActive }
  );
                    await pushSettings(
  );
                    toast(`Flash Deal Protocol ${!flashDealActive ? 'Activated' : 'Decommissioned'}`, "info"
  );
                  }}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    flashDealActive ? "bg-primary" : "bg-[var(--foreground)]/10"
                  )}
                 >
                    <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", flashDealActive ? "left-7" : "left-1")} />
                 </button>
              </div>

              <div className="space-y-2">
                 <label className="text-[8px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Target Expiry (Local Time)</label>
                 <div className="relative">
                    <Input 
                      type="datetime-local" 
                      defaultValue={flashDealEnd.slice(0, 16)}
                      onChange={(e) => {
                        const date = new Date(e.target.value).toISOString(
  );
                        setSettings({ flashDealEnd: date }
  );
                      }}
                      className="h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 italic rounded-xl text-[10px] font-black uppercase text-[var(--foreground)]" 
                    />
                    <Button 
                      size="sm" 
                      onClick={async () => {
                        await pushSettings(
  );
                        toast("Target Expiry Synchronized.", "success"
  );
                      }}
                      className="absolute right-1 top-1 h-10 w-10 p-0 rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-[var(--foreground)]"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                 </div>
              </div>

              <div className="space-y-3 pt-2">
                 <div className="flex items-center justify-between px-1">
                    <label className="text-[8px] font-black text-[var(--foreground)] uppercase tracking-widest italic opacity-60">Atmosphere Intensity</label>
                    <Badge variant="glass" className="text-[8px] font-black">{atmosphericGlow}%</Badge>
                 </div>
                 <div className="relative pt-1">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={atmosphericGlow} 
                      onChange={async (e) => {
                        setSettings({ atmosphericGlow: parseInt(e.target.value) }
  );
                        // Debounced push or just wait for manual save? 
                        // For UX, we'll push immediately
                        await pushSettings(
  );
                      }}
                      className="w-full h-1 bg-[var(--foreground)]/10 rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                 </div>
              </div>
           </div>
        </Card>
      </div>

      {/* Commission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
           <Card className="relative z-10 w-full max-w-sm md:max-w-lg p-6 md:p-10 bg-bg-secondary border-[var(--foreground)]/5 space-y-6 md:space-y-8 animate-in zoom-in-95 duration-300 rounded-[24px] md:rounded-[48px] shadow-glow-purple/20">
              <div className="space-y-1 border-b border-[var(--foreground)]/5 pb-4 md:pb-6">
                 <h3 className="text-lg md:text-xl font-black text-[var(--foreground)] uppercase italic tracking-tighter">
                   {viewOnly ? "Directive Intel" : editingItem ? "Edit Directive" : "Commission Directive"}
                 </h3>
                 <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">
                   {viewOnly ? "Full telemetry of the selected broadcast asset." : "Integrating a New Broadcast Asset into the Platform Feed"}
                 </p>
              </div>
              <div className="space-y-4 md:space-y-6">
                 <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Directive Title</label>
                    <Input disabled={viewOnly} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Summer Harvest Hero" className="h-11 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 italic rounded-lg md:rounded-xl" />
                 </div>
                 <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1.5 md:space-y-2">
                       <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Directive Type</label>
                       <select 
                           disabled={viewOnly} 
                           value={formData.type} 
                           onChange={(e) => setFormData({...formData, type: e.target.value})} 
                           className="w-full h-11 md:h-14 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-lg md:rounded-[16px] px-3 md:px-4 text-[8px] md:text-[10px] font-black uppercase text-[var(--foreground)] outline-none italic disabled:opacity-50 appearance-none cursor-pointer hover:bg-[var(--foreground)]/10 transition-colors"
                           style={{ colorScheme: 'dark' }}
                        >
                           <option value="BANNER" className="bg-[#020617] text-[var(--foreground)]">BANNER (Hero)</option>
                           <option value="PROMO" className="bg-[#020617] text-[var(--foreground)]">PROMO (Deals)</option>
                           <option value="RECIPE" className="bg-[#020617] text-[var(--foreground)]">RECIPE (Culinary)</option>
                           <option value="LEGAL" className="bg-[#020617] text-[var(--foreground)]">LEGAL (Policy)</option>
                           <option value="STORY" className="bg-[#020617] text-[var(--foreground)]">STORY (Dispatch)</option>
                       </select>
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                       <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Sovereign Sector</label>
                       <Input disabled={viewOnly} value={formData.sector} onChange={(e) => setFormData({...formData, sector: e.target.value})} placeholder="GLOBAL" className="h-11 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 italic rounded-lg md:rounded-xl" />
                    </div>
                 </div>
                 <div className="space-y-3 md:space-y-4">
                    <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Visual Asset (Image/Banner)</label>
                    <div 
                      onClick={() => !viewOnly && fileInputRef.current?.click()}
                      className={`aspect-video w-full rounded-2xl md:rounded-[24px] bg-[var(--foreground)]/5 border-2 border-dashed border-[var(--foreground)]/10 flex items-center justify-center transition-all overflow-hidden ${!viewOnly ? 'cursor-pointer hover:border-primary/50' : 'cursor-default opacity-80'}`}
                    >
                       {formData.image_url ? <img src={formData.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 md:w-8 h-6 md:h-8 opacity-20" />}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-4 pt-2 md:pt-4">
                 <Button variant="ghost" className="flex-1 h-11 md:h-12 uppercase text-[9px] md:text-[10px] font-black italic rounded-xl" onClick={() => setIsModalOpen(false)}>
                   {viewOnly ? "CLOSE" : "ABORT"}
                 </Button>
                 {!viewOnly && (
                   <>
                    <Button variant="outline" className="flex-1 h-11 md:h-12 uppercase text-[9px] md:text-[10px] font-black italic rounded-xl border-[var(--foreground)]/10 hover:border-primary/40 flex items-center justify-center gap-2" onClick={() => handleSave()}>
                      <Save className="w-3.5 h-3.5" /> SAVE DRAFT
                    </Button>
                    <Button className="flex-[1.5] h-11 md:h-12 uppercase text-[9px] md:text-[10px] font-black shadow-glow-purple italic rounded-xl bg-primary hover:bg-primary/90 flex items-center justify-center gap-2" onClick={() => handleSave('PUBLISHED')}>
                      <ExternalLink className="w-3.5 h-3.5" /> PUBLISH DIRECTIVE
                    </Button>
                   </>
                 )}
              </div>
           </Card>
        </div>
      )}
    </div>
  
  );
}
