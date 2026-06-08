"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { CUSTOMER_THEMES, CustomerTheme } from "@/config/customerThemes";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Palette, 
  Check, 
  Image as ImageIcon, 
  Upload, 
  Zap, 
  ShieldCheck, 
  Globe,
  Layout,
  Sparkles,
  RefreshCcw,
  Smartphone,
  Save,
  Apple,
  Megaphone,
  Box,
  Droplets,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { Logo } from "@/components/ui/Logo";

export default function MarketplaceThemeControl() {
  const { customerTheme, atmosphericGlow, customerAssets, setSettings, pushSettings } = useSettingsStore(
  );
  const { toast } = useToast(
  );
  const [selectedThemeId, setSelectedThemeId] = useState(customerTheme
  );
  const [tempAssets, setTempAssets] = useState(customerAssets
  );
  const [tempGlow, setTempGlow] = useState(atmosphericGlow
  );
  const [isCommitting, setIsCommitting] = useState(false
  );
  const fileInputRef = useRef<HTMLInputElement>(null
  );
  const [activeStation, setActiveStation] = useState<string | null>(null
  );

  // Sync with store when hydrated or updated
  useEffect(() => {
    setTempAssets(customerAssets
  );
    setSelectedThemeId(customerTheme
  );
    setTempGlow(atmosphericGlow
  );
  }, [customerAssets, customerTheme, atmosphericGlow]
  );

  const isDirty = selectedThemeId !== customerTheme || 
                  tempGlow !== atmosphericGlow || 
                  JSON.stringify(tempAssets) !== JSON.stringify(customerAssets
  );

  const handleThemeSelect = (themeId: string) => {
    setSelectedThemeId(themeId
  );
    toast(`Previewing ${CUSTOMER_THEMES.find(t => t.id === themeId)?.name} protocol.`, "info"
  );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeStation) {
      const reader = new FileReader(
  );
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setTempAssets(prev => ({
          ...prev,
          [activeStation]: base64String
        })
  );
        toast(`${activeStation.toUpperCase()} asset staged for commitment.`, "success"
  );
      };
      reader.readAsDataURL(file
  );
    }
  };

  const triggerUpload = (stationId: string) => {
    setActiveStation(stationId
  );
    setTimeout(() => {
      fileInputRef.current?.click(
  );
    }, 10
  );
  };

  const handleCommit = async () => {
    setIsCommitting(true
  );
    setSettings({
      customerTheme: selectedThemeId,
      customerAssets: tempAssets,
      atmosphericGlow: tempGlow
    }
  );
    const success = await pushSettings(
  );
    setIsCommitting(false
  );
    if (success) {
      toast("Marketplace protocols synchronized to Sovereign Registry.", "success"
  );
    } else {
      toast("Database synchronization failed.", "error"
  );
    }
  };

  const uploadStations = [
    { id: 'logo', title: 'Master Logo', desc: 'PNG', icon: <ImageIcon className="w-5 h-5 text-primary" />, aspect: 'aspect-[3/1]', preview: tempAssets.logo },
    { id: 'hero', title: 'Hero Slide 1', desc: 'Primary', icon: <Zap className="w-5 h-5 text-warning" />, aspect: 'aspect-video', preview: tempAssets.hero },
    { id: 'hero2', title: 'Hero Slide 2', desc: 'Optional', icon: <Zap className="w-5 h-5 text-warning" />, aspect: 'aspect-video', preview: (tempAssets as any).hero2 || null },
    { id: 'hero3', title: 'Hero Slide 3', desc: 'Optional', icon: <Zap className="w-5 h-5 text-warning" />, aspect: 'aspect-video', preview: (tempAssets as any).hero3 || null },
    { id: 'favicon', title: 'System Favicon', desc: '32x32', icon: <Globe className="w-5 h-5 text-blue-500" />, aspect: 'aspect-square w-16 mx-auto', preview: tempAssets.favicon },
    { id: 'appleIcon', title: 'Apple Icon', desc: '180x180', icon: <Apple className="w-5 h-5 text-[var(--foreground)]" />, aspect: 'aspect-square w-24 mx-auto', preview: (tempAssets as any).appleIcon || null },
    { id: 'promo', title: 'Promo #1', desc: 'Campaign', icon: <Megaphone className="w-5 h-5 text-success" />, aspect: 'aspect-[16/9]', preview: tempAssets.promo },
    { id: 'mobile', title: 'Mobile Splash', desc: 'Launch', icon: <Smartphone className="w-5 h-5 text-purple-500" />, aspect: 'aspect-[9/16] w-24 mx-auto', preview: tempAssets.mobile }
  ];

  return (

    <div className="space-y-[10px] md:space-y-12 animate-fade-in pb-32 pt-4 md:pt-10 px-4 md:px-0">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
      
      {/* HIGH-FIDELITY HEADER: Matches Settings Style Exactly */}
      <div className="relative overflow-hidden rounded-[20px] md:rounded-[40px] p-[10px] md:p-12 border border-[var(--foreground)]/5 bg-gradient-to-br from-bg-secondary/80 to-transparent">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <Badge variant="glass" className="px-4 py-1 text-[8px] tracking-[0.3em] font-black bg-primary/20 text-primary border-primary/30">
                  MARKETPLACE GOVERNANCE
               </Badge>
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-glow-purple" />
            </div>
            <h1 className="text-2xl md:text-5xl font-black text-[var(--foreground)] tracking-tighter uppercase italic leading-none">
               Visual <span className="text-primary underline decoration-primary/20 underline-offset-8">Sovereignty</span>
            </h1>
            <p className="text-[8px] md:text-xs font-black text-text-secondary uppercase tracking-[0.3em] opacity-80 italic">Global Aesthetic Registry Active | Operational Status: Prime</p>
          </div>
          <div className="flex items-center gap-4">
             <Button 
              onClick={handleCommit}
              disabled={isCommitting || !isDirty}
              className="h-12 md:h-16 px-8 md:px-12 rounded-xl md:rounded-[24px] bg-primary text-[var(--foreground)] shadow-glow-purple text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 italic"
             >
               {isCommitting ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> COMMIT REGISTRY</>}
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[10px] md:gap-12">
        
        {/* LEFT: Octagonal Theme Selection */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center justify-between px-1">
              <div className="space-y-[2px] md:space-y-1">
                 <h3 className="text-[10px] md:text-lg font-black text-[var(--foreground)] uppercase tracking-tight flex items-center gap-2 md:gap-3">
                    <Palette className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" /> Sensory Modules
                 </h3>
                 <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest leading-relaxed">Select a high-fidelity aesthetic protocol.</p>
              </div>
              <Badge variant="glass" className="text-[8px] md:text-[9px] font-black">{CUSTOMER_THEMES.length} Themes</Badge>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
             {CUSTOMER_THEMES.map((theme, i) => {
               const isActive = selectedThemeId === theme.id;
               return (

                 <motion.button
                   key={theme.id}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.05 }}
                   onClick={() => handleThemeSelect(theme.id)}
                   className={cn(
                     "group relative h-28 md:h-44 transition-all active:scale-[0.95]",
                     isActive ? "z-20" : "z-10"
                   )}
                 >
                   <div 
                     className={cn(
                       "absolute inset-0 transition-all duration-500",
                       isActive ? "opacity-100 scale-105" : "opacity-80 group-hover:opacity-100 group-hover:scale-102"
                     )}
                     style={{ 
                       clipPath: 'polygon(12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%, 0% 12%)',
                       background: isActive ? `var(--foreground)` : 'rgba(255,255,255,0.05)',
                       padding: '2px'
                     }}
                   >
                     <div className="w-full h-full relative overflow-hidden bg-bg-secondary" style={{ clipPath: 'polygon(12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%, 0% 12%)' }}>
                        <div 
                           className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700"
                           style={{ backgroundColor: theme.colors.primary }} 
                        />
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 gap-2 md:gap-4 text-center">
                           <div 
                             className={cn(
                               "w-8 h-8 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-all duration-500",
                               isActive ? "shadow-glow-purple" : "bg-[var(--foreground)]/5 border border-[var(--foreground)]/10"
                             )}
                             style={{ 
                               backgroundColor: isActive ? theme.colors.primary : 'transparent',
                               borderRadius: theme.visuals.radiusBtn 
                             }}
                           >
                              <Sparkles className={cn("w-4 h-4 md:w-7 md:h-7", isActive ? "text-[var(--foreground)]" : "text-primary")} />
                           </div>
                           <h4 className={cn("text-[8px] md:text-[10px] font-black uppercase tracking-widest", isActive ? "text-[var(--foreground)]" : "text-text-secondary")}>{theme.name}</h4>
                        </div>
                     </div>
                   </div>
                   {isActive && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-6 h-6 bg-primary flex items-center justify-center z-30 shadow-glow-purple" style={{ clipPath: 'polygon(30% 0%, 100% 0%, 100% 70%, 70% 100%, 0% 100%, 0% 30%)' }}>
                         <Check className="w-3.5 h-3.5 text-[var(--foreground)]" />
                      </motion.div>
                   )}
                 </motion.button>
               
  );
             })}
           </div>
        </div>

        {/* SIDEBAR: Registry Status */}
        <div className="lg:col-span-4 space-y-8">
           <div 
             className="relative p-[2px] overflow-hidden group"
             style={{ clipPath: 'polygon(8% 0%, 100% 0%, 100% 92%, 92% 100%, 0% 100%, 0% 8%)' }}
           >
              <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/40 transition-colors" />
              <div className="bg-bg-secondary p-8 space-y-8 relative z-10" style={{ clipPath: 'polygon(8% 0%, 100% 0%, 100% 92%, 92% 100%, 0% 100%, 0% 8%)' }}>
                 <div className="space-y-1">
                    <h3 className="text-xl font-black text-[var(--foreground)] uppercase italic tracking-tighter">Live Telemetry</h3>
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">Registry Validation</p>
                 </div>

                 <div className="space-y-4">
                    {[
                      { label: "Active Protocol", value: CUSTOMER_THEMES.find(t => t.id === customerTheme)?.name },
                      { label: "Staged Selection", value: CUSTOMER_THEMES.find(t => t.id === selectedThemeId)?.name },
                      { label: "Atmosphere Intensity", value: `${tempGlow}%` }
                    ].map((stat, i) => (
                      <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5">
                         <span className="text-[9px] font-black text-text-secondary uppercase opacity-40 italic">{stat.label}</span>
                         <span className="text-xs font-black text-primary uppercase italic tracking-widest">{stat.value}</span>
                      </div>
                    ))}
                 </div>

                 <div className="space-y-4 pt-4 border-t border-[var(--foreground)]/5">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest italic">Atmosphere Glow</h4>
                      <Badge variant="glass" className="text-[9px] font-black border-primary/20 text-primary">{tempGlow}%</Badge>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={tempGlow} 
                      onChange={(e) => setTempGlow(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[var(--foreground)]/5 rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                 </div>

                 <Button 
                   onClick={handleCommit}
                   disabled={isCommitting || !isDirty}
                   className="w-full h-16 rounded-[20px] bg-primary text-[var(--foreground)] shadow-glow-purple text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 italic"
                 >
                    {isCommitting ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> SYNCHRONIZE REGISTRY</>}
                 </Button>
              </div>
           </div>
        </div>
      </div>

      {/* ASSET REGISTRY: Octagonal Cards */}
      <div className="pt-12 space-y-10">
        <div className="flex items-center justify-between px-1 border-b border-[var(--foreground)]/5 pb-6">
           <h3 className="text-2xl md:text-3xl font-black text-[var(--foreground)] uppercase italic tracking-tighter flex items-center gap-4">
              <Layout className="w-7 h-7 md:w-8 md:h-8 text-primary" /> Visual Infrastructure
           </h3>
           <Badge variant="glass" className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-primary border-primary/20">MASTER NODES</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
           {uploadStations.map((station) => (
             <div 
               key={station.id}
               className="group relative p-[2px] transition-all hover:scale-[1.02]"
               style={{ clipPath: 'polygon(12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%, 0% 12%)' }}
             >
                <div className="absolute inset-0 bg-[var(--foreground)]/5 group-hover:bg-primary/20 transition-colors" />
                <div className="bg-bg-secondary p-8 space-y-6 relative z-10 h-full flex flex-col" style={{ clipPath: 'polygon(12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%, 0% 12%)' }}>
                   <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--foreground)]/5 flex items-center justify-center text-primary shadow-inner">{station.icon}</div>
                      <div>
                         <h4 className="text-lg font-black text-[var(--foreground)] uppercase italic tracking-tighter">{station.title}</h4>
                         <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-40 italic">{station.desc}</p>
                      </div>
                   </div>
                   
                   <div 
                     onClick={() => triggerUpload(station.id)}
                     className={cn("bg-black/40 rounded-3xl border border-dashed border-[var(--foreground)]/10 flex items-center justify-center group cursor-pointer hover:border-primary transition-all overflow-hidden relative", station.aspect)}
                   >
                      {station.id === 'logo' ? (
                        <div className="w-full h-full flex items-center justify-center p-8 bg-bg-secondary group-hover:scale-105 transition-transform duration-700">
                          <Logo size="xl" />
                        </div>
                      ) : station.preview ? (
                         <img src={station.preview} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Preview" />
                      ) : (
                         <div className="text-center space-y-2 opacity-20 group-hover:opacity-100 transition-opacity">
                            <Upload className="w-8 h-8 mx-auto" />
                            <p className="text-[9px] font-black uppercase tracking-tighter">Upload Registry</p>
                         </div>
                      )}
                      {(station.preview || station.id === 'logo') && (
                         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                            <Button variant="outline" className="h-11 px-8 text-[10px] font-black uppercase tracking-widest glass border-[var(--foreground)]/20 italic">
                               {station.id === 'logo' ? 'CONFIGURE MASTER' : 'REPLACE NODE'}
                            </Button>
                         </div>
                      )}
                   </div>

                   <div className="mt-auto pt-6 flex items-center justify-between border-t border-[var(--foreground)]/5">
                       <Badge className={cn(
                         "text-[9px] font-black px-4 py-1.5 rounded-full border-0",
                         !station.preview ? "bg-slate-500/10 text-slate-500" : "bg-success/10 text-success"
                       )}>
                          {!station.preview ? 'NODE EMPTY' : 'SYNCHRONIZED'}
                       </Badge>
                       <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-2 italic">
                          Registry Info <ChevronRight className="w-3 h-3" />
                       </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  
  );
}
