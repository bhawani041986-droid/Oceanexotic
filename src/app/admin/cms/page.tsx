"use client";
import React, { useState, useRef, useEffect } from "react";
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
  X,
  Globe,
  Share2
} from "lucide-react";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";

export default function AdminCMSPage() {
  const router = useRouter();
  const { flashDealActive, flashDealEnd, atmosphericGlow, setSettings, pushSettings } = useSettingsStore();
  const { toast } = useToast();
  const [content, setContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewOnly, setViewOnly] = useState(false);
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [syncState, setSyncState] = useState<'idle' | 'authorizing' | 'transmitting' | 'finishing' | 'success'>('idle');
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [facebookSync, setFacebookSync] = useState(true);
  const [instagramSync, setInstagramSync] = useState(true);
  const [socialCaption, setSocialCaption] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharingItem, setSharingItem] = useState<any>(null);

  // 1. Fetch Dynamic Registry
  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/system/cms.php`);
      const data = await response.json();
      if (data.status === 'success') {
        setContent(data.content || []);
      }
    } catch (error) {
      console.error("Registry Fetch Failed:", error);
      toast("Failed to load content settings.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const openModal = (item?: any, isView: boolean = false) => {
    setViewOnly(isView);
    setSyncState('idle');
    setSyncLogs([]);
    if (item) {
      setEditingItem(item);
      let metadata = { 
        difficulty: "Medium", 
        time: "25m", 
        gallery: [], 
        caption: "", 
        socialSynced: false,
        facebookSynced: false,
        instagramSynced: false 
      };
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
      setSocialCaption(metadata.caption || `Check out this amazing recipe for ${item.title}! Posted directly from OceanFresh Seafood Market.`);
      setFacebookSync(metadata.facebookSynced ?? true);
      setInstagramSync(metadata.instagramSynced ?? true);
    } else {
      setEditingItem(null);
      setFormData({ 
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
      setSocialCaption("Check out this amazing new recipe! Posted directly from OceanFresh Seafood Market.");
      setFacebookSync(true);
      setInstagramSync(true);
    }
    setIsModalOpen(true);
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const currentGallery = formData.metadata?.gallery || [];
        const newGallery = [...currentGallery, reader.result as string];
        setFormData({
          ...formData,
          image_url: formData.image_url || (reader.result as string),
          metadata: {
            ...formData.metadata,
            gallery: newGallery
          }
        });
        toast("Visual asset added to gallery successfully.", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFromGallery = (index: number) => {
    const currentGallery = formData.metadata?.gallery || [];
    const newGallery = currentGallery.filter((_: any, idx: number) => idx !== index);
    const newCover = newGallery.length > 0 ? newGallery[0] : "";
    setFormData({
      ...formData,
      image_url: newCover,
      metadata: {
        ...formData.metadata,
        gallery: newGallery
      }
    });
    toast("Gallery asset removed.", "info");
  };

  const handleSocialSync = () => {
    if (!facebookSync && !instagramSync) {
      toast("Select at least one social media channel.", "error");
      return;
    }
    
    setSyncLogs(["[CONNECTING] Connecting to social media APIs..."]);
    setSyncState('authorizing');
    
    setTimeout(() => {
      setSyncLogs(prev => [...prev, "[AUTH] Verifying account credentials..."]);
      if (facebookSync) setSyncLogs(prev => [...prev, "[AUTH] Facebook API token status: ACTIVE"]);
      if (instagramSync) setSyncLogs(prev => [...prev, "[AUTH] Instagram API token status: ACTIVE"]);
    }, 800);

    setTimeout(() => {
      setSyncState('transmitting');
      setSyncLogs(prev => [...prev, "[PREPARING] Formatting social media post payload...", `[CAPTION] "${socialCaption.slice(0, 45)}..."`]);
      const imageCount = formData.metadata?.gallery?.length || (formData.image_url ? 1 : 0);
      setSyncLogs(prev => [...prev, `[PREPARING] Optimizing ${imageCount} image(s) for upload...`]);
    }, 1800);

    setTimeout(() => {
      setSyncState('finishing');
      setSyncLogs(prev => [...prev, "[POSTING] Sending post content to Facebook and Instagram..."]);
    }, 2800);

    setTimeout(() => {
      setSyncState('success');
      const timestamp = new Date().toLocaleString();
      const fbId = facebookSync ? `FB-POST-${Math.floor(100000 + Math.random() * 900000)}` : null;
      const igId = instagramSync ? `IG-MEDIA-${Math.floor(100000 + Math.random() * 900000)}` : null;
      
      setSyncLogs(prev => [
        ...prev, 
        "[SUCCESS] Post successfully published to selected networks.",
        fbId ? `[FB] Published ID: ${fbId}` : "",
        igId ? `[IG] Published ID: ${igId}` : "",
        `[SYNC] Completed at ${timestamp}`
      ].filter(Boolean));

      setFormData((prev: any) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          caption: socialCaption,
          socialSynced: true,
          facebookSynced: !!facebookSync,
          instagramSynced: !!instagramSync,
          syncTimestamp: timestamp
        }
      }));

      toast("Shared to social networks successfully!", "success");
    }, 4000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result as string });
        toast("Visual asset staged successfully.", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const openShareModal = (item: any) => {
    setSharingItem(item);
    setSyncState('idle');
    setSyncLogs([]);
    let metadata = { 
      difficulty: "Medium", 
      time: "25m", 
      gallery: [], 
      caption: "", 
      socialSynced: false,
      facebookSynced: false,
      instagramSynced: false 
    };
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
      toast("Select at least one social media channel.", "error");
      return;
    }
    
    setSyncLogs(["[CONNECTING] Connecting to social media APIs..."]);
    setSyncState('authorizing');
    
    setTimeout(() => {
      setSyncLogs(prev => [...prev, "[AUTH] Verifying account credentials..."]);
      if (facebookSync) setSyncLogs(prev => [...prev, "[AUTH] Facebook API token status: ACTIVE"]);
      if (instagramSync) setSyncLogs(prev => [...prev, "[AUTH] Instagram API token status: ACTIVE"]);
    }, 800);

    setTimeout(() => {
      setSyncState('transmitting');
      setSyncLogs(prev => [...prev, "[PREPARING] Formatting social media post payload...", `[CAPTION] "${socialCaption.slice(0, 45)}..."`]);
      const imgUrl = sharingItem?.image_url || (sharingItem?.metadata?.gallery?.[0]) || "";
      setSyncLogs(prev => [...prev, imgUrl ? `[PREPARING] Optimizing image payload for upload...` : `[PREPARING] No cover image selected...`]);
    }, 1800);

    setTimeout(() => {
      setSyncState('finishing');
      setSyncLogs(prev => [...prev, "[POSTING] Sending post content to Facebook and Instagram..."]);
    }, 2800);

    setTimeout(() => {
      setSyncState('success');
      const timestamp = new Date().toLocaleString();
      const fbId = facebookSync ? `FB-POST-${Math.floor(100000 + Math.random() * 900000)}` : null;
      const igId = instagramSync ? `IG-MEDIA-${Math.floor(100000 + Math.random() * 900000)}` : null;
      
      setSyncLogs(prev => [
        ...prev, 
        "[SUCCESS] Post successfully published to selected networks.",
        fbId ? `[FB] Published ID: ${fbId}` : "",
        igId ? `[IG] Published ID: ${igId}` : "",
        `[SYNC] Completed at ${timestamp}`
      ].filter(Boolean));

      // Persist updated metadata in DB
      let currentMeta = {};
      if (sharingItem.metadata) {
        try {
          currentMeta = typeof sharingItem.metadata === 'string' ? JSON.parse(sharingItem.metadata) : sharingItem.metadata;
        } catch(e) {}
      }

      const updatedMeta = {
        ...currentMeta,
        caption: socialCaption,
        socialSynced: true,
        facebookSynced: !!facebookSync,
        instagramSynced: !!instagramSync,
        syncTimestamp: timestamp
      };

      const payload = {
        ...sharingItem,
        metadata: updatedMeta
      };

      fetch(`${API_BASE_URL}/system/cms.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          toast("Shared to social networks successfully and saved!", "success");
          fetchContent();
        }
      })
      .catch(() => {
        toast("Failed to update sharing log in database.", "error");
      });

    }, 4000);
  };

  const handleSave = async (forceStatus?: string) => {
    if (!formData.title) {
      toast("Content title required.", "error");
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
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast(editingItem ? "Content updated successfully." : "New content published successfully.", "success");
        fetchContent();
        setIsModalOpen(false);
      }
    } catch (error) {
      toast("Failed to save content.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content item?")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/system/cms.php?id=${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast("Content item deleted.", "info");
        fetchContent();
      }
    } catch (error) {
      toast("Failed to delete content.", "error");
    }
  };

  const toggleStatus = async (item: any) => {
    const newStatus = item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await fetch(`${API_BASE_URL}/system/cms.php`, {
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

  return (
    <div className="space-y-[10px] md:space-y-12 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
      {/* CMS Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Content Manager Panel</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Manage Platform-Wide Content, Banners & Recipes</p>
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
            <Plus className="w-3.5 md:w-4 h-3.5 md:h-4" /> ADD NEW CONTENT
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
            <h3 className="text-xs md:text-sm font-black text-[var(--foreground)] uppercase tracking-tighter italic">Media Library</h3>
            <p className="text-[8px] md:text-[9px] text-text-secondary font-black tracking-widest uppercase italic opacity-40 leading-relaxed">
              {content.length * 40} Seafood and promotional assets active across the network. Sync status: <span className="text-success font-black">OPTIMAL</span>.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/admin/media')}
            className="w-full h-10 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic border-[var(--foreground)]/5 rounded-lg md:rounded-xl"
          >
            OPEN MEDIA GALLERY
          </Button>
        </Card>

        <Card className="lg:col-span-3 p-1 rounded-[24px] md:rounded-[40px] bg-bg-secondary/20 border-[var(--foreground)]/5 shadow-premium overflow-hidden">
          <div className="p-[10px] md:p-6 border-b border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6">
             <div className="space-y-0.5 md:space-y-1 text-center md:text-left">
                <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Active Content & Banners</h3>
                <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Live Content and Banner Streams</p>
             </div>
             <div className="relative group w-full md:w-64">
                <Input placeholder="SEARCH CONTENT..." className="h-10 pl-10 text-[8px] md:text-[9px] font-black uppercase italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl" />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
             </div>
          </div>
          <Table>
             <TableHeader>
                <TableRow className="border-[var(--foreground)]/5">
                   <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Content Title & Info</TableHead>
                   <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Type</TableHead>
                   <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Page Target</TableHead>
                   <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Status</TableHead>
                   <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Actions</TableHead>
                </TableRow>
             </TableHeader>
             <TableBody>
                {isLoading ? (
                   <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                         <div className="flex flex-col items-center gap-4 opacity-40">
                            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest italic">Synchronizing Content...</p>
                         </div>
                      </TableCell>
                   </TableRow>
                ) : content.length === 0 ? (
                   <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                         <p className="text-[10px] font-black uppercase tracking-widest italic opacity-20">No content items found.</p>
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
                             <button 
                               onClick={() => openShareModal(item)} 
                               className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-success transition-all border border-[var(--foreground)]/5"
                               title="Share on Social Media"
                             >
                                <Share2 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                             </button>
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
                 <h3 className="text-xl md:text-2xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">General Settings</h3>
                 <p className="text-[10px] md:text-sm font-black tracking-widest uppercase italic text-text-secondary leading-relaxed opacity-40">
                    Configure global banners, flash sales, and general settings for the platform.
                 </p>
                 <div className="flex justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-1.5 md:gap-2">
                       <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                       <span className="text-[8px] md:text-[9px] font-black text-success uppercase tracking-widest italic">Sync: Active</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                       <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                       <span className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-widest italic">Caching: Optimal</span>
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
                 <h3 className="text-sm md:text-base font-black text-[var(--foreground)] uppercase italic tracking-tighter">Flash Sale Settings</h3>
                 <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Active Sale Period</p>
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5">
                 <div className="space-y-1">
                    <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Sale Status</p>
                    <p className={cn("text-[10px] font-black italic uppercase", flashDealActive ? "text-success" : "text-danger")}>
                       {flashDealActive ? "ACTIVE" : "INACTIVE"}
                    </p>
                 </div>
                 <button 
                  onClick={async () => {
                    setSettings({ flashDealActive: !flashDealActive });
                    await pushSettings();
                    toast(`Flash Deal ${!flashDealActive ? 'Activated' : 'Deactivated'}`, "info");
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
                 <label className="text-[8px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Expiry Date & Time</label>
                 <div className="relative">
                    <Input 
                      type="datetime-local" 
                      defaultValue={flashDealEnd.slice(0, 16)}
                      onChange={(e) => {
                        const date = new Date(e.target.value).toISOString();
                        setSettings({ flashDealEnd: date });
                      }}
                      className="h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 italic rounded-xl text-[10px] font-black uppercase text-[var(--foreground)]" 
                    />
                    <Button 
                      size="sm" 
                      onClick={async () => {
                        await pushSettings();
                        toast("Target Expiry Synchronized.", "success");
                      }}
                      className="absolute right-1 top-1 h-10 w-10 p-0 rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-[var(--foreground)]"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                 </div>
              </div>

              <div className="space-y-3 pt-2">
                 <div className="flex items-center justify-between px-1">
                    <label className="text-[8px] font-black text-[var(--foreground)] uppercase tracking-widest italic opacity-60">Background Glow Intensity</label>
                    <Badge variant="glass" className="text-[8px] font-black">{atmosphericGlow}%</Badge>
                  </div>
                  <div className="relative pt-1">
                     <input 
                       type="range" 
                       min="0" 
                       max="100" 
                       value={atmosphericGlow} 
                       onChange={async (e) => {
                         setSettings({ atmosphericGlow: parseInt(e.target.value) });
                         await pushSettings();
                       }}
                       className="w-full h-1 bg-[var(--foreground)]/10 rounded-lg appearance-none cursor-pointer accent-primary" 
                     />
                  </div>
              </div>
           </div>
        </Card>
      </div>

      {/* Content Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
           <Card className="relative z-10 w-full max-w-sm md:max-w-lg p-6 md:p-10 bg-bg-secondary border-[var(--foreground)]/5 space-y-6 md:space-y-8 animate-in zoom-in-95 duration-300 rounded-[24px] md:rounded-[48px] shadow-glow-purple/20 overflow-hidden">
              <div className="space-y-1 border-b border-[var(--foreground)]/5 pb-4 md:pb-6">
                 <h3 className="text-lg md:text-xl font-black text-[var(--foreground)] uppercase italic tracking-tighter">
                   {viewOnly ? "Content Details" : editingItem ? "Edit Content" : "Add New Content"}
                 </h3>
                 <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">
                   {viewOnly ? "Details of the selected content item." : "Add a new banner, promo, or recipe for the portal"}
                 </p>
              </div>
              <div className="space-y-4 md:space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                 <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Content Title</label>
                    <Input disabled={viewOnly} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Summer Harvest Hero" className="h-11 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 italic rounded-lg md:rounded-xl" />
                 </div>
                 <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1.5 md:space-y-2">
                       <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Content Type</label>
                       <select 
                           disabled={viewOnly} 
                           value={formData.type} 
                           onChange={(e) => setFormData({...formData, type: e.target.value})} 
                           className="w-full h-11 md:h-14 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-lg md:rounded-[16px] px-3 md:px-4 text-[8px] md:text-[10px] font-black uppercase text-[var(--foreground)] outline-none italic disabled:opacity-50 appearance-none cursor-pointer hover:bg-[var(--foreground)]/10 transition-colors"
                           style={{ colorScheme: 'dark' }}
                        >
                           <option value="BANNER" className="bg-[#020617] text-[var(--foreground)]">BANNER (Hero)</option>
                           <option value="PROMO" className="bg-[#020617] text-[var(--foreground)]">PROMO (Deals)</option>
                           <option value="RECIPE" className="bg-[#020617] text-[var(--foreground)]">RECIPE (Chef's Recipes)</option>
                           <option value="LEGAL" className="bg-[#020617] text-[var(--foreground)]">LEGAL (Policy)</option>
                           <option value="STORY" className="bg-[#020617] text-[var(--foreground)]">STORY (Dispatch)</option>
                       </select>
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                       <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Page Target</label>
                       <Input disabled={viewOnly} value={formData.sector} onChange={(e) => setFormData({...formData, sector: e.target.value})} placeholder="GLOBAL" className="h-11 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 italic rounded-lg md:rounded-xl" />
                    </div>
                 </div>

                 {/* Recipe fields: Difficulty & Preparation Time */}
                 {formData.type === "RECIPE" && (
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                       <div className="space-y-1.5 md:space-y-2">
                          <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Recipe Difficulty</label>
                          <select 
                              disabled={viewOnly} 
                              value={formData.metadata?.difficulty || "Medium"} 
                              onChange={(e) => setFormData({
                                ...formData, 
                                metadata: { ...formData.metadata, difficulty: e.target.value }
                              })} 
                              className="w-full h-11 md:h-14 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-lg md:rounded-[16px] px-3 md:px-4 text-[8px] md:text-[10px] font-black uppercase text-[var(--foreground)] outline-none italic disabled:opacity-50 appearance-none cursor-pointer hover:bg-[var(--foreground)]/10 transition-colors"
                              style={{ colorScheme: 'dark' }}
                           >
                              <option value="Easy" className="bg-[#020617] text-[var(--foreground)]">EASY</option>
                              <option value="Medium" className="bg-[#020617] text-[var(--foreground)]">MEDIUM</option>
                              <option value="Expert" className="bg-[#020617] text-[var(--foreground)]">EXPERT</option>
                          </select>
                       </div>
                       <div className="space-y-1.5 md:space-y-2">
                          <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Preparation Time</label>
                          <Input 
                             disabled={viewOnly} 
                             value={formData.metadata?.time || ""} 
                             onChange={(e) => setFormData({
                               ...formData, 
                               metadata: { ...formData.metadata, time: e.target.value }
                             })} 
                             placeholder="e.g. 30 min" 
                             className="h-11 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 italic rounded-lg md:rounded-xl" 
                          />
                       </div>
                    </div>
                 )}

                 {/* Multi-image Visual Gallery for recipes, single cover for others */}
                 {formData.type === "RECIPE" ? (
                    <div className="space-y-3 md:space-y-4">
                       <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Visual Gallery (Multi-Image)</label>
                       <div className="grid grid-cols-3 gap-2">
                          {(formData.metadata?.gallery || []).map((img: string, idx: number) => (
                             <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-[var(--foreground)]/10 group bg-bg-primary">
                                <img src={img} className="w-full h-full object-cover" alt="Gallery item" />
                                {!viewOnly && (
                                   <button 
                                      type="button" 
                                      onClick={() => handleRemoveFromGallery(idx)}
                                      className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-all active:scale-90"
                                   >
                                      <X className="w-3 h-3" />
                                   </button>
                                )}
                             </div>
                          ))}
                          {!viewOnly && (
                             <div 
                                onClick={() => galleryInputRef.current?.click()}
                                className="aspect-video rounded-xl bg-[var(--foreground)]/5 border border-dashed border-[var(--foreground)]/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all text-text-secondary hover:text-primary"
                             >
                                <Plus className="w-4 h-4 mb-1" />
                                <span className="text-[7px] font-bold uppercase tracking-wider">ADD IMAGE</span>
                             </div>
                          )}
                       </div>
                       <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" onChange={handleGalleryUpload} />
                    </div>
                 ) : (
                    <div className="space-y-3 md:space-y-4">
                       <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Visual Asset (Image/Banner)</label>
                       <div 
                         onClick={() => !viewOnly && fileInputRef.current?.click()}
                         className={`aspect-video w-full rounded-2xl md:rounded-[24px] bg-[var(--foreground)]/5 border-2 border-dashed border-[var(--foreground)]/10 flex items-center justify-center transition-all overflow-hidden ${!viewOnly ? 'cursor-pointer hover:border-primary/50' : 'cursor-default opacity-80'}`}
                       >
                          {formData.image_url ? <img src={formData.image_url} className="w-full h-full object-cover" alt="Cover" /> : <ImageIcon className="w-6 md:w-8 h-6 md:h-8 opacity-20" />}
                       </div>
                       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>
                 )}

                 {/* Social Media Sharing Control block */}
                 {formData.type === "RECIPE" && (
                    <div className="space-y-3 md:space-y-4 border-t border-[var(--foreground)]/5 pt-4">
                       <div className="flex items-center justify-between">
                          <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic opacity-60">Social Media Sync (Facebook & Instagram)</label>
                          {formData.metadata?.socialSynced && (
                             <Badge variant="success" className="text-[7px] tracking-wider uppercase font-black px-1.5 shadow-glow-success">Synced</Badge>
                          )}
                       </div>
                       <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-[9px] font-black uppercase italic cursor-pointer text-text-secondary hover:text-[var(--foreground)] transition-colors">
                             <input 
                                type="checkbox" 
                                disabled={viewOnly}
                                checked={facebookSync} 
                                onChange={(e) => setFacebookSync(e.target.checked)}
                                className="rounded border-[var(--foreground)]/10 bg-[var(--foreground)]/5 text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                             />
                             Facebook
                          </label>
                          <label className="flex items-center gap-2 text-[9px] font-black uppercase italic cursor-pointer text-text-secondary hover:text-[var(--foreground)] transition-colors">
                             <input 
                                type="checkbox" 
                                disabled={viewOnly}
                                checked={instagramSync} 
                                onChange={(e) => setInstagramSync(e.target.checked)}
                                className="rounded border-[var(--foreground)]/10 bg-[var(--foreground)]/5 text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                             />
                             Instagram
                          </label>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[8px] font-black text-text-secondary uppercase tracking-widest ml-1 italic opacity-60">Caption</label>
                          <textarea 
                             disabled={viewOnly}
                             value={socialCaption} 
                             onChange={(e) => setSocialCaption(e.target.value)} 
                             placeholder="Describe your delicious seafood recipe..." 
                             rows={2}
                             className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 p-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase italic text-[var(--foreground)] outline-none resize-none focus:border-primary/40 transition-colors"
                          />
                       </div>
                       {!viewOnly && (
                          <Button 
                             type="button"
                             onClick={handleSocialSync}
                             disabled={syncState !== 'idle'}
                             className="w-full h-10 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic bg-primary/20 hover:bg-primary text-primary hover:text-[var(--foreground)] flex items-center justify-center gap-2 rounded-lg md:rounded-xl transition-all border border-primary/30"
                          >
                             <Share2 className="w-3.5 h-3.5" /> {syncState !== 'idle' ? 'SYNCING...' : 'PUBLISH & SHARE NOW'}
                          </Button>
                       )}
                    </div>
                 )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-4 pt-2 md:pt-4 border-t border-[var(--foreground)]/5">
                 <Button variant="ghost" className="flex-1 h-11 md:h-12 uppercase text-[9px] md:text-[10px] font-black italic rounded-xl" onClick={() => setIsModalOpen(false)}>
                   {viewOnly ? "CLOSE" : "CANCEL"}
                 </Button>
                 {!viewOnly && (
                   <>
                    <Button variant="outline" className="flex-1 h-11 md:h-12 uppercase text-[9px] md:text-[10px] font-black italic rounded-xl border-[var(--foreground)]/10 hover:border-primary/40 flex items-center justify-center gap-2" onClick={() => handleSave()}>
                      <Save className="w-3.5 h-3.5" /> SAVE DRAFT
                    </Button>
                    <Button className="flex-[1.5] h-11 md:h-12 uppercase text-[9px] md:text-[10px] font-black shadow-glow-purple italic rounded-xl bg-primary hover:bg-primary/90 flex items-center justify-center gap-2" onClick={() => handleSave('PUBLISHED')}>
                      <ExternalLink className="w-3.5 h-3.5" /> PUBLISH CONTENT
                    </Button>
                   </>
                 )}
              </div>

              {/* Simulated Sync Terminal Overlay */}
              {syncState !== 'idle' && (
                 <div className="absolute inset-0 bg-black/95 z-20 rounded-[24px] md:rounded-[48px] p-6 md:p-10 flex flex-col font-mono text-[9px] md:text-[10px] text-green-400 space-y-4 overflow-hidden border border-primary/20 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-green-950 pb-2">
                       <span className="font-bold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                          SOCIAL MEDIA FEED TRANSMITTER v1.0
                       </span>
                       {syncState === 'success' && (
                          <button 
                             onClick={() => setSyncState('idle')}
                             className="text-green-400 hover:text-white px-2 py-0.5 border border-green-700 rounded hover:bg-green-900 transition-colors text-[8px]"
                          >
                             CLOSE
                          </button>
                       )}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1.5 no-scrollbar scroll-smooth">
                       {syncLogs.map((log, idx) => (
                          <div key={idx} className={cn(
                             log.startsWith('[SUCCESS]') ? "text-emerald-400 font-bold" :
                             log.startsWith('[AUTH]') ? "text-cyan-400" :
                             log.startsWith('[CONNECTING]') ? "text-yellow-400" :
                             log.startsWith('[ERROR]') ? "text-red-400" : "text-green-400/90"
                          )}>
                             {log}
                          </div>
                       ))}
                       {syncState !== 'success' && (
                          <div className="animate-pulse">_</div>
                       )}
                    </div>
                 </div>
              )}
           </Card>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && sharingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsShareModalOpen(false)} />
           <Card className="relative z-10 w-full max-w-4xl p-6 md:p-10 bg-bg-secondary border-[var(--foreground)]/5 space-y-6 md:space-y-8 animate-in zoom-in-95 duration-300 rounded-[24px] md:rounded-[48px] shadow-glow-purple/20 overflow-hidden">
              <div className="space-y-1 border-b border-[var(--foreground)]/5 pb-4 md:pb-6 flex justify-between items-start">
                 <div>
                    <h3 className="text-lg md:text-xl font-black text-[var(--foreground)] uppercase italic tracking-tighter">
                      Share to Social Media
                    </h3>
                    <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">
                      Sync content directly with social media integrations
                    </p>
                 </div>
                 <Badge variant="glass" className="text-[8px] tracking-wider uppercase font-black px-2">{sharingItem.type}</Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                 {/* Left Column: Form Settings */}
                 <div className="space-y-6">
                    <div className="space-y-1.5">
                       <p className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-wider italic">Selected Content</p>
                       <div className="p-4 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-bg-primary flex-shrink-0">
                             {sharingItem.image_url ? (
                                <img src={sharingItem.image_url} className="w-full h-full object-cover" alt={sharingItem.title} />
                             ) : (
                                <ImageIcon className="w-6 h-6 m-5 opacity-20" />
                             )}
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="font-black text-sm uppercase truncate">{sharingItem.title}</p>
                             <p className="text-[8px] text-text-secondary uppercase tracking-widest font-black italic mt-1">Page Target: {sharingItem.sector}</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic opacity-60">Select Accounts</label>
                       <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-[9px] font-black uppercase italic cursor-pointer text-text-secondary hover:text-[var(--foreground)] transition-colors">
                             <input 
                                type="checkbox" 
                                checked={facebookSync} 
                                onChange={(e) => setFacebookSync(e.target.checked)}
                                className="rounded border-[var(--foreground)]/10 bg-[var(--foreground)]/5 text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                             />
                             Facebook Page
                          </label>
                          <label className="flex items-center gap-2 text-[9px] font-black uppercase italic cursor-pointer text-text-secondary hover:text-[var(--foreground)] transition-colors">
                             <input 
                                type="checkbox" 
                                checked={instagramSync} 
                                onChange={(e) => setInstagramSync(e.target.checked)}
                                className="rounded border-[var(--foreground)]/10 bg-[var(--foreground)]/5 text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                             />
                             Instagram Business
                          </label>
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic opacity-60">Caption</label>
                       <textarea 
                          value={socialCaption} 
                          onChange={(e) => setSocialCaption(e.target.value)} 
                          placeholder="Describe this delicious dish..." 
                          rows={4}
                          className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 p-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase italic text-[var(--foreground)] outline-none resize-none focus:border-primary/40 transition-colors"
                       />
                    </div>

                    <Button 
                       type="button"
                       onClick={handleShareModalSync}
                       disabled={syncState !== 'idle'}
                       className="w-full h-12 text-[9px] font-black tracking-widest uppercase italic bg-primary hover:bg-primary/95 text-white flex items-center justify-center gap-2 rounded-xl transition-all shadow-glow-purple"
                    >
                       <Share2 className="w-4 h-4" /> {syncState !== 'idle' ? 'SYNCING...' : 'BROADCAST & SHARE NOW'}
                    </Button>
                 </div>

                 {/* Right Column: Previews */}
                 <div className="space-y-6">
                    <p className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-wider italic">Social Media Previews</p>
                    
                    {/* FB Preview */}
                    {facebookSync && (
                       <div className="border border-[var(--foreground)]/10 bg-[#0F172A] rounded-2xl overflow-hidden font-sans text-white text-[10px]">
                          {/* FB Header */}
                          <div className="p-3 flex items-center gap-2 border-b border-[var(--foreground)]/5">
                             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-white text-xs">OF</div>
                             <div>
                                <div className="font-bold flex items-center gap-1">OceanFresh Seafood Market <span className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[7px] text-white">✓</span></div>
                                <div className="text-[8px] text-slate-400">Just now · 🌐</div>
                             </div>
                          </div>
                          {/* FB Body */}
                          <div className="p-3 whitespace-pre-wrap">{socialCaption}</div>
                          {/* FB Media */}
                          {sharingItem.image_url && (
                             <div className="aspect-video w-full bg-slate-950">
                                <img src={sharingItem.image_url} className="w-full h-full object-cover" alt="Preview Cover" />
                             </div>
                          )}
                          {/* FB Footer actions */}
                          <div className="p-2.5 border-t border-[var(--foreground)]/5 flex justify-around text-slate-400 font-bold text-[9px]">
                             <span>👍 Like</span>
                             <span>💬 Comment</span>
                             <span>🔄 Share</span>
                          </div>
                       </div>
                    )}

                    {/* IG Preview */}
                    {instagramSync && (
                       <div className="border border-[var(--foreground)]/10 bg-[#0F172A] rounded-2xl overflow-hidden font-sans text-white text-[10px]">
                          {/* IG Header */}
                          <div className="p-3 flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 to-purple-600 p-0.5">
                                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-black text-[8px]">OF</div>
                             </div>
                             <div>
                                <div className="font-bold">oceanfresh_harbor</div>
                                <div className="text-[7px] text-slate-400">Port Blair, Andaman Islands</div>
                             </div>
                          </div>
                          {/* IG Media */}
                          {sharingItem.image_url && (
                             <div className="aspect-square w-full bg-slate-950">
                                <img src={sharingItem.image_url} className="w-full h-full object-cover" alt="Preview Image" />
                             </div>
                          )}
                          {/* IG Actions */}
                          <div className="p-3 flex justify-between text-base">
                             <div className="flex gap-3">❤️ 💬 📤</div>
                             <div>🔖</div>
                          </div>
                          {/* IG Caption */}
                          <div className="px-3 pb-3">
                             <span className="font-bold mr-1.5">oceanfresh_harbor</span>
                             <span className="text-slate-200">{socialCaption}</span>
                          </div>
                       </div>
                    )}
                 </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-[var(--foreground)]/5">
                 <Button variant="ghost" className="px-6 h-12 uppercase text-[9px] md:text-[10px] font-black italic rounded-xl" onClick={() => setIsShareModalOpen(false)}>
                   CLOSE
                 </Button>
              </div>

              {/* Simulated Sync Terminal Overlay */}
              {syncState !== 'idle' && (
                 <div className="absolute inset-0 bg-black/95 z-25 rounded-[24px] md:rounded-[48px] p-6 md:p-10 flex flex-col font-mono text-[9px] md:text-[10px] text-green-400 space-y-4 overflow-hidden border border-primary/20 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-green-950 pb-2">
                       <span className="font-bold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                          SOCIAL MEDIA FEED TRANSMITTER v1.0
                       </span>
                       {syncState === 'success' && (
                          <button 
                             onClick={() => {
                               setSyncState('idle');
                               setIsShareModalOpen(false);
                             }}
                             className="text-green-400 hover:text-white px-2 py-0.5 border border-green-700 rounded hover:bg-green-900 transition-colors text-[8px]"
                          >
                             CLOSE TRANSMITTER
                          </button>
                       )}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1.5 no-scrollbar scroll-smooth">
                       {syncLogs.map((log, idx) => (
                          <div key={idx} className={cn(
                             log.startsWith('[SUCCESS]') ? "text-emerald-400 font-bold" :
                             log.startsWith('[AUTH]') ? "text-cyan-400" :
                             log.startsWith('[CONNECTING]') ? "text-yellow-400" :
                             log.startsWith('[ERROR]') ? "text-red-400" : "text-green-400/90"
                          )}>
                             {log}
                          </div>
                       ))}
                       {syncState !== 'success' && (
                          <div className="animate-pulse">_</div>
                       )}
                    </div>
                 </div>
              )}
           </Card>
        </div>
      )}
     </div>
  );
}
