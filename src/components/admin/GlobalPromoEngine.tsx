"use client";
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useSettingsStore } from '@/store/settingsStore';
import { useToast } from "@/components/ui/Toast";
import { Clock, Save, Image as ImageIcon, Link as LinkIcon, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

const toLocalDatetimeLocal = (utcIsoString: string) => {
  if (!utcIsoString) return "";
  const d = new Date(utcIsoString);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
};

export function GlobalPromoEngine() {
  const { 
    flashDealActive, flashDealStart, flashDealEnd, 
    flashDealTitle, flashDealSector, flashDealFont, 
    flashDealCarousel, customerAssets, 
    setSettings, pushSettings 
  } = useSettingsStore();
  const { toast } = useToast();

  const [draft, setDraft] = useState({
     start: flashDealStart || new Date().toISOString(),
     end: flashDealEnd || new Date().toISOString(),
     title: flashDealTitle || "",
     sector: flashDealSector || "",
     font: flashDealFont || "font-inter",
     image: customerAssets?.promo || "",
     carousel: flashDealCarousel?.length === 3 ? [...flashDealCarousel] : [
         {image_url: "", product_link: ""},
         {image_url: "", product_link: ""},
         {image_url: "", product_link: ""}
     ]
  });

  const [isSaving, setIsSaving] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<{cover: File | null, carousel: (File|null)[]}>({
     cover: null,
     carousel: [null, null, null]
  });

  useEffect(() => {
     if (flashDealTitle !== undefined) {
         setDraft({
             start: flashDealStart || new Date().toISOString(),
             end: flashDealEnd || new Date().toISOString(),
             title: flashDealTitle || "",
             sector: flashDealSector || "",
             font: flashDealFont || "font-inter",
             image: customerAssets?.promo || "",
             carousel: flashDealCarousel?.length === 3 ? JSON.parse(JSON.stringify(flashDealCarousel)) : [
                 {image_url: "", product_link: ""},
                 {image_url: "", product_link: ""},
                 {image_url: "", product_link: ""}
             ]
         });
     }
  }, [flashDealTitle, flashDealStart, flashDealEnd, flashDealSector, flashDealFont, flashDealCarousel, customerAssets?.promo]);

  const handleToggle = () => {
      setSettings({ flashDealActive: !flashDealActive });
      pushSettings();
      toast(`Flash Deal ${!flashDealActive ? 'Activated' : 'Deactivated'}`, "success");
  };

  const uploadFileToServerless = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("file", file);
    const res = await fetch(`/api/system/upload`, { method: "POST", body: data });
    const json = await res.json();
    if (json.status !== "success") throw new Error(json.message || "Upload failed");
    return json.url;
  };

  const handleSave = async () => {
      setIsSaving(true);
      toast("Syncing Promo Engine to Global Edge...", "info");
      try {
          let finalCoverUrl = draft.image;
          if (stagedFiles.cover) {
              finalCoverUrl = await uploadFileToServerless(stagedFiles.cover);
          }

          const finalCarousel = draft.carousel.map(item => ({ ...item }));
          for (let i = 0; i < 3; i++) {
              if (stagedFiles.carousel[i]) {
                  finalCarousel[i].image_url = await uploadFileToServerless(stagedFiles.carousel[i]!);
              }
          }

          setSettings({
              flashDealStart: draft.start,
              flashDealEnd: draft.end,
              flashDealTitle: draft.title,
              flashDealSector: draft.sector,
              flashDealFont: draft.font,
              flashDealCarousel: finalCarousel,
              customerAssets: { ...customerAssets, promo: finalCoverUrl }
          });
          
          await pushSettings();
          
          setStagedFiles({ cover: null, carousel: [null, null, null] });
          toast("Promo Engine Updated Successfully!", "success");
      } catch (err) {
          console.error(err);
          toast("Failed to update Promo Engine.", "error");
      } finally {
          setIsSaving(false);
      }
  };

  const handleCarouselFile = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const newFiles = [...stagedFiles.carousel];
          newFiles[index] = e.target.files[0];
          setStagedFiles({ ...stagedFiles, carousel: newFiles });
      }
  };

  return (
      <Card className="p-4 md:p-6 rounded-[24px] bg-bg-secondary/20 border-[var(--foreground)]/5 shadow-premium mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-[var(--foreground)]/10 pb-6">
          <div className="space-y-1">
            <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Global Promo Engine
            </h3>
            <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Master Controls for Flash Deals & Carousels</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-text-secondary">Master Switch:</span>
              <button 
                onClick={handleToggle}
                className={cn("w-12 h-6 rounded-full p-1 transition-colors relative flex items-center shadow-inner", flashDealActive ? "bg-primary" : "bg-black border border-[var(--foreground)]/20")}
              >
                 <span className={cn("absolute text-[6px] font-black uppercase", flashDealActive ? "left-1.5 text-black" : "right-1.5 text-text-secondary")}>
                   {flashDealActive ? "ON" : "OFF"}
                 </span>
                 <div className={cn("w-4 h-4 rounded-full bg-white transition-transform z-10", flashDealActive ? "translate-x-6" : "translate-x-0")} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 border-l border-[var(--foreground)]/10 pl-4">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-text-secondary">Start Time:</span>
              <Input 
                type="datetime-local" 
                value={toLocalDatetimeLocal(draft.start)} 
                onChange={(e) => { 
                   if (e.target.value) setDraft({...draft, start: new Date(e.target.value).toISOString()}); 
                }}
                className="h-8 md:h-10 text-[10px] font-black uppercase bg-black/50 border-[var(--foreground)]/10 text-[var(--foreground)] w-[160px]"
              />
            </div>
            <div className="flex items-center gap-2 border-l border-[var(--foreground)]/10 pl-4">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-text-secondary">End Time:</span>
              <Input 
                type="datetime-local" 
                value={toLocalDatetimeLocal(draft.end)} 
                onChange={(e) => { 
                   if (e.target.value) setDraft({...draft, end: new Date(e.target.value).toISOString()}); 
                }}
                className="h-8 md:h-10 text-[10px] font-black uppercase bg-black/50 border-[var(--foreground)]/10 text-[var(--foreground)] w-[160px]"
              />
            </div>
            <div className="w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-[var(--foreground)]/10 pt-4 sm:pt-0 sm:pl-4 mt-2 sm:mt-0 ml-auto flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} variant="primary" className="h-10 px-6 text-[10px] font-black tracking-widest uppercase">
                   <Save className="w-4 h-4 mr-2" /> {isSaving ? "SYNCING..." : "SYNC & SAVE"}
                </Button>
            </div>
          </div>
        </div>

        {/* Text & Primary Image Editor */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-[var(--foreground)]/10 pb-6">
           <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic">Promo Title</label>
                    <Input 
                       value={draft.title}
                       onChange={(e) => setDraft({...draft, title: e.target.value})}
                       className="bg-black/50 border-[var(--foreground)]/10 text-[var(--foreground)]"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic flex items-center gap-1"><Type className="w-3 h-3"/> Text Style</label>
                    <select 
                        value={draft.font} 
                        onChange={(e) => setDraft({...draft, font: e.target.value})}
                        className="w-full h-10 bg-black/50 border border-[var(--foreground)]/10 rounded-xl px-4 text-xs font-black uppercase text-[var(--foreground)] outline-none"
                    >
                        <option value="font-inter">Standard (Inter)</option>
                        <option value="font-serif">Elegant (Playfair)</option>
                        <option value="font-mono">Technical (Mono)</option>
                        <option value="font-sans italic">Slanted Motion</option>
                    </select>
                 </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic">Target Sector (Badge)</label>
                <Input 
                   value={draft.sector}
                   onChange={(e) => setDraft({...draft, sector: e.target.value})}
                   className="bg-black/50 border-[var(--foreground)]/10 text-[var(--foreground)]"
                />
             </div>
           </div>
           
           <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Cover Background Image</label>
              <div className="flex items-center gap-4">
                  <div className="flex-1">
                      <Input 
                         type="file" accept="image/*"
                         onChange={(e) => {
                             if (e.target.files && e.target.files[0]) {
                                 setStagedFiles({...stagedFiles, cover: e.target.files[0]});
                             }
                         }}
                         className="bg-black/50 border-[var(--foreground)]/10 text-[var(--foreground)] file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary file:text-black cursor-pointer"
                      />
                  </div>
              </div>
              <div className="h-24 w-full rounded-xl bg-black border border-[var(--foreground)]/10 overflow-hidden mt-3 relative">
                 {(stagedFiles.cover || draft.image) ? (
                    <img 
                        src={stagedFiles.cover ? URL.createObjectURL(stagedFiles.cover) : draft.image} 
                        className="w-full h-full object-contain opacity-80" 
                    />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary text-[10px] font-black uppercase tracking-widest opacity-40">No Cover Set</div>
                 )}
              </div>
           </div>
        </div>

        {/* 3-Slot Carousel Builder */}
        <div className="pt-6">
            <h4 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" /> Carousel Items (3 Slots required for layout)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[0,1,2].map(index => (
                    <div key={index} className="space-y-3 bg-black/20 p-4 rounded-2xl border border-[var(--foreground)]/5">
                        <div className="flex items-center justify-between">
                            <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Slot {index + 1}</label>
                        </div>
                        <div className="h-32 w-full rounded-xl bg-black border border-[var(--foreground)]/10 overflow-hidden relative group">
                            {(stagedFiles.carousel[index] || draft.carousel[index]?.image_url) ? (
                                <img 
                                    src={stagedFiles.carousel[index] ? URL.createObjectURL(stagedFiles.carousel[index]!) : draft.carousel[index].image_url} 
                                    className="w-full h-full object-contain opacity-80 transition-opacity group-hover:opacity-40" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-secondary text-[10px] font-black uppercase tracking-widest opacity-40 border border-dashed border-[var(--foreground)]/20 rounded-xl">Empty</div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <label className="cursor-pointer bg-black/80 px-4 py-2 rounded-lg text-[10px] font-black uppercase text-white hover:bg-primary hover:text-black transition-colors border border-white/10">
                                    Upload Image
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCarouselFile(index, e)} />
                                </label>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Product Link (e.g. /products/123)</label>
                            <Input 
                               value={draft.carousel[index]?.product_link || ""}
                               onChange={(e) => {
                                   const newCarousel = [...draft.carousel];
                                   if (!newCarousel[index]) newCarousel[index] = {image_url: "", product_link: ""};
                                   newCarousel[index].product_link = e.target.value;
                                   setDraft({...draft, carousel: newCarousel});
                               }}
                               className="h-8 text-[10px] bg-black/50 border-[var(--foreground)]/10 text-[var(--foreground)]"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </Card>
  );
}
