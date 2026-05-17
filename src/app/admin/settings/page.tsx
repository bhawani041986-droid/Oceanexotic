"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Palette, 
  Droplets, 
  Zap, 
  Sparkles, 
  Layout, 
  Check,
  ChevronRight,
  Save,
  ShieldCheck,
  RefreshCw,
  Fingerprint,
  Bell,
  Globe,
  Lock,
  Database,
  CreditCard,
  Key
} from "lucide-react";
import { useTheme, ThemeType } from "@/context/ThemeContext";
import { useSettingsStore } from "@/store/settingsStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";

const THEMES: { id: ThemeType; name: string; description: string; colors: string[]; style: string; accent: string; gradient: string }[] = [
  { 
    id: "theme-ocean-neon", 
    name: "Ocean Neon", 
    description: "Cyberpunk maritime node with electric violet flows.", 
    colors: ["#7C3AED", "#3B82F6", "#06B6D4"],
    style: "bg-bg-primary",
    accent: "bg-primary shadow-glow-purple",
    gradient: "from-[#7C3AED] via-[#3B82F6] to-[#06B6D4]"
  },
  { 
    id: "theme-midnight-executive", 
    name: "Midnight", 
    description: "Elite dark-matter interface for deep-sea logistics.", 
    colors: ["#6366F1", "#4F46E5", "#1E1B4B"],
    style: "bg-[#020617]",
    accent: "bg-indigo-500 shadow-glow-purple",
    gradient: "from-[#6366F1] to-[#1E1B4B]"
  },
  { 
    id: "theme-aqua-glass", 
    name: "Aqua Glass", 
    description: "Crystalline aquatic depth with refractive surfaces.", 
    colors: ["#0EA5E9", "#2DD4BF", "#F0FDFA"],
    style: "bg-[#082F49]",
    accent: "bg-cyan-400 shadow-glow-blue",
    gradient: "from-[#0EA5E9] to-[#2DD4BF]"
  },
  { 
    id: "theme-royal-purple", 
    name: "Royal Purple", 
    description: "Imperial velvet tones with gilded highlights.", 
    colors: ["#581C87", "#7C3AED", "#FDE047"],
    style: "bg-[#2E1065]",
    accent: "bg-purple-500 shadow-glow-purple",
    gradient: "from-[#581C87] to-[#7C3AED]"
  },
  { 
    id: "theme-carbon-minimal", 
    name: "Carbon", 
    description: "Hyper-clean industrial monolith aesthetic.", 
    colors: ["#0F172A", "#334155", "#F8FAFC"],
    style: "bg-[#0F172A]",
    accent: "bg-slate-500",
    gradient: "from-[#0F172A] to-[#334155]"
  },
  { 
    id: "theme-sunset-energy", 
    name: "Sunset", 
    description: "Volcanic energy dispatch for high-throughput hubs.", 
    colors: ["#F97316", "#DC2626", "#FACC15"],
    style: "bg-[#431407]",
    accent: "bg-orange-500 shadow-glow-orange",
    gradient: "from-[#F97316] to-[#DC2626]"
  },
  { 
    id: "theme-light-sovereign", 
    name: "Sovereign", 
    description: "High-precision light mode with soft elevation.", 
    colors: ["#7C3AED", "#2563EB", "#F8FAFC"],
    style: "bg-white",
    accent: "bg-primary shadow-lg",
    gradient: "from-[#7C3AED] to-[#2563EB]"
  },
  { 
    id: "theme-alibaba-orange", 
    name: "Alibaba", 
    description: "Wholesale maritime node with high-authority orange.", 
    colors: ["#FF6600", "#064495", "#0B1120"],
    style: "bg-bg-primary",
    accent: "bg-[#FF6600] shadow-glow-orange",
    gradient: "from-[#FF6600] to-[#064495]"
  },
  { 
    id: "theme-amazon-global", 
    name: "Amazon", 
    description: "Prime logistics infrastructure with amber highlights.", 
    colors: ["#FF9900", "#232F3E", "#131921"],
    style: "bg-[#131921]",
    accent: "bg-[#FF9900] shadow-glow-orange",
    gradient: "from-[#FF9900] to-[#232F3E]"
  },
  { 
    id: "theme-swiggy-vibrant", 
    name: "Swiggy", 
    description: "High-velocity culinary dispatch aesthetics.", 
    colors: ["#FC8019", "#F8FAFC", "#282C3F"],
    style: "bg-white",
    accent: "bg-[#FC8019] shadow-md",
    gradient: "from-[#FC8019] to-[#FDA054]"
  },
  { 
    id: "theme-zomato-passion", 
    name: "Zomato", 
    description: "Gourmet discovery engine with passionate red flows.", 
    colors: ["#E23744", "#F8FAFC", "#1C1C1C"],
    style: "bg-white",
    accent: "bg-[#E23744] shadow-md",
    gradient: "from-[#E23744] to-[#EF4F5F]"
  },
];

export default function AdminSettingsPage() {
  const { theme, setTheme, font, setFont, blurIntensity, setBlurIntensity, glowIntensity, setGlowIntensity } = useTheme();
  const { pushSettings } = useSettingsStore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await pushSettings();
      if (success) {
        setSaveSuccess(true);
        toast("Governance protocols persisted to sovereign vault.", "success");
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        toast("Registry synchronization failed.", "error");
      }
    } catch (err) {
      toast("Connection failure during synchronization.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-[10px] md:space-y-12 animate-fade-in pb-32 pt-4 md:pt-10">
      
      {/* High-Fidelity Header */}
      <div className="relative overflow-hidden rounded-[20px] md:rounded-[40px] p-[10px] md:p-12 border border-[var(--foreground)]/5 bg-gradient-to-br from-bg-secondary/80 to-transparent">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
             <Badge variant="glass" className="px-4 py-1 text-[8px] tracking-[0.3em] font-black bg-primary/20 text-primary border-primary/30">
                ADMIN COMMAND
             </Badge>
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-glow-purple" />
          </div>
          <h2 className="text-2xl md:text-5xl font-black text-[var(--foreground)] tracking-tighter uppercase italic leading-none">
             Platform <span className="text-primary underline decoration-primary/20 underline-offset-8">Governance</span>
          </h2>
          <p className="text-[8px] md:text-xs font-black text-text-secondary uppercase tracking-[0.3em] opacity-80">Global override active | Authority Level: 5</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[10px] md:gap-12">
        
        <div className="lg:col-span-2 space-y-[10px] md:space-y-10">
           {/* Sensory Modules */}
           <div className="flex items-center justify-between px-1">
              <div className="space-y-[2px] md:space-y-1">
                 <h3 className="text-[10px] md:text-lg font-black text-[var(--foreground)] uppercase tracking-tight flex items-center gap-2 md:gap-3">
                    <Layout className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" /> Sensory Modules
                 </h3>
                 <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest leading-relaxed">Reconfigure global visual telemetry.</p>
              </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {THEMES.map((t, i) => {
                const isActive = theme === t.id;
                return (
                   <motion.button 
                    key={t.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "group relative h-28 md:h-40 transition-all active:scale-[0.95]",
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
                        background: isActive ? `var(--c-primary)` : 'rgba(255,255,255,0.05)',
                        padding: '2px'
                      }}
                    >
                      <div className="w-full h-full relative overflow-hidden bg-bg-secondary" style={{ clipPath: 'polygon(12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%, 0% 12%)' }}>
                         <div className={cn("absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 bg-gradient-to-br", t.gradient)} />
                         
                         <div className="absolute inset-0 flex flex-col items-center justify-center p-4 gap-3 md:gap-4 text-center">
                            <div className={cn(
                                "w-8 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-500",
                                isActive ? t.accent : "bg-[var(--foreground)]/5 border border-[var(--foreground)]/10"
                              )}>
                               <Sparkles className={cn("w-4 h-4 md:w-6 md:h-6", isActive ? "text-[var(--foreground)]" : "text-[var(--foreground)]/40")} />
                            </div>
                            <h4 className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-widest", isActive ? "text-[var(--foreground)]" : "text-text-secondary")}>{t.name}</h4>
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

           {/* Typography Engine */}
           <div className="pt-10 space-y-8">
              <div className="flex items-center justify-between px-1">
                 <div className="space-y-[2px] md:space-y-1">
                    <h3 className="text-[10px] md:text-lg font-black text-[var(--foreground)] uppercase tracking-tight flex items-center gap-2 md:gap-3">
                       <Palette className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" /> Typography Engine
                    </h3>
                    <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest leading-relaxed">Select a high-density typeface for global governance.</p>
                 </div>
              </div>

              <div className="relative group">
                 <div className="absolute inset-0 bg-primary/20 blur-[20px] opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
                 <div className="relative overflow-hidden rounded-[24px] border border-[var(--foreground)]/5 bg-bg-secondary/40 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                       {['Inter', 'Outfit', 'Roboto Mono'].map((f) => (
                          <button
                             key={f}
                             onClick={() => setFont(f)}
                             className={cn(
                                "h-14 rounded-xl flex items-center justify-between px-6 transition-all group/btn",
                                font === f ? "bg-primary text-[var(--foreground)] shadow-glow-purple" : "bg-bg-primary/50 text-text-secondary hover:bg-bg-primary"
                             )}
                          >
                             <span className="text-[10px] font-black uppercase tracking-widest italic">{f}</span>
                             {font === f && <Check className="w-4 h-4" />}
                          </button>
                       ))}
                    </div>
                    <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 pointer-events-none">
                       <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-primary rotate-90" />
                    </div>
                 </div>
              </div>
           </div>

           {/* System Operational Protocols */}
           <div className="pt-10 space-y-8">
              <div className="flex items-center justify-between px-1">
                 <div className="space-y-[2px] md:space-y-1">
                    <h3 className="text-[10px] md:text-lg font-black text-[var(--foreground)] uppercase tracking-tight flex items-center gap-2 md:gap-3">
                       <Database className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" /> Operational Protocols
                    </h3>
                    <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest leading-relaxed">Manage platform-wide security and session parameters.</p>
                 </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 px-4 md:px-0">
                 {[
                   { label: "Alerts", icon: <Bell className="w-5 h-5" />, desc: "Broadcasts" },
                   { label: "Region", icon: <Globe className="w-5 h-5" />, desc: "Local Sync" },
                   { label: "Security", icon: <ShieldCheck className="w-5 h-5" />, desc: "Auth Layers" },
                   { label: "Session", icon: <Lock className="w-5 h-5" />, desc: "Security" },
                 ].map((item) => (
                   <button key={item.label} className="group relative h-20 md:h-28 transition-all hover:scale-[1.02] active:scale-95">
                      {/* Parallelogram Base */}
                      <div className="absolute inset-0 bg-bg-secondary/20 border border-[var(--foreground)]/5 -skew-x-12 rounded-lg group-hover:bg-primary/10 group-hover:border-primary/30 transition-all shadow-premium overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Content */}
                      <div className="relative h-full flex flex-col items-center justify-center p-2 gap-1 md:gap-3">
                         <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-[var(--foreground)] transition-all shadow-inner">
                            {item.icon}
                         </div>
                         <div className="text-center">
                            <p className="text-[7px] md:text-[11px] font-black text-[var(--foreground)] uppercase italic truncate leading-none mb-0.5">{item.label}</p>
                            <p className="hidden md:block text-[8px] font-black text-text-secondary uppercase tracking-widest opacity-40 truncate">{item.desc}</p>
                         </div>
                      </div>
                   </button>
                 ))}
              </div>
           </div>

           {/* PayU Biz - Credential Registry */}
           <div className="pt-10 space-y-8">
              <div className="flex items-center justify-between px-1">
                 <div className="space-y-[2px] md:space-y-1">
                    <h3 className="text-[10px] md:text-lg font-black text-[var(--foreground)] uppercase tracking-tight flex items-center gap-2 md:gap-3">
                       <CreditCard className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" /> PayU Registry
                    </h3>
                    <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest leading-relaxed">Configure high-velocity commerce credentials.</p>
                 </div>
              </div>

              <Card className="p-6 md:p-10 space-y-8 rounded-[32px] border-[var(--foreground)]/5 bg-bg-secondary/40">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest ml-1 text-text-secondary flex items-center gap-2">
                          <Key className="w-3 h-3 text-primary" /> Merchant Key
                       </label>
                       <input 
                          type="text" 
                          className="w-full h-14 bg-bg-primary/50 border border-[var(--foreground)]/5 rounded-2xl px-6 text-sm font-black text-[var(--foreground)] outline-none focus:border-primary/40 transition-all"
                          placeholder="Enter Merchant Key"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest ml-1 text-text-secondary flex items-center gap-2">
                          <ShieldCheck className="w-3 h-3 text-primary" /> Merchant Salt
                       </label>
                       <input 
                          type="password" 
                          className="w-full h-14 bg-bg-primary/50 border border-[var(--foreground)]/5 rounded-2xl px-6 text-sm font-black text-[var(--foreground)] outline-none focus:border-primary/40 transition-all"
                          placeholder="Enter Merchant Salt"
                       />
                    </div>
                 </div>
                 <div className="flex items-center gap-6">
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Environment Mode:</p>
                    <div className="flex bg-bg-primary/50 p-1.5 rounded-xl border border-[var(--foreground)]/5">
                       {['test', 'live'].map((mode) => (
                          <button 
                            key={mode}
                            className={cn(
                              "px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                              "text-text-secondary/40"
                            )}
                          >
                            {mode}
                          </button>
                       ))}
                    </div>
                 </div>
              </Card>
           </div>
        </div>

        <div className="space-y-[10px] md:space-y-10">
           {/* Visual Fidelity Controls */}
           <div className="flex items-center justify-between px-1">
              <div className="space-y-[2px] md:space-y-1">
                 <h3 className="text-[10px] md:text-lg font-black text-[var(--foreground)] uppercase tracking-tight flex items-center gap-2 md:gap-3">
                    <Sparkles className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" /> Fidelity Controls
                 </h3>
                 <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest leading-relaxed">Adjust platform rendering engine.</p>
              </div>
           </div>

           <Card className="p-8 md:p-12 space-y-12 rounded-[32px] md:rounded-[48px] border-[var(--foreground)]/5 bg-bg-secondary/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-[50px] pointer-events-none" />
              
              <div className="space-y-12">
                 <div className="space-y-5">
                    <div className="flex items-center justify-between px-1">
                       <p className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-primary" /> Blur Intensity
                       </p>
                       <span className="text-[11px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">{blurIntensity}%</span>
                    </div>
                    <input type="range" min="0" max="150" value={blurIntensity} onChange={(e) => setBlurIntensity(parseInt(e.target.value))} className="w-full h-1 bg-[var(--foreground)]/10 rounded-full appearance-none cursor-pointer accent-primary" />
                 </div>

                 <div className="space-y-5">
                    <div className="flex items-center justify-between px-1">
                       <p className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" /> Glow Energy
                       </p>
                       <span className="text-[11px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">{glowIntensity}%</span>
                    </div>
                    <input type="range" min="0" max="200" value={glowIntensity} onChange={(e) => setGlowIntensity(parseInt(e.target.value))} className="w-full h-1 bg-[var(--foreground)]/10 rounded-full appearance-none cursor-pointer accent-primary" />
                 </div>

                 <Button onClick={handleSave} disabled={isSaving} className={cn("w-full h-16 text-[10px] font-black tracking-[0.3em] uppercase rounded-[24px] shadow-glow-purple transition-all flex items-center justify-center gap-3 relative overflow-hidden", saveSuccess ? "bg-success shadow-glow-success" : "bg-primary")}>
                   <AnimatePresence mode="wait">
                     {isSaving ? (
                       <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                         <RefreshCw className="w-5 h-5 animate-spin" />
                       </motion.div>
                     ) : saveSuccess ? (
                       <motion.div key="success" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-3">
                         <ShieldCheck className="w-5 h-5" /> PERSISTED
                       </motion.div>
                     ) : (
                       <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                         <Save className="w-5 h-5" /> COMMIT CHANGES
                       </motion.div>
                     ) }
                   </AnimatePresence>
                 </Button>
              </div>
           </Card>
        </div>
      </div>
    </div>

  );
}
