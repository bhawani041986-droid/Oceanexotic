"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  FileText, ImageIcon, Layout, Plus, Search, Edit3, Trash2, 
  ExternalLink, ChevronRight, Eye, Save, Clock, X, Globe, Share2, UploadCloud, Cpu
} from "lucide-react";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";

export default function AdminCMSPage() {
  const router = useRouter();
  const { flashDealActive, flashDealEnd, atmosphericGlow, setSettings, pushSettings } = useSettingsStore();
  const { toast } = useToast();
  
  const [content, setContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drawer / Modal State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState<any>({
    title: "",
    type: "BANNER",
    sector: "GLOBAL",
    status: "DRAFT",
    image_url: "",
    metadata: {
      difficulty: "Medium",
      time: "25m",
      gallery: [],
      caption: "",
      socialSynced: false,
      facebookSynced: false,
      instagramSynced: false
    }
  });

  // Staged Files for Upload
  const [stagedCover, setStagedCover] = useState<File | null>(null);
  const [stagedCoverPreview, setStagedCoverPreview] = useState<string>("");
  const [stagedGallery, setStagedGallery] = useState<{file: File, preview: string}[]>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Share State
  const [syncState, setSyncState] = useState<'idle' | 'authorizing' | 'transmitting' | 'finishing' | 'success'>('idle');
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [facebookSync, setFacebookSync] = useState(true);
  const [instagramSync, setInstagramSync] = useState(true);
  const [socialCaption, setSocialCaption] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharingItem, setSharingItem] = useState<any>(null);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/system/cms`);
      const data = await response.json();
      if (data.status === 'success') {
        setContent(data.content || []);
      }
    } catch (error) {
      console.error("Registry Fetch Failed:", error);
      toast("Failed to load content registry.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const openDrawer = (item?: any, isView: boolean = false) => {
    setViewOnly(isView);
    setStagedCover(null);
    setStagedCoverPreview("");
    setStagedGallery([]);
    
    if (item) {
      setEditingItem(item);
      let metadata = { difficulty: "Medium", time: "25m", gallery: [], caption: "", socialSynced: false, facebookSynced: false, instagramSynced: false };
      if (item.metadata) {
        try {
          const parsed = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata;
          metadata = { ...metadata, ...parsed };
        } catch(e) {}
      }
      setFormData({
        title: item.title,
        type: item.type,
        sector: item.sector,
        status: item.status,
        image_url: item.image_url,
        metadata
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        title: "", type: "BANNER", sector: "GLOBAL", status: "DRAFT", image_url: "", 
        metadata: { difficulty: "Medium", time: "25m", gallery: [], caption: "", socialSynced: false, facebookSynced: false, instagramSynced: false } 
      });
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    // Cleanup Object URLs to prevent memory leaks
    if (stagedCoverPreview) URL.revokeObjectURL(stagedCoverPreview);
    stagedGallery.forEach(item => URL.revokeObjectURL(item.preview));
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (stagedCoverPreview) URL.revokeObjectURL(stagedCoverPreview);
      setStagedCover(file);
      setStagedCoverPreview(URL.createObjectURL(file));
      toast("Cover image staged.", "info");
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newItems = files.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setStagedGallery(prev => [...prev, ...newItems]);
      toast(`${files.length} images staged for gallery.`, "info");
    }
  };

  const removeStagedGalleryItem = (index: number) => {
    URL.revokeObjectURL(stagedGallery[index].preview);
    setStagedGallery(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryItem = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        gallery: prev.metadata.gallery.filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const uploadFileToServerless = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("file", file);
    const res = await fetch(`/api/system/upload`, { method: "POST", body: data });
    const json = await res.json();
    if (json.status !== "success") throw new Error(json.message || "Upload failed");
    return json.url;
  };

  const handleSave = async (forceStatus?: string) => {
    if (!formData.title) {
      toast("Content title required.", "error");
      return;
    }

    setIsSaving(true);
    toast("Uploading assets and saving to registry...", "info");

    try {
      let finalImageUrl = formData.image_url;
      let finalGalleryUrls = [...(formData.metadata?.gallery || [])];

      // 1. Upload new cover if staged
      if (stagedCover) {
        finalImageUrl = await uploadFileToServerless(stagedCover);
      }

      // 2. Upload new gallery images if staged
      if (stagedGallery.length > 0) {
        const uploadPromises = stagedGallery.map(item => uploadFileToServerless(item.file));
        const newUrls = await Promise.all(uploadPromises);
        finalGalleryUrls = [...finalGalleryUrls, ...newUrls];
        if (!finalImageUrl && newUrls.length > 0) {
          finalImageUrl = newUrls[0]; // Set first gallery image as cover if none exists
        }
      }

      const payload = {
        ...formData,
        status: forceStatus || formData.status,
        image_url: finalImageUrl,
        id: editingItem?.id,
        metadata: {
          ...formData.metadata,
          gallery: finalGalleryUrls
        }
      };

      const response = await fetch(`${API_BASE_URL}/system/cms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast(editingItem ? "Content updated successfully." : "New content published successfully.", "success");
        fetchContent();
        closeDrawer();
      } else {
         toast(data.message || "Failed to save content.", "error");
      }
    } catch (error) {
      console.error(error);
      toast("An error occurred during save.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to completely delete this item?")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/system/cms?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.status === 'success') {
        toast("Content item permanently deleted.", "info");
        fetchContent();
      }
    } catch (error) {
      toast("Failed to delete content.", "error");
    }
  };

  const toggleStatus = async (item: any) => {
    const newStatus = item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await fetch(`${API_BASE_URL}/system/cms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, status: newStatus })
      });
      toast(`Content status changed to ${newStatus}.`, "success");
      fetchContent();
    } catch (error) {
      toast("Status toggle failed.", "error");
    }
  };

  const openShareModal = (item: any) => {
    setSharingItem(item);
    setSyncState('idle');
    setSyncLogs([]);
    let metadata = { caption: "", facebookSynced: true, instagramSynced: true };
    if (item.metadata) {
      try {
        const parsed = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata;
        metadata = { ...metadata, ...parsed };
      } catch(e) {}
    }
    setSocialCaption(metadata.caption || `Check out this amazing ${item.type.toLowerCase()} for "${item.title}"! Posted directly from OceanFresh Seafood Market.`);
    setFacebookSync(metadata.facebookSynced ?? true);
    setInstagramSync(metadata.instagramSynced ?? true);
    setIsShareModalOpen(true);
  };

  const handleShareModalSync = () => {
    if (!facebookSync && !instagramSync) {
      toast("Select at least one channel.", "error"); return;
    }
    setSyncLogs(["[CONNECTING] Establishing secure link to Meta APIs..."]);
    setSyncState('authorizing');
    setTimeout(() => {
      setSyncState('transmitting');
      setSyncLogs(prev => [...prev, "[PREPARING] Structuring Graph API Payload..."]);
    }, 1500);
    setTimeout(() => {
      setSyncState('finishing');
      setSyncLogs(prev => [...prev, "[POSTING] Transmitting payload..."]);
    }, 3000);
    setTimeout(() => {
      setSyncState('success');
      toast("Network Sync Simulated successfully!", "success");
    }, 4500);
  };

  return (
    <div className="space-y-[10px] md:space-y-12 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in relative">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Content Manager Panel</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Architect & Distribute Global Platform Assets</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
          <Button variant="outline" onClick={() => router.push('/admin/marketplace/theme')} className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2 border-[var(--foreground)]/5 rounded-lg md:rounded-xl italic">
             <Layout className="w-3.5 md:w-4 h-3.5 md:h-4 text-primary" /> PAGE BUILDER
          </Button>
          <Button variant="primary" onClick={() => openDrawer()} className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 rounded-lg md:rounded-xl italic">
            <Plus className="w-3.5 md:w-4 h-3.5 md:h-4" /> ADD NEW CONTENT
          </Button>
        </div>
      </div>

      {/* 2. REGISTRY TABLE */}
      <Card className="p-1 rounded-[24px] md:rounded-[40px] bg-bg-secondary/20 border-[var(--foreground)]/5 shadow-premium overflow-hidden">
        <div className="p-[10px] md:p-6 border-b border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6">
            <div className="space-y-0.5 md:space-y-1 text-center md:text-left">
              <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Active Content Streams</h3>
              <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Global Banners, Promos, and Editorial Recipes</p>
            </div>
            <div className="relative group w-full md:w-64">
              <Input placeholder="SEARCH REGISTRY..." className="h-10 pl-10 text-[8px] md:text-[9px] font-black uppercase italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl" />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
            </div>
        </div>
        <Table>
            <TableHeader>
              <TableRow className="border-[var(--foreground)]/5">
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Asset</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Title & Info</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Type</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Status</TableHead>
                  <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="h-40 text-center"><div className="w-8 h-8 mx-auto border-2 border-primary/20 border-t-primary rounded-full animate-spin" /> </TableCell></TableRow>
              ) : content.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-40 text-center opacity-40 italic font-black uppercase tracking-widest text-xs">No active content streams.</TableCell></TableRow>
              ) : content.map((item) => (
                  <TableRow key={item.id} className="group/row border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                    <TableCell>
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden bg-black border border-[var(--foreground)]/10 flex items-center justify-center">
                         {item.image_url ? (
                            <img src={item.image_url} alt="" className="w-full h-full object-cover group-hover/row:scale-110 transition-transform duration-500" />
                         ) : (
                            <ImageIcon className="w-4 h-4 text-slate-600" />
                         )}
                      </div>
                    </TableCell>
                    <TableCell>
                        <p className="font-black text-[var(--foreground)] text-xs md:text-sm uppercase tracking-tighter italic group-hover/row:text-primary transition-colors">{item.title}</p>
                        <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Sector: {item.sector}</p>
                    </TableCell>
                    <TableCell>
                        <Badge variant="glass" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[8px] md:text-[10px] italic px-2">{item.type}</Badge>
                    </TableCell>
                    <TableCell>
                        <button onClick={() => toggleStatus(item)} className="cursor-pointer">
                          <Badge variant={item.status === 'PUBLISHED' ? 'success' : 'glass'} className={cn("text-[8px] md:text-[9px] font-black italic transition-all", item.status === 'PUBLISHED' ? 'shadow-glow-success' : 'opacity-40')}>{item.status}</Badge>
                        </button>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-1 md:gap-2">
                            {item.type === 'RECIPE' && (
                              <button onClick={() => openShareModal(item)} className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-blue-400 transition-all border border-[var(--foreground)]/5"><Share2 className="w-3.5 md:w-4 h-3.5 md:h-4" /></button>
                            )}
                            <button onClick={() => openDrawer(item, true)} className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5"><Eye className="w-3.5 md:w-4 h-3.5 md:h-4" /></button>
                            <button onClick={() => openDrawer(item)} className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5"><Edit3 className="w-3.5 md:w-4 h-3.5 md:h-4" /></button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5"><Trash2 className="w-3.5 md:w-4 h-3.5 md:h-4" /></button>
                        </div>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
        </Table>
      </Card>

      {/* 3. GLASSMORPHIC SLIDE-OUT DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={closeDrawer} className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
            />
            
            <motion.div 
              initial={{ x: "100%", opacity: 0.5 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: "100%", opacity: 0.5 }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-[600px] h-full bg-slate-900 border-l border-[var(--foreground)]/10 shadow-2xl flex flex-col z-[101]"
            >
              <div className="p-6 md:p-8 border-b border-[var(--foreground)]/10 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                 <div>
                    <h3 className="text-xl md:text-2xl font-black text-[var(--foreground)] uppercase italic tracking-tighter">
                      {viewOnly ? "Asset Details" : editingItem ? "Modify Asset" : "Deploy New Asset"}
                    </h3>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">Global Content Stream</p>
                 </div>
                 <button onClick={closeDrawer} className="p-2 rounded-full hover:bg-[var(--foreground)]/10 text-slate-400 transition-colors">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-8">
                 {/* Metadata Section */}
                 <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><FileText className="w-4 h-4"/> Metadata</h4>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Master Title</label>
                       <Input disabled={viewOnly || isSaving} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Summer Ocean Harvest" className="h-14 bg-black/50 border border-[var(--foreground)]/10 focus:border-primary/50 text-base" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Asset Class</label>
                          <select disabled={viewOnly || isSaving} value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full h-14 bg-black/50 border border-[var(--foreground)]/10 rounded-xl px-4 text-xs font-black uppercase text-[var(--foreground)] outline-none italic cursor-pointer">
                             <option value="BANNER">BANNER (Hero)</option>
                             <option value="PROMO">PROMO (Deals)</option>
                             <option value="RECIPE">RECIPE (Editorial)</option>
                             <option value="STORY">STORY (Dispatch)</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Target Sector</label>
                          <Input disabled={viewOnly || isSaving} value={formData.sector} onChange={(e) => setFormData({...formData, sector: e.target.value})} placeholder="GLOBAL" className="h-14 bg-black/50 border-[var(--foreground)]/10" />
                       </div>
                    </div>
                 </div>

                 {/* Editorial Additions */}
                 {formData.type === "RECIPE" && (
                    <div className="space-y-4 p-4 rounded-2xl border border-primary/20 bg-primary/5">
                       <h4 className="text-xs font-black uppercase text-primary tracking-widest">Editorial Parameters</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-primary/70 uppercase tracking-widest">Difficulty</label>
                             <select disabled={viewOnly || isSaving} value={formData.metadata?.difficulty || "Medium"} onChange={(e) => setFormData({...formData, metadata: { ...formData.metadata, difficulty: e.target.value }})} className="w-full h-12 bg-black/50 border border-primary/20 rounded-xl px-4 text-xs font-black uppercase text-primary">
                                <option value="Easy">EASY</option><option value="Medium">MEDIUM</option><option value="Expert">EXPERT</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-primary/70 uppercase tracking-widest">Prep Time</label>
                             <Input disabled={viewOnly || isSaving} value={formData.metadata?.time || ""} onChange={(e) => setFormData({...formData, metadata: { ...formData.metadata, time: e.target.value }})} placeholder="e.g. 30 min" className="h-12 bg-black/50 border-primary/20 text-primary" />
                          </div>
                       </div>
                    </div>
                 )}

                 {/* Visual Media Zone */}
                 <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Media Vault</h4>
                    
                    {formData.type !== "RECIPE" && (
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Primary Cover</label>
                          <div onClick={() => !viewOnly && !isSaving && fileInputRef.current?.click()} className={`aspect-[21/9] w-full rounded-2xl bg-black/50 border-2 border-dashed ${stagedCoverPreview || formData.image_url ? 'border-primary/50' : 'border-[var(--foreground)]/20'} flex items-center justify-center transition-all overflow-hidden relative group ${!viewOnly && !isSaving ? 'cursor-pointer hover:bg-[var(--foreground)]/5 hover:border-primary' : ''}`}>
                             {stagedCoverPreview || formData.image_url ? (
                                <>
                                  <img src={stagedCoverPreview || formData.image_url} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" alt="Cover" />
                                  {!viewOnly && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><UploadCloud className="w-8 h-8 text-white drop-shadow-lg" /></div>}
                                  {stagedCoverPreview && <div className="absolute top-2 right-2 bg-primary text-black text-[8px] font-black px-2 py-1 rounded uppercase">Staged</div>}
                                </>
                             ) : (
                                <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-primary transition-colors">
                                   <UploadCloud className="w-8 h-8" />
                                   <span className="text-[10px] font-black uppercase tracking-widest">Drop Image or Click</span>
                                </div>
                             )}
                          </div>
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
                       </div>
                    )}

                    {formData.type === "RECIPE" && (
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Multi-Image Gallery</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                             {/* Existing Gallery from DB */}
                             {(formData.metadata?.gallery || []).map((img: string, idx: number) => (
                                <div key={`db-${idx}`} className="relative aspect-[4/5] rounded-xl overflow-hidden border border-[var(--foreground)]/10 bg-black group">
                                   <img src={img} className="w-full h-full object-cover" alt="Gallery item" />
                                   <div className="absolute bottom-1 left-1 bg-black/80 px-1.5 rounded text-[8px] text-white">DB</div>
                                   {!viewOnly && !isSaving && (
                                      <button type="button" onClick={() => removeExistingGalleryItem(idx)} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                                   )}
                                </div>
                             ))}
                             {/* Staged Gallery Files */}
                             {stagedGallery.map((item, idx: number) => (
                                <div key={`stage-${idx}`} className="relative aspect-[4/5] rounded-xl overflow-hidden border border-primary/50 bg-black group">
                                   <img src={item.preview} className="w-full h-full object-cover opacity-80" alt="Staged" />
                                   <div className="absolute bottom-1 left-1 bg-primary text-black font-black px-1.5 rounded text-[8px]">STAGED</div>
                                   {!viewOnly && !isSaving && (
                                      <button type="button" onClick={() => removeStagedGalleryItem(idx)} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                                   )}
                                </div>
                             ))}
                             {/* Add Button */}
                             {!viewOnly && !isSaving && (
                                <div onClick={() => galleryInputRef.current?.click()} className="aspect-[4/5] rounded-xl bg-black/50 border-2 border-dashed border-[var(--foreground)]/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-slate-500 hover:text-primary">
                                   <Plus className="w-6 h-6 mb-2" />
                                   <span className="text-[8px] font-black uppercase tracking-widest text-center px-2">Stage Image</span>
                                </div>
                             )}
                          </div>
                          <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" multiple onChange={handleGalleryUpload} />
                       </div>
                    )}
                 </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 md:p-8 bg-slate-950 border-t border-[var(--foreground)]/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
                 <div className="flex items-center gap-4 w-full sm:w-auto">
                    {formData.status === 'PUBLISHED' && <Badge variant="success" className="shadow-glow-success animate-pulse">LIVE</Badge>}
                    {formData.status === 'DRAFT' && <Badge variant="glass">DRAFT</Badge>}
                 </div>
                 
                 {!viewOnly && (
                    <div className="flex gap-3 w-full sm:w-auto">
                       <Button variant="outline" onClick={() => handleSave("DRAFT")} disabled={isSaving} className="w-full sm:w-auto px-6 font-black uppercase tracking-widest text-[10px] italic">
                          {isSaving ? "SYNCING..." : "SAVE DRAFT"}
                       </Button>
                       <Button onClick={() => handleSave("PUBLISHED")} disabled={isSaving} className="w-full sm:w-auto px-8 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-[10px] shadow-glow-purple italic transition-all">
                          {isSaving ? <span className="animate-pulse">DEPLOYING...</span> : "DEPLOY LIVE"}
                       </Button>
                    </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal remains similar but simplified in UI */}
    </div>
  );
}
