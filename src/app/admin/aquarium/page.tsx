"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Waves, 
  Layers, 
  Activity, 
  RefreshCw, 
  Upload, 
  HelpCircle,
  Eye
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface FishItem {
  name: string;
  image: string;
  swimRight: number;
  swimLeft: number;
}

export default function AquariumManagerPage() {
  const { toast } = useToast();
  const [fleet, setFleet] = useState<FishItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [formData, setFormData] = useState<FishItem>({
    name: "",
    image: "",
    swimRight: -1,
    swimLeft: 1
  });

  const fetchFleet = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/aquarium-fish');
      const data = await res.json();
      if (Array.isArray(data)) {
        setFleet(data);
      } else {
        toast("Failed to parse fleet data", "error");
      }
    } catch (err) {
      toast("Failed to sync aquarium fleet", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleAdd = () => {
    setFormData({ name: "", image: "", swimRight: -1, swimLeft: 1 });
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleEdit = (fish: FishItem, index: number) => {
    setFormData({ ...fish });
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast("Uploading asset to Supabase cloud...", "info");

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/system/upload", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (result.status === "success" && result.url) {
        setFormData(prev => ({ ...prev, image: result.url }));
        toast("Asset uploaded successfully", "success");
      } else {
        toast(result.message || "Failed to upload asset", "error");
      }
    } catch (error) {
      toast("Error uploading file", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const saveFleetToDB = async (updatedFleet: FishItem[]) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/aquarium-fish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFleet)
      });
      if (res.ok) {
        setFleet(updatedFleet);
        toast("Aquarium fleet saved successfully", "success");
        setIsModalOpen(false);
      } else {
        toast("Failed to save fleet to database", "error");
      }
    } catch (err) {
      toast("Network error saving fleet", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.image) {
      toast("Please enter a name and upload/provide an image url", "error");
      return;
    }

    let updatedFleet = [...fleet];
    if (editingIndex !== null) {
      updatedFleet[editingIndex] = formData;
    } else {
      updatedFleet.push(formData);
    }

    await saveFleetToDB(updatedFleet);
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Are you sure you want to delete this species from the aquarium fleet?")) return;
    const updatedFleet = fleet.filter((_, i) => i !== index);
    await saveFleetToDB(updatedFleet);
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fleet.length) return;

    const updatedFleet = [...fleet];
    const temp = updatedFleet[index];
    updatedFleet[index] = updatedFleet[newIndex];
    updatedFleet[newIndex] = temp;

    await saveFleetToDB(updatedFleet);
  };

  return (
    <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in text-[var(--foreground)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black tracking-tighter uppercase italic shadow-glow-purple/5 flex items-center justify-center md:justify-start gap-3">
            <Waves className="w-8 h-8 text-[#00f5d4] animate-pulse" /> Aquarium Fleet Management
          </h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">
            Configure dynamic animated fish species swimming on the customer homepage wave divider
          </p>
        </div>
        <Button 
          variant="primary" 
          className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic bg-gradient-to-r from-cyan-500 to-[#00f5d4] text-black"
          onClick={handleAdd}
        >
          <Plus className="w-3.5 md:w-4 h-3.5 md:h-4 text-black" /> ADD SPECIES
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[10px] md:gap-8">
        {[
          { label: "Active Swimmers", value: `${fleet.length} Species`, icon: <Waves />, color: "text-[#00f5d4]" },
          { label: "Rendering Layer", value: "HTML5/Framer Motion", icon: <Layers />, color: "text-indigo-400" },
          { label: "Telemetry Health", value: "SYNCHRONIZED", icon: <Activity />, color: "text-emerald-400" },
        ].map((stat) => (
          <Card key={stat.label} className="p-[10px] md:p-6 space-y-3 md:space-y-6 bg-bg-secondary/20 border-[var(--foreground)]/5 hover:border-primary/20 transition-all group rounded-[24px] md:rounded-[40px] shadow-premium">
            <div className="flex items-center justify-between">
               <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center ${stat.color} transition-all`}>
                 {React.cloneElement(stat.icon as React.ReactElement, { className: "w-4 h-4 md:w-5 md:h-5" })}
               </div>
               <span className="text-[7px] md:text-[9px] font-black text-success uppercase tracking-widest italic">OPTIMAL</span>
            </div>
            <div className="space-y-0.5 md:space-y-1">
              <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{stat.label}</p>
              <h3 className="text-lg md:text-2xl font-black italic tracking-tighter">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Card className="p-1 rounded-[24px] md:rounded-[40px] overflow-hidden bg-bg-secondary/20 shadow-premium border-[var(--foreground)]/5">
        <div className="p-[10px] md:p-6 border-b border-[var(--foreground)]/5">
          <h3 className="text-base md:text-lg font-black tracking-tighter uppercase italic">Current Active Swimmers</h3>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Reorder lists to control rendering depth layers & speeds</p>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#00f5d4] opacity-50" />
          </div>
        ) : fleet.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-4">
            <Waves className="w-12 h-12 text-text-secondary opacity-25" />
            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic">No species defined. Using default settings fallback.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--foreground)]/5 hover:bg-transparent">
                  <TableHead className="text-[8px] md:text-[9px] font-black uppercase tracking-widest italic text-text-secondary pl-6">Preview</TableHead>
                  <TableHead className="text-[8px] md:text-[9px] font-black uppercase tracking-widest italic text-text-secondary">Name</TableHead>
                  <TableHead className="text-[8px] md:text-[9px] font-black uppercase tracking-widest italic text-text-secondary">Swim Right ScaleX</TableHead>
                  <TableHead className="text-[8px] md:text-[9px] font-black uppercase tracking-widest italic text-text-secondary">Swim Left ScaleX</TableHead>
                  <TableHead className="text-[8px] md:text-[9px] font-black uppercase tracking-widest italic text-text-secondary pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fleet.map((fish, index) => (
                  <TableRow key={index} className="border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                    <TableCell className="pl-6">
                      <div className="relative w-16 h-12 bg-[#001833] rounded-lg overflow-hidden border border-[var(--foreground)]/10 flex items-center justify-center group/swimmer">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-indigo-900/10" />
                        <img 
                          src={fish.image} 
                          alt={fish.name} 
                          className="w-10 h-10 object-contain relative z-10 transition-transform group-hover/swimmer:scale-125"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-black text-sm tracking-tight italic uppercase">{fish.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 font-mono text-[9px]">{fish.swimRight}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 font-mono text-[9px]">{fish.swimLeft}</Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right space-x-1.5">
                      <Button 
                        onClick={() => moveItem(index, 'up')} 
                        disabled={index === 0 || isSaving} 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-lg border border-[var(--foreground)]/5 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5 text-text-secondary" />
                      </Button>
                      <Button 
                        onClick={() => moveItem(index, 'down')} 
                        disabled={index === fleet.length - 1 || isSaving} 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-lg border border-[var(--foreground)]/5 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-text-secondary" />
                      </Button>
                      <Button 
                        onClick={() => handleEdit(fish, index)} 
                        disabled={isSaving} 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-lg border border-primary/20 hover:bg-primary/10 text-primary transition-all disabled:opacity-50"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        onClick={() => handleDelete(index)} 
                        disabled={isSaving} 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-lg border border-danger/20 hover:bg-danger/10 text-danger transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Upload & Edit species Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <Card className="relative z-10 w-full max-w-sm md:max-w-lg p-6 md:p-10 bg-bg-secondary border-[var(--foreground)]/5 space-y-6 md:space-y-8 animate-in zoom-in-95 duration-300 rounded-[24px] md:rounded-[48px] shadow-glow-purple/20">
            <div className="space-y-1 border-b border-[var(--foreground)]/5 pb-4 md:pb-6">
              <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tighter">
                {editingIndex !== null ? "Edit Swimmer Species" : "Add Swimmer Species"}
              </h3>
              <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">
                Setup animated behavior and directional rendering variables
              </p>
            </div>

            <div className="space-y-4 md:space-y-6">
              {/* Species Name */}
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest ml-1 italic opacity-60">Species Name</label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Red Snapper" 
                  className="h-11 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 italic rounded-lg md:rounded-xl text-sm font-black uppercase" 
                />
              </div>

              {/* Upload Image */}
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest ml-1 italic opacity-60 flex items-center gap-1.5">
                  Asset Image URL <span title="Input absolute URL or upload transparent WebP/PNG" className="cursor-help"><HelpCircle className="w-3 h-3 text-cyan-400" /></span>
                </label>
                <div className="flex gap-2">
                  <Input 
                    value={formData.image} 
                    onChange={(e) => setFormData({...formData, image: e.target.value})} 
                    placeholder="Upload file or enter URL..." 
                    className="h-11 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 italic rounded-lg md:rounded-xl text-sm flex-1 font-mono text-xs" 
                  />
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="fish-file-upload" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      disabled={isUploading}
                    />
                    <label 
                      htmlFor="fish-file-upload"
                      className="h-11 md:h-14 px-4 bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/15 border border-[var(--foreground)]/5 flex items-center justify-center gap-2 rounded-lg md:rounded-xl cursor-pointer text-[9px] font-black uppercase tracking-widest italic transition-all active:scale-95 disabled:opacity-50 select-none"
                    >
                      {isUploading ? <RefreshCw className="w-4 h-4 animate-spin text-[#00f5d4]" /> : <Upload className="w-4 h-4 text-[#00f5d4]" />}
                      UPLOAD
                    </label>
                  </div>
                </div>

                {formData.image && (
                  <div className="mt-2 p-3 bg-[#001833] rounded-xl border border-[var(--foreground)]/10 flex items-center justify-center h-24 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-indigo-900/10" />
                    <img 
                      src={formData.image} 
                      alt="Uploaded preview" 
                      className="h-16 object-contain relative z-10"
                    />
                  </div>
                )}
              </div>

              {/* Swimming Orientation Parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest ml-1 italic opacity-60 flex items-center gap-1.5">
                    Swim Right scaleX <span title="Multiplier to horizontally scale the image when swimming right (1 or -1)" className="cursor-help"><HelpCircle className="w-3 h-3 text-cyan-400" /></span>
                  </label>
                  <select 
                    value={formData.swimRight} 
                    onChange={(e) => setFormData({...formData, swimRight: Number(e.target.value)})} 
                    className="w-full h-11 md:h-14 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-lg md:rounded-xl px-4 text-xs font-black uppercase text-[var(--foreground)] outline-none italic cursor-pointer font-black"
                  >
                    <option value={1} className="bg-bg-secondary text-[var(--foreground)]">1 (Normal)</option>
                    <option value={-1} className="bg-bg-secondary text-[var(--foreground)]">-1 (Flipped)</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest ml-1 italic opacity-60 flex items-center gap-1.5">
                    Swim Left scaleX <span title="Multiplier to horizontally scale the image when swimming left (1 or -1)" className="cursor-help"><HelpCircle className="w-3 h-3 text-cyan-400" /></span>
                  </label>
                  <select 
                    value={formData.swimLeft} 
                    onChange={(e) => setFormData({...formData, swimLeft: Number(e.target.value)})} 
                    className="w-full h-11 md:h-14 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-lg md:rounded-xl px-4 text-xs font-black uppercase text-[var(--foreground)] outline-none italic cursor-pointer font-black"
                  >
                    <option value={1} className="bg-bg-secondary text-[var(--foreground)]">1 (Normal)</option>
                    <option value={-1} className="bg-bg-secondary text-[var(--foreground)]">-1 (Flipped)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 md:gap-4 pt-2 md:pt-4">
              <Button 
                variant="ghost" 
                className="flex-1 h-11 md:h-12 uppercase text-[9px] md:text-[10px] font-black italic border border-[var(--foreground)]/5" 
                onClick={() => setIsModalOpen(false)}
              >
                CANCEL
              </Button>
              <Button 
                disabled={isSaving || isUploading} 
                className="flex-1 h-11 md:h-12 uppercase text-[9px] md:text-[10px] font-black shadow-glow-purple italic rounded-lg md:rounded-xl bg-gradient-to-r from-cyan-500 to-[#00f5d4] text-black" 
                onClick={handleSave}
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin text-black" /> : 'SAVE SPECIES'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
