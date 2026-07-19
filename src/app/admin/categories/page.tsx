"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit3, 
  Trash2,
  Layers,
  Fish,
  Activity,
  Filter,
  BarChart3,
  Globe,
  RefreshCw,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "",
    label: "",
    iconName: "Fish",
    status: "ACTIVE",
    imageUrl: "",
    colorHex: "#14B8A6"
  });
  const [originalId, setOriginalId] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      toast("Failed to sync categories", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setFormData({ id: "", label: "", iconName: "Fish", status: "ACTIVE", imageUrl: "", colorHex: "#14B8A6" });
    setOriginalId("");
    setIsModalOpen(true);
  };

  const handleEdit = (cat: any) => {
    setFormData({ id: cat.id, label: cat.label, iconName: cat.iconName || "Fish", status: cat.status || "ACTIVE", imageUrl: cat.imageUrl || "", colorHex: cat.colorHex || "#14B8A6" });
    setOriginalId(cat.id);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setIsUploadingImage(true);
    
    try {
      const form = new FormData();
      form.append("file", file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form
      });
      
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
        toast("Image uploaded successfully", "success");
      } else {
        toast(data.error || "Upload failed", "error");
      }
    } catch (err) {
      toast("Network error during upload", "error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!formData.label || !formData.id) {
      toast("Please fill all required fields", "error");
      return;
    }
    
    setIsSaving(true);
    try {
      let updatedCategories;
      if (originalId) {
        updatedCategories = categories.map(c => c.id === originalId ? formData : c);
      } else {
        if (categories.find(c => c.id === formData.id)) {
          toast("Category ID already exists", "error");
          setIsSaving(false);
          return;
        }
        updatedCategories = [...categories, formData];
      }

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategories)
      });
      
      if (res.ok) {
        setCategories(updatedCategories);
        toast("Category saved successfully", "success");
        setIsModalOpen(false);
        setFormData({ id: "", label: "", iconName: "Fish", status: "ACTIVE", imageUrl: "", colorHex: "#14B8A6" });
        setOriginalId("");
      } else {
        toast("Failed to save category", "error");
      }
    } catch (err) {
      toast("Network error", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedCategories = [...categories];
    const temp = updatedCategories[index];
    updatedCategories[index] = updatedCategories[newIndex];
    updatedCategories[newIndex] = temp;

    setIsSaving(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategories)
      });
      if (res.ok) {
        setCategories(updatedCategories);
        toast("Category order updated", "success");
      } else {
        toast("Failed to save updated order", "error");
      }
    } catch (err) {
      toast("Failed to update order due to network issue", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSaving(true);
    try {
      const updatedCategories = categories.filter(c => c.id !== id);
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategories)
      });
      
      if (res.ok) {
        setCategories(updatedCategories);
        toast("Category deleted", "success");
      }
    } catch (err) {
      toast("Failed to delete category", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Category Management</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Manage Product Categories and Market Sections</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
          <div className="relative group w-full md:w-80">
            <Input 
              placeholder="SEARCH CATEGORIES..." 
              className="h-10 md:h-12 pl-10 md:pl-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 focus:border-primary/50 transition-all text-[8px] md:text-[9px] font-black tracking-widest uppercase italic rounded-lg md:rounded-xl" 
            />
            <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-3.5 md:w-4 h-3.5 md:h-4 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
          </div>
          <Button 
            variant="primary" 
            className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic"
            onClick={handleAdd}
          >
            <Plus className="w-3.5 md:w-4 h-3.5 md:h-4" /> ADD CATEGORY
          </Button>
        </div>
      </div>

      {/* Category Intelligence Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[10px] md:gap-8">
        {[
          { label: "Active Categories", value: `${categories.length} Total`, icon: <Layers />, trend: "OPTIMAL" },
          { label: "Total Products", value: "84 Products", icon: <Fish />, trend: "+12%" },
          { label: "Market Circulation", value: "₹158M", icon: <Activity />, trend: "STABLE" },
        ].map((stat) => (
          <Card key={stat.label} className="p-[10px] md:p-6 space-y-3 md:space-y-6 bg-bg-secondary/20 border-[var(--foreground)]/5 hover:border-primary/20 transition-all group rounded-[24px] md:rounded-[40px] shadow-premium">
            <div className="flex items-center justify-between">
               <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-[var(--foreground)] transition-all shadow-glow-purple/5">
                 {React.cloneElement(stat.icon as React.ReactElement, { className: "w-4 h-4 md:w-5 md:h-5" })}
               </div>
               <span className="text-[7px] md:text-[9px] font-black text-success uppercase tracking-widest italic">{stat.trend}</span>
            </div>
            <div className="space-y-0.5 md:space-y-1">
              <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{stat.label}</p>
              <h3 className="text-lg md:text-2xl font-black text-[var(--foreground)] italic tracking-tighter">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-1 rounded-[24px] md:rounded-[40px] overflow-hidden bg-bg-secondary/20 shadow-premium border-[var(--foreground)]/5">
        <div className="p-[10px] md:p-6 border-b border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6">
           <div className="space-y-0.5 md:space-y-1 text-center md:text-left">
              <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Category List</h3>
              <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">List of all active categories</p>
           </div>
           <Button variant="outline" size="sm" className="h-9 md:h-10 px-4 md:px-6 flex items-center gap-2 md:gap-3 text-[8px] md:text-[9px] font-black uppercase border-[var(--foreground)]/5 rounded-lg md:rounded-xl italic">
              <Filter className="w-3.5 md:w-4 h-3.5 md:h-4" /> FILTERS
           </Button>
        </div>
        
        {isLoading ? (
           <div className="h-64 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-primary opacity-50" />
           </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--foreground)]/5">
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Category Details</TableHead>
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Icon</TableHead>
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Status</TableHead>
                    <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat, idx) => (
                    <TableRow key={cat.id} className="group/row border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                      <TableCell>
                        <div className="space-y-0.5 md:space-y-1">
                          <p className="font-black text-[var(--foreground)] text-xs md:text-sm uppercase tracking-tighter group-hover/row:text-primary transition-colors italic">{cat.label}</p>
                          <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">ID: {cat.id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] md:text-xs font-black text-text-secondary italic opacity-40">{cat.iconName}</TableCell>
                      <TableCell>
                        <Badge variant={(cat.status || "ACTIVE") === "ACTIVE" ? "success" : "secondary"} className="italic uppercase text-[8px] md:text-[10px] px-2">
                          {cat.status || "ACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 md:gap-2">
                          <button
                            disabled={isSaving || idx === 0}
                            onClick={() => handleMove(idx, 'up')}
                            className="p-2 md:p-2.5 rounded-lg hover:bg-primary/10 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5 disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 md:w-4 h-3.5 md:h-4" />
                          </button>
                          <button
                            disabled={isSaving || idx === categories.length - 1}
                            onClick={() => handleMove(idx, 'down')}
                            className="p-2 md:p-2.5 rounded-lg hover:bg-primary/10 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5 disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 md:w-4 h-3.5 md:h-4" />
                          </button>
                          <button 
                            disabled={isSaving}
                            onClick={() => handleEdit(cat)}
                            className="p-2 md:p-2.5 rounded-lg hover:bg-primary/10 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5 disabled:opacity-50"
                          >
                            <Edit3 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                          </button>
                          <button 
                            disabled={isSaving}
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 md:p-2.5 rounded-lg hover:bg-danger/10 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5 disabled:opacity-50"
                          >
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
              {categories.map((cat, idx) => (
                <div key={cat.id} className="p-4 rounded-xl border border-[var(--foreground)]/5 bg-bg-card/40 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <p className="font-black text-[var(--foreground)] italic text-sm tracking-tighter uppercase">{cat.label}</p>
                      <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{cat.id} • Icon: {cat.iconName}</p>
                    </div>
                    <Badge variant={(cat.status || "ACTIVE") === "ACTIVE" ? "success" : "secondary"} className="italic uppercase text-[8px] px-2">
                      {cat.status || "ACTIVE"}
                    </Badge>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-[var(--foreground)]/5">
                    <button
                      disabled={isSaving || idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all border border-[var(--foreground)]/5 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={isSaving || idx === categories.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all border border-[var(--foreground)]/5 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleEdit(cat)} disabled={isSaving} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all border border-[var(--foreground)]/5 disabled:opacity-50">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} disabled={isSaving} className="p-2 rounded-lg hover:bg-danger/10 text-danger transition-all border border-danger/20 disabled:opacity-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Global Intelligence Handshake */}
      <div className="flex items-center justify-center gap-10 opacity-30 pt-10">
         <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest italic">Global Category Sync Active</span>
         </div>
         <div className="w-1 h-1 rounded-full bg-[var(--foreground)]/20" />
         <div className="flex items-center gap-3">
            <BarChart3 className="w-4 h-4 text-success" />
            <span className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest italic">System Integrity Verified</span>
         </div>
      </div>

      {/* Commission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
           <Card className="relative z-10 w-full max-w-sm md:max-w-xl p-6 md:p-8 bg-bg-secondary border-[var(--foreground)]/5 space-y-4 md:space-y-6 animate-in zoom-in-95 duration-300 rounded-[24px] md:rounded-[32px] shadow-glow-purple/20">
              <div className="space-y-1 border-b border-[var(--foreground)]/5 pb-4">
                 <h3 className="text-lg md:text-xl font-black text-[var(--foreground)] uppercase italic tracking-tighter">{originalId ? "Edit Category" : "Add Category"}</h3>
                 <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Create or modify a category for the marketplace</p>
              </div>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                 <div className="space-y-1.5">
                    <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Category Image</label>
                    <div className="flex items-center gap-4">
                       {formData.imageUrl && (
                         <div className="w-16 h-16 rounded-lg bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 overflow-hidden shrink-0">
                           <img src={formData.imageUrl} alt="Category" className="w-full h-full object-cover" />
                         </div>
                       )}
                       <div className="flex-1">
                         <input 
                           type="file" 
                           accept="image/jpeg, image/png, image/webp" 
                           onChange={handleImageUpload} 
                           className="hidden" 
                           id="category-image-upload" 
                           disabled={isUploadingImage}
                         />
                         <label 
                           htmlFor="category-image-upload" 
                           className="flex items-center justify-center h-11 md:h-14 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 transition-colors border border-dashed border-[var(--foreground)]/20 rounded-lg md:rounded-xl cursor-pointer text-xs font-black uppercase italic"
                         >
                           {isUploadingImage ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                           {isUploadingImage ? 'UPLOADING...' : 'UPLOAD IMAGE (204x341px)'}
                         </label>
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5 md:space-y-2">
                      <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Category ID</label>
                      <Input value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} disabled={!!originalId} placeholder="e.g. EXOTIC_FISH" className="h-11 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 italic rounded-lg md:rounded-xl uppercase font-black text-sm disabled:opacity-50" />
                   </div>
                   <div className="space-y-1.5 md:space-y-2">
                      <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Category Name</label>
                      <Input value={formData.label} onChange={(e) => setFormData({...formData, label: e.target.value})} placeholder="e.g. Exotic Fish" className="h-11 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 italic rounded-lg md:rounded-xl text-sm" />
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5 md:space-y-2">
                      <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Accent Color</label>
                      <div className="flex gap-2">
                        <Input type="color" value={formData.colorHex} onChange={(e) => setFormData({...formData, colorHex: e.target.value})} className="w-14 h-11 md:h-14 p-1 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl" />
                        <Input value={formData.colorHex} onChange={(e) => setFormData({...formData, colorHex: e.target.value})} placeholder="#14B8A6" className="flex-1 h-11 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 italic rounded-lg md:rounded-xl uppercase font-black text-sm" />
                      </div>
                   </div>
                   <div className="space-y-1.5 md:space-y-2">
                      <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Lucide Icon Name</label>
                      <Input value={formData.iconName} onChange={(e) => setFormData({...formData, iconName: e.target.value})} placeholder="e.g. Anchor, Fish, Star" className="h-11 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 italic rounded-lg md:rounded-xl text-sm" />
                   </div>
                 </div>
                 <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Status</label>
                    <select 
                      value={formData.status || "ACTIVE"} 
                      onChange={(e) => setFormData({...formData, status: e.target.value})} 
                      className="w-full h-11 md:h-14 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-lg md:rounded-xl px-4 text-xs font-black uppercase text-[var(--foreground)] outline-none italic cursor-pointer font-black"
                    >
                      <option value="ACTIVE" className="bg-bg-secondary text-[var(--foreground)]">ACTIVE</option>
                      <option value="INACTIVE" className="bg-bg-secondary text-[var(--foreground)]">INACTIVE</option>
                    </select>
                 </div>
              </div>
              <div className="flex gap-2 md:gap-4 pt-2 md:pt-4">
                 <Button variant="ghost" className="flex-1 h-11 md:h-12 uppercase text-[9px] md:text-[10px] font-black italic" onClick={() => setIsModalOpen(false)}>CANCEL</Button>
                 <Button disabled={isSaving} className="flex-1 h-11 md:h-12 uppercase text-[9px] md:text-[10px] font-black shadow-glow-purple italic rounded-lg md:rounded-xl" onClick={handleSave}>
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'SAVE CATEGORY'}
                 </Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
